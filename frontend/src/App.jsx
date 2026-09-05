import { useState } from 'react';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import Palette from './pages/Palette';

const SAMPLE_RECIPES = [
  {
    type: 'Dinner',
    name: 'Grilled Chicken & Steamed Veggies',
    prepTime: '25 mins',
    tag: 'High-Protein',
    cost: 32.50
  },
  {
    type: 'Dinner',
    name: 'Cape Malay Lentil Bobotie',
    prepTime: '35 mins',
    tag: 'Vegetarian',
    cost: 19.50
  },
  {
    type: 'Dinner',
    name: 'Pilchard & Tomato Stew with Pap',
    prepTime: '20 mins',
    tag: 'Budget Saver',
    cost: 16.80
  },
  {
    type: 'Dinner',
    name: 'Beef Stew & Dumplings (Dombolo)',
    prepTime: '50 mins',
    tag: 'Hearty',
    cost: 36.00
  }
];

function App() {
  const [activePage, setActivePage] = useState('landing');
  const [recipeIndex, setRecipeIndex] = useState(0);

  const [planData, setPlanData] = useState({
    budget: 500,
    spent: 418.50,
    mealsPlanned: 21,
    calories: 1840,
    protein: 115,
    carbs: 210,
    fat: 54,
    groceries: [
      { id: 1, name: 'Jungle Oats', quantity: '1', unit: 'kg box', price: 38.99, checked: true },
      { id: 2, name: 'Full Cream Milk', quantity: '2', unit: 'litres', price: 34.00, checked: false },
      { id: 3, name: 'Chicken Breast Fillets', quantity: '1', unit: 'kg pack', price: 89.99, checked: false },
      { id: 4, name: 'Brown Rice', quantity: '2', unit: 'kg bag', price: 36.50, checked: false }
    ]
  });

  const handleSwapRecipe = () => {
    setRecipeIndex((prevIndex) => (prevIndex + 1) % SAMPLE_RECIPES.length);
  };

  const handleGeneratePlan = ({ budget, people, selectedTags }) => {
    const calculatedSpent = Math.round(budget * 0.837 * 100) / 100;
    const isHighProtein = selectedTags.includes('High-Protein');

    setPlanData((prev) => ({
      ...prev,
      budget: Number(budget),
      spent: calculatedSpent,
      calories: isHighProtein ? 2050 : 1840,
      protein: isHighProtein ? 140 : 115
    }));
  };

  return (
    <div>
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main>
        {activePage === 'landing' && <Landing setActivePage={setActivePage} />}
        {activePage === 'dashboard' && (
          <Dashboard
            setActivePage={setActivePage}
            planData={planData}
            featuredRecipe={SAMPLE_RECIPES[recipeIndex]}
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
        {activePage === 'palette' && <Palette />}
      </main>
    </div>
  );
}

export default App;