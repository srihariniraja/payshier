import React, { useState, useEffect } from 'react'

function Dashboard({ goTo }) {
  const [loans, setLoans] = useState([])
  const [bills, setBills] = useState([])
  const [stats, setStats] = useState({
  totalLent: 0,
  totalBorrowed: 0,
  pendingLoans: 0,
  totalBillsPaid: 0,
  totalAmountPaid: 0,
  pendingBills: 0,
  totalAmountDue: 0,
  // Add these new expense stats
  totalExpenseAmount: 0,
  expenseMoneyYouOwe: 0,
  expenseMoneyOwedToYou: 0,
  totalExpensesCount: 0
})

  // Load actual data from localStorage
  // Load actual data from localStorage
useEffect(() => {
  loadActualData()
  loadBillsData()
  loadExpenseData() // Add this line
}, [])

// Add this new function to load expense data
const loadExpenseData = () => {
  try {
    const expenses = JSON.parse(localStorage.getItem('payshier-expenses') || '[]')
    const currentUser = getCurrentUserName()
    
    // Filter expenses where current user is involved
    const userExpenses = expenses.filter(expense => 
      expense.participants && expense.participants.includes(currentUser)
    )
    
    console.log('User expenses:', userExpenses)
    
    // Calculate expense statistics
    const totalExpenseAmount = userExpenses.reduce((sum, expense) => 
      sum + parseFloat(expense.totalAmount || 0), 0
    )
    
    // Calculate money you owe from expenses
    const expenseMoneyYouOwe = userExpenses
      .filter(expense => expense.paidBy !== currentUser)
      .reduce((sum, expense) => {
        const share = parseFloat(expense.totalAmount) / expense.participants.length
        return sum + share
      }, 0)
    
    // Calculate money owed to you from expenses
    const expenseMoneyOwedToYou = userExpenses
      .filter(expense => expense.paidBy === currentUser)
      .reduce((sum, expense) => {
        const share = parseFloat(expense.totalAmount) / expense.participants.length
        const numberOfPeopleOwing = expense.participants.length - 1
        return sum + (share * numberOfPeopleOwing)
      }, 0)
    
    // Update stats with expense data
    setStats(prevStats => ({
      ...prevStats,
      totalExpenseAmount,
      expenseMoneyYouOwe,
      expenseMoneyOwedToYou,
      totalExpensesCount: userExpenses.length
    }))
    
  } catch (error) {
    console.error('Error loading expense data:', error)
  }
}

  const loadActualData = () => {
  try {
    const pendingContracts = JSON.parse(localStorage.getItem('payshier-pending-contracts') || '[]')
    const activeLoans = JSON.parse(localStorage.getItem('payshier-transactions') || '[]')
    
    const currentUser = getCurrentUserName()
    console.log('Current user:', currentUser)
    
    // FILTER: Only show transactions where current user is actually involved
    const userLoans = activeLoans.filter(loan => {
      const isLender = loan.type === 'lent' && loan.parties?.person === currentUser
      const isBorrower = loan.type === 'borrowed' && loan.parties?.person === currentUser
      return isLender || isBorrower
    })
    
    console.log('Filtered user loans:', userLoans)
    setLoans(userLoans)

    const calculatedStats = {
      totalLent: userLoans
        .filter(loan => loan.type === 'lent')
        .reduce((sum, loan) => sum + parseFloat(loan.amount?.replace('₹', '')?.replace(/,/g, '') || 0), 0),
      
      totalBorrowed: userLoans
        .filter(loan => loan.type === 'borrowed')
        .reduce((sum, loan) => sum + parseFloat(loan.amount?.replace('₹', '')?.replace(/,/g, '') || 0), 0),
      
      pendingLoans: pendingContracts.length
    }

    setStats(prevStats => ({ ...prevStats, ...calculatedStats }))
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
}

  // Load bills data
  const loadBillsData = () => {
    try {
      const savedBills = JSON.parse(localStorage.getItem('payshier-bills') || '[]')
      setBills(savedBills)

      // Calculate bill statistics
      const paidBills = savedBills.filter(bill => bill.status === 'paid')
      const pendingBills = savedBills.filter(bill => bill.status !== 'paid')
      
      const totalAmountPaid = paidBills.reduce((sum, bill) => {
        const amount = parseFloat(bill.amount?.replace('₹', '') || 0)
        return sum + amount
      }, 0)

      const totalAmountDue = pendingBills.reduce((sum, bill) => {
        const amount = parseFloat(bill.amount?.replace('₹', '') || 0)
        return sum + amount
      }, 0)

      setStats(prevStats => ({
        ...prevStats,
        totalBillsPaid: paidBills.length,
        totalAmountPaid: totalAmountPaid,
        pendingBills: pendingBills.length,
        totalAmountDue: totalAmountDue
      }))
    } catch (error) {
      console.error('Error loading bills data:', error)
    }
  }

  // Helper function to get current user - UPDATE THIS BASED ON YOUR AUTH
  const getCurrentUserName = () => {
    // Get the current user email (same as LendingPage)
    const currentUser = localStorage.getItem('currentUser')
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser)
        return user.email || user.name || 'user1'
      } catch {
        return 'user1'
      }
    }
    return 'user1'
  }

  const getStatusColor = (status) => {
    return status === 'paid' ? '#28a745' : status === 'approved' ? '#17a2b8' : '#ffc107'
  }

  const getTypeColor = (loan) => {
    const currentUser = getCurrentUserName()
    // For active loans only now
    return loan.type === 'lent' ? '#dc3545' : '#007bff'
  }

  const getTypeIcon = (loan) => {
    return loan.type === 'lent' ? '⬆️' : '⬇️'
  }

  const getLoanType = (loan) => {
    return loan.type === 'lent' ? 'lent' : 'borrowed'
  }

  const getOtherParty = (loan) => {
    return loan.parties?.otherParty || 'Unknown'
  }

  const getBillCategoryIcon = (category) => {
    const icons = {
      utility: '💡',
      rent: '🏠',
      subscription: '📱',
      internet: '🌐',
      other: '📄'
    };
    return icons[category] || '📄';
  }

  const getBillStatusColor = (bill) => {
    if (bill.status === 'paid') return '#28a745';
    
    const today = new Date();
    const dueDate = new Date(bill.dueDate);
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) return '#dc3545'; // Overdue
    if (daysUntilDue <= 3) return '#ffc107'; // Due soon
    return '#17a2b8'; // Upcoming
  }

  const getBillStatusText = (bill) => {
    if (bill.status === 'paid') return 'PAID';
    
    const today = new Date();
    const dueDate = new Date(bill.dueDate);
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) return 'OVERDUE';
    if (daysUntilDue === 0) return 'DUE TODAY';
    if (daysUntilDue === 1) return 'DUE TOMORROW';
    if (daysUntilDue <= 3) return 'DUE SOON';
    return 'UPCOMING';
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      {/* Navbar - same as before but with fixed text visibility */}
      <nav style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        padding: '1rem 2rem',
        boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid rgba(102, 126, 234, 0.2)'
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
          📊 PAYSHIER Dashboard
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => goTo('features')}
            style={{
              background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(108, 117, 125, 0.4)'
            }}
          >
            ⚙️ Features
          </button>
          <button 
            onClick={() => goTo('createloan')}
            style={{
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)'
            }}
          >
            ➕ New Loan
          </button>
        </div>
      </nav>
      <button 
  onClick={() => goTo('splitexpenses')}
  style={{
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '25px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
  }}
>
  👥 Split Expenses
</button>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Header Stats - NOW WITH BILLS DATA */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Loan Stats */}
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: '1.5rem',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
            <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>Total Lent</h3>
            <p style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              ₹{stats.totalLent.toLocaleString()}
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: '1.5rem',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💳</div>
            <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>Total Borrowed</h3>
            <p style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              ₹{stats.totalBorrowed.toLocaleString()}
            </p>
          </div>

          {/* Pending Loans Stats */}
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: '1.5rem',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>Pending Loans</h3>
            <p style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {stats.pendingLoans}
            </p>
          </div>

          {/* Bills Stats */}
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: '1.5rem',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>Bills Paid</h3>
            <p style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {stats.totalBillsPaid} Bills
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
              ₹{stats.totalAmountPaid.toLocaleString()} Total
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: '1.5rem',
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏰</div>
            <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>Pending Bills</h3>
            <p style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {stats.pendingBills} Bills
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
              ₹{stats.totalAmountDue.toLocaleString()} Due
            </p>
          </div>
        </div>

        {/* Active Loans Section */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          padding: '2.5rem',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.3)',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <h2 style={{ 
              color: '#333',
              fontSize: '2rem',
              fontWeight: 'bold',
              margin: 0
            }}>
              ✅ Active Loans
            </h2>
            <span style={{
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              padding: '5px 15px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>
              {loans.length} Active
            </span>
          </div>
          
          {loans.map((loan, index) => (
            <div key={index} style={{
              background: '#f8f9fa',
              borderLeft: `6px solid ${getTypeColor(loan)}`,
              padding: '1.5rem',
              margin: '1rem 0',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(5px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    background: getTypeColor(loan),
                    color: 'white',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    {getTypeIcon(loan)}
                  </div>
                  <div>
                    <h3 style={{ 
                      color: '#333', 
                      margin: '0 0 0.5rem 0',
                      fontSize: '1.3rem'
                    }}>
                      {getOtherParty(loan)}
                    </h3>
                    <p style={{ 
                      color: '#666', 
                      margin: '0.2rem 0',
                      fontSize: '1rem'
                    }}>
                      <strong>Amount:</strong> 
                      <span style={{ 
                        color: getTypeColor(loan),
                        fontWeight: 'bold',
                        marginLeft: '0.5rem'
                      }}>
                        {loan.amount}
                      </span>
                    </p>
                    <p style={{ 
                      color: '#666', 
                      margin: '0.2rem 0',
                      fontSize: '1rem'
                    }}>
                      <strong>Type:</strong> 
                      <span style={{ 
                        color: getTypeColor(loan),
                        fontWeight: 'bold',
                        marginLeft: '0.5rem'
                      }}>
                        {getLoanType(loan) === 'lent' ? 'You lent' : 'You borrowed'}
                      </span>
                    </p>
                    <p style={{ 
                      color: '#666', 
                      margin: '0.2rem 0',
                      fontSize: '1rem'
                    }}>
                      <strong>Due:</strong> 
                      <span style={{ 
                        color: '#e83e8c',
                        fontWeight: 'bold',
                        marginLeft: '0.5rem'
                      }}>
                        {loan.returnDate || loan.dueDate || 'Not specified'}
                      </span>
                    </p>
                    {loan.purpose && (
                      <p style={{ 
                        color: '#666', 
                        margin: '0.2rem 0',
                        fontSize: '1rem'
                      }}>
                        <strong>Purpose:</strong> {loan.purpose}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <span style={{
                    background: '#28a745',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          ))}

          {loans.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              color: '#666',
              padding: '3rem'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
              <h3 style={{ color: '#333' }}>No active loans</h3>
              <p>All your approved loans will appear here</p>
              <button 
                onClick={() => goTo('createloan')}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginTop: '1rem',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}
              >
                Create New Loan
              </button>
            </div>
          )}
        </div>
{/* EXPENSE STATS CARDS - ADD THESE 3 NEW CARDS */}

{/* Total Group Expenses */}
<div style={{
  background: 'rgba(255,255,255,0.95)',
  padding: '1.5rem',
  borderRadius: '15px',
  textAlign: 'center',
  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
  border: '1px solid rgba(255,255,255,0.3)'
}}>
  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
  <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>Group Expenses</h3>
  <p style={{ 
    fontSize: '1.5rem', 
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  }}>
    ₹{stats.totalExpenseAmount.toLocaleString()}
  </p>
  <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
    {stats.totalExpensesCount} Expenses
  </p>
</div>

{/* Money You Owe from Expenses */}
<div style={{
  background: 'rgba(255,255,255,0.95)',
  padding: '1.5rem',
  borderRadius: '15px',
  textAlign: 'center',
  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
  border: '1px solid rgba(255,255,255,0.3)'
}}>
  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💸</div>
  <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>You Owe (Expenses)</h3>
  <p style={{ 
    fontSize: '1.5rem', 
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  }}>
    ₹{stats.expenseMoneyYouOwe.toFixed(2)}
  </p>
</div>

{/* Money Owed to You from Expenses */}
<div style={{
  background: 'rgba(255,255,255,0.95)',
  padding: '1.5rem',
  borderRadius: '15px',
  textAlign: 'center',
  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
  border: '1px solid rgba(255,255,255,0.3)'
}}>
  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
  <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>Owed to You (Expenses)</h3>
  <p style={{ 
    fontSize: '1.5rem', 
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  }}>
    ₹{stats.expenseMoneyOwedToYou.toFixed(2)}
  </p>
</div>
        {/* Bills Section */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          padding: '2.5rem',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <h2 style={{ 
              color: '#333',
              fontSize: '2rem',
              fontWeight: 'bold',
              margin: 0
            }}>
              ⏰ Your Bills
            </h2>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                padding: '5px 15px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                {stats.totalBillsPaid} Paid
              </span>
              <span style={{
                background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
                color: 'white',
                padding: '5px 15px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                {stats.pendingBills} Pending
              </span>
            </div>
          </div>
          
          {bills.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#666',
              padding: '3rem'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
              <h3 style={{ color: '#333' }}>No bills tracked yet</h3>
              <p>Add your first bill to start tracking payments!</p>
              <button 
                onClick={() => goTo('billtracker')}
                style={{
                  background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginTop: '1rem',
                  boxShadow: '0 4px 15px rgba(255, 165, 0, 0.4)'
                }}
              >
                Go to Bill Tracker
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bills.map((bill) => (
                <div key={bill.id} style={{
                  background: '#f8f9fa',
                  borderLeft: `6px solid ${getBillStatusColor(bill)}`,
                  padding: '1.5rem',
                  borderRadius: '12px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div style={{
                      background: getBillStatusColor(bill),
                      color: 'white',
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      {getBillCategoryIcon(bill.category)}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1.2rem' }}>
                        {bill.name}
                      </h4>
                      <p style={{ margin: '0.2rem 0', color: '#666' }}>
                        <strong>Amount:</strong> {bill.amount}
                      </p>
                      <p style={{ margin: '0.2rem 0', color: '#666' }}>
                        <strong>Due:</strong> {new Date(bill.dueDate).toLocaleDateString()}
                      </p>
                      <p style={{ margin: '0.2rem 0', color: '#666' }}>
                        <strong>Category:</strong> {bill.category.charAt(0).toUpperCase() + bill.category.slice(1)}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      background: getBillStatusColor(bill),
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>
                      {getBillStatusText(bill)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Group Expenses Section */}
<div style={{
  background: 'rgba(255,255,255,0.95)',
  backdropFilter: 'blur(10px)',
  padding: '2.5rem',
  borderRadius: '20px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  border: '1px solid rgba(255,255,255,0.3)',
  marginBottom: '2rem'
}}>
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  }}>
    <h2 style={{ 
      color: '#333',
      fontSize: '2rem',
      fontWeight: 'bold',
      margin: 0
    }}>
      👥 Group Expenses
    </h2>
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <button 
        onClick={() => goTo('splitexpenses')}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '25px',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
        }}
      >
        ➕ Split Expense
      </button>
    </div>
  </div>
  
  {(() => {
    const expenses = JSON.parse(localStorage.getItem('payshier-expenses') || '[]')
    const currentUser = getCurrentUserName()
    const userExpenses = expenses.filter(expense => 
      expense.participants && expense.participants.includes(currentUser)
    )
    
    return userExpenses.length === 0 ? (
      <div style={{ 
        textAlign: 'center', 
        color: '#666',
        padding: '3rem'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
        <h3 style={{ color: '#333' }}>No group expenses yet</h3>
        <p>Split your first expense with friends!</p>
        <button 
          onClick={() => goTo('splitexpenses')}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '1rem',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
          }}
        >
          Create Group Expense
        </button>
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {userExpenses.slice(0, 5).map((expense) => (
          <div key={expense.id} style={{
            background: '#f8f9fa',
            borderLeft: `6px solid ${expense.paidBy === currentUser ? '#28a745' : '#ffc107'}`,
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                  {expense.title}
                </h4>
                <p style={{ margin: '0.2rem 0', color: '#666' }}>
                  <strong>Amount:</strong> ₹{expense.totalAmount}
                </p>
                <p style={{ margin: '0.2rem 0', color: '#666' }}>
                  <strong>Paid by:</strong> {expense.paidBy} {expense.paidBy === currentUser ? '(You)' : ''}
                </p>
                <p style={{ margin: '0.2rem 0', color: '#666' }}>
                  <strong>Your share:</strong> ₹{(expense.totalAmount / expense.participants.length).toFixed(2)}
                </p>
                <p style={{ margin: '0.2rem 0', color: '#666' }}>
                  <strong>Participants:</strong> {expense.participants.length} people
                </p>
                <p style={{ margin: '0.2rem 0', color: '#666' }}>
                  <strong>Date:</strong> {new Date(expense.date).toLocaleDateString()}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  background: expense.paidBy === currentUser ? '#28a745' : '#ffc107',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  display: 'inline-block',
                  marginBottom: '0.5rem'
                }}>
                  {expense.paidBy === currentUser ? 'You Paid' : 'You Owe'}
                </span>
                <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                  {expense.category === 'food' ? '🍕' : 
                   expense.category === 'travel' ? '🚗' : 
                   expense.category === 'entertainment' ? '🎬' : 
                   expense.category === 'shopping' ? '🛒' : '📦'} 
                  {expense.category}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {userExpenses.length > 5 && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button 
              onClick={() => goTo('splitexpenses')}
              style={{
                background: 'transparent',
                color: '#667eea',
                border: '2px solid #667eea',
                padding: '10px 20px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              View All {userExpenses.length} Expenses
            </button>
          </div>
        )}
      </div>
    )
  })()}
</div>
      </div>
    </div>
  )
}

export default Dashboard