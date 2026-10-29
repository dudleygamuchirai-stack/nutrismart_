
// Generate view: handles dietary preference forms and meal plan generation
import React, { useState } from 'react';
import './Generate.css';

const API_BASE_URL = 'https://nutrismart-f59i.onrender.com';

export default function Generate({
  setActivePage,
  onGeneratePlan,
  currentBudget = 500
}) {
  const [budget, setBudget] = useState(currentBudget);
  const [people, setPeople] = useState(2);
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
    if (selectedTags.includes(label)) {
      setSelectedTags(selectedTags.filter((tag) => tag !== label));
    } else {
      setSelectedTags([...selectedTags, label]);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    let dietaryPref = 'None';
    const tagString = selectedTags.join(' ').toLowerCase();

    if (tagString.includes('vegetarian')) {
      dietaryPref = 'vegetarian';
    } else if (tagString.includes('halal')) {
      dietaryPref = 'halal';
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/plans/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            WeeklyBudget: Number(budget),
            DietaryPreference: dietaryPref,
            UserID: 1
          })
        }
      );

      const result = await response.json();

      if (!response.ok || result.status === 'error') {
        throw new Error(
          result.message || 'Failed to generate meal plan from server.'
        );
      }

      if (onGeneratePlan) {
        onGeneratePlan({
          budget,
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
          'Could not connect to the live backend. Please check the server and its CORS settings.'
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
            Set your preferences to optimize meal costs against local SA retail prices.
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
                onClick={() => setPeople(Math.max(1, people - 1))}
              >
                −
              </button>

              <span className="stepper-value">
                {people} {people === 1 ? 'person' : 'people'}
              </span>

              <button
                type="button"
                className="stepper-btn"
                onClick={() => setPeople(Math.min(8, people + 1))}
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
