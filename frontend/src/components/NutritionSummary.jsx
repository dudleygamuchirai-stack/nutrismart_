
import React from 'react';
import './NutritionSummary.css';

export default function NutritionSummary({
  calories = '—',
  avgCaloriesPerPerson = '—',
  avgCaloriesHousehold = '—',
  calorieTargetPerPerson = '—',
  protein = '—',
  carbs = '—',
  fat = '—'
}) {
  const metrics = [
    {
      icon: '🔥',
      value: avgCaloriesPerPerson,
      unit: 'kcal',
      label: 'Average per Person',
      className: 'calories'
    },
    {
      icon: '👨‍👩‍👧‍👦',
      value: avgCaloriesHousehold,
      unit: 'kcal',
      label: 'Household Average',
      className: 'household'
    },
    {
      icon: '🎯',
      value: calorieTargetPerPerson,
      unit: 'kcal',
      label: 'Personal Target',
      className: 'target'
    },
    {
      icon: '🥩',
      value: protein,
      unit: 'g',
      label: 'Protein',
      className: 'protein'
    },
    {
      icon: '🌾',
      value: carbs,
      unit: 'g',
      label: 'Carbs',
      className: 'carbs'
    },
    {
      icon: '🥑',
      value: fat,
      unit: 'g',
      label: 'Fats',
      className: 'fat'
    }
  ];

  return (
    <div className="nutrition-summary-card">
      <div className="nutrition-header">
        <h4>Daily Nutrition Overview</h4>
        <span className="nutrition-badge">Nutrition</span>
      </div>

      <div className="nutrition-metrics">
        {metrics.map((item) => (
          <div className="macro-item" key={item.className}>
            <div className={`macro-icon ${item.className}`}>
              {item.icon}
            </div>

            <div className="macro-data">
              <span className="macro-value">
                {item.value}
              </span>
              <span className="macro-unit">
                {item.unit}
              </span>
            </div>

            <span className="macro-label">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
