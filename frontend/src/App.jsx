
import React, { useCallback, useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import Induction from './pages/Induction';
import Palette from './pages/Palette';
import Auth from './pages/Auth';
import './App.css';

const INITIAL_PLAN = {
  budget: 500,
  spent: null,
  totalCost: null,
  mealsPlanned: 0,
  calories: null,
  protein: null,
  carbs: null,
  fat: null,
  schedule: [],
  groceries: []
};

const FEATURED_RECIPES = [
  {
    id: 1,
    name: 'Grilled Chicken & Steamed Veggies',
    type: 'DINNER',
    price: 'R32.50',
    time: '25 mins',
    tag: 'High-Protein'
  },
  {
    id: 2,
    name: 'Pap & Chakalaka with Beans',
    type: 'DINNER',
    price: 'R28.00',
    time: '20 mins',
    tag: 'Vegetarian'
  },
  {
    id: 3,
    name: 'Lentil Stew with Brown Rice',
    type: 'DINNER',
    price: 'R22.50',
    time: '35 mins',
    tag: 'Budget Saver'
  }
];

const Icons = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  Generate: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Calendar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Cart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  Folder: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Heart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Printer: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  )
};

function Sidebar({ activePage, setActivePage, user }) {
  const handleScrollToPlan = () => {
    if (activePage !== 'dashboard') {
      setActivePage('dashboard');

      window.setTimeout(() => {
        document.querySelector('.dashboard-grid')?.scrollIntoView({
          behavior: 'smooth'
        });
      }, 100);
    } else {
      document.querySelector('.dashboard-grid')?.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };

  const initials = (user?.FullName || 'User')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className="app-sidebar">
      <div className="sidebar-section">
        <span className="sidebar-label">MAIN</span>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-link ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActivePage('dashboard')}
          >
            <span className="sidebar-icon"><Icons.Dashboard /></span>
            Dashboard
          </button>

          <button
            type="button"
            className={`sidebar-link ${activePage === 'generate' ? 'active' : ''}`}
            onClick={() => setActivePage('generate')}
          >
            <span className="sidebar-icon"><Icons.Generate /></span>
            Generate Plan
          </button>

          <button
            type="button"
            className="sidebar-link"
            onClick={handleScrollToPlan}
          >
            <span className="sidebar-icon"><Icons.Calendar /></span>
            My Plan
          </button>

          <button
            type="button"
            className={`sidebar-link ${activePage === 'shopping' ? 'active' : ''}`}
            onClick={() => setActivePage('shopping')}
          >
            <span className="sidebar-icon"><Icons.Cart /></span>
            Shopping List
          </button>
        </nav>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-label">ACCOUNT</span>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-link ${activePage === 'history' ? 'active' : ''}`}
            onClick={() => setActivePage('history')}
          >
            <span className="sidebar-icon"><Icons.Folder /></span>
            Plan History
          </button>

          <button
            type="button"
            className={`sidebar-link ${activePage === 'saved' ? 'active' : ''}`}
            onClick={() => setActivePage('saved')}
          >
            <span className="sidebar-icon"><Icons.Heart /></span>
            Saved Plans
          </button>

          <button
            type="button"
            className={`sidebar-link ${activePage === 'profile' ? 'active' : ''}`}
            onClick={() => setActivePage('profile')}
          >
            <span className="sidebar-icon"><Icons.User /></span>
            Profile
          </button>
        </nav>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar">{initials}</div>

        <div className="sidebar-user-info">
          <span className="sidebar-user-name">
            {user?.FullName || 'NutriSmart User'}
          </span>
          <span className="sidebar-user-tier">Free plan</span>
        </div>
      </div>
    </aside>
  );
}

