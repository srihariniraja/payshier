import React, { useState, useEffect } from 'react';

function SpendingInsights({ goTo }) {
  const [expenses, setExpenses] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const savedBudget = localStorage.getItem('payshier-monthly-budget');
    return savedBudget ? parseInt(savedBudget) : 10000;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newBudgetInput, setNewBudgetInput] = useState(monthlyBudget);

  // Load expenses from localStorage
  const loadExpenses = () => {
    setIsLoading(true);
    try {
      console.log('🔄 Loading expenses from localStorage...');
      const savedExpenses = JSON.parse(localStorage.getItem('payshier-expenses') || '[]');
      console.log('📊 Raw expenses data:', savedExpenses);
      
      // Transform data with better handling
      const transformedExpenses = savedExpenses.map(exp => {
        // Get amount from different possible fields
        let amount = 0;
        if (typeof exp.totalAmount === 'number') {
          amount = exp.totalAmount;
        } else if (typeof exp.totalAmount === 'string') {
          amount = parseFloat(exp.totalAmount) || 0;
        } else if (typeof exp.amount === 'number') {
          amount = exp.amount;
        } else if (typeof exp.amount === 'string') {
          amount = parseFloat(exp.amount) || 0;
        }
        
        // Get category - check multiple possible fields
        let category = 'other';
        if (exp.category && typeof exp.category === 'string') {
          category = exp.category.toLowerCase();
        }
        
        // Get title/description
        let title = 'Untitled Expense';
        if (exp.title && exp.title.trim()) {
          title = exp.title;
        } else if (exp.description && exp.description.trim()) {
          title = exp.description;
        }
        
        // Get date
        let date = new Date().toISOString().split('T')[0];
        if (exp.date) {
          date = exp.date;
        } else if (exp.createdAt) {
          date = exp.createdAt.split('T')[0];
        }
        
        // Get paidBy
        let paidBy = 'Unknown';
        if (exp.paidBy) {
          paidBy = exp.paidBy;
        }
        
        // Get split type
        let splitType = 'equal';
        if (exp.splitType) {
          splitType = exp.splitType;
        }
        
        return {
          ...exp,
          amount: amount,
          title: title,
          category: category,
          date: date,
          paidBy: paidBy,
          splitType: splitType
        };
      });
      
      console.log('📈 Transformed expenses:', transformedExpenses);
      setExpenses(transformedExpenses);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('❌ Error loading expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear ALL expenses
  const clearAllExpenses = () => {
    if (window.confirm('⚠️ Are you sure you want to clear ALL expenses? This action cannot be undone!')) {
      localStorage.removeItem('payshier-expenses');
      
      const allTransactions = JSON.parse(localStorage.getItem('payshier-transactions') || '[]');
      const nonExpenseTransactions = allTransactions.filter(t => 
        t.type !== 'expense' && t.type !== 'expense_settlement'
      );
      localStorage.setItem('payshier-transactions', JSON.stringify(nonExpenseTransactions));
      
      setExpenses([]);
      setLastUpdated(new Date());
      
      alert('✅ All expenses have been cleared!');
    }
  };

  // Refresh button handler
  const handleRefresh = () => {
    if (window.confirm('This will clear all expenses and allow you to set a new budget. Continue?')) {
      clearAllExpenses();
      setShowBudgetModal(true);
    }
  };

  // Save new budget
  const saveNewBudget = () => {
    const budget = parseInt(newBudgetInput);
    if (isNaN(budget) || budget < 0) {
      alert('Please enter a valid budget amount!');
      return;
    }
    
    setMonthlyBudget(budget);
    localStorage.setItem('payshier-monthly-budget', budget.toString());
    setShowBudgetModal(false);
    
    alert(`✅ Monthly budget set to ₹${budget}`);
  };

  // Reset budget to default
  const resetBudgetToDefault = () => {
    setMonthlyBudget(10000);
    localStorage.setItem('payshier-monthly-budget', '10000');
    setNewBudgetInput(10000);
    alert('✅ Budget reset to default: ₹10,000');
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  // Calculate totals
  const currentMonthSpending = expenses
    .filter(exp => {
      if (!exp.date) return false;
      try {
        const expenseDate = new Date(exp.date);
        const now = new Date();
        return expenseDate.getMonth() === now.getMonth() && 
               expenseDate.getFullYear() === now.getFullYear();
      } catch {
        return false;
      }
    })
    .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

  // Get spending by category with proper category names
  const spendingByCategory = expenses.reduce((acc, exp) => {
    const category = exp.category || 'other';
    const amount = parseFloat(exp.amount) || 0;
    if (amount > 0) {
      acc[category] = (acc[category] || 0) + amount;
    }
    return acc;
  }, {});

  // Calculate total spending for percentages
  const totalSpending = Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0);
  
  // Category mapping with proper names
  const categoryMapping = {
    'food': 'Food & Dining',
    'travel': 'Travel & Transport',
    'shopping': 'Shopping',
    'entertainment': 'Entertainment',
    'utilities': 'Utilities',
    'other': 'Other'
  };
  
  // Category colors and icons
  const categoryData = {
    food: { color: '#FF6384', icon: '🍕', name: 'Food & Dining' },
    travel: { color: '#36A2EB', icon: '🚗', name: 'Travel & Transport' },
    shopping: { color: '#FFCE56', icon: '🛒', name: 'Shopping' },
    entertainment: { color: '#4BC0C0', icon: '🎬', name: 'Entertainment' },
    utilities: { color: '#9966FF', icon: '🏠', name: 'Utilities' },
    other: { color: '#FF9F40', icon: '📦', name: 'Other' }
  };

  // Format category name for display
  const getCategoryDisplay = (category) => {
    const normalizedCategory = category.toLowerCase();
    return categoryData[normalizedCategory]?.name || categoryMapping[normalizedCategory] || 'Other';
  };

  // Format category for icon/color lookup
  const getCategoryKey = (category) => {
    const normalizedCategory = category.toLowerCase();
    return categoryData[normalizedCategory] ? normalizedCategory : 'other';
  };

  // Calculate pie chart segments
  const getPieChartSegments = () => {
    const segments = [];
    let currentAngle = 0;
    
    Object.entries(spendingByCategory).forEach(([category, amount]) => {
      const percentage = totalSpending > 0 ? (amount / totalSpending) * 100 : 0;
      const angle = (percentage / 100) * 360;
      const categoryKey = getCategoryKey(category);
      
      segments.push({
        category: getCategoryDisplay(category),
        originalCategory: category,
        amount,
        percentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        color: categoryData[categoryKey]?.color || '#999',
        icon: categoryData[categoryKey]?.icon || '📦',
        midAngle: currentAngle + (angle / 2)
      });
      
      currentAngle += angle;
    });
    
    return segments;
  };

  const pieSegments = getPieChartSegments();

  // Recent expenses for display
  const recentExpenses = expenses
    .sort((a, b) => {
      try {
        return new Date(b.date) - new Date(a.date);
      } catch {
        return 0;
      }
    })
    .slice(0, 5);

  return (
    <div style={{ padding: '0', background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Navigation Header */}
      <nav style={{
        background: 'rgba(255,255,255,0.95)',
        padding: '1rem 2rem',
        boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          color: 'white',
          background: 'linear-gradient(135deg, #7e1047 0%, #2f040d 100%)',
          padding: '10px 20px',
          borderRadius: '10px',
          boxShadow: '0 4px 15px rgba(126, 16, 71, 0.4)'
        }}>
          Spending Insights
        </div>
        <div>
          <button style={navButtonStyle} onClick={() => goTo('features')}>
            ← Back to Features
          </button>
          <button style={navButtonStyle} onClick={() => goTo('dashboard')}>
            Dashboard
          </button>
          <button style={navButtonStyle} onClick={() => {
            localStorage.removeItem('currentUser');
            goTo('home');
          }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ padding: '0 2rem' }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>
            Spending Insight
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
            Smarter spending made simple. Track, analyse, save!
          </p>
        </div>
        
        {/* Action Buttons */}
        <div style={{ 
          marginBottom: '2rem', 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          flexWrap: 'wrap' 
        }}>
          <button style={primaryButtonStyle} onClick={() => goTo('splitexpenses')}>
            ➕ Create New Expense
          </button>
          <button 
            style={refreshButtonStyle} 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? '🔄 Processing...' : `🔄 Clear & Set New Budget`}
          </button>
          <button 
            style={clearButtonStyle}
            onClick={clearAllExpenses}
          >
            🗑️ Clear All Expenses
          </button>
          <button 
            style={budgetButtonStyle}
            onClick={() => setShowBudgetModal(true)}
          >
            💰 Edit Budget
          </button>
          <div style={{
            padding: '0.5rem 1rem',
            background: '#f8f9fa',
            borderRadius: '20px',
            fontSize: '0.9rem',
            color: '#666',
            border: '1px solid #e9ecef'
          }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* Budget Modal */}
        {showBudgetModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '15px',
              width: '90%',
              maxWidth: '400px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>💰 Set New Monthly Budget</h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Monthly Budget (₹)</label>
                <input
                  type="number"
                  value={newBudgetInput}
                  onChange={(e) => setNewBudgetInput(e.target.value)}
                  placeholder="Enter budget amount"
                  style={inputStyle}
                  min="0"
                  step="100"
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                <button 
                  onClick={() => setShowBudgetModal(false)}
                  style={cancelButtonStyle}
                >
                  Cancel
                </button>
                <button 
                  onClick={resetBudgetToDefault}
                  style={secondaryButtonStyle}
                >
                  Reset to ₹10,000
                </button>
                <button 
                  onClick={saveNewBudget}
                  style={saveButtonStyle}
                >
                  Save Budget
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Summary */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: '0', color: '#333', fontSize: '1.2rem' }}>📅 Monthly Overview</h3>
            <button 
              onClick={() => setShowBudgetModal(true)}
              style={{
                background: 'transparent',
                color: '#667eea',
                border: '1px solid #667eea',
                padding: '5px 15px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Edit Budget
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#e7f3ff', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>This Month's Spending</p>
              <p style={{ margin: '0', fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                ₹{currentMonthSpending.toFixed(2)}
              </p>
            </div>
            <div style={{ padding: '1rem', background: '#d4edda', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Monthly Budget</p>
              <p style={{ margin: '0', fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                ₹{monthlyBudget.toLocaleString()}
              </p>
            </div>
            <div style={{ padding: '1rem', background: currentMonthSpending > monthlyBudget ? '#f8d7da' : '#fff3cd', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                {currentMonthSpending > monthlyBudget ? 'Over Budget' : 'Remaining'}
              </p>
              <p style={{ 
                margin: '0', 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: currentMonthSpending > monthlyBudget ? '#dc3545' : '#ffc107' 
              }}>
                ₹{Math.abs(monthlyBudget - currentMonthSpending).toFixed(2)}
                {currentMonthSpending > monthlyBudget ? ' over' : ' left'}
              </p>
            </div>
          </div>
          
          {/* Budget Progress Bar */}
          <div style={{ marginTop: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              color: '#666'
            }}>
              <span>Spent: ₹{currentMonthSpending.toFixed(2)}</span>
              <span>Budget: ₹{monthlyBudget.toLocaleString()}</span>
            </div>
            <div style={{
              height: '10px',
              background: '#e9ecef',
              borderRadius: '5px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min((currentMonthSpending / monthlyBudget) * 100, 100)}%`,
                background: currentMonthSpending > monthlyBudget ? '#dc3545' : '#28a745',
                borderRadius: '5px',
                transition: 'width 0.5s ease'
              }}></div>
            </div>
            <p style={{ 
              margin: '0.5rem 0 0 0', 
              fontSize: '0.9rem', 
              color: currentMonthSpending > monthlyBudget ? '#dc3545' : '#28a745',
              fontWeight: 'bold'
            }}>
              {currentMonthSpending > monthlyBudget ? 
                `⚠️ Exceeded budget by ₹${(currentMonthSpending - monthlyBudget).toFixed(2)}` : 
                `✅ ${((monthlyBudget - currentMonthSpending) / monthlyBudget * 100).toFixed(1)}% of budget remaining`}
            </p>
          </div>
        </div>

        {/* Recent Expenses */}
        {recentExpenses.length > 0 ? (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: '0', color: '#333', fontSize: '1.2rem' }}>📝 Recent Expenses</h3>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>
                Total: {expenses.length} expenses
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentExpenses.map((expense, index) => {
                const categoryKey = getCategoryKey(expense.category);
                const categoryDisplay = getCategoryDisplay(expense.category);
                const categoryIcon = categoryData[categoryKey]?.icon || '📦';
                
                return (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.8rem',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${categoryData[categoryKey]?.color || '#999'}`
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 0.3rem 0', fontWeight: 'bold', color: '#333' }}>
                        {expense.title}
                      </p>
                      <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
                        {categoryIcon} {categoryDisplay} • Paid by: {expense.paidBy} • {new Date(expense.date).toLocaleDateString()}
                      </p>
                      {expense.description && (
                        <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.85rem', color: '#888', fontStyle: 'italic' }}>
                          "{expense.description}"
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '120px' }}>
                      <p style={{ margin: '0', fontWeight: 'bold', fontSize: '1.1rem', color: '#333' }}>
                        ₹{expense.amount.toFixed(2)}
                      </p>
                      <p style={{ margin: '0', fontSize: '0.8rem', color: '#666' }}>
                        Split: {expense.splitType || 'equal'}
                      </p>
                      <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.75rem', color: '#999' }}>
                        {expense.participants ? `${expense.participants.length} people` : 'Individual'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {expenses.length > 5 && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button 
                  onClick={clearAllExpenses}
                  style={{
                    background: 'transparent',
                    color: '#dc3545',
                    border: '1px solid #dc3545',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  🗑️ Clear All {expenses.length} Expenses
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={cardStyle}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>No Recent Expenses Found</h3>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Your expense list is empty. Create expenses in Split Expenses to see them here!
              </p>
              <button style={primaryButtonStyle} onClick={() => goTo('splitexpenses')}>
                ➕ Go to Split Expenses
              </button>
            </div>
          </div>
        )}

        {/* Spending Distribution Chart */}
        {totalSpending > 0 && pieSegments.length > 0 ? (
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333', fontSize: '1.2rem' }}>📈 Spending Distribution</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
              {/* Chart Visualization */}
              <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                <div style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: `conic-gradient(${pieSegments
                    .map(segment => `${segment.color} ${segment.startAngle}deg ${segment.endAngle}deg`)
                    .join(', ')})`
                }}></div>
                
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'white',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.7rem',
                  textAlign: 'center',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}>
                  <span style={{ color: '#333' }}>Total</span>
                  <span style={{ color: '#667eea', fontSize: '0.9rem' }}>
                    ₹{totalSpending.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div style={{ flex: 1 }}>
                {pieSegments.map((segment, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                    padding: '0.8rem',
                    background: '#f8f9fa',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      background: segment.color,
                      borderRadius: '4px',
                      marginRight: '0.8rem'
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 'bold', color: '#333' }}>
                        {segment.icon} {segment.category}:
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ fontWeight: 'bold', color: '#333' }}>
                        ₹{segment.amount.toFixed(2)}
                      </span>
                      <span style={{ color: '#666', fontSize: '0.8rem' }}>
                        {segment.percentage.toFixed(1)}% of total
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : expenses.length > 0 ? (
          <div style={cardStyle}>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <p style={{ margin: '0', color: '#666' }}>
                No spending distribution data available. Expenses may not have category information.
              </p>
            </div>
          </div>
        ) : null}

        {/* CTA Section */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '2rem',
          textAlign: 'center',
          color: 'white',
          marginTop: '2rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.8rem', fontWeight: 'bold' }}>Need Better Expense Tracking?</h3>
          <p style={{ margin: '0 auto 1.5rem', opacity: 0.9, maxWidth: '500px' }}>
            Make sure to add proper titles and categories when creating expenses for better insights!
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={ctaButtonStyle} onClick={() => goTo('splitexpenses')}>
              ➕ Create Proper Expense
            </button>
            <button style={outlineButtonStyle} onClick={loadExpenses}>
              🔄 Reload Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: '15px',
  marginBottom: '1.5rem',
  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
};

const primaryButtonStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '25px',
  cursor: 'pointer',
  fontWeight: 'bold',
  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
};

const secondaryButtonStyle = {
  background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const refreshButtonStyle = {
  background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '25px',
  cursor: 'pointer',
  fontWeight: 'bold',
  boxShadow: '0 4px 15px rgba(220, 53, 69, 0.4)'
};

const clearButtonStyle = {
  background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '25px',
  cursor: 'pointer',
  fontWeight: 'bold',
  boxShadow: '0 4px 15px rgba(108, 117, 125, 0.4)'
};

const budgetButtonStyle = {
  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '25px',
  cursor: 'pointer',
  fontWeight: 'bold',
  boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)'
};

const navButtonStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
  marginLeft: '10px'
};

const ctaButtonStyle = {
  background: 'white',
  color: '#667eea',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '25px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '1rem',
  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
};

const outlineButtonStyle = {
  background: 'rgba(255,255,255,0.2)',
  color: 'white',
  border: '2px solid white',
  padding: '12px 24px',
  borderRadius: '25px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '1rem'
};

const saveButtonStyle = {
  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const cancelButtonStyle = {
  background: '#6c757d',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  fontWeight: 'bold',
  color: '#333'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '2px solid #e9ecef',
  borderRadius: '5px',
  fontSize: '1rem'
};

export default SpendingInsights;