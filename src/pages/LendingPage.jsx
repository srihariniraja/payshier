import React, { useState } from 'react'

function LendingPage({ goTo }) {
  const [activeTab, setActiveTab] = useState('lend') // 'lend' or 'borrow'
  const [loans, setLoans] = useState([]) // Start with empty array

  const filteredLoans = loans.filter(loan => loan.type === (activeTab === 'lend' ? 'lent' : 'borrowed'))

  return (
    <div style={{
      minHeight: '100vh'
    }}>
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
          💰 Lending & Borrowing
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => goTo('features')} style={navButtonStyle}>
            ← Back to Features
          </button>
          <button onClick={() => goTo('createloan')} style={primaryButtonStyle}>
            ➕ New Transaction
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '15px',
          padding: '0.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => setActiveTab('lend')}
            style={{
              flex: 1,
              padding: '1rem',
              border: 'none',
              background: activeTab === 'lend' ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' : 'transparent',
              color: activeTab === 'lend' ? 'white' : '#ffffff', // Changed to white
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            📤 Money I Lent
          </button>
          <button
            onClick={() => setActiveTab('borrow')}
            style={{
              flex: 1,
              padding: '1rem',
              border: 'none',
              background: activeTab === 'borrow' ? 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)' : 'transparent',
              color: activeTab === 'borrow' ? 'white' : '#ffffff', // Changed to white
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            📥 Money I Borrowed
          </button>
        </div>

        {/* Loans List */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ color: '#333', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            {activeTab === 'lend' ? '📤 Money Lent to Others' : '📥 Money Borrowed from Others'}
          </h3>

          {filteredLoans.length > 0 ? (
            filteredLoans.map(loan => (
              <div key={loan.id} style={{
                background: '#f8f9fa',
                borderLeft: `6px solid ${loan.type === 'lent' ? '#dc3545' : '#007bff'}`,
                padding: '1.5rem',
                margin: '1rem 0',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ color: '#333', margin: '0 0 0.5rem 0' }}>{loan.person}</h4>
                  <p style={{ color: '#666', margin: '0.2rem 0' }}>
                    <strong>Amount:</strong> ₹{loan.amount}
                  </p>
                  <p style={{ color: '#666', margin: '0.2rem 0' }}>
                    <strong>Date:</strong> {loan.date} | <strong>Due:</strong> {loan.dueDate}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{
                    background: loan.status === 'paid' ? '#28a745' : '#ffc107',
                    color: 'white',
                    padding: '5px 15px',
                    borderRadius: '20px',
                    fontWeight: 'bold'
                  }}>
                    {loan.status.toUpperCase()}
                  </span>
                  <button style={secondaryButtonStyle}>
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#666', padding: '3rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                {activeTab === 'lend' ? '📤' : '📥'}
              </div>
              <h3>No {activeTab === 'lend' ? 'lending' : 'borrowing'} records</h3>
              <p>Start by creating a new transaction</p>
              <button 
                onClick={() => goTo('createloan')}
                style={primaryButtonStyle}
              >
                Create Your First Transaction
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

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
  padding: '10px 20px',
  borderRadius: '25px',
  cursor: 'pointer',
  fontWeight: 'bold'
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

export default LendingPage