import React, { useState } from 'react'

function Dashboard({ goTo }) {
  const [loans, setLoans] = useState([
    { id: 1, person: 'John', amount: 5000, type: 'lent', dueDate: '2024-12-25', status: 'pending' },
    { id: 2, person: 'Sarah', amount: 2500, type: 'borrowed', dueDate: '2024-12-20', status: 'pending' },
    { id: 3, person: 'Mike', amount: 3000, type: 'lent', dueDate: '2024-12-28', status: 'paid' }
  ])

  const getStatusColor = (status) => {
    return status === 'paid' ? '#28a745' : '#ffc107'
  }

  const getTypeColor = (type) => {
    return type === 'lent' ? '#dc3545' : '#007bff'
  }

  const getTypeIcon = (type) => {
    return type === 'lent' ? '⬆️' : '⬇️'
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      {/* Navbar */}
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          📊 PAYSHIER Dashboard
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => goTo('home')}
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
            🏠 Home
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

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Header Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
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
              ₹8,000
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
              ₹2,500
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
            <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>Pending</h3>
            <p style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              2 Loans
            </p>
          </div>
        </div>

        {/* Loans Section */}
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
              📋 Your Loans & Borrowings
            </h2>
            <span style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '5px 15px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>
              {loans.length} Total
            </span>
          </div>
          
          {loans.map(loan => (
            <div key={loan.id} style={{
              background: '#f8f9fa',
              borderLeft: `6px solid ${getTypeColor(loan.type)}`,
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
                    background: getTypeColor(loan.type),
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
                    {getTypeIcon(loan.type)}
                  </div>
                  <div>
                    <h3 style={{ 
                      color: '#333', 
                      margin: '0 0 0.5rem 0',
                      fontSize: '1.3rem'
                    }}>
                      {loan.person}
                    </h3>
                    <p style={{ 
                      color: '#666', 
                      margin: '0.2rem 0',
                      fontSize: '1rem'
                    }}>
                      <strong>Amount:</strong> 
                      <span style={{ 
                        color: getTypeColor(loan.type),
                        fontWeight: 'bold',
                        marginLeft: '0.5rem'
                      }}>
                        ₹{loan.amount}
                      </span>
                    </p>
                    <p style={{ 
                      color: '#666', 
                      margin: '0.2rem 0',
                      fontSize: '1rem'
                    }}>
                      <strong>Type:</strong> 
                      <span style={{ 
                        color: getTypeColor(loan.type),
                        fontWeight: 'bold',
                        marginLeft: '0.5rem'
                      }}>
                        {loan.type === 'lent' ? 'You lent' : 'You borrowed'}
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
                        {loan.dueDate}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <span style={{
                    background: getStatusColor(loan.status),
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    {loan.status.toUpperCase()}
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
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💰</div>
              <h3 style={{ color: '#333' }}>No loans recorded yet</h3>
              <p>Create your first loan to get started!</p>
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
                Create Your First Loan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard