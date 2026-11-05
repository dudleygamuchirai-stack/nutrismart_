
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import Palette from './pages/Palette';
import Auth from './pages/Auth';
import './App.css';

const INITIAL_PLAN = {
  budget: 500,
  spent: 418.50,
  totalCost: 418.50,
  mealsPlanned: 21,
  calories: 1840,
  protein: 115,
  carbs: 210,
  fat: 54,
  schedule: [],
  groceries: [
    { id: 1, name: 'Jungle Oats', quantity: '1 kg box', price: 38.99, checked: true },
    { id: 2, name: 'Full Cream Milk', quantity: '2 litres', price: 34.00, checked: false },
    { id: 3, name: 'Chicken Breast Fillets', quantity: '1 kg pack', price: 89.99, checked: false },
    { id: 4, name: 'Brown Rice', quantity: '2 kg bag', price: 36.50, checked: false }
  ]
};

const INITIAL_SHOPPING_CATEGORIES = [
  {
    category: 'Protein',
    count: '4 items',
    subtotal: 'R142.00',
    color: '#e0f2fe',
    badgeColor: '#0284c7',
    items: [
      { id: 'p1', name: 'Chicken Breast (2 pack)', detail: '800g · Pick n Pay', price: 62.99, checked: false },
      { id: 'p2', name: 'Eggs (6 pack)', detail: '6 units · Checkers', price: 34.99, checked: true },
      { id: 'p3', name: 'Tuna in brine (2 tins)', detail: '2 x 170g · Pick n Pay', price: 26.00, checked: false },
      { id: 'p4', name: 'Lentils (dry)', detail: '500g · Pick n Pay', price: 18.99, checked: false }
    ]
  },
  {
    category: 'Grains & Starches',
    count: '4 items',
    subtotal: 'R68.50',
    color: '#ecfdf5',
    badgeColor: '#059669',
    items: [
      { id: 'g1', name: 'Jungle Oats (1kg)', detail: '1kg · Checkers', price: 38.99, checked: true },
      { id: 'g2', name: 'White Maize Meal (2kg)', detail: '2 kg · Shoprite', price: 22.50, checked: false },
      { id: 'g3', name: 'Brown Bread', detail: '1 loaf · Pick n Pay', price: 17.00, checked: false }
    ]
  }
];

const FEATURED_RECIPES = [
  { id: 1, name: 'Grilled Chicken & Steamed Veggies', type: 'DINNER', price: 'R32.50', time: '25 mins', tag: 'High-Protein' },
  { id: 2, name: 'Pap & Chakalaka with Beans', type: 'DINNER', price: 'R28.00', time: '20 mins', tag: 'Vegetarian' },
  { id: 3, name: 'Lentil Stew with Brown Rice', type: 'DINNER', price: 'R22.50', time: '35 mins', tag: 'Budget Saver' }
];

const Icons = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1"></rect>
      <rect x="14" y="3" width="7" height="5" rx="1"></rect>
      <rect x="14" y="12" width="7" height="9" rx="1"></rect>
      <rect x="3" y="16" width="7" height="5" rx="1"></rect>
    </svg>
  ),
  Generate: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  ),
  Calendar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  Cart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
  ),
  Folder: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  Heart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  Printer: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9"></polyline>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
      <rect x="6" y="14" width="12" height="8"></rect>
    </svg>
  )
};

