
import React from 'react';
import './WeekView.css';

function formatPrice(value) {
  const price = Number(value);

  if (!Number.isFinite(price)) return '—';

  return `R${price.toFixed(2)}`;
}

function getDayTotal(day) {
  const total =
    day.total_cost_zar ??
    day.total_cost ??
    day.day_total ??
    day.totalCost ??
    day.daily_total;

  return total;
}

export default function WeekView({ schedule = [], onRegenerate }) {
  const hasSchedule =
    Array.isArray(schedule) && schedule.length > 0;

  return (
    <div className="week-view-container">
      <div className="week-view-header">
        <div>
          <h3>This Week's Plan</h3>

          <span>
            {hasSchedule
              ? `${schedule.length} days in your meal plan`
              : 'Your meal schedule will appear here'}
          </span>
        </div>

        {onRegenerate && (
          <button
            className="btn-sm"
            onClick={onRegenerate}
            type="button"
          >
            {hasSchedule ? 'Regenerate' : 'Generate Plan'}
          </button>
        )}
      </div>

      {hasSchedule ? (
        <div className="week-grid">
          {schedule.map((item, index) => {
            const dayName =
              typeof item.day === 'string'
                ? item.day
                : `Day ${index + 1}`;

            const displayDay = dayName
              .slice(0, 3)
              .toUpperCase();

            const meals = [
              {
                name: 'Breakfast',
                value: item.breakfast,
                className: 'breakfast'
              },
              {
                name: 'Lunch',
                value: item.lunch,
                className: 'lunch'
              },
              {
                name: 'Dinner',
                value: item.dinner,
                className: 'dinner'
              }
            ];

            const dayTotal = getDayTotal(item);

            return (
              <div
                key={item.day || index}
                className="day-col"
              >
                <div className="day-title">
                  {displayDay}
                </div>

                {meals.map((meal) => (
                  <div
                    key={meal.name}
                    className={`meal-chip ${meal.className}`}
                  >
                    <span className="meal-chip-label">
                      {meal.name}
                    </span>

                    <span className="meal-chip-name">
                      {meal.value || 'Not available'}
                    </span>
                  </div>
                ))}

                {dayTotal !== undefined &&
                  dayTotal !== null && (
                    <div className="day-total">
                      Daily total: {formatPrice(dayTotal)}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="week-empty-state">
          <p>No meal plan generated yet.</p>

          <p>
            Choose your budget and dietary preferences
            to create your seven-day meal plan.
          </p>
        </div>
      )}
    </div>
  );
}
