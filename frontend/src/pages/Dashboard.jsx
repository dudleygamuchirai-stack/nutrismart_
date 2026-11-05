
import React, { useEffect, useState } from 'react';
import MealCard from '../components/MealCard';
import ShoppingListItem from '../components/ShoppingListItem';
import NutritionSummary from '../components/NutritionSummary';
import WeekView from '../components/WeekView';
import BudgetMeter from '../components/BudgetMeter';
import './Dashboard.css';

const API = (
  import.meta.env.VITE_API_URL ||
  'https://nutrismart-f59i.onrender.com'
).replace(/\/$/, '');

const SAMPLE_NUTRITION = {
  calories: 1840,
  protein: 115,
  carbs: 210,
  fat: 54
};

const SAMPLE_GROCERIES = [
  {
    id: 'oats',
    name: 'Jungle Oats',
    quantity: '1 kg',
    unit: 'box',
    price: 38.99,
    checked: false
  },
  {
    id: 'milk',
    name: 'Full Cream Milk',
    quantity: '2',
    unit: 'litres',
    price: 34.00,
    checked: false
  },
  {
    id: 'chicken',
    name: 'Chicken Breast Fillets',
    quantity: '1 kg',
    unit: 'pack',
    price: 89.99,
    checked: false
  },
  {
    id: 'rice',
    name: 'Brown Rice',
    quantity: '2 kg',
    unit: 'bag',
    price: 36.50,
    checked: false
  }
];

function readUser() {
  try {
    const savedUser = JSON.parse(
      localStorage.getItem('user') || 'null'
    );

    if (savedUser) {
      return {
        ...savedUser,
        UserID:
          savedUser.UserID ||
          savedUser.user_id ||
          savedUser.id ||
          localStorage.getItem('userId')
      };
    }
  } catch (error) {
    console.error('Could not read saved user:', error);
  }

  const id = localStorage.getItem('userId');

  return id
    ? {
        UserID: id,
        FullName: localStorage.getItem('userName') || ''
      }
    : null;
}

function greeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

async function getJson(response) {
  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      'The server returned an unexpected response. Please try again.'
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || 'Could not load your meal plan.'
    );
  }

  return data;
}

export default function Dashboard({
  setActivePage,
  planData = {},
  featuredRecipe,
  onSwapRecipe,
  user,
  onGeneratePlan
}) {
  const savedUser = readUser();

  const activeUser = user
    ? {
        ...savedUser,
        ...user,
        UserID:
          user.UserID ||
          user.user_id ||
          user.id ||
          savedUser?.UserID
      }
    : savedUser;

  const userId = activeUser?.UserID;

  const [state, setState] = useState({
    loading: true,
    error: '',
    plan: null
  });

  useEffect(() => {
    if (!userId) {
      setState({
        loading: false,
        error: '',
        plan: null
      });
      return;
    }

    let cancelled = false;

    async function loadPlan() {
      try {
        setState({
          loading: true,
          error: '',
          plan: null
        });

        const listResponse = await fetch(
          `${API}/plans/user/${userId}`
        );

        const listData = await getJson(listResponse);

        if (!listData.plans || listData.plans.length === 0) {
          if (!cancelled) {
            setState({
              loading: false,
              error: '',
              plan: null
            });
          }

          return;
        }

        const newestPlan = listData.plans[0];

        const detailResponse = await fetch(
          `${API}/plans/${newestPlan.plan_id}`
        );

        const detailData = await getJson(detailResponse);

        if (!cancelled) {
          setState({
            loading: false,
            error: '',
            plan: detailData
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            loading: false,
            error: error.message || 'Something went wrong.',
            plan: null
          });
        }
      }
    }

    loadPlan();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const goGenerate = () => {
    if (onGeneratePlan) {
      onGeneratePlan();
    } else if (setActivePage) {
      setActivePage('generate');
    }
  };

  const goPalette = () => {
    if (setActivePage) {
      setActivePage('palette');
    }
  };

  const { loading, error, plan } = state;

  const schedule = Array.isArray(plan?.schedule)
    ? plan.schedule
    : [];

  const hasPlan = schedule.length > 0;

  const budget = plan
    ? Number(plan.weekly_budget_zar || 0)
    : 500;

  const spent = plan
    ? Number(plan.total_cost_zar || 0)
    : null;

  const hasSpend =
    spent !== null && Number.isFinite(spent);

  const remaining = hasSpend ? budget - spent : null;

  const isWithinBudget = hasSpend && spent <= budget;

  const mealsPlanned = schedule.reduce((total, day) => {
    return (
      total +
      ['breakfast', 'lunch', 'dinner'].filter(
        (meal) => day[meal]
      ).length
    );
  }, 0);

  const firstName =
    activeUser?.FullName?.trim().split(' ')[0] || 'there';

  return (
    <div className="dashboard-container">
      <header className="dash-header">
        <h2>{greeting()}, {firstName}!</h2>

        <p>
          {loading
            ? 'Loading your meal plan...'
            : hasPlan
              ? 'Your generated meal plan overview'
              : 'Welcome to your NutriSmart dashboard'}
        </p>
      </header>

      {error && (
        <div className="quick-actions-card">
          <p style={{ color: '#D63031' }}>
            {error}
          </p>

          <button
            className="action-btn"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      )}

      {!activeUser?.UserID && (
        <div className="quick-actions-card">
          <p>Please log in to see your meal plans.</p>
        </div>
      )}

      {loading && (
        <div className="quick-actions-card">
          <p>Loading your latest meal plan...</p>
        </div>
      )}

      {!loading && !error && activeUser?.UserID && (
        <>
          <section className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-label">
                Weekly Budget
              </span>

              <div className="kpi-value">
                R{budget.toFixed(2)}
              </div>

              <span className="kpi-sub">
                {hasSpend
                  ? isWithinBudget
                    ? `R${remaining.toFixed(2)} remaining`
                    : `R${Math.abs(remaining).toFixed(2)} over budget`
                  : 'Generate a plan to see spending'}
              </span>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">
                Est. Spend
              </span>

              <div className="kpi-value">
                {hasSpend
                  ? `R${spent.toFixed(2)}`
                  : 'Not available'}
              </div>

              <span
                className={`kpi-sub ${
                  hasSpend
                    ? isWithinBudget
                      ? 'highlight'
                      : 'text-error'
                    : ''
                }`}
              >
                {hasSpend
                  ? isWithinBudget
                    ? 'Within budget'
                    : 'Exceeds budget'
                  : 'No generated cost yet'}
              </span>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">
                Meals Planned
              </span>

              <div className="kpi-value">
                {hasPlan ? mealsPlanned : 0}
              </div>

              <span className="kpi-sub highlight">
                {hasPlan
                  ? `${schedule.length} days generated`
                  : 'No plan generated yet'}
              </span>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">
                Avg. Calories/day
              </span>

              <div className="kpi-value">
                {SAMPLE_NUTRITION.calories.toLocaleString()}
              </div>

              <span className="kpi-sub">
                Example nutrition values
              </span>
            </div>
          </section>

          <div style={{ marginBottom: '24px' }}>
            <NutritionSummary
              calories={SAMPLE_NUTRITION.calories}
              protein={SAMPLE_NUTRITION.protein}
              carbs={SAMPLE_NUTRITION.carbs}
              fat={SAMPLE_NUTRITION.fat}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                fontFamily: 'Fraunces',
                color: 'var(--color-navy)',
                marginBottom: '12px'
              }}
            >
              Featured Recipe
            </h3>

            <div style={{ maxWidth: '320px' }}>
              {featuredRecipe ? (
                <MealCard
                  meal={featuredRecipe}
                  onSwap={onSwapRecipe}
                />
              ) : (
                <div className="quick-actions-card">
                  <p>
                    Your featured recipe will appear here
                    when one is available.
                  </p>
                </div>
              )}
            </div>
          </div>

          <section className="dashboard-grid">
            <WeekView
              schedule={schedule}
              onRegenerate={goGenerate}
            />

            <div className="dash-sidebar">
              {hasSpend && (
                <BudgetMeter
                  budget={budget}
                  spent={spent}
                />
              )}

              <div className="quick-actions-card">
                <h4>Checkers Shopping List</h4>

                {SAMPLE_GROCERIES.map((grocery) => (
                  <ShoppingListItem
                    key={grocery.id}
                    name={grocery.name}
                    quantity={grocery.quantity}
                    unit={grocery.unit}
                    price={grocery.price}
                    checked={grocery.checked}
                  />
                ))}
              </div>

              <div className="quick-actions-card">
                <h4>Quick Actions</h4>

                <button
                  className="action-btn primary"
                  onClick={goGenerate}
                >
                  ✨ Generate new plan
                </button>

                <button
                  className="action-btn"
                  onClick={goPalette}
                >
                  🎨 View Design Tokens
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