function Sidebar({ activePage, setActivePage, user }) {
  const handleScrollToPlan = () => {
    if (activePage !== 'dashboard') {
      setActivePage('dashboard');
      setTimeout(() => {
        const el = document.querySelector('.dashboard-grid');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.querySelector('.dashboard-grid');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
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
          <button type="button" className={`sidebar-link ${activePage === 'dashboard' ? 'active' : ''}`} onClick={() => setActivePage('dashboard')}>
            <span className="sidebar-icon"><Icons.Dashboard /></span>
            Dashboard
          </button>
          <button type="button" className={`sidebar-link ${activePage === 'generate' ? 'active' : ''}`} onClick={() => setActivePage('generate')}>
            <span className="sidebar-icon"><Icons.Generate /></span>
            Generate Plan
          </button>
          <button type="button" className="sidebar-link" onClick={handleScrollToPlan}>
            <span className="sidebar-icon"><Icons.Calendar /></span>
            My Plan
          </button>
          <button type="button" className={`sidebar-link ${activePage === 'shopping' ? 'active' : ''}`} onClick={() => setActivePage('shopping')}>
            <span className="sidebar-icon"><Icons.Cart /></span>
            Shopping List
          </button>
        </nav>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-label">ACCOUNT</span>
        <nav className="sidebar-nav">
          <button type="button" className={`sidebar-link ${activePage === 'history' ? 'active' : ''}`} onClick={() => setActivePage('history')}>
            <span className="sidebar-icon"><Icons.Folder /></span>
            Plan History
          </button>
          <button type="button" className={`sidebar-link ${activePage === 'saved' ? 'active' : ''}`} onClick={() => setActivePage('saved')}>
            <span className="sidebar-icon"><Icons.Heart /></span>
            Saved Plans
          </button>
          <button type="button" className={`sidebar-link ${activePage === 'profile' ? 'active' : ''}`} onClick={() => setActivePage('profile')}>
            <span className="sidebar-icon"><Icons.User /></span>
            Profile
          </button>
        </nav>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar">{initials}</div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">{user?.FullName || 'NutriSmart User'}</span>
          <span className="sidebar-user-tier">Free plan</span>
        </div>
      </div>
    </aside>
  );
}

function FullShoppingListView() {
  const [categories, setCategories] = useState(INITIAL_SHOPPING_CATEGORIES);

  const toggleItem = (catIdx, itemIdx) => {
    setCategories((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[catIdx].items[itemIdx].checked = !next[catIdx].items[itemIdx].checked;
      return next;
    });
  };

  return (
    <div className="shopping-page-wrapper">
      <div className="shopping-header">
        <div>
          <h2>Shopping List</h2>
          <p>Week of 19 – 25 May 2026 · Tap items to mark as collected</p>
        </div>
        <button className="print-btn" onClick={() => window.print()}>
          <Icons.Printer /> Print / Export
        </button>
      </div>

      <div className="shopping-content-grid">
        <div className="shopping-categories-column">
          {categories.map((cat, catIdx) => (
            <div key={cat.category} className="shopping-cat-card">
              <div className="shopping-cat-header">
                <div className="cat-title">
                  <span className="cat-dot" style={{ backgroundColor: cat.badgeColor }}></span>
                  <strong>{cat.category}</strong>
                  <span className="cat-count">{cat.count}</span>
                </div>
                <span className="cat-subtotal">{cat.subtotal}</span>
              </div>

              <div className="shopping-cat-items">
                {cat.items.map((item, itemIdx) => (
                  <div key={item.id} className={`shopping-item-row ${item.checked ? 'checked' : ''}`} onClick={() => toggleItem(catIdx, itemIdx)}>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(catIdx, itemIdx)}
                      onClick={(event) => event.stopPropagation()}
                      className="custom-checkbox"
                    />
                    <div className="item-text">
                      <span className="item-name">{item.name}</span>
                      <span className="item-detail">{item.detail}</span>
                    </div>
                    <span className="item-price">R{item.price.toFixed(2)}</span>
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
              <div className="summary-row"><span>Protein items</span><strong>R142.00</strong></div>
              <div className="summary-row"><span>Grains & Starches</span><strong>R68.50</strong></div>
              <div className="summary-row"><span>Produce</span><strong>R78.50</strong></div>
              <div className="summary-row"><span>Dairy</span><strong>R58.50</strong></div>
              <div className="summary-row"><span>Condiments</span><strong>R50.00</strong></div>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-total-area">
              <span className="total-label">Total Estimate</span>
              <div className="total-value">R418.50</div>
              <span className="budget-target">of R500.00 weekly budget</span>
            </div>
            <div className="summary-savings-pill">
              <strong>R81.50 under budget!</strong>
              <small>That's money back in your pocket</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanHistoryView({ setActivePage }) {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const days = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday',
    'Friday', 'Saturday', 'Sunday'
  ];

  const plans = [
    {
      id: 1,
      title: 'Week of 12 – 18 May 2026',
      store: 'Checkers',
      spent: 'R412.00',
      budget: 'R500.00',
      meals: [
        ['Jungle Oats and Banana', 'Pap and Lentils', 'Grilled Chicken and Vegetables'],
        ['Scrambled Eggs and Toast', 'Rice and Beans', 'Chicken Stew and Pap'],
        ['Maize Meal Porridge', 'Lentil and Rice Bowl', 'Grilled Chicken and Spinach'],
        ['Boiled Eggs and Toast', 'Pap and Chakalaka', 'Vegetable Stew and Rice'],
        ['Oats and Milk', 'Chicken and Brown Rice', 'Beans and Vegetables'],
        ['Peanut Butter Toast', 'Pap and Spinach', 'Chicken Stew and Vegetables'],
        ['Banana Smoothie', 'Rice and Lentils', 'Eggs and Vegetables']
      ]
    },
    {
      id: 2,
      title: 'Week of 5 – 11 May 2026',
      store: 'Shoprite',
      spent: 'R395.50',
      budget: 'R500.00',
      meals: [
        ['Oats and Milk', 'Rice and Beans', 'Chicken and Vegetables'],
        ['Boiled Eggs and Toast', 'Pap and Spinach', 'Lentil Stew and Rice'],
        ['Banana and Yoghurt', 'Chicken Rice Bowl', 'Vegetable Soup and Bread'],
        ['Maize Meal Porridge', 'Beans and Chakalaka', 'Grilled Chicken and Rice'],
        ['Scrambled Eggs and Toast', 'Lentils and Pap', 'Chicken and Vegetables'],
        ['Oats and Banana', 'Rice and Vegetables', 'Bean Stew and Pap'],
        ['Peanut Butter Toast', 'Chicken and Rice', 'Eggs and Spinach']
      ]
    }
  ];

  if (selectedPlan) {
    return (
      <div className="page-view-container">
        <header className="page-view-header">
          <h2>{selectedPlan.title}</h2>
          <p>Completed weekly meal plan from {selectedPlan.store}</p>
        </header>

        <div className="account-card" style={{ marginBottom: '20px' }}>
          <h3>Weekly Spending Summary</h3>
          <div className="card-metric">Store: <strong>{selectedPlan.store}</strong></div>
          <div className="card-metric">Total spent: <strong>{selectedPlan.spent}</strong></div>
          <div className="card-metric">Weekly budget: <strong>{selectedPlan.budget}</strong></div>
          <div className="card-metric">Meals planned: <strong>21 meals</strong></div>
        </div>

        <h3 style={{ color: '#0c232c', marginBottom: '15px' }}>Your Weekly Meals</h3>

        {days.map((day, index) => (
          <div key={day} className="account-card" style={{ marginBottom: '15px' }}>
            <h3>{day}</h3>
            <p><strong>🥣 Breakfast:</strong> {selectedPlan.meals[index][0]}</p>
            <p><strong>🍛 Lunch:</strong> {selectedPlan.meals[index][1]}</p>
            <p><strong>🍽️ Dinner:</strong> {selectedPlan.meals[index][2]}</p>
          </div>
        ))}

        <button type="button" className="back-dash-btn" onClick={() => setSelectedPlan(null)}>
          ← Back to Plan History
        </button>
      </div>
    );
  }

  return (
    <div className="page-view-container">
      <header className="page-view-header">
        <h2>Plan History</h2>
        <p>Review your previous weekly grocery plans and expenditure</p>
      </header>

      <div className="account-cards-grid">
        {plans.map((plan) => (
          <button
            key={plan.id}
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
            <div className="account-card-badge">COMPLETED</div>
            <h3>{plan.title}</h3>
            <p className="card-subtext">21 Meals Planned · {plan.store}</p>
            <div className="card-metric">
              Spent: <strong>{plan.spent}</strong> / {plan.budget}
            </div>
            <p style={{ color: '#059669', fontWeight: '600' }}>View Meal Plan →</p>
          </button>
        ))}
      </div>

      <button type="button" className="back-dash-btn" onClick={() => setActivePage('dashboard')}>
        ← Back to Dashboard
      </button>
    </div>
  );
}

function SavedPlansView({ setActivePage }) {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: 'budget',
      title: 'Budget Student Saver',
      description: 'Affordable meals featuring pap, beans and oats.',
      cost: 'R380.00',
      meals: [
        ['Jungle Oats', 'Pap and beans', 'Chicken stew and vegetables'],
        ['Toast and eggs', 'Rice and chakalaka', 'Bean stew and pap'],
        ['Oats and banana', 'Pap and spinach', 'Chicken and rice'],
        ['Boiled eggs and toast', 'Beans and rice', 'Vegetable stew and pap'],
        ['Jungle Oats', 'Chicken and vegetables', 'Pap and beans'],
        ['Peanut butter toast', 'Rice and beans', 'Chicken stew'],
        ['Oats and banana', 'Pap and vegetables', 'Eggs and rice']
      ]
    },
    {
      id: 'protein',
      title: 'High Protein Lean Plan',
      description: 'Balanced meals featuring grilled chicken and eggs.',
      cost: 'R450.00',
      meals: [
        ['Boiled eggs and oats', 'Grilled chicken and rice', 'Chicken salad'],
        ['Eggs and wholewheat toast', 'Chicken and vegetables', 'Tuna salad'],
        ['Greek yoghurt and oats', 'Grilled chicken and sweet potato', 'Egg omelette'],
        ['Scrambled eggs', 'Chicken rice bowl', 'Grilled fish and vegetables'],
        ['Oats and boiled eggs', 'Chicken salad', 'Eggs and sweet potato'],
        ['Greek yoghurt and banana', 'Grilled chicken and rice', 'Tuna and vegetables'],
        ['Egg omelette and toast', 'Chicken and vegetables', 'Grilled fish and salad']
      ]
    }
  ];

  const days = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday',
    'Friday', 'Saturday', 'Sunday'
  ];

  if (selectedPlan) {
    return (
      <div className="page-view-container">
        <header className="page-view-header">
          <h2>{selectedPlan.title}</h2>
          <p>{selectedPlan.description}</p>
        </header>

        <div className="account-card" style={{ marginBottom: '20px' }}>
          <h3>Weekly Meal Plan</h3>
          <p>Estimated weekly cost: <strong>{selectedPlan.cost}</strong></p>
        </div>

        {days.map((day, index) => (
          <div key={day} className="account-card" style={{ marginBottom: '15px' }}>
            <h3>{day}</h3>
            <p><strong>🥣 Breakfast:</strong> {selectedPlan.meals[index][0]}</p>
            <p><strong>🍛 Lunch:</strong> {selectedPlan.meals[index][1]}</p>
            <p><strong>🍽️ Dinner:</strong> {selectedPlan.meals[index][2]}</p>
          </div>
        ))}

        <button className="back-dash-btn" onClick={() => setSelectedPlan(null)}>
          ← Back to Saved Plans
        </button>
      </div>
    );
  }

  return (
    <div className="page-view-container">
      <header className="page-view-header">
        <h2>Saved Plans</h2>
        <p>Your pinned meal routines and favorite weekly recipes</p>
      </header>

      <div className="account-cards-grid">
        {plans.map((plan) => (
          <button
            key={plan.id}
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
            <div className="account-card-badge active-tag">FAVORITE</div>
            <h3>{plan.title}</h3>
            <p className="card-subtext">{plan.description}</p>
            <div className="card-metric">
              Estimated: <strong>{plan.cost} / week</strong>
            </div>
            <p style={{ color: '#059669', fontWeight: '600' }}>View Meal Plan →</p>
          </button>
        ))}
      </div>

      <button className="back-dash-btn" onClick={() => setActivePage('dashboard')}>
        ← Back to Dashboard
      </button>
    </div>
  );
}

function ProfileView({ setActivePage, user }) {
  const initials = (user?.FullName || 'User')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="page-view-container">
      <header className="page-view-header">
        <h2>User Profile</h2>
        <p>Account preferences and weekly nutritional goals</p>
      </header>

      <div className="profile-details-card">
        <div className="profile-avatar-large">{initials}</div>
        <div className="profile-rows">
          <div className="profile-row">
            <span>Full Name:</span>
            <strong>{user?.FullName || 'Not available'}</strong>
          </div>
          <div className="profile-row">
            <span>Email:</span>
            <strong>{user?.Email || 'Not available'}</strong>
          </div>
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

      <button className="back-dash-btn" onClick={() => setActivePage('dashboard')}>
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

    return {
      UserID: userId,
      FullName: localStorage.getItem('userName') || 'NutriSmart User',
      Email: localStorage.getItem('userEmail') || ''
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
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
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

  const handleGeneratePlan = (newPlan) => {
    setPlanData((prev) => ({
      ...prev,
      budget: Number(newPlan.budget) || prev.budget,
      spent: Number(newPlan.totalCost ?? newPlan.spent ?? prev.spent),
      totalCost: Number(newPlan.totalCost ?? newPlan.spent ?? prev.spent),
      schedule:
        newPlan.schedule && newPlan.schedule.length > 0
          ? newPlan.schedule
          : prev.schedule,
      planId: newPlan.planId || prev.planId
    }));
  };

  const handleSwapRecipe = () => {
    setFeaturedRecipe((prev) => {
      const currentIndex = FEATURED_RECIPES.findIndex(
        (recipe) => recipe.name === prev.name
      );
      const nextIndex = (currentIndex + 1) % FEATURED_RECIPES.length;
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
          padding: 1.5rem 1rem 1.25rem 1rem;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
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
          background: rgba(255, 255, 255, 0.06);
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
          border-top: 1px solid rgba(255, 255, 255, 0.08);
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
        }

        .item-text {
          flex: 1;
          display: flex;
          flex-direction: column;
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
          font-size: 0.88rem;
          color: #cbd5e1;
        }

        .summary-row strong {
          color: #ffffff;
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
          background-color: rgba(5, 150, 105, 0.2);
          border: 1px solid rgba(52, 211, 153, 0.3);
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
          border-bottom: 1px solid #f8fafc;
          padding-bottom: 0.4rem;
          font-size: 0.92rem;
        }

        .profile-row span {
          color: #64748b;
        }

        .profile-row strong {
          color: #0c232c;
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
            gap: 1rem;
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
          activePage === 'register'
            ? 'no-sidebar'
            : ''
        }`}
      >
        {user &&
          activePage !== 'landing' &&
          activePage !== 'login' &&
          activePage !== 'register' && (
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
            <FullShoppingListView />
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
