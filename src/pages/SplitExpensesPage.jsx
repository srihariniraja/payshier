import React, { useState, useEffect } from 'react'

function SplitExpensesPage({ goTo }) {
  const [activeTab, setActiveTab] = useState('create') // 'create', 'history', 'settlements'
  const [expenses, setExpenses] = useState([])
  const [friends, setFriends] = useState([])
  const [currentUser, setCurrentUser] = useState('')
  const [currentExpense, setCurrentExpense] = useState({
  title: '',
  totalAmount: '',
  date: new Date().toISOString().split('T')[0],
  category: 'food',
  description: '',
  paidBy: '',
  splitType: 'equal',
  participants: [],
  payments: [],
  // Add these for custom splits
  customSplits: {}, // { participant: amount }
  percentageSplits: {} // { participant: percentage }
})

  const [coveredPayments, setCoveredPayments] = useState([])
  const [showPaidByDropdown, setShowPaidByDropdown] = useState(false);
  const dropdownStyle = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  background: 'white',
  border: '1px solid #ddd',
  borderRadius: '0 0 10px 10px',
  maxHeight: '200px',
  overflowY: 'auto',
  zIndex: 1000,
  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
}

const dropdownItemStyle = {
  padding: '12px',
  cursor: 'pointer',
  borderBottom: '1px solid #f0f0f0',
  background: 'white',
  color: '#333'
}

const dropdownItemHoverStyle = {
  background: '#667eea',
  color: 'white'
}


// Load users and current user data
useEffect(() => {
  const users = JSON.parse(localStorage.getItem('payshier-users') || '[]');
  const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const currentUserEmail = currentUserData.email || '';
  
  setCurrentUser(currentUserEmail);
  
  // Create demo users if no users exist
  let allUsers = users.map(user => user.email);
  if (allUsers.length === 0) {
    allUsers = ['user1', 'user2', 'user3', 'user4']; // Demo users
    if (currentUserEmail && !allUsers.includes(currentUserEmail)) {
      allUsers.push(currentUserEmail);
    }
  }
  
  setFriends(allUsers);
  
  // Load existing expenses
  const savedExpenses = JSON.parse(localStorage.getItem('payshier-expenses') || '[]');
  setExpenses(savedExpenses);
  
  // Load covered payments
  const savedCoveredPayments = JSON.parse(localStorage.getItem('payshier-covered-payments') || '[]');
  setCoveredPayments(savedCoveredPayments);
}, []);

// ADD THIS NEW USEEFFECT RIGHT HERE:
// Reset splits when split type changes
useEffect(() => {
  if (currentExpense.splitType === 'equal') {
    setCurrentExpense(prev => ({
      ...prev,
      customSplits: {},
      percentageSplits: {}
    }))
  }
}, [currentExpense.splitType])


  // Save expenses to localStorage
  const saveExpenses = (updatedExpenses) => {
    setExpenses(updatedExpenses);
    localStorage.setItem('payshier-expenses', JSON.stringify(updatedExpenses));
  };

  // Save covered payments to localStorage
  const saveCoveredPayments = (updatedPayments) => {
    setCoveredPayments(updatedPayments);
    localStorage.setItem('payshier-covered-payments', JSON.stringify(updatedPayments));
  };

  // Save transaction for timeline
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
  
  // Remove a participant


// ADD THIS NEW FUNCTION HERE:
// Update paidBy and automatically include in participants
const updatePaidBy = (paidByPerson) => {
  setCurrentExpense(prev => {
    const updatedParticipants = [...prev.participants];
    
    // Remove the previous paidBy from participants if it exists
    if (prev.paidBy && prev.paidBy !== paidByPerson) {
      const previousPaidByIndex = updatedParticipants.indexOf(prev.paidBy);
      if (previousPaidByIndex > -1) {
        updatedParticipants.splice(previousPaidByIndex, 1);
      }
    }
    
    // Add the new paidBy to participants if not already there
    if (paidByPerson && !updatedParticipants.includes(paidByPerson)) {
      updatedParticipants.push(paidByPerson);
    }
    
    return {
      ...prev,
      paidBy: paidByPerson,
      participants: updatedParticipants
    };
  });
};

  // Create new expense
  // Create new expense
