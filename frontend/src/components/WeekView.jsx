
import React from 'react';
import './WeekView.css';

export default function WeekView({ schedule, onRegenerate }) {
  const hasSchedule = Array.isArray(schedule) && schedule.length > 0;

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
          <button className="btn-sm" onClick={onRegenerate}>
            {hasSchedule ? 'Regenerate' : 'Generate Plan'}
          </button>
        )}
      </div>

      {hasSchedule ? (
        <div className="week-grid">
          {schedule.map((item, index) => {
            const displayDay = item.day
              ? item.day.slice(0, 3).toUpperCase()
              : `DAY ${index + 1}`;

            return (
              <div key={item.day || index} className="day-col">
                <div className="day-title">{displayDay}</div>

                <div className="meal-chip breakfast">
                  {item.breakfast || 'Not available'}
                </div>

                <div className="meal-chip lunch">
                  {item.lunch || 'Not available'}
                </div>

                <div className="meal-chip dinner">
                  {item.dinner || 'Not available'}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <p>No meal plan generated yet.</p>
          <p>Choose your budget and dietary preferences to create your seven-day meal plan.</p>
        </div>
      )}
    </div>
  );
}