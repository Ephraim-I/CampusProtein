import { useState } from "react";
import { Target, DollarSign, CheckCircle } from "lucide-react";
import { updateConsumerProfile } from "../services/api";
import "./ConsumerOnboarding.css";

type OnboardingProps = {
  onComplete: () => void;
};

export default function ConsumerOnboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [proteinGoal, setProteinGoal] = useState(55);
  const [budget, setBudget] = useState(1000);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const proteinOptions = [
    { value: 45, label: "Light (45g)", desc: "General health" },
    { value: 55, label: "Moderate (55g)", desc: "Active lifestyle" },
    { value: 75, label: "High (75g)", desc: "Building muscle" },
    { value: 100, label: "Very High (100g)", desc: "Intense training" },
  ];

  const preferenceOptions = [
    { id: "legume", label: "Beans & Legumes", emoji: "🫘" },
    { id: "soy_product", label: "Soy Products", emoji: "🥛" },
    { id: "seed_or_nut", label: "Nuts & Seeds", emoji: "🥜" },
    { id: "mushroom", label: "Mushrooms", emoji: "🍄" },
  ];

  const handlePreferenceToggle = (id: string) => {
    setPreferences(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await updateConsumerProfile({
        protein_goal_g: proteinGoal,
        budget_ngn: budget,
        dietary_restrictions: "",
        preferred_proteins: preferences.join(","),
      });
      onComplete();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Unable to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <h1>Welcome to CampusProtein! 🌱</h1>
          <p>Let's personalize your nutrition journey</p>
          <div className="onboarding-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }} />
            </div>
            <span>Step {step} of 3</span>
          </div>
        </div>

        {step === 1 && (
          <div className="onboarding-step">
            <div className="step-icon">
              <Target size={48} />
            </div>
            <h2>Set Your Daily Protein Goal</h2>
            <p>How much protein do you want to consume each day?</p>

            <div className="goal-options">
              {proteinOptions.map(option => (
                <button
                  key={option.value}
                  className={`goal-option ${proteinGoal === option.value ? "selected" : ""}`}
                  onClick={() => setProteinGoal(option.value)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.desc}</span>
                </button>
              ))}
            </div>

            <button className="onboarding-next" onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step">
            <div className="step-icon">
              <DollarSign size={48} />
            </div>
            <h2>Set Your Meal Budget</h2>
            <p>What's your typical budget for a campus meal?</p>

            <div className="budget-selector">
              <input
                type="range"
                min="200"
                max="3000"
                step="100"
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
              />
              <div className="budget-display">₦{budget.toLocaleString()}</div>
            </div>

            <div className="quick-budgets">
              {[500, 1000, 1500, 2000].map(amount => (
                <button
                  key={amount}
                  className={budget === amount ? "selected" : ""}
                  onClick={() => setBudget(amount)}
                >
                  ₦{amount}
                </button>
              ))}
            </div>

            <div className="onboarding-actions">
              <button className="onboarding-back" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="onboarding-next" onClick={() => setStep(3)}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-step">
            <div className="step-icon">
              <CheckCircle size={48} />
            </div>
            <h2>Choose Your Preferences</h2>
            <p>Select the alternative proteins you'd like to explore</p>

            <div className="preference-options">
              {preferenceOptions.map(pref => (
                <button
                  key={pref.id}
                  className={`preference-option ${preferences.includes(pref.id) ? "selected" : ""}`}
                  onClick={() => handlePreferenceToggle(pref.id)}
                >
                  <span className="pref-emoji">{pref.emoji}</span>
                  <span>{pref.label}</span>
                  {preferences.includes(pref.id) && <CheckCircle size={20} />}
                </button>
              ))}
            </div>

            <p className="onboarding-note">
              💡 Don't worry, you can change these settings anytime!
            </p>

            <div className="onboarding-actions">
              <button className="onboarding-back" onClick={() => setStep(2)}>
                Back
              </button>
              <button
                className="onboarding-complete"
                onClick={handleComplete}
                disabled={loading}
              >
                {loading ? "Setting up..." : "Get Started 🚀"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