/* Shopping List now uses the groceries from the generated plan. */
function FullShoppingListView({ groceries = [], budget = 500 }) {
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    const savedChecks = {};

    groceries.forEach((item, index) => {
      const id = item.id || item.ingredient_id || index;
      savedChecks[id] = Boolean(item.checked);
    });

    setCheckedItems(savedChecks);
  }, [groceries]);

  const getPrice = (item) => {
    const value =
      item.price ??
      item.price_zar ??
      item.total_price_zar ??
      item.unit_price_zar ??
      0;

    const price = Number(value);
    return Number.isFinite(price) ? price : 0;
  };

  const getName = (item) =>
    item.name ||
    item.ingredient_name ||
    item.item ||
    'Unnamed item';

  const getQuantity = (item) =>
    item.quantity ?? item.amount ?? '';

  const getUnit = (item) => item.unit || '';

  const getCategory = (item) =>
    item.category ||
    item.category_name ||
    'Other';

  const groupedItems = groceries.reduce((groups, item, index) => {
    const category = getCategory(item);

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push({
      ...item,
      id: item.id || item.ingredient_id || index
    });

    return groups;
  }, {});

  const categories = Object.entries(groupedItems).map(
    ([category, items]) => ({
      category,
      items,
      subtotal: items.reduce(
        (total, item) => total + getPrice(item),
        0
      )
    })
  );

  const total = groceries.reduce(
    (sum, item) => sum + getPrice(item),
    0
  );

  const safeBudget = Number(budget) || 0;
  const remaining = safeBudget - total;

  const collectedCount = groceries.filter((item, index) => {
    const id = item.id || item.ingredient_id || index;
    return Boolean(checkedItems[id]);
  }).length;

  const toggleItem = (id) => {
    setCheckedItems((previous) => ({
      ...previous,
      [id]: !previous[id]
    }));
  };

  return (
    <div className="shopping-page-wrapper">
      <div className="shopping-header">
        <div>
          <h2>Shopping List</h2>
          <p>
            Your generated meal plan groceries Â· Tap items
            to mark them as collected
          </p>
        </div>

        <button
          type="button"
          className="print-btn"
          onClick={() => window.print()}
        >
          <Icons.Printer /> Print / Export
        </button>
      </div>

      {groceries.length > 0 ? (
        <>
          <p className="shopping-progress">
            {collectedCount} of {groceries.length} items collected
          </p>

          <div className="shopping-content-grid">
            <div className="shopping-categories-column">
              {categories.map((cat) => (
                <div
                  key={cat.category}
                  className="shopping-cat-card"
                >
                  <div className="shopping-cat-header">
                    <div className="cat-title">
                      <span className="cat-dot" />
                      <strong>{cat.category}</strong>
                      <span className="cat-count">
                        {cat.items.length} items
                      </span>
                    </div>

                    <span className="cat-subtotal">
                      R{cat.subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="shopping-cat-items">
                    {cat.items.map((item) => (
                      <div
                        key={item.id}
                        className={`shopping-item-row ${
                          checkedItems[item.id] ? 'checked' : ''
                        }`}
                        onClick={() => toggleItem(item.id)}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(checkedItems[item.id])}
                          onChange={() => toggleItem(item.id)}
                          onClick={(event) => event.stopPropagation()}
                          className="custom-checkbox"
                          aria-label={`Mark ${getName(item)} as collected`}
                        />

                        <div className="item-text">
                          <span className="item-name">
                            {getName(item)}
                          </span>

                          <span className="item-detail">
                            {getQuantity(item)} {getUnit(item)}
                          </span>
                        </div>

                        <span className="item-price">
                          R{getPrice(item).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="shopping-summary-column">
              <div className="cost-summary-card">
                <h3>Cost Summary</h3>

                <div className="summary-breakdown-list">
                  {categories.map((cat) => (
                    <div
                      className="summary-row"
                      key={cat.category}
                    >
                      <span>{cat.category}</span>
                      <strong>
                        R{cat.subtotal.toFixed(2)}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="summary-divider" />

                <div className="summary-total-area">
                  <span className="total-label">Total Estimate</span>

                  <div className="total-value">
                    R{total.toFixed(2)}
                  </div>

                  <span className="budget-target">
                    of R{safeBudget.toFixed(2)} weekly budget
                  </span>
                </div>

                <div className="summary-savings-pill">
                  <strong>
                    {remaining >= 0
                      ? `R${remaining.toFixed(2)} under budget`
                      : `R${Math.abs(remaining).toFixed(2)} over budget`}
                  </strong>

                  <small>
                    {remaining >= 0
                      ? 'You are within your weekly budget.'
                      : 'Your shopping list exceeds your weekly budget.'}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="cost-summary-card">
          <h3>Your shopping list is empty</h3>
          <p>
            Generate a meal plan with groceries to see your
            shopping items, quantities and estimated costs here.
          </p>
        </div>
      )}
    </div>
  );
}

function getPlanSchedule(plan) {
  const schedule = plan?.schedule || plan?.weekly_schedule || plan?.days || [];

  if (Array.isArray(schedule)) return schedule;

  if (schedule && Array.isArray(schedule.days)) return schedule.days;

  if (schedule && typeof schedule === 'object') {
    return Object.entries(schedule).map(([day, meals]) => ({
      day,
      ...(meals || {})
    }));
  }

  return [];
}

function getPlanMealName(value) {
  if (!value) return 'Not available';
  if (typeof value === 'string') return value;

  return (
    value.name ||
    value.meal_name ||
    value.title ||
    value.recipe_name ||
    'Not available'
  );
}

function PlanViewSchedule({ plan }) {
  const schedule = getPlanSchedule(plan);

  if (!schedule.length) {
    return (
      <div className="account-card">
        <p>This plan does not contain a meal schedule.</p>
      </div>
    );
  }

  return (
    <>
      {schedule.map((day, index) => {
        const meals = day.meals || day;
        const dayName = day.day || day.day_name || day.name || `Day ${index + 1}`;

        return (
          <div
            key={`${dayName}-${index}`}
            className="account-card"
            style={{ marginBottom: '15px' }}
          >
            <h3>{dayName}</h3>
            <p><strong>🥣 Breakfast:</strong> {getPlanMealName(meals.breakfast)}</p>
            <p><strong>🍛 Lunch:</strong> {getPlanMealName(meals.lunch)}</p>
            <p><strong>🍽️ Dinner:</strong> {getPlanMealName(meals.dinner)}</p>
          </div>
        );
      })}
    </>
  );
}

function PlanHistoryView({ setActivePage }) {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  const userId = localStorage.getItem('userId');
  const apiBase = (
    import.meta.env.VITE_API_URL ||
    'https://nutrismart-f59i.onrender.com'
  ).replace(/\/$/, '');

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      if (!userId) {
        setErrorMessage('Please log in to view your plan history.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${apiBase}/plans/user/${encodeURIComponent(userId)}`
        );

        if (!response.ok) {
          throw new Error('Could not load your plan history.');
        }

        const data = await response.json();

        const history = Array.isArray(data)
          ? data
          : data.plans || data.history || (data.plan ? [data.plan] : []);

        if (!cancelled) {
          setPlans(history);
          setErrorMessage('');
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error.message || 'Unable to load plan history.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [userId, apiBase]);

  async function openPlan(plan) {
    setSelectedPlan(plan);
    setSavedMessage('');

    const planId = plan.plan_id || plan.id;

    if (!planId || getPlanSchedule(plan).length) return;

    try {
      const response = await fetch(
        `${apiBase}/plans/${encodeURIComponent(planId)}`
      );

      if (!response.ok) return;

      const data = await response.json();
      setSelectedPlan(data.plan || data);
    } catch (error) {
      console.error('Could not load plan details:', error);
    }
  }

  function savePlan(plan) {
    try {
      const existing = JSON.parse(
        localStorage.getItem('nutrismartSavedPlans') || '[]'
      );

      const planId = plan.plan_id || plan.id || `saved-${Date.now()}`;

      const alreadySaved = existing.some(
        (item) => String(item.plan_id || item.id) === String(planId)
      );

      if (alreadySaved) {
        setSavedMessage('This plan is already saved.');
        return;
      }

      const updated = [
        ...existing,
        { ...plan, id: planId, savedAt: new Date().toISOString() }
      ];

      localStorage.setItem('nutrismartSavedPlans', JSON.stringify(updated));
      setSavedMessage('Plan saved successfully!');
    } catch (error) {
      setSavedMessage('Unable to save this plan on this browser.');
    }
  }

  const formatMoney = (value) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? `R${amount.toFixed(2)}` : 'Not available';
  };

  if (selectedPlan) {
    const title =
      selectedPlan.title ||
      selectedPlan.name ||
      (selectedPlan.week_start
        ? `Week starting ${selectedPlan.week_start}`
        : 'Meal Plan');

    const spent =
      selectedPlan.total_cost_zar ??
      selectedPlan.totalCost ??
      selectedPlan.spent;

    const budget =
      selectedPlan.weekly_budget_zar ??
      selectedPlan.budget;

    return (
      <div className="page-view-container">
        <header className="page-view-header">
          <h2>{title}</h2>
          <p>View the details of your previous meal plan.</p>
        </header>

        <div className="account-card" style={{ marginBottom: '20px' }}>
          <h3>Weekly Spending Summary</h3>
          <div className="card-metric">
            Total spent: <strong>{formatMoney(spent)}</strong>
          </div>
          <div className="card-metric">
            Weekly budget: <strong>{formatMoney(budget)}</strong>
          </div>
        </div>

        <h3 style={{ color: '#0c232c', marginBottom: '15px' }}>
          Your Weekly Meals
        </h3>

        <PlanViewSchedule plan={selectedPlan} />

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="back-dash-btn"
            onClick={() => savePlan(selectedPlan)}
          >
            ♡ Save this plan
          </button>

          <button
            type="button"
            className="back-dash-btn"
            onClick={() => setSelectedPlan(null)}
          >
            ← Back to Plan History
          </button>
        </div>

        {savedMessage && (
          <p role="status" style={{ marginTop: '12px' }}>
            {savedMessage}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="page-view-container">
      <header className="page-view-header">
        <h2>Plan History</h2>
        <p>Review your previous weekly meal plans and expenditure.</p>
      </header>

      {loading && <p>Loading your previous plans...</p>}

      {!loading && errorMessage && (
        <div className="account-card">
          <p>{errorMessage}</p>
        </div>
      )}

      {!loading && !errorMessage && plans.length === 0 && (
        <div className="account-card">
          <h3>No previous plans yet</h3>
          <p>Your generated meal plans will appear here.</p>
          <button
            type="button"
            className="back-dash-btn"
            onClick={() => setActivePage('generate')}
          >
            Generate a Meal Plan
          </button>
        </div>
      )}

      <div className="account-cards-grid">
        {plans.map((plan, index) => {
          const planId = plan.plan_id || plan.id || index;
          const title =
            plan.title ||
            plan.name ||
            (plan.week_start
              ? `Week starting ${plan.week_start}`
              : `Meal Plan ${index + 1}`);

          const cost =
            plan.total_cost_zar ??
            plan.totalCost ??
            plan.spent;

          return (
            <button
              key={planId}
              type="button"
              className="account-card"
              onClick={() => openPlan(plan)}
              style={{
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontFamily: 'inherit'
              }}
            >
              <h3>{title}</h3>
              <div className="card-metric">
                Total spent: <strong>{formatMoney(cost)}</strong>
              </div>
              <p className="card-subtext">Select to view this meal plan.</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SavedPlansView({ setActivePage }) {
  const [plans, setPlans] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('nutrismartSavedPlans') || '[]'
      );
    } catch {
      return [];
    }
  });

  const [selectedPlan, setSelectedPlan] = useState(null);

  function removePlan(planToRemove) {
    const planId = planToRemove.plan_id || planToRemove.id;

    const updated = plans.filter(
      (plan) =>
        String(plan.plan_id || plan.id) !== String(planId)
    );

    setPlans(updated);
    localStorage.setItem('nutrismartSavedPlans', JSON.stringify(updated));
    setSelectedPlan(null);
  }

  const formatMoney = (value) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? `R${amount.toFixed(2)}` : 'Not available';
  };

  if (selectedPlan) {
    const title =
      selectedPlan.title ||
      selectedPlan.name ||
      'Saved Meal Plan';

    const cost =
      selectedPlan.total_cost_zar ??
      selectedPlan.totalCost ??
      selectedPlan.spent;

    return (
      <div className="page-view-container">
        <header className="page-view-header">
          <h2>{title}</h2>
          <p>Your saved weekly meal plan.</p>
        </header>

        <div className="account-card" style={{ marginBottom: '20px' }}>
          <h3>Weekly Meal Plan</h3>
          <p>
            Estimated weekly cost: <strong>{formatMoney(cost)}</strong>
          </p>
        </div>

        <PlanViewSchedule plan={selectedPlan} />

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="back-dash-btn"
            onClick={() => removePlan(selectedPlan)}
          >
            Remove Saved Plan
          </button>

          <button
            type="button"
            className="back-dash-btn"
            onClick={() => setSelectedPlan(null)}
          >
            ← Back to Saved Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-view-container">
      <header className="page-view-header">
        <h2>Saved Plans</h2>
        <p>Your pinned meal plans and favourite weekly routines.</p>
      </header>

      {plans.length === 0 ? (
        <div className="account-card">
          <h3>No saved plans yet</h3>
          <p>Open a plan in Plan History and select "Save this plan".</p>
          <button
            type="button"
            className="back-dash-btn"
            onClick={() => setActivePage('history')}
          >
            View Plan History
          </button>
        </div>
      ) : (
        <div className="account-cards-grid">
          {plans.map((plan, index) => {
            const planId = plan.plan_id || plan.id || index;
            const title =
              plan.title ||
              plan.name ||
              `Saved Plan ${index + 1}`;

            const cost =
              plan.total_cost_zar ??
              plan.totalCost ??
              plan.spent;

            return (
              <button
                key={planId}
                type="button"
                className="account-card"
                onClick={() => setSelectedPlan(plan)}
                style={{
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  fontFamily: 'inherit'
                }}
              >
                <div className="account-card-badge active-tag">
                  FAVORITE
                </div>
                <h3>{title}</h3>
                <div className="card-metric">
                  Estimated: <strong>{formatMoney(cost)} / week</strong>
                </div>
                <p className="card-subtext">Select to view this saved plan.</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getActivityLevelLabel(value) {
  const labels = {
    "1.2": "Sedentary",
    "1.375": "Lightly Active",
    "1.55": "Moderately Active",
    "1.725": "Very Active",
    "1.9": "Extra Active"
  };

  return labels[String(value)] || value || "Not provided";
}
function ProfileView({ setActivePage, user }) {
  const initials = (user?.FullName || 'User')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const profileDetails = [
    ['Full Name', user?.FullName],
    ['Email', user?.Email],
    ['Age', user?.Age ? `${user.Age} years` : null],
    ['Sex', user?.Sex],
    ['Height', user?.HeightCm ? `${user.HeightCm} cm` : null],
    ['Weight', user?.WeightKg ? `${user.WeightKg} kg` : null],
    ['Activity Level', getActivityLevelLabel(user?.ActivityLevel)],
    ['Fitness Goal', user?.Goal],
    ['Household Size', user?.HouseholdSize],
    [
      'Daily Calorie Target',
      user?.DailyCalorieTarget
        ? `${user.DailyCalorieTarget} kcal`
        : null
    ]
  ];

  return (
    <div className="page-view-container">
      <header className="page-view-header">
        <h2>User Profile</h2>
        <p>Your personal details and nutritional goals</p>
      </header>

      <div className="profile-details-card">
        <div className="profile-avatar-large">{initials}</div>

        <div className="profile-rows">
          {profileDetails.map(([label, value]) => (
            <div className="profile-row" key={label}>
              <span>{label}:</span>
              <strong>{value || 'Not available'}</strong>
            </div>
          ))}

          <div className="profile-row">
            <span>Plan Tier:</span>
            <strong>Free Student Tier</strong>
          </div>

          <div className="profile-row">
            <span>Default Weekly Budget:</span>
            <strong>R500.00</strong>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="back-dash-btn"
        onClick={() => setActivePage('dashboard')}
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}

export default function App() {
  const getStoredUser = () => {
    const userId = localStorage.getItem('userId');

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!userId || !uuidPattern.test(userId)) {
      return null;
    }

    let inductionData = {};

    try {
      inductionData = JSON.parse(
        localStorage.getItem('inductionData') || '{}'
      );
    } catch {
      inductionData = {};
    }

    return {
      UserID: userId,
      FullName: localStorage.getItem('userName') || 'NutriSmart User',
      Email: localStorage.getItem('userEmail') || '',
      ...inductionData
    };
  };

  const [user, setUser] = useState(getStoredUser);

  const [activePage, setActivePage] = useState(() =>
    getStoredUser() ? 'dashboard' : 'landing'
  );

  const [planData, setPlanData] = useState(INITIAL_PLAN);
  const [featuredRecipe, setFeaturedRecipe] = useState(FEATURED_RECIPES[0]);

  const handleAuthSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      'Are you sure you want to log out?'
    );

    if (!confirmLogout) return;

    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('inductionData');
    localStorage.removeItem('user');

    setUser(null);
    setPlanData(INITIAL_PLAN);
    setActivePage('landing');
  };

  const handlePageChange = (page) => {
    const protectedPages = [
      'dashboard',
      'generate',
      'shopping',
      'palette',
      'history',
      'saved',
      'profile'
    ];

    if (protectedPages.includes(page) && !user) {
      setActivePage('login');
      return;
    }

    setActivePage(page);
  };

  const handleGeneratePlan = useCallback((newPlan = {}) => {
    const schedule = Array.isArray(newPlan.schedule)
      ? newPlan.schedule
      : [];

    const totalCostValue =
      newPlan.totalCost ??
      newPlan.total_cost_zar ??
      newPlan.spent;

    const totalCost =
      totalCostValue === undefined ||
      totalCostValue === null ||
      totalCostValue === ''
        ? null
        : Number(totalCostValue);

    const mealsPlanned = schedule.reduce((total, day) => {
      return total + ['breakfast', 'lunch', 'dinner'].filter(
        (meal) => day[meal]
      ).length;
    }, 0);

    setPlanData((prev) => ({
      ...prev,
      budget:
        Number(
          newPlan.budget ??
          newPlan.weekly_budget_zar
        ) || prev.budget,
      spent: Number.isFinite(totalCost) ? totalCost : null,
      totalCost: Number.isFinite(totalCost) ? totalCost : null,
      mealsPlanned,
      calories: newPlan.calories ?? null,
      protein: newPlan.protein ?? null,
      carbs: newPlan.carbs ?? null,
      fat: newPlan.fat ?? null,
      schedule,
      groceries: Array.isArray(newPlan.groceries)
        ? newPlan.groceries
        : [],
      planId:
        newPlan.planId ||
        newPlan.plan_id ||
        newPlan.id ||
        null
    }));

    setActivePage('dashboard');
  }, []);

  const handleSwapRecipe = () => {
    setFeaturedRecipe((prev) => {
      const currentIndex = FEATURED_RECIPES.findIndex(
        (recipe) => recipe.name === prev.name
      );

      const nextIndex =
        (currentIndex + 1) % FEATURED_RECIPES.length;

      return FEATURED_RECIPES[nextIndex];
    });
  };

  return (
    <div className="app-layout">
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .fixed-navbar-shell {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 65px;
          z-index: 1000;
          background-color: #0c232c;
        }

        .app-sidebar {
          position: fixed;
          top: 65px;
          left: 0;
          bottom: 0;
          width: 240px;
          height: calc(100vh - 65px);
          background-color: #0c232c;
          color: #94a3b8;
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1rem 1.25rem;
          border-right: 1px solid rgba(255,255,255,0.08);
          box-sizing: border-box;
          z-index: 999;
          overflow-y: auto;
        }

        .sidebar-section {
          margin-bottom: 2rem;
        }

        .sidebar-label {
          display: block;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #64748b;
          margin-bottom: 0.75rem;
          padding-left: 0.75rem;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          width: 100%;
          background: transparent;
          border: none;
          color: #94a3b8;
          padding: 0.65rem 0.75rem;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .sidebar-link:hover {
          background: rgba(255,255,255,0.06);
          color: #ffffff;
        }

        .sidebar-link.active {
          background: #1b3846;
          color: #ffffff;
          font-weight: 600;
        }

        .sidebar-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: inherit;
          width: 20px;
          height: 20px;
        }

        .sidebar-user {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .sidebar-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #059669;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.82rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .sidebar-user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .sidebar-user-name {
          color: #ffffff;
          font-size: 0.84rem;
          font-weight: 600;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .sidebar-user-tier {
          color: #64748b;
          font-size: 0.72rem;
        }

        .app-body {
          margin-top: 65px;
          margin-left: 240px;
          min-height: calc(100vh - 65px);
          background-color: #f8fafc;
        }

        .app-body.no-sidebar {
          margin-left: 0;
        }

        .app-main-content {
          width: 100%;
          min-width: 0;
          background-color: #f8fafc;
        }

        .shopping-page-wrapper {
          padding: 2.2rem 2.5rem;
          max-width: 1100px;
        }

        .shopping-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .shopping-header h2 {
          font-family: 'Fraunces', serif;
          font-size: 1.85rem;
          color: #0c232c;
          margin-bottom: 0.25rem;
        }

        .shopping-header p {
          color: #64748b;
          font-size: 0.95rem;
        }

        .shopping-progress {
          color: #059669;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .print-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background-color: #059669;
          color: white;
          border: none;
          padding: 0.65rem 1.15rem;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .print-btn:hover {
          background-color: #047857;
        }

        .shopping-content-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 2rem;
          align-items: start;
        }

        .shopping-categories-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .shopping-cat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .shopping-cat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.9rem 1.25rem;
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .cat-title {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.95rem;
          color: #0c232c;
        }

        .cat-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #059669;
        }

        .cat-count {
          color: #64748b;
          font-size: 0.82rem;
          font-weight: 400;
        }

        .cat-subtotal {
          font-weight: 700;
          color: #059669;
          font-size: 0.9rem;
        }

        .shopping-item-row {
          display: flex;
          align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #f1f5f9;
          cursor: pointer;
          transition: background 0.15s;
        }

        .shopping-item-row:last-child {
          border-bottom: none;
        }

        .shopping-item-row:hover {
          background-color: #f8fafc;
        }

        .shopping-item-row.checked {
          background-color: #fafbfc;
        }

        .shopping-item-row.checked .item-name {
          text-decoration: line-through;
          color: #94a3b8;
        }

        .custom-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #059669;
          margin-right: 1rem;
          cursor: pointer;
          flex-shrink: 0;
        }

        .item-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .item-name {
          font-size: 0.92rem;
          font-weight: 500;
          color: #1e293b;
        }

        .item-detail {
          font-size: 0.78rem;
          color: #64748b;
        }

        .item-price {
          font-weight: 600;
          color: #1e293b;
          font-size: 0.92rem;
          margin-left: 0.75rem;
        }

        .cost-summary-card {
          background-color: #0c232c;
          color: #ffffff;
          padding: 1.75rem 1.5rem;
          border-radius: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          position: sticky;
          top: 85px;
        }

        .cost-summary-card h3 {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
          color: #ffffff;
        }

        .summary-breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          font-size: 0.88rem;
          color: #cbd5e1;
        }

        .summary-row strong {
          color: #ffffff;
          white-space: nowrap;
        }

        .summary-divider {
          height: 1px;
          background-color: rgba(255,255,255,0.12);
          margin: 1.25rem 0;
        }

        .summary-total-area {
          display: flex;
          flex-direction: column;
          margin-bottom: 1.25rem;
        }

        .total-label {
          font-size: 0.78rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .total-value {
          font-family: 'Fraunces', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #34d399;
        }

        .budget-target {
          font-size: 0.82rem;
          color: #94a3b8;
        }

        .summary-savings-pill {
          background-color: rgba(5,150,105,0.2);
          border: 1px solid rgba(52,211,153,0.3);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          color: #34d399;
          font-size: 0.85rem;
        }

        .summary-savings-pill small {
          color: #94a3b8;
          font-size: 0.75rem;
        }

        .page-view-container {
          padding: 2.5rem;
          max-width: 860px;
        }

        .page-view-header h2 {
          font-family: 'Fraunces', serif;
          font-size: 1.8rem;
          color: #0c232c;
          margin-bottom: 0.25rem;
        }

        .page-view-header p {
          color: #64748b;
          font-size: 0.95rem;
          margin-bottom: 2rem;
        }

        .account-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .account-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .account-card-badge {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748b;
          background: #f1f5f9;
          padding: 3px 8px;
          border-radius: 4px;
          margin-bottom: 0.75rem;
        }

        .account-card-badge.active-tag {
          color: #059669;
          background: #d1fae5;
        }

        .account-card h3 {
          font-size: 1.1rem;
          color: #0c232c;
          margin-bottom: 0.35rem;
        }

        .card-subtext {
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 1rem;
        }

        .card-metric {
          font-size: 0.9rem;
          color: #334155;
          padding-top: 0.75rem;
          border-top: 1px solid #f1f5f9;
        }

        .profile-details-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 2rem;
          display: flex;
          gap: 2rem;
          align-items: center;
          margin-bottom: 2rem;
        }

        .profile-avatar-large {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #059669;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .profile-rows {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
        }

        .profile-row {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          border-bottom: 1px solid #f8fafc;
          padding-bottom: 0.4rem;
          font-size: 0.92rem;
        }

        .profile-row span {
          color: #64748b;
        }

        .profile-row strong {
          color: #0c232c;
          text-align: right;
        }

        .back-dash-btn {
          background: #059669;
          color: #ffffff;
          border: none;
          padding: 0.65rem 1.25rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.88rem;
          transition: background 0.2s ease;
        }

        .back-dash-btn:hover {
          background: #047857;
        }

        @media (max-width: 900px) {
          .app-sidebar {
            width: 200px;
          }

          .app-body {
            margin-left: 200px;
          }

          .shopping-content-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .app-sidebar {
            display: none;
          }

          .app-body {
            margin-left: 0;
          }

          .shopping-page-wrapper,
          .page-view-container {
            padding: 1.25rem;
          }

          .shopping-header {
            flex-direction: column;
            gap: 1rem;
          }

          .profile-details-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .profile-row {
            flex-wrap: wrap;
          }
        }
      `}</style>

      <div className="fixed-navbar-shell">
        <Navbar
          activePage={activePage}
          setActivePage={handlePageChange}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      <div
        className={`app-body ${
          activePage === 'landing' ||
          activePage === 'login' ||
          activePage === 'register' ||
          activePage === 'induction'
            ? 'no-sidebar'
            : ''
        }`}
      >
        {user &&
          activePage !== 'landing' &&
          activePage !== 'login' &&
          activePage !== 'register' &&
          activePage !== 'induction' && (
            <Sidebar
              activePage={activePage}
              setActivePage={handlePageChange}
              user={user}
            />
          )}

        <main className="app-main-content">
          {activePage === 'landing' && (
            <Landing setActivePage={handlePageChange} />
          )}

          {activePage === 'induction' && (
            <Induction
              onContinue={(inductionData) => {
                localStorage.setItem(
                  'inductionData',
                  JSON.stringify(inductionData)
                );
                setActivePage('register');
              }}
            />
          )}

          {(activePage === 'login' || activePage === 'register') && (
            <Auth
              mode={activePage}
              setActivePage={setActivePage}
              onAuthSuccess={handleAuthSuccess}
            />
          )}

          {activePage === 'dashboard' && user && (
  <Dashboard
    setActivePage={handlePageChange}
    planData={planData}
    featuredRecipe={featuredRecipe}
    onSwapRecipe={handleSwapRecipe}
    user={user}
    onGeneratePlan={() => handlePageChange('generate')}
    onPlanLoaded={handleGeneratePlan}
  />
)}

          {activePage === 'generate' && user && (
            <Generate
              setActivePage={handlePageChange}
              onGeneratePlan={handleGeneratePlan}
              currentBudget={planData.budget}
            />
          )}

          {activePage === 'shopping' && user && (
            <FullShoppingListView
              groceries={planData.groceries}
              budget={planData.budget}
            />
          )}

          {activePage === 'palette' && user && (
            <Palette setActivePage={handlePageChange} />
          )}

          {activePage === 'history' && user && (
            <PlanHistoryView setActivePage={handlePageChange} />
          )}

          {activePage === 'saved' && user && (
            <SavedPlansView setActivePage={handlePageChange} />
          )}

          {activePage === 'profile' && user && (
            <ProfileView
              setActivePage={handlePageChange}
              user={user}
            />
          )}
        </main>
      </div>
    </div>
  );
}

