
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

function readUser() {
  try {
    const savedUser = JSON.parse(
      localStorage.getItem('user') || 'null'
    );

    const inductionData = JSON.parse(
      localStorage.getItem('inductionData') || '{}'
    );

    const id = localStorage.getItem('userId');

    if (!savedUser && !id) return null;

    return {
      ...inductionData,
      ...(savedUser || {}),
      UserID:
        savedUser?.UserID ||
        savedUser?.user_id ||
        savedUser?.id ||
        id,
      FullName:
        savedUser?.FullName ||
        localStorage.getItem('userName') ||
        '',
      Email:
        savedUser?.Email ||
        localStorage.getItem('userEmail') ||
        ''
    };
  } catch (error) {
    console.error('Could not read saved user:', error);
    return null;
  }
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
      data.message ||
      data.error ||
      'Could not load your meal plan.'
    );
  }

  return data;
}

function getNumber(...values) {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      Number.isFinite(Number(value))
    ) {
      return Number(value);
    }
  }

  return null;
}

function getGroceries(plan) {
  const possibleLists = [
    plan?.groceries,
    plan?.shopping_list,
    plan?.shoppingList,
    plan?.shopping_items,
    plan?.ingredients
  ];

  const groceries = possibleLists.find(
    (list) => Array.isArray(list)
  );

  if (!groceries) return [];

  return groceries.map((item, index) => ({
    id: item.id || item.ingredient_id || index,
    name:
      item.name ||
      item.ingredient_name ||
      item.item ||
      'Unnamed item',
    quantity:
      item.quantity ??
      item.amount ??
      '—',
    unit: item.unit || '',
    price: getNumber(
      item.price,
      item.price_zar,
      item.total_price_zar,
      item.unit_price_zar
    ) ?? 0,
    checked: Boolean(item.checked)
  }));
}

