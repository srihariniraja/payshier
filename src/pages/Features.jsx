import React from 'react'

function Features({ goTo }) {
  const features = [
    {
      icon: '💰',
      title: 'Lending & Borrowing',
      description: 'Track informal loans with friends and family. Set repayment dates and get reminders.',
      buttonText: 'Manage Loans',
      action: () => goTo('lending')
    },
    {
      icon: '👥',
      title: 'Group Expenses',
      description: 'Split bills, trips, and shared expenses. Know exactly who owes whom.',
      buttonText: 'Split Expenses',
      action: () => goTo('splitexpenses')
    },
    {
      icon: '📅',
      title: 'Timeline & Calendar',
      description: 'Track all your contracts with calendar view and timeline history. Never miss a due date.',
      buttonText: 'View Timeline',
      action: () => goTo('timeline')
    },
    {
      icon: '⏰',
      title: 'Bill Reminder & Tracker',
      description: 'Track bills (rent, utilities, subscriptions) with due dates and get smart reminders before deadlines.',
      buttonText: 'Manage Bills',
      action: () => goTo('billtracker')
    },
    {
      icon: '📊',
      title: 'Spending Insight',
      description: 'Track, analyze, and optimize your spending with visual reports and smart budgeting tools.',
      buttonText: 'See Analytics',
      action: () => goTo('spendinginsights')
    }
  ]

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '2rem 0'
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
          color: 'white',
          background: 'linear-gradient(135deg, #7e1047 0%, #2f040d 100%)',
          padding: '10px 20px',
          borderRadius: '10px',
          boxShadow: '0 4px 15px rgba(126, 16, 71, 0.4)'
        }}>
          PAYSHIER Features
        </div>
        
        <div>
          <button style={navButtonStyle} onClick={() => goTo('dashboard')}>Go to Dashboard</button>
          <button style={profileButtonStyle} onClick={() => goTo('profile')}>
            👤 Profile
          </button>
          <button style={navButtonStyle} onClick={() => {
            localStorage.removeItem('currentUser');
            goTo('home');
          }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{
          textAlign: 'center',
          color: 'white',
          marginBottom: '4rem',
          padding: '3rem 1rem'
        }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            marginBottom: '1.5rem',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Everything You Need for Trusted Money Management
          </h1>
          <p style={{ 
            fontSize: '1.4rem', 
            opacity: 0.9,
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            PAYSHIER combines powerful features to make informal lending safe, transparent, and hassle-free.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {features.map((feature, index) => (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              padding: '2.5rem',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              textAlign: 'center',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }} 
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)'
            }}>
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '1.5rem',
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))'
              }}>
                {feature.icon}
              </div>
              
              <h3 style={{ 
                marginBottom: '1.2rem', 
                color: '#333',
                fontSize: '1.8rem',
                fontWeight: 'bold'
              }}>
                {feature.title}
              </h3>
              
              <p style={{ 
                marginBottom: '2rem', 
                color: '#666', 
                lineHeight: '1.7',
                fontSize: '1.1rem'
              }}>
                {feature.description}
              </p>
              
              <button 
                onClick={feature.action}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '25px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)'
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)'
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}
              >
                {feature.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const navButtonStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
  marginLeft: '10px'
}

const profileButtonStyle = {
  background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
  marginLeft: '10px'
}

export default Features