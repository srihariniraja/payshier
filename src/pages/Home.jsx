import React from 'react'

function Home({ goTo }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem', fontWeight: 'bold' }}>PAYSHIER</h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '3rem', opacity: 0.9 }}>
        Track, Pay and Lend with Trust
      </p>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          style={{
            background: 'white',
            color: '#667eea',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '10px',
            fontSize: '1.2rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
          onClick={() => goTo('login')}  // ← MUST BE 'login' NOT 'landing'
        >
          Login
        </button>
        
        <button 
          style={{
            background: 'transparent',
            color: 'white',
            border: '2px solid white',
            padding: '15px 30px',
            borderRadius: '10px',
            fontSize: '1.2rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          onClick={() => goTo('landing')}  // ← This goes to features page
        >
          Explore Features
        </button>
      </div>
    </div>
  )
}

export default Home