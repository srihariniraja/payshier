import React, { useState } from 'react'

function SplitExpensesPage({ goTo }) {
  const [activeTab, setActiveTab] = useState('create') // 'create', 'history', 'settlements'
  const [expenses, setExpenses] = useState([])
  const [currentExpense, setCurrentExpense] = useState({
    title: '',
    totalAmount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'food',
    description: '',
    paidBy: '',
    splitType: 'equal',
    participants: [],
    payments: []
  })

  const [friends] = useState(['Madhu', 'Shobika', 'Sri Harini', 'Darani', 'You'])
  const [coveredPayments, setCoveredPayments] = useState([])

  // ✅ ADD THIS HELPER FUNCTION (after useState declarations)
  const saveTransaction = (transactionData) => {
    const existing = JSON.parse(localStorage.getItem('payshier-transactions') || '[]');
    const updated = [...existing, transactionData];
    localStorage.setItem('payshier-transactions', JSON.stringify(updated));
  };

  // Add a participant
  const addParticipant = (friend) => {
    if (!currentExpense.participants.includes(friend)) {
      setCurrentExpense({
        ...currentExpense,
        participants: [...currentExpense.participants, friend]
      })
    }
  }

  // Remove a participant
  const removeParticipant = (friend) => {
    setCurrentExpense({
      ...currentExpense,
      participants: currentExpense.participants.filter(p => p !== friend)
    })
  }

  // Create new expense
  const createExpense = (e) => {
    e.preventDefault()
    if (!currentExpense.title || !currentExpense.totalAmount || !currentExpense.paidBy || currentExpense.participants.length === 0) {
      alert('Please fill all required fields!')
      return
    }

    const newExpense = {
      id: Date.now(),
      ...currentExpense,
      totalAmount: parseFloat(currentExpense.totalAmount),
      createdAt: new Date().toLocaleString(),
      settlements: calculateSettlements(currentExpense)
    }

    setExpenses([...expenses, newExpense])
    
    // ✅ ADD THIS: Save to transactions for timeline
    const expenseTransaction = {
      id: 'EXPENSE' + Date.now(),
      type: 'group_expense',
      title: currentExpense.title,
      amount: `₹${currentExpense.totalAmount}`,
      purpose: currentExpense.description || 'Group expense',
      parties: {
        paidBy: currentExpense.paidBy,
        participants: currentExpense.participants
      },
      dates: {
        created: new Date().toISOString(),
        due: currentExpense.date // Use expense date as due date
      },
      status: 'pending_settlements',
      category: currentExpense.category,
      splitType: currentExpense.splitType
    };

    saveTransaction(expenseTransaction);
    console.log('💾 Expense saved, checking localStorage...');
  const checkData = localStorage.getItem('payshier-transactions');
  console.log('✅ Current transactions after save:', JSON.parse(checkData));
  
    console.log('Expense saved to timeline:', expenseTransaction);
    
    // Reset form
    setCurrentExpense({
      title: '',
      totalAmount: '',
      date: new Date().toISOString().split('T')[0],
      category: 'food',
      description: '',
      paidBy: '',
      splitType: 'equal',
      participants: [],
      payments: []
    })

    alert('🎉 Expense created successfully! Check "Expense History" tab.')
  }

  // Calculate who owes whom
  const calculateSettlements = (expense) => {
    const total = parseFloat(expense.totalAmount)
    const participantCount = expense.participants.length
    const sharePerPerson = total / participantCount
    
    const settlements = expense.participants
      .filter(person => person !== expense.paidBy)
      .map(person => ({
        from: person,
        to: expense.paidBy,
        amount: sharePerPerson,
        status: 'pending'
      }))

    return settlements
  }

  // Mark settlement as paid
  const markAsPaid = (expenseId, settlementIndex) => {
    setExpenses(expenses.map(expense => {
      if (expense.id === expenseId) {
        const updatedSettlements = [...expense.settlements]
        updatedSettlements[settlementIndex].status = 'paid'
        return { ...expense, settlements: updatedSettlements }
      }
      return expense
    }))
  }

  // Add covered payment
  const addCoveredPayment = (coveredBy, coveredFor, amount) => {
    const newCoveredPayment = {
      id: Date.now(),
      coveredBy,
      coveredFor,
      amount: parseFloat(amount),
      date: new Date().toLocaleString(),
      status: 'pending'
    }
    setCoveredPayments([...coveredPayments, newCoveredPayment])
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      {/* Navigation */}
      <nav style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        padding: '1rem 2rem',
        boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          👥 Group Expense Splitter
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => goTo('features')} style={navButtonStyle}>
            ← Back to Features
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '15px',
          padding: '0.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          {[
            { id: 'create', label: '➕ Create Expense', icon: '➕' },
            { id: 'history', label: '📊 Expense History', icon: '📊' },
            { id: 'settlements', label: '💰 Settlements', icon: '💰' },
            { id: 'covered', label: '🛡️ Covered Payments', icon: '🛡️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '1rem',
                border: 'none',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#333',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* CREATE EXPENSE TAB */}
        {activeTab === 'create' && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ color: '#333', marginBottom: '2rem', textAlign: 'center', fontSize: '1.8rem' }}>
              🍕 Create Group Expense
            </h3>

            <form onSubmit={createExpense}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Left Column - Basic Info */}
                <div>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Expense Title *</label>
                    <input
                      type="text"
                      value={currentExpense.title}
                      onChange={(e) => setCurrentExpense({...currentExpense, title: e.target.value})}
                      placeholder="e.g., Dinner at Restaurant, Movie Night"
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Total Amount (₹) *</label>
                    <input
                      type="number"
                      value={currentExpense.totalAmount}
                      onChange={(e) => setCurrentExpense({...currentExpense, totalAmount: e.target.value})}
                      placeholder="Enter total amount"
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Category</label>
                    <select
                      value={currentExpense.category}
                      onChange={(e) => setCurrentExpense({...currentExpense, category: e.target.value})}
                      style={inputStyle}
                    >
                      <option value="food">🍕 Food & Dining</option>
                      <option value="travel">🚗 Travel & Transport</option>
                      <option value="entertainment">🎬 Entertainment</option>
                      <option value="shopping">🛒 Shopping</option>
                      <option value="utilities">🏠 Utilities</option>
                      <option value="other">📦 Other</option>
                    </select>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Date</label>
                    <input
                      type="date"
                      value={currentExpense.date}
                      onChange={(e) => setCurrentExpense({...currentExpense, date: e.target.value})}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Right Column - Participants */}
                <div>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Paid By *</label>
                    <select
                      value={currentExpense.paidBy}
                      onChange={(e) => setCurrentExpense({...currentExpense, paidBy: e.target.value})}
                      style={inputStyle}
                      required
                    >
                      <option value="">Select who paid</option>
                      {friends.map(friend => (
                        <option key={friend} value={friend}>{friend}</option>
                      ))}
                    </select>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Split Type</label>
                    <select
                      value={currentExpense.splitType}
                      onChange={(e) => setCurrentExpense({...currentExpense, splitType: e.target.value})}
                      style={inputStyle}
                    >
                      <option value="equal">Equal Split</option>
                      <option value="custom">Custom Split</option>
                      <option value="percentage">Percentage Split</option>
                    </select>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Add Participants *</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                      {friends.map(friend => (
                        <button
                          key={friend}
                          type="button"
                          onClick={() => addParticipant(friend)}
                          style={{
                            background: currentExpense.participants.includes(friend) ? 
                              'linear-gradient(135deg, #28a745 0%, #20c997 100%)' : 'rgba(0,0,0,0.1)',
                            color: currentExpense.participants.includes(friend) ? 'white' : '#333',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          {friend} {currentExpense.participants.includes(friend) ? '✓' : '+'}
                        </button>
                      ))}
                    </div>
                    
                    {/* Selected Participants */}
                    <div>
                      <strong>Selected: </strong>
                      {currentExpense.participants.length > 0 ? (
                        currentExpense.participants.map(participant => (
                          <span key={participant} style={participantTagStyle}>
                            {participant}
                            <button
                              type="button"
                              onClick={() => removeParticipant(participant)}
                              style={{ marginLeft: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                              ❌
                            </button>
                          </span>
                        ))
                      ) : (
                        <span style={{ color: '#666' }}>No participants selected</span>
                      )}
                    </div>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Description (Optional)</label>
                    <textarea
                      value={currentExpense.description}
                      onChange={(e) => setCurrentExpense({...currentExpense, description: e.target.value})}
                      placeholder="Any additional notes..."
                      style={{...inputStyle, minHeight: '80px'}}
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              {currentExpense.participants.length > 0 && currentExpense.totalAmount && (
                <div style={{
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  padding: '1.5rem',
                  borderRadius: '15px',
                  marginTop: '1.5rem',
                  border: '2px dashed #667eea'
                }}>
                  <h4 style={{ color: '#333', marginBottom: '1rem' }}>📊 Split Preview</h4>
                  <p><strong>Total:</strong> ₹{currentExpense.totalAmount}</p>
                  <p><strong>Per Person:</strong> ₹{(currentExpense.totalAmount / currentExpense.participants.length).toFixed(2)}</p>
                  <p><strong>Paid by:</strong> {currentExpense.paidBy}</p>
                  <p><strong>Owes to {currentExpense.paidBy}:</strong> {
                    currentExpense.participants
                      .filter(p => p !== currentExpense.paidBy)
                      .join(', ')
                  }</p>
                </div>
              )}

              <button
                type="submit"
                style={{
                  ...primaryButtonStyle,
                  width: '100%',
                  marginTop: '2rem',
                  padding: '15px'
                }}
              >
                🎉 Create Expense Split
              </button>
            </form>
          </div>
        )}

        {/* EXPENSE HISTORY TAB */}
        {activeTab === 'history' && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ color: '#333', marginBottom: '2rem', textAlign: 'center', fontSize: '1.8rem' }}>
              📊 Expense History
            </h3>

            {expenses.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '3rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💸</div>
                <h3>No expenses yet</h3>
                <p>Create your first group expense to get started!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {expenses.map(expense => (
                  <div key={expense.id} style={expenseCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h4 style={{ color: '#333', margin: '0 0 0.5rem 0' }}>{expense.title}</h4>
                        <p style={{ color: '#666', margin: '0.2rem 0' }}>
                          <strong>Amount:</strong> ₹{expense.totalAmount} | 
                          <strong> Paid by:</strong> {expense.paidBy} |
                          <strong> Date:</strong> {expense.date}
                        </p>
                        <p style={{ color: '#666', margin: '0.2rem 0' }}>
                          <strong>Participants:</strong> {expense.participants.join(', ')}
                        </p>
                        <p style={{ color: '#666', margin: '0.2rem 0' }}>
                          <strong>Category:</strong> {expense.category} | 
                          <strong> Split:</strong> {expense.splitType}
                        </p>
                      </div>
                      <span style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '5px 15px',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}>
                        {expense.category === 'food' ? '🍕' : 
                         expense.category === 'travel' ? '🚗' : 
                         expense.category === 'entertainment' ? '🎬' : 
                         expense.category === 'shopping' ? '🛒' : '📦'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SETTLEMENTS TAB */}
        {activeTab === 'settlements' && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ color: '#333', marginBottom: '2rem', textAlign: 'center', fontSize: '1.8rem' }}>
              💰 Pending Settlements
            </h3>

            {expenses.filter(exp => exp.settlements.some(s => s.status === 'pending')).length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '3rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h3>All settled up! 🎉</h3>
                <p>No pending payments found.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {expenses.map(expense => 
                  expense.settlements
                    .filter(settlement => settlement.status === 'pending')
                    .map((settlement, index) => (
                    <div key={`${expense.id}-${index}`} style={settlementCardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ color: '#333', margin: '0 0 0.5rem 0' }}>{expense.title}</h4>
                          <p style={{ color: '#666', margin: '0.2rem 0' }}>
                            <strong>💰 {settlement.from}</strong> owes <strong>₹{settlement.amount}</strong> to {settlement.to}
                          </p>
                          <p style={{ color: '#999', fontSize: '0.9rem', margin: '0.2rem 0' }}>
                            For: {expense.description || 'No description'}
                          </p>
                        </div>
                        <button
                          onClick={() => markAsPaid(expense.id, index)}
                          style={secondaryButtonStyle}
                        >
                          ✅ Mark Paid
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* COVERED PAYMENTS TAB */}
        {activeTab === 'covered' && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ color: '#333', marginBottom: '2rem', textAlign: 'center', fontSize: '1.8rem' }}>
              🛡️ Covered Payments
            </h3>
            
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#333', marginBottom: '1rem' }}>Add Covered Payment</h4>
              <CoveredPaymentForm onAdd={addCoveredPayment} friends={friends} />
            </div>

            {coveredPayments.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤝</div>
                <h3>No covered payments yet</h3>
                <p>When someone pays for others, add it here to track!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {coveredPayments.map(payment => (
                  <div key={payment.id} style={coveredCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ color: '#333', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                          🛡️ {payment.coveredBy} covered for {payment.coveredFor}
                        </p>
                        <p style={{ color: '#666', margin: '0.2rem 0' }}>
                          <strong>Amount:</strong> ₹{payment.amount} | 
                          <strong> Date:</strong> {payment.date}
                        </p>
                        <p style={{ color: '#666', margin: '0.2rem 0' }}>
                          <strong>Status:</strong> 
                          <span style={{ 
                            color: payment.status === 'paid' ? '#28a745' : '#ffc107',
                            fontWeight: 'bold',
                            marginLeft: '0.5rem'
                          }}>
                            {payment.status.toUpperCase()}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Covered Payment Form Component
function CoveredPaymentForm({ onAdd, friends }) {
  const [formData, setFormData] = useState({
    coveredBy: '',
    coveredFor: '',
    amount: '',
    description: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.coveredBy || !formData.coveredFor || !formData.amount) {
      alert('Please fill all fields!')
      return
    }
    onAdd(formData.coveredBy, formData.coveredFor, formData.amount)
    setFormData({ coveredBy: '', coveredFor: '', amount: '', description: '' })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
      <div>
        <label style={labelStyle}>Covered By</label>
        <select
          value={formData.coveredBy}
          onChange={(e) => setFormData({...formData, coveredBy: e.target.value})}
          style={inputStyle}
          required
        >
          <option value="">Select person</option>
          {friends.map(friend => (
            <option key={friend} value={friend}>{friend}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label style={labelStyle}>Covered For</label>
        <select
          value={formData.coveredFor}
          onChange={(e) => setFormData({...formData, coveredFor: e.target.value})}
          style={inputStyle}
          required
        >
          <option value="">Select person</option>
          {friends.map(friend => (
            <option key={friend} value={friend}>{friend}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label style={labelStyle}>Amount (₹)</label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: e.target.value})}
          placeholder="Amount"
          style={inputStyle}
          required
        />
      </div>
      
      <button type="submit" style={primaryButtonStyle}>
        ➕ Add
      </button>
    </form>
  )
}

// Styles
const navButtonStyle = {
  background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '25px',
  cursor: 'pointer',
  fontWeight: 'bold'
}

const primaryButtonStyle = {
  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '25px',
  cursor: 'pointer',
  fontWeight: 'bold',
  boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)'
}

const secondaryButtonStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '20px',
  cursor: 'pointer',
  fontWeight: 'bold'
}

const formGroupStyle = {
  marginBottom: '1.5rem'
}

const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  fontWeight: 'bold',
  color: '#333'
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '2px solid #e9ecef',
  borderRadius: '10px',
  fontSize: '1rem',
  background: 'white'
}

const participantTagStyle = {
  display: 'inline-block',
  background: 'rgba(102, 126, 234, 0.1)',
  color: '#667eea',
  padding: '5px 12px',
  borderRadius: '15px',
  margin: '0.2rem',
  fontSize: '0.9rem',
  fontWeight: 'bold'
}

const expenseCardStyle = {
  background: '#f8f9fa',
  borderLeft: '6px solid #667eea',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
}

const settlementCardStyle = {
  background: '#fff3cd',
  borderLeft: '6px solid #ffc107',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
}

const coveredCardStyle = {
  background: '#d1ecf1',
  borderLeft: '6px solid #17a2b8',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
}

export default SplitExpensesPage