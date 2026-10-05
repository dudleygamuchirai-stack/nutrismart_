import React from 'react';
import './NutritionSummary.css';

export default function NutritionSummary({
  calories = 1840,
  protein = 115,
  carbs = 210,
  fat = 54
}) {
  return (
    <div className="nutrition-summary-card">
      <div className="nutrition-header">
        <h4>Daily Nutrition Target</h4>
        <span className="nutrition-badge">Optimal</span>
      </div>

      <div className="nutrition-metrics">
        <div className="macro-item">
          <div className="macro-icon calories">🔥</div>
          <div className="macro-data">
            <span className="macro-value">{calories}</span>
            <span className="macro-unit">kcal</span>
          </div>
          <span className="macro-label">Calories</span>
        </div>

        <div className="macro-item">
          <div className="macro-icon protein">🥩</div>
          <div className="macro-data">
            <span className="macro-value">{protein}g</span>
          </div>
          <span className="macro-label">Protein</span>
        </div>

        <div className="macro-item">
          <div className="macro-icon carbs">🌾</div>
          <div className="macro-data">
            <span className="macro-value">{carbs}g</span>
          </div>
          <span className="macro-label">Carbs</span>
        </div>

        <div className="macro-item">
          <div className="macro-icon fat">🥑</div>
          <div className="macro-data">
            <span className="macro-value">{fat}g</span>
          </div>
          <span className="macro-label">Fats</span>
        </div>
      </div>
    </div>
  );
}