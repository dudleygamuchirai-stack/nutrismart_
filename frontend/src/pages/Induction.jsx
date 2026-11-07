
import React, { useState } from 'react';
import './Induction.css';

export default function Induction({ onContinue }) {
  const [form, setForm] = useState({
    age: '',
    sex: '',
    height: '',
    weight: '',
    activity: '1.2',
    goal: 'maintain',
    householdSize: '1'
  });

  const [error, setError] = useState('');

  const updateField = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const calculateCalories = () => {
    const age = Number(form.age);
    const height = Number(form.height);
    const weight = Number(form.weight);

    if (!age || !height || !weight || !form.sex) {
      return null;
    }

    let bmr;

    if (form.sex === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    let calories = bmr * Number(form.activity);

    if (form.goal === 'lose') calories -= 300;
    if (form.goal === 'gain') calories += 300;

    return Math.round(calories);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const calories = calculateCalories();

    if (!calories || calories <= 0) {
      setError('Please complete all personal details correctly.');
      return;
    }

    setError('');

    const inductionData = {
      Age: Number(form.age),
      Sex: form.sex,
      HeightCm: Number(form.height),
      WeightKg: Number(form.weight),
      ActivityLevel: form.activity,
      Goal: form.goal,
      HouseholdSize: Number(form.householdSize),
      DailyCalorieTarget: calories
    };

    localStorage.setItem(
      'inductionData',
      JSON.stringify(inductionData)
    );

    onContinue(inductionData);
  };

  const calorieTarget = calculateCalories();

  return (
    <div className="induction-page">
      <div className="induction-card">
        <h1>Let's get to know you</h1>
        <p>
          Tell us a little about yourself so NutriSmart
          can help create a meal plan that suits your needs.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Age</label>
          <input
            type="number"
            name="age"
            min="15"
            max="100"
            value={form.age}
            onChange={updateField}
            placeholder="Enter your age"
            required
          />

          <label>Sex</label>
          <select
            name="sex"
            value={form.sex}
            onChange={updateField}
            required
          >
            <option value="">Select</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>

          <label>Height (cm)</label>
          <input
            type="number"
            name="height"
            min="100"
            max="250"
            value={form.height}
            onChange={updateField}
            placeholder="e.g. 165"
            required
          />

          <label>Weight (kg)</label>
          <input
            type="number"
            name="weight"
            min="30"
            max="300"
            value={form.weight}
            onChange={updateField}
            placeholder="e.g. 65"
            required
          />

          <label>Activity level</label>
          <select
            name="activity"
            value={form.activity}
            onChange={updateField}
          >
            <option value="1.2">Not very active</option>
            <option value="1.375">Lightly active</option>
            <option value="1.55">Moderately active</option>
            <option value="1.725">Very active</option>
            <option value="1.9">Extremely active</option>
          </select>

          <label>What is your goal?</label>
          <select
            name="goal"
            value={form.goal}
            onChange={updateField}
          >
            <option value="maintain">Maintain my weight</option>
            <option value="lose">Lose weight</option>
            <option value="gain">Gain weight</option>
          </select>

          <label>How many people are you shopping for?</label>
          <input
            type="number"
            name="householdSize"
            min="1"
            max="20"
            value={form.householdSize}
            onChange={updateField}
            required
          />

          {calorieTarget && (
            <div className="calorie-result">
              <strong>Your estimated daily calorie target</strong>
              <h2>{calorieTarget} kcal</h2>
            </div>
          )}

          {error && <p className="induction-error">{error}</p>}

          <button type="submit">
            Continue to Registration
          </button>
        </form>
      </div>
    </div>
  );
}