// Create new expense - COMPLETE VERSION
const createExpense = (e) => {
  e.preventDefault()
  
  // Basic validation
  if (!currentExpense.title || !currentExpense.totalAmount || !currentExpense.paidBy || currentExpense.participants.length === 0) {
    alert('Please fill all required fields!')
    return
  }

  // Custom split validation
  if (currentExpense.splitType === 'custom') {
    const totalCustom = Object.values(currentExpense.customSplits).reduce((sum, val) => sum + parseFloat(val || 0), 0)
    if (Math.abs(totalCustom - parseFloat(currentExpense.totalAmount)) > 0.01) {
      alert(`Custom split amounts (₹${totalCustom.toFixed(2)}) don't match total amount (₹${currentExpense.totalAmount})`)
      return
    }
  }

  // Percentage split validation
  if (currentExpense.splitType === 'percentage') {
    const totalPercentage = Object.values(currentExpense.percentageSplits).reduce((sum, val) => sum + parseFloat(val || 0), 0)
    if (Math.abs(totalPercentage - 100) > 0.01) {
      alert(`Percentage split (${totalPercentage}%) doesn't add up to 100%`)
      return
    }
  }

  // CREATE THE EXPENSE - THIS WAS MISSING!
  const settlements = calculateSettlements(currentExpense)
  const newExpense = {
    ...currentExpense,
    id: Date.now().toString(),
    createdBy: currentUser,
    totalAmount: parseFloat(currentExpense.totalAmount),
    settlements: settlements
  }

  const updatedExpenses = [...expenses, newExpense]
  saveExpenses(updatedExpenses)

  // Create transactions for all participants
  settlements.forEach(settlement => {
    const transaction = {
      id: `${newExpense.id}-${settlement.from}-${settlement.to}`,
      type: 'expense_settlement',
      title: `Split: ${newExpense.title}`,
      amount: settlement.amount,
      purpose: `Your share of ${newExpense.title}`,
      parties: {
        person: settlement.from,
        otherParty: settlement.to
      },
      dates: {
        created: new Date().toISOString(),
        due: newExpense.date
      },
      status: 'pending',
      category: newExpense.category,
      forUser: settlement.from,
      expenseId: newExpense.id
    }
    saveTransaction(transaction)
  })

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
    payments: [],
    customSplits: {},
    percentageSplits: {}
  })

  alert('✅ Expense created successfully! Settlements calculated.')
}

  // Calculate who owes whom
  // Calculate who owes whom
// Calculate who owes whom
const calculateSettlements = (expense) => {
  const total = parseFloat(expense.totalAmount)
  
  let settlements = []

  if (expense.splitType === 'equal') {
    // Equal split logic
    const sharePerPerson = total / expense.participants.length
    settlements = expense.participants
      .filter(person => person !== expense.paidBy)
      .map(person => ({
        from: person,
        to: expense.paidBy,
        amount: sharePerPerson.toFixed(2),
        status: 'pending',
        markedByFrom: false,
        markedByTo: false
      }))
  } else if (expense.splitType === 'custom') {
    // Custom split logic
    settlements = expense.participants
      .filter(person => person !== expense.paidBy)
      .map(person => {
        const amount = parseFloat(expense.customSplits[person] || 0)
        return {
          from: person,
          to: expense.paidBy,
          amount: amount.toFixed(2),
          status: 'pending',
          markedByFrom: false,
          markedByTo: false
        }
      })
      .filter(settlement => settlement.amount > 0) // Only include non-zero amounts
  } else if (expense.splitType === 'percentage') {
    // Percentage split logic
    settlements = expense.participants
      .filter(person => person !== expense.paidBy)
      .map(person => {
        const percentage = parseFloat(expense.percentageSplits[person] || 0)
        const amount = (percentage / 100) * total
        return {
          from: person,
          to: expense.paidBy,
          amount: amount.toFixed(2),
          status: 'pending',
          markedByFrom: false,
          markedByTo: false
        }
      })
      .filter(settlement => settlement.amount > 0) // Only include non-zero amounts
  }

  return settlements
}

  // Mark settlement as paid
// Mark settlement as paid (individual confirmation)
const markAsPaid = (expenseId, settlementIndex) => {
  const updatedExpenses = expenses.map(expense => {
    if (expense.id === expenseId) {
      const updatedSettlements = [...expense.settlements]
      const settlement = updatedSettlements[settlementIndex];
      
      // Determine who is marking it
      const isBorrower = settlement.from === currentUser;
      const isLender = settlement.to === currentUser;
      
      // Update the individual confirmation
      const updatedSettlement = {
        ...settlement,
        markedByFrom: isBorrower ? true : settlement.markedByFrom,
        markedByTo: isLender ? true : settlement.markedByTo
      };
      
      // Check if both parties have confirmed
      if (updatedSettlement.markedByFrom && updatedSettlement.markedByTo) {
        updatedSettlement.status = 'paid';
        updateTransactionStatus(settlement.from, expenseId, 'paid');
        updateTransactionStatus(settlement.to, expenseId, 'paid');
      }
      
      updatedSettlements[settlementIndex] = updatedSettlement;
      
      return { 
        ...expense, 
        settlements: updatedSettlements 
      }
    }
    return expense
  })
  
  saveExpenses(updatedExpenses);
  
  const settlement = expenses.find(e => e.id === expenseId)?.settlements[settlementIndex];
  if (settlement) {
    const isBorrower = settlement.from === currentUser;
    const otherPerson = isBorrower ? settlement.to : settlement.from;
    alert(`✅ You confirmed payment! Waiting for ${otherPerson} to also confirm.`);
  }
}

  // Update transaction status for a user
  const updateTransactionStatus = (userEmail, expenseId, status) => {
    const transactions = JSON.parse(localStorage.getItem('payshier-transactions') || '[]');
    const updatedTransactions = transactions.map(transaction => {
      if (transaction.forUser === userEmail && transaction.id.includes(expenseId)) {
        return { ...transaction, status: status === 'paid' ? 'completed' : 'pending' };
      }
      return transaction;
    });
    localStorage.setItem('payshier-transactions', JSON.stringify(updatedTransactions));
  }

  // Add covered payment
  const addCoveredPayment = (coveredBy, coveredFor, amount) => {
    const newCoveredPayment = {
      id: Date.now().toString(),
      coveredBy,
      coveredFor,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      status: 'pending',
      createdBy: currentUser
    }
    
    const updatedPayments = [...coveredPayments, newCoveredPayment];
    saveCoveredPayments(updatedPayments);
    
    // Save as transaction for both users
    [coveredBy, coveredFor].forEach(user => {
      const coveredTransaction = {
        id: `COVERED-${Date.now()}-${user}`,
        type: 'covered_payment',
        title: `Covered payment - ${coveredBy} for ${coveredFor}`,
        amount: amount,
        purpose: 'Covered payment between users',
        parties: {
          person: user,
          otherParty: user === coveredBy ? coveredFor : coveredBy
        },
        dates: {
          created: new Date().toISOString(),
          due: new Date().toISOString().split('T')[0]
        },
        status: 'pending',
        category: 'covered_payment',
        forUser: user,
        coveredBy: coveredBy,
        coveredFor: coveredFor,
        isCoverer: user === coveredBy
      };

      saveTransaction(coveredTransaction);
    });

    alert('🛡️ Covered payment added! Both users can see it in their timeline.');
  }

  
  // Filter expenses for current user
