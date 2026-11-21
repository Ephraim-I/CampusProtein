from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.health import router as health_router
from app.api.foods import router as foods_router
from app.api.auth import router as auth_router
from app.api.vendors import router as vendors_router
from app.api.orders import router as orders_router
from app.api.consumer import router as consumer_router

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="CampusProtein campus alternative-protein marketplace API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api/v1")
app.include_router(foods_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(vendors_router, prefix="/api/v1")
app.include_router(orders_router, prefix="/api/v1")
app.include_router(consumer_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "message": "Welcome to CampusProtein API",
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/api/v1/health",
    }
