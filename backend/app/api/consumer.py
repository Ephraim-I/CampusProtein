"""Consumer profile, meal logging, and gamification endpoints"""
from datetime import timedelta
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_, func
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.api.auth import get_current_user, require_role
from app.models.entities import (
    User, ConsumerProfile, MealLog, GamificationProfile, FoodCatalogue
)
from pydantic import BaseModel

router = APIRouter(prefix="/consumer", tags=["Consumer"])

# Schemas
class ConsumerProfileCreate(BaseModel):
    protein_goal_g: int = 55
    budget_ngn: int | None = None
    dietary_restrictions: str = ""
    preferred_proteins: str = ""

class ConsumerProfileResponse(BaseModel):
    id: int
    protein_goal_g: int
    budget_ngn: int | None
    dietary_restrictions: str
    preferred_proteins: str
    onboarding_completed: bool
    
    class Config:
        from_attributes = True

class MealLogCreate(BaseModel):
    food_id: int
    servings: float = 1.0

class MealLogResponse(BaseModel):
    id: int
    food_id: int
    servings: float
    protein_g: float
    calories: float
    logged_at: datetime
    
    class Config:
        from_attributes = True

class GamificationResponse(BaseModel):
    points: int
    current_streak: int
    longest_streak: int
    badges: str
    challenge_joined: bool
    challenge_progress: int
    
    class Config:
        from_attributes = True

# Profile endpoints
@router.post("/profile", response_model=ConsumerProfileResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_profile(
    profile_data: ConsumerProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("consumer")),
):
    """Create or update consumer profile"""
    profile = db.scalar(
        select(ConsumerProfile).where(ConsumerProfile.user_id == current_user.id)
    )
    
    if profile:
        profile.protein_goal_g = profile_data.protein_goal_g
        profile.budget_ngn = profile_data.budget_ngn
        profile.dietary_restrictions = profile_data.dietary_restrictions
        profile.preferred_proteins = profile_data.preferred_proteins
        profile.onboarding_completed = True
    else:
        profile = ConsumerProfile(
            user_id=current_user.id,
            protein_goal_g=profile_data.protein_goal_g,
            budget_ngn=profile_data.budget_ngn,
            dietary_restrictions=profile_data.dietary_restrictions,
            preferred_proteins=profile_data.preferred_proteins,
            onboarding_completed=True,
        )
        db.add(profile)
    
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/profile", response_model=ConsumerProfileResponse)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("consumer")),
):
    """Get consumer profile"""
    profile = db.scalar(
        select(ConsumerProfile).where(ConsumerProfile.user_id == current_user.id)
    )
    
    if not profile:
        # Create default profile
        profile = ConsumerProfile(
            user_id=current_user.id,
            onboarding_completed=False,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    return profile

# Meal logging
@router.post("/meals", response_model=MealLogResponse, status_code=status.HTTP_201_CREATED)
def log_meal(
    meal_data: MealLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("consumer")),
):
    """Log a meal"""
    food = db.get(FoodCatalogue, meal_data.food_id)
    if not food:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food not found"
        )
    
    # Calculate nutrition per serving
    protein_g = food.protein_per_100g * meal_data.servings
    calories = food.calories_per_100g * meal_data.servings
    
    meal_log = MealLog(
        consumer_id=current_user.id,
        food_id=meal_data.food_id,
        servings=meal_data.servings,
        protein_g=protein_g,
        calories=calories,
    )
    db.add(meal_log)
    
    # Update gamification
    update_gamification(db, current_user.id, food.protein_category)
    
    db.commit()
    db.refresh(meal_log)
    return meal_log

@router.get("/meals", response_model=list[MealLogResponse])
def get_meals(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("consumer")),
):
    """Get meal logs"""
    query = (
        select(MealLog)
        .where(MealLog.consumer_id == current_user.id)
        .order_by(MealLog.logged_at.desc())
        .limit(100)
    )
    return db.scalars(query).all()

@router.get("/meals/daily-total")
def get_daily_total(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("consumer")),
):
    """Get today's nutrition totals"""
    today = date.today()
    
    result = db.execute(
        select(
            func.sum(MealLog.protein_g).label("total_protein"),
            func.sum(MealLog.calories).label("total_calories"),
            func.count(MealLog.id).label("meal_count"),
        ).where(
            and_(
                MealLog.consumer_id == current_user.id,
                func.date(MealLog.logged_at) == today
            )
        )
    ).first()
    
    return {
        "date": today.isoformat(),
        "total_protein_g": float(result.total_protein or 0),
        "total_calories": float(result.total_calories or 0),
        "meal_count": result.meal_count,
    }

# Gamification
@router.get("/gamification", response_model=GamificationResponse)
def get_gamification(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("consumer")),
):
    """Get gamification profile"""
    profile = db.scalar(
        select(GamificationProfile).where(GamificationProfile.user_id == current_user.id)
    )
    
    if not profile:
        profile = GamificationProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    return profile

@router.post("/gamification/join-challenge")
def join_challenge(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("consumer")),
):
    """Join the Alternative Protein Challenge"""
    profile = db.scalar(
        select(GamificationProfile).where(GamificationProfile.user_id == current_user.id)
    )
    
    if not profile:
        profile = GamificationProfile(user_id=current_user.id)
        db.add(profile)
    
    profile.challenge_joined = True
    db.commit()
    return {"message": "Joined Alternative Protein Challenge"}

def update_gamification(db: Session, user_id: int, protein_category: str):
    """Update gamification stats after logging a meal"""
    profile = db.scalar(
        select(GamificationProfile).where(GamificationProfile.user_id == user_id)
    )
    
    if not profile:
        profile = GamificationProfile(user_id=user_id)
        db.add(profile)
        db.flush()
    
    today = date.today().isoformat()
    
    # Update streak
    if profile.last_log_date != today:
        if profile.last_log_date == (date.today() - timedelta(days=1)).isoformat():
            profile.current_streak += 1
        else:
            profile.current_streak = 1
        
        profile.last_log_date = today
        profile.longest_streak = max(profile.longest_streak, profile.current_streak)
        
        # Award points for logging (once per day)
        profile.points += 10
        
        # Streak badges
        if profile.current_streak == 3 and "streak_3" not in profile.badges:
            profile.badges += ",streak_3" if profile.badges else "streak_3"
        if profile.current_streak == 7 and "streak_7" not in profile.badges:
            profile.badges += ",streak_7" if profile.badges else "streak_7"
    
    # First meal ever
    if not profile.badges or "first_bite" not in profile.badges:
        profile.badges = "first_bite" if not profile.badges else profile.badges + ",first_bite"
    
    # Alternative protein challenge
    if profile.challenge_joined and protein_category != "conventional":
        # Count unique alternative proteins logged
        unique_proteins = db.execute(
            select(func.count(func.distinct(FoodCatalogue.protein_category)))
            .join(MealLog, MealLog.food_id == FoodCatalogue.id)
            .where(
                and_(
                    MealLog.consumer_id == user_id,
                    FoodCatalogue.protein_category != "conventional"
                )
            )
        ).scalar()
        
        profile.challenge_progress = unique_proteins
        
        if unique_proteins >= 5 and "challenge_champion" not in profile.badges:
            profile.badges += ",challenge_champion" if profile.badges else "challenge_champion"
            profile.points += 100