// Filter expenses for current user
const getUserExpenses = () => {
  return expenses.filter(expense => {
    // Check if expense and participants exist
    if (!expense || !expense.participants) return false;
    
    return expense.participants.includes(currentUser) || 
           expense.createdBy === currentUser;
  });
}

  // Filter settlements for current user
  // Filter settlements for current user
const getUserSettlements = () => {
  const userExpenses = getUserExpenses();
  const allSettlements = [];
  
  userExpenses.forEach(expense => {
    if (expense.settlements) {
      expense.settlements.forEach((settlement, index) => {
        if ((settlement.from === currentUser || settlement.to === currentUser) && 
            settlement.status === 'pending') {
          allSettlements.push({
            ...settlement,
            expenseTitle: expense.title,
            expenseId: expense.id,
            settlementIndex: index
          });
        }
      });
    }
  });
  
  return allSettlements;
}

  // Filter covered payments for current user
  const getUserCoveredPayments = () => {
    return coveredPayments.filter(payment => 
      payment.coveredBy === currentUser || payment.coveredFor === currentUser
    );
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
          color: '#667eea',
          textShadow: '0 2px 4px rgba(102, 126, 234, 0.3)',
          padding: '8px 16px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '12px',
          border: '1px solid rgba(102, 126, 234, 0.2)',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
        }}>
          👥 Group Expense Splitter
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: '#333', fontWeight: 'bold' }}>
            👋 {currentUser || 'Loading...'}
          </span>
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
                {/* Right Column - Participants */}
<div>
  <div style={formGroupStyle}>
  <label style={labelStyle}>Paid By *</label>
  <div style={{ position: 'relative' }}>
    <input
      type="text"
      value={currentExpense.paidBy}
      onChange={(e) => setCurrentExpense({...currentExpense, paidBy: e.target.value})}
      onFocus={() => setShowPaidByDropdown(true)}
      onBlur={() => setTimeout(() => setShowPaidByDropdown(false), 200)}
      placeholder="Search or select who paid..."
      style={inputStyle}
      required
    />
    {showPaidByDropdown && (
      <div style={dropdownStyle}>
        {friends
          .filter(friend => 
            friend.toLowerCase().includes(currentExpense.paidBy.toLowerCase()) ||
            currentExpense.paidBy === ''
          )
          .map(friend => (
            <div
              key={friend}
              onClick={() => {
  const updatedParticipants = [...currentExpense.participants];
  
  // Add the paidBy person if not already there
  if (!updatedParticipants.includes(friend)) {
    updatedParticipants.push(friend);
  }
  
  setCurrentExpense({
    ...currentExpense, 
    paidBy: friend,
    participants: updatedParticipants
  });
  setShowPaidByDropdown(false);
}}
              style={{
                ...dropdownItemStyle,
                background: currentExpense.paidBy === friend ? '#667eea' : 'white',
                color: currentExpense.paidBy === friend ? 'white' : '#333'
              }}
            >
              {friend} {friend === currentUser ? '(You)' : ''}
            </div>
          ))
        }
      </div>
    )}
  </div>
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

{/* Split Configuration */}
{currentExpense.participants.length > 0 && currentExpense.totalAmount && (
  <div style={formGroupStyle}>
    <label style={labelStyle}>
      {currentExpense.splitType === 'equal' && '💰 Equal Split'}
      {currentExpense.splitType === 'custom' && '🎯 Custom Amounts'}
      {currentExpense.splitType === 'percentage' && '📊 Percentage Split'}
    </label>
    
    {currentExpense.splitType === 'equal' && (
      <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
        <p style={{ margin: '0', color: '#666' }}>
          Each person pays: <strong>₹{(currentExpense.totalAmount / currentExpense.participants.length).toFixed(2)}</strong>
        </p>
      </div>
    )}

    {currentExpense.splitType === 'custom' && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {currentExpense.participants.map(participant => (
          <div key={participant} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ flex: 1, color: '#333' }}>
              {participant} {participant === currentUser ? '(You)' : ''}
            </span>
            <input
              type="number"
              placeholder="Amount"
              value={currentExpense.customSplits[participant] || ''}
              onChange={(e) => {
                const newCustomSplits = {
                  ...currentExpense.customSplits,
                  [participant]: e.target.value
                }
                setCurrentExpense({
                  ...currentExpense,
                  customSplits: newCustomSplits
                })
              }}
              style={{
                width: '120px',
                padding: '8px',
                border: '2px solid #e9ecef',
                borderRadius: '5px'
              }}
            />
            <span style={{ color: '#666', fontSize: '0.9rem', width: '60px' }}>
              ₹{currentExpense.customSplits[participant] || '0'}
            </span>
          </div>
        ))}
        <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#fff3cd', borderRadius: '5px' }}>
          <small style={{ color: '#856404' }}>
            Total: ₹{Object.values(currentExpense.customSplits).reduce((sum, val) => sum + parseFloat(val || 0), 0).toFixed(2)} / ₹{currentExpense.totalAmount}
          </small>
        </div>
      </div>
    )}

    {currentExpense.splitType === 'percentage' && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {currentExpense.participants.map(participant => (
          <div key={participant} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ flex: 1, color: '#333' }}>
              {participant} {participant === currentUser ? '(You)' : ''}
            </span>
            <input
              type="number"
              placeholder="%"
              min="0"
              max="100"
              value={currentExpense.percentageSplits[participant] || ''}
              onChange={(e) => {
                const newPercentageSplits = {
                  ...currentExpense.percentageSplits,
                  [participant]: e.target.value
                }
                setCurrentExpense({
                  ...currentExpense,
                  percentageSplits: newPercentageSplits
                })
              }}
              style={{
                width: '80px',
                padding: '8px',
                border: '2px solid #e9ecef',
                borderRadius: '5px'
              }}
            />
            <span style={{ color: '#666', fontSize: '0.9rem', width: '80px' }}>
              = ₹{((parseFloat(currentExpense.percentageSplits[participant] || 0) / 100) * currentExpense.totalAmount).toFixed(2)}
            </span>
          </div>
        ))}
        <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#fff3cd', borderRadius: '5px' }}>
          <small style={{ color: '#856404' }}>
            Total: {Object.values(currentExpense.percentageSplits).reduce((sum, val) => sum + parseFloat(val || 0), 0)}% / 100%
          </small>
        </div>
      </div>
    )}
  </div>
)}
<div style={formGroupStyle}>
  <label style={labelStyle}>Add Participants *</label>
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
    {friends.map(friend => (
      <button
        key={friend}
        type="button"
        onClick={() => {
          // Allow adding any friend, even if they're the payer
          // The payer will be handled automatically in the calculation
          addParticipant(friend);
        }}
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
        {friend} {friend === currentUser ? '(You)' : ''} 
        {currentExpense.participants.includes(friend) ? '✓' : '+'}
        {friend === currentExpense.paidBy && ' 💰'}
      </button>
    ))}
  </div>
  
  {/* Selected Participants */}
  <div>
    <strong>Selected: </strong>
    {currentExpense.participants.length > 0 ? (
      currentExpense.participants.map(participant => (
        <span key={participant} style={participantTagStyle}>
          {participant} {participant === currentUser ? '(You)' : ''}
          {participant === currentExpense.paidBy && ' 💰'}
          <button
            type="button"
            onClick={() => {
              // Don't allow removing the paidBy person
              if (participant !== currentExpense.paidBy) {
                removeParticipant(participant);
              }
            }}
            style={{ 
              marginLeft: '0.5rem', 
              background: 'none', 
              border: 'none', 
              cursor: participant !== currentExpense.paidBy ? 'pointer' : 'not-allowed',
              opacity: participant !== currentExpense.paidBy ? 1 : 0.5
            }}
          >
            {participant !== currentExpense.paidBy ? '❌' : '💰'}
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
{currentExpense.participants.length > 0 && currentExpense.totalAmount && currentExpense.paidBy && (
  <div style={{
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    padding: '1.5rem',
    borderRadius: '15px',
    marginTop: '1.5rem',
    border: '2px dashed #667eea'
  }}>
    <h4 style={{ color: '#333', marginBottom: '1rem' }}>📊 Split Preview</h4>
    <p><strong>Total:</strong> ₹{currentExpense.totalAmount}</p>
    
    {currentExpense.splitType === 'equal' && (
      <>
        <p><strong>Split between {currentExpense.participants.length} people:</strong> ₹{(currentExpense.totalAmount / currentExpense.participants.length).toFixed(2)} each</p>
        <p><strong>Paid by:</strong> {currentExpense.paidBy} {currentExpense.paidBy === currentUser ? '(You)' : ''}</p>
      </>
    )}

    {currentExpense.splitType === 'custom' && (
      <>
        <p><strong>Custom Split Amounts:</strong></p>
        {currentExpense.participants.map(person => {
          const amount = parseFloat(currentExpense.customSplits[person] || 0)
          return (
            <p key={person} style={{ margin: '0.3rem 0' }}>
              • {person} {person === currentUser ? '(You)' : ''}: 
              <strong> ₹{amount.toFixed(2)}</strong>
              {person === currentExpense.paidBy && ' 💰 (paid)'}
            </p>
          )
        })}
        <p style={{ marginTop: '0.5rem', color: '#666' }}>
          Total: ₹{Object.values(currentExpense.customSplits).reduce((sum, val) => sum + parseFloat(val || 0), 0).toFixed(2)} / ₹{currentExpense.totalAmount}
        </p>
      </>
    )}

    {currentExpense.splitType === 'percentage' && (
      <>
        <p><strong>Percentage Split:</strong></p>
        {currentExpense.participants.map(person => {
          const percentage = parseFloat(currentExpense.percentageSplits[person] || 0)
          const amount = (percentage / 100) * currentExpense.totalAmount
          return (
            <p key={person} style={{ margin: '0.3rem 0' }}>
              • {person} {person === currentUser ? '(You)' : ''}: 
              <strong> {percentage}% = ₹{amount.toFixed(2)}</strong>
              {person === currentExpense.paidBy && ' 💰 (paid)'}
            </p>
          )
        })}
        <p style={{ marginTop: '0.5rem', color: '#666' }}>
          Total: {Object.values(currentExpense.percentageSplits).reduce((sum, val) => sum + parseFloat(val || 0), 0)}% / 100%
        </p>
      </>
    )}
    
    <div style={{ marginTop: '1rem', padding: '1rem', background: '#e7f3ff', borderRadius: '8px' }}>
      <strong>Payment Summary:</strong>
      {calculateSettlements(currentExpense)
        .map(settlement => (
          <div key={settlement.from} style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'white', borderRadius: '5px' }}>
            • {settlement.from === currentUser ? 'You' : settlement.from} owes <strong>₹{settlement.amount}</strong> to {settlement.to}
          </div>
        ))
      }
      {calculateSettlements(currentExpense).length === 0 && (
        <div style={{ marginTop: '0.5rem', color: '#666' }}>
          No one owes money - {currentExpense.paidBy} paid for everyone
        </div>
      )}
    </div>
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
              📊 Your Expense History
            </h3>

            {getUserExpenses().length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '3rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💸</div>
                <h3>No expenses yet</h3>
                <p>Create your first group expense to get started!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {getUserExpenses().map(expense => (
                  <div key={expense.id} style={expenseCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h4 style={{ color: '#333', margin: '0 0 0.5rem 0' }}>{expense.title}</h4>
                        <p style={{ color: '#666', margin: '0.2rem 0' }}>
                          <strong>Amount:</strong> ₹{expense.totalAmount} | 
                          <strong> Paid by:</strong> {expense.paidBy} {expense.paidBy === currentUser ? '(You)' : ''} |
                          <strong> Date:</strong> {new Date(expense.date).toLocaleDateString()}
                        </p>
                        <p style={{ color: '#666', margin: '0.2rem 0' }}>
                          <strong>Participants:</strong> {expense.participants.map(p => p === currentUser ? 'You' : p).join(', ')}
                        </p>
                        <p style={{ color: '#666', margin: '0.2rem 0' }}>
                          <strong>Your share:</strong> ₹{(expense.totalAmount / expense.participants.length).toFixed(2)} | 
                          <strong> Status:</strong> {expense.paidBy === currentUser ? 'Waiting for others' : 'You owe ₹' + (expense.totalAmount / expense.participants.length).toFixed(2)}
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
      💰 Your Pending Settlements
    </h3>

    {getUserSettlements().length === 0 ? (
      <div style={{ textAlign: 'center', color: '#666', padding: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
        <h3>All settled up! 🎉</h3>
        <p>No pending payments found.</p>
      </div>
    ) : (
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {getUserSettlements().map((settlement, index) => {
          const isBorrower = settlement.from === currentUser;
          const isLender = settlement.to === currentUser;
          const userHasConfirmed = isBorrower ? settlement.markedByFrom : settlement.markedByTo;
          const otherPersonHasConfirmed = isBorrower ? settlement.markedByTo : settlement.markedByFrom;
          
          return (
            <div key={index} style={settlementCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: '#333', margin: '0 0 0.5rem 0' }}>{settlement.expenseTitle}</h4>
                  <p style={{ color: '#666', margin: '0.2rem 0' }}>
                    {isBorrower ? (
                      <strong>💰 You owe ₹{settlement.amount} to {settlement.to}</strong>
                    ) : (
                      <strong>💰 {settlement.from} owes you ₹{settlement.amount}</strong>
                    )}
                  </p>
                  <p style={{ color: '#666', margin: '0.2rem 0', fontSize: '0.9rem' }}>
                    {userHasConfirmed ? '✅ You confirmed' : '⏳ Waiting for your confirmation'} | 
                    {otherPersonHasConfirmed ? ' ✅ Other confirmed' : ' ⏳ Waiting for other'}
                  </p>
                </div>
                {!userHasConfirmed && (
                  <button
                    onClick={() => markAsPaid(settlement.expenseId, settlement.settlementIndex)}
                    style={secondaryButtonStyle}
                  >
                    ✅ Confirm Paid
                  </button>
                )}
              </div>
            </div>
          );
        })}
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
              🛡️ Your Covered Payments
            </h3>
            
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#333', marginBottom: '1rem' }}>Add Covered Payment</h4>
              <CoveredPaymentForm onAdd={addCoveredPayment} friends={friends} currentUser={currentUser} />
            </div>

            {getUserCoveredPayments().length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤝</div>
                <h3>No covered payments yet</h3>
                <p>When someone pays for others, add it here to track!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {getUserCoveredPayments().map(payment => (
                  <div key={payment.id} style={coveredCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ color: '#333', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                          {payment.coveredBy === currentUser ? (
                            `🛡️ You covered ₹${payment.amount} for ${payment.coveredFor}`
                          ) : (
                            `🛡️ ${payment.coveredBy} covered ₹${payment.amount} for you`
                          )}
                        </p>
                        <p style={{ color: '#666', margin: '0.2rem 0' }}>
                          <strong>Date:</strong> {new Date(payment.date).toLocaleDateString()}
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
function CoveredPaymentForm({ onAdd, friends, currentUser }) {
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
            <option key={friend} value={friend}>{friend} {friend === currentUser ? '(You)' : ''}</option>
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
            <option key={friend} value={friend}>{friend} {friend === currentUser ? '(You)' : ''}</option>
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

// Styles (same as before)
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