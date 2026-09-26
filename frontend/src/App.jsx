import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import Palette from './pages/Palette';
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

const FEATURED_RECIPES = [
  { id: 1, name: 'Grilled Chicken & Steamed Veggies', type: 'DINNER', price: 'R32.50', time: '25 mins', tag: 'High-Protein' },
  { id: 2, name: 'Pap & Chakalaka with Beans', type: 'DINNER', price: 'R28.00', time: '20 mins', tag: 'Vegetarian' },
  { id: 3, name: 'Lentil Stew with Brown Rice', type: 'DINNER', price: 'R22.50', time: '35 mins', tag: 'Budget Saver' }
];

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [planData, setPlanData] = useState(INITIAL_PLAN);
  const [featuredRecipe, setFeaturedRecipe] = useState(FEATURED_RECIPES[0]);

  // Saves the live backend schedule and total cost into React state
  const handleGeneratePlan = (newPlan) => {
    setPlanData((prev) => ({
      ...prev,
      budget: Number(newPlan.budget) || prev.budget,
      spent: Number(newPlan.totalCost ?? newPlan.spent ?? prev.spent),
      totalCost: Number(newPlan.totalCost ?? newPlan.spent ?? prev.spent),
      schedule: newPlan.schedule && newPlan.schedule.length > 0 ? newPlan.schedule : prev.schedule,
      planId: newPlan.planId || prev.planId,
    }));
  };

  const handleSwapRecipe = () => {
    setFeaturedRecipe((prev) => {
      const currentIndex = FEATURED_RECIPES.findIndex((r) => r.name === prev.name);
      const nextIndex = (currentIndex + 1) % FEATURED_RECIPES.length;
      return FEATURED_RECIPES[nextIndex];
    });
  };

  return (
    <div className="app-layout">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <main className="app-main-content">
        {activePage === 'landing' && <Landing setActivePage={setActivePage} />}
        {activePage === 'dashboard' && (
          <Dashboard
            setActivePage={setActivePage}
            planData={planData}
            featuredRecipe={featuredRecipe}
            onSwapRecipe={handleSwapRecipe}
          />
        )}
        {activePage === 'generate' && (
          <Generate
            setActivePage={setActivePage}
            onGeneratePlan={handleGeneratePlan}
            currentBudget={planData.budget}
          />
        )}
        {activePage === 'palette' && <Palette setActivePage={setActivePage} />}
      </main>
    </div>
  );
}