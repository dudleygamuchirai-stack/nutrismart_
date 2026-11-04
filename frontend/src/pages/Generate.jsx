
import React, { useState } from 'react';
import './Generate.css';

const API_BASE_URL = 'https://nutrismart-f59i.onrender.com';

export default function Generate({
  setActivePage,
  onGeneratePlan,
  currentBudget = 500
}) {
  const [budget, setBudget] = useState(currentBudget);
  const [people, setPeople] = useState(1);
  const [selectedTags, setSelectedTags] = useState(['🌿 Vegetarian']);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const dietaryOptions = [
    { id: 'vegetarian', label: '🌿 Vegetarian' },
    { id: 'high-protein', label: '💪 High-Protein' },
    { id: 'halal', label: '☪️ Halal' },
    { id: 'low-carb', label: '🥑 Low-Carb' },
    { id: 'budget-saver', label: '🏷️ Budget Saver' },
    { id: 'student', label: '🎓 Quick & Easy' }
  ];

  const toggleTag = (label) => {
    setSelectedTags((previousTags) =>
      previousTags.includes(label)
        ? previousTags.filter((tag) => tag !== label)
        : [...previousTags, label]
    );
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const userId = localStorage.getItem('userId');

    if (!userId) {
      setErrorMessage('Please log in first before generating a meal plan.');
      setLoading(false);
      return;
    }

    let dietaryPref = 'None';
    const tagString = selectedTags.join(' ').toLowerCase();

    if (tagString.includes('vegetarian')) {
      dietaryPref = 'vegetarian';
    } else if (tagString.includes('halal')) {
      dietaryPref = 'halal';
    } else if (tagString.includes('high-protein')) {
      dietaryPref = 'high-protein';
    } else if (tagString.includes('low-carb')) {
      dietaryPref = 'low-carb';
    }

    try {
      const response = await fetch(`${API_BASE_URL}/plans/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          WeeklyBudget: Number(budget),
          DietaryPreference: dietaryPref,
          HouseholdSize: Number(people),
          UserID: userId
        })
      });

      const result = await response.json();

      if (!response.ok || result.status === 'error') {
        throw new Error(
          result.message || 'Failed to generate meal plan from server.'
        );
      }

      if (onGeneratePlan) {
        onGeneratePlan({
          budget: Number(budget),
          people,
          selectedTags,
          schedule: result.schedule,
          totalCost: result.total_cost_zar,
          planId: result.plan_id
        });
      }

      setActivePage('dashboard');
    } catch (err) {
      console.error('Plan generation failed:', err);

      if (err instanceof TypeError) {
        setErrorMessage(
          'Could not connect to the backend. Please check your internet connection or backend CORS settings.'
        );
      } else {
        setErrorMessage(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generate-container">
      <div className="generate-card">
        <div className="generate-header">
          <span className="section-eyebrow">Smart Customiser</span>
          <h2>Build Your 7-Day Plan</h2>
          <p>
            Set your preferences to optimize meal costs against local SA retail
            prices.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="generate-form">
          <div className="form-group">
            <label htmlFor="budget">Weekly Budget (ZAR)</label>

            <div className="input-affix-wrapper">
              <span className="input-prefix">R</span>
              <input
                id="budget"
                type="number"
                min="150"
                max="3000"
                step="50"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                required
              />
            </div>

            <span className="form-hint">
              Suggested: R350–R600 per person/week
            </span>
          </div>

          <div className="form-group">
            <label>Household Size</label>

            <div className="stepper-wrapper">
              <button
                type="button"
                className="stepper-btn"
                onClick={() => setPeople((previous) => Math.max(1, previous - 1))}
                aria-label="Decrease household size"
              >
                −
              </button>

              <span className="stepper-value">
                {people} {people === 1 ? 'person' : 'people'}
              </span>

              <button
                type="button"
                className="stepper-btn"
                onClick={() => setPeople((previous) => Math.min(8, previous + 1))}
                aria-label="Increase household size"
              >
                +
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Dietary Preferences</label>

            <div className="dietary-tag-picker">
              {dietaryOptions.map((item) => {
                const isSelected = selectedTags.includes(item.label);

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`diet-tag-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => toggleTag(item.label)}
                    aria-pressed={isSelected}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {errorMessage && (
            <div
              style={{
                color: '#d63031',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                textAlign: 'center'
              }}
              role="alert"
            >
              ⚠️ {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="generate-submit-btn"
            disabled={loading}
          >
            {loading
              ? '⏳ Optimizing ingredients…'
              : '✨ Generate My 7-Day Plan'}
          </button>
        </form>
      </div>
    </div>
  );
}