export default function Dashboard({
  setActivePage,
  planData = {},
  featuredRecipe,
  onSwapRecipe,
  user,
  onGeneratePlan,
  onPlanLoaded
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

  const [downloading, setDownloading] = useState('');
  const [downloadError, setDownloadError] = useState('');

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
        setState((previous) => ({
          ...previous,
          loading: true,
          error: ''
        }));

        const listResponse = await fetch(
          `${API}/plans/user/${userId}`
        );

        const listData = await getJson(listResponse);

        if (
          !Array.isArray(listData.plans) ||
          listData.plans.length === 0
        ) {
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

        const loadedPlan = detailData.plan || detailData;

        if (!cancelled) {
          setState({
            loading: false,
            error: '',
            plan: loadedPlan
          });

          // Send the loaded plan and groceries to App.jsx.
          if (typeof onPlanLoaded === 'function') {
            onPlanLoaded({
              ...loadedPlan,
              budget:
                loadedPlan.weekly_budget_zar ??
                loadedPlan.WeeklyBudget ??
                loadedPlan.budget ??
                planData.budget,
              totalCost:
                loadedPlan.total_cost_zar ??
                loadedPlan.totalCost ??
                loadedPlan.spent ??
                null,
              planId:
                loadedPlan.plan_id ||
                loadedPlan.PlanID ||
                loadedPlan.id ||
                null,
              schedule: Array.isArray(loadedPlan.schedule)
                ? loadedPlan.schedule
                : [],
              groceries: getGroceries(loadedPlan)
            });
          }
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
  }, [userId, onPlanLoaded]);

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

  const currentPlan = plan || planData;

  const schedule = Array.isArray(currentPlan?.schedule)
    ? currentPlan.schedule
    : [];

  const hasPlan = schedule.length > 0;

  const planId =
    currentPlan?.plan_id ||
    currentPlan?.PlanID ||
    currentPlan?.planId ||
    currentPlan?.id ||
    null;

  const downloadPlan = async (format) => {
    if (!planId) return;

    try {
      setDownloading(format);
      setDownloadError('');

      const response = await fetch(
        `${API}/plans/${planId}/download?format=${format}`
      );

      if (!response.ok) {
        throw new Error(
          `Could not download the ${format.toUpperCase()} file.`
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `NutriSmart-Meal-Plan.${format}`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      setDownloadError(error.message);
    } finally {
      setDownloading('');
    }
  };

  const budget =
    getNumber(
      currentPlan?.weekly_budget_zar,
      currentPlan?.WeeklyBudget,
      currentPlan?.budget,
      activeUser?.DefaultWeeklyBudget,
      activeUser?.WeeklyBudget,
      planData?.budget
    ) ?? 500;

  const spent = getNumber(
    currentPlan?.total_cost_zar,
    currentPlan?.totalCost,
    currentPlan?.spent
  );

  const hasSpend = spent !== null;
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

  const calorieTarget = getNumber(
    activeUser?.DailyCalorieTarget,
    activeUser?.daily_calorie_target
  );

  const nutrition = currentPlan?.nutrition || {};

  const avgCaloriesPerPerson = getNumber(
    currentPlan?.avg_calories_per_person_per_day,
    currentPlan?.average_calories_per_person_per_day,
    nutrition?.avg_calories_per_person_per_day,
    nutrition?.avg_calories_per_person,
    nutrition?.calories_per_person,
    nutrition?.avg_calories,
    currentPlan?.average_calories,
    currentPlan?.avg_calories,
    calorieTarget
  );

  const avgCaloriesHousehold = getNumber(
    currentPlan?.avg_calories_household_per_day,
    currentPlan?.average_calories_household_per_day,
    nutrition?.avg_calories_household_per_day,
    nutrition?.avg_calories_household,
    nutrition?.household_calories,
    currentPlan?.household_calories
  );

  const calorieTargetPerPerson = getNumber(
    currentPlan?.calorie_target_per_person,
    currentPlan?.calorieTargetPerPerson,
    nutrition?.calorie_target_per_person,
    calorieTarget
  );

  const calories = getNumber(
    nutrition.calories,
    nutrition.avg_calories,
    currentPlan?.average_calories,
    currentPlan?.avg_calories,
    calorieTarget
  );

  const protein = getNumber(
    nutrition.protein,
    nutrition.avg_protein,
    currentPlan?.average_protein,
    currentPlan?.avg_protein
  );

  const carbs = getNumber(
    nutrition.carbs,
    nutrition.avg_carbs,
    currentPlan?.average_carbs,
    currentPlan?.avg_carbs
  );

  const fat = getNumber(
    nutrition.fat,
    nutrition.avg_fat,
    currentPlan?.average_fat,
    currentPlan?.avg_fat
  );

  const groceries = getGroceries(currentPlan);

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

      {!loading && activeUser?.UserID && (
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
                Daily Calorie Target
              </span>

              <div className="kpi-value">
                {calorieTarget !== null
                  ? calorieTarget.toLocaleString()
                  : '—'}
              </div>

              <span className="kpi-sub">
                Personal target from your profile
              </span>
            </div>

          </section>

          <div style={{ marginBottom: '24px' }}>
            <NutritionSummary
              calories={calories ?? '—'}
              avgCaloriesPerPerson={
                avgCaloriesPerPerson ?? '—'
              }
              avgCaloriesHousehold={
                avgCaloriesHousehold ?? '—'
              }
              calorieTargetPerPerson={
                calorieTargetPerPerson ?? '—'
              }
              protein={protein ?? '—'}
              carbs={carbs ?? '—'}
              fat={fat ?? '—'}
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
                <h4>Shopping List</h4>

                {groceries.length > 0 ? (
                  groceries.map((grocery) => (
                    <ShoppingListItem
                      key={grocery.id}
                      name={grocery.name}
                      quantity={grocery.quantity}
                      unit={grocery.unit}
                      price={grocery.price}
                      checked={grocery.checked}
                    />
                  ))
                ) : (
                  <p>
                    Your shopping list will appear here
                    when your meal plan includes groceries.
                  </p>
                )}
              </div>

              <div className="quick-actions-card">
                <h4>Quick Actions</h4>

                <button
                  className="action-btn primary"
                  onClick={goGenerate}
                >
                  Generate new plan
                </button>

                <button
                  className="action-btn"
                  onClick={goPalette}
                >
                  View Design Tokens
                </button>

                {hasPlan && planId && (
                  <div style={{ marginTop: '16px' }}>
                    <h4>Download Meal Plan</h4>

                    <button
                      className="action-btn"
                      onClick={() => downloadPlan('pdf')}
                      disabled={downloading !== ''}
                    >
                      {downloading === 'pdf'
                        ? 'Preparing PDF...'
                        : 'Download PDF'}
                    </button>

                    <button
                      className="action-btn"
                      onClick={() => downloadPlan('csv')}
                      disabled={downloading !== ''}
                    >
                      {downloading === 'csv'
                        ? 'Preparing CSV...'
                        : 'Download CSV'}
                    </button>

                    {downloadError && (
                      <p
                        style={{
                          color: '#D63031',
                          fontSize: '12px'
                        }}
                      >
                        {downloadError}
                      </p>
                    )}
                  </div>
                )}

              </div>

            </div>
          </section>

        </>
      )}

    </div>
  );
}

