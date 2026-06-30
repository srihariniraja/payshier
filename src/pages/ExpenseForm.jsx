import React, { useState } from 'react';

function ExpenseForm({ goTo, onAddExpense }) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'food',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = [
    { value: 'food', label: '🍕 Food & Dining', keywords: ['swiggy', 'zomato', 'restaurant', 'food'] },
    { value: 'travel', label: '🚗 Travel & Transport', keywords: ['uber', 'ola', 'fuel', 'bus', 'train'] },
    { value: 'shopping', label: '🛒 Shopping', keywords: ['amazon', 'flipkart', 'mall', 'clothes'] },
    { value: 'entertainment', label: '🎬 Entertainment', keywords: ['movie', 'netflix', 'concert', 'game'] },
    { value: 'utilities', label: '🏠 Utilities', keywords: ['electricity', 'rent', 'internet', 'bill'] }
  ];

  // 🆕 ADD THIS HANDLESUBMIT FUNCTION
  const handleSubmit = (e) => {
    e.preventDefault();
    const expense = {
      id: Date.now(),
      ...formData,
      amount: parseFloat(formData.amount)
    };
    
    console.log('🆕 Creating expense:', expense);
    
    // 🆕 SAVE TO LOCALSTORAGE DIRECTLY:
    const existingExpenses = JSON.parse(localStorage.getItem('payshier-expenses') || '[]');
    const updatedExpenses = [...existingExpenses, expense];
    localStorage.setItem('payshier-expenses', JSON.stringify(updatedExpenses));
    
    console.log('✅ Expense saved to localStorage. Total expenses:', updatedExpenses.length);
    
    // Also call the prop function if it exists
    if (onAddExpense) {
      onAddExpense(expense);
    }
    
    goTo('spendinginsights');
  };

  // Auto-detect category based on description
  const autoDetectCategory = (description) => {
    const desc = description.toLowerCase();
    const detected = categories.find(cat => 
      cat.keywords.some(keyword => desc.includes(keyword))
    );
    return detected ? detected.value : 'other';
  };

  return (
    <div style={{ padding: '2rem', background: '#f8f9fa', minHeight: '100vh' }}>
      <h2>➕ Add Expense</h2>
      <form onSubmit={handleSubmit} style={cardStyle}>
        <div style={formGroupStyle}>
          <label style={labelStyle}>Description *</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => {
              const desc = e.target.value;
              setFormData({
                ...formData,
                description: desc,
                category: autoDetectCategory(desc)
              });
            }}
            placeholder="e.g., Dinner at Restaurant, Uber ride"
            style={inputStyle}
            required
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Amount (₹) *</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            style={inputStyle}
            required
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            style={inputStyle}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            style={inputStyle}
          />
        </div>

        <button type="submit" style={buttonStyle}>Add Expense</button>
      </form>
    </div>
  );
}

// STYLES
const buttonStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '25px',
  cursor: 'pointer',
  fontWeight: 'bold',
  marginTop: '1rem',
  width: '100%'
};

const formGroupStyle = { 
  marginBottom: '1.5rem' 
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  fontWeight: 'bold',
  color: '#333'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '2px solid #e9ecef',
  borderRadius: '10px',
  fontSize: '1rem',
  background: 'white'
};

const cardStyle = {
  background: 'white',
  padding: '2rem',
  borderRadius: '10px',
  maxWidth: '500px',
  margin: '0 auto',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
};

export default ExpenseForm;