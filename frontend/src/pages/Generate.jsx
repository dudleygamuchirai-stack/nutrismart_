import React, { useState } from 'react';
import './Generate.css';

export default function Generate({ setActivePage, onGeneratePlan, currentBudget = 500 }) {
  const [budget, setBudget] = useState(currentBudget);
  const [people, setPeople] = useState(2);
  const [selectedTags, setSelectedTags] = useState(['High-Protein']);
  const [loading, setLoading] = useState(false);

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
      setSelectedTags(selectedTags.filter((t) => t !== label));
    } else {
      setSelectedTags([...selectedTags, label]);
    }
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      onGeneratePlan({ budget, people, selectedTags });
      setLoading(false);
      setActivePage('dashboard');
    }, 1200);
  };

  return (
    <div className="generate-container">
      <div className="generate-card">
        <div className="generate-header">
          <span className="section-eyebrow">Smart Customiser</span>
          <h2>Build Your 7-Day Plan</h2>
          <p>Set your preferences to optimize meal costs against local SA retail prices.</p>
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
            <span className="form-hint">Suggested: R350–R600 per person/week</span>
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
              <span className="stepper-value">{people} {people === 1 ? 'person' : 'people'}</span>
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

          <button type="submit" className="generate-submit-btn" disabled={loading}>
            {loading ? '⏳ Optimizing ingredients…' : '✨ Generate My 7-Day Plan'}
          </button>
        </form>
      </div>
    </div>
  );
}