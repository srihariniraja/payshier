import React, { useState, useEffect } from 'react';

function TimelinePage({ goTo }) {
  const [contracts, setContracts] = useState([]);
  const [view, setView] = useState('timeline');

  // Load contracts from localStorage
  // Load contracts from localStorage
useEffect(() => {
  console.log('🔍 CHECKING LOCALSTORAGE...');
  
  // Check all localStorage items
  const allKeys = Object.keys(localStorage);
  console.log('📋 All localStorage keys:', allKeys);
  
  const savedContracts = localStorage.getItem('payshier-transactions');
  console.log('📦 payshier-transactions raw:', savedContracts);
  
  if (savedContracts) {
    const parsed = JSON.parse(savedContracts);
    console.log('🔄 Parsed transactions:', parsed);
    console.log('📊 Number of transactions:', parsed.length);
    setContracts(parsed);
  } else {
    console.log('❌ No payshier-transactions found in localStorage');
  }
}, []);
  const TimelineView = () => (
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>Contract Timeline</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {contracts.map((contract) => (
          <div key={contract.id} style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '1.5rem',
            borderRadius: '10px',
            borderLeft: `4px solid ${contract.status === 'active' ? '#51cf66' : '#868e96'}`,
            color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>
                  {contract.lenderName} → {contract.borrowerName}
                </h4>
                <p style={{ margin: '0.25rem 0', opacity: 0.8 }}>Amount: {contract.amount}</p>
                <p style={{ margin: '0.25rem 0', opacity: 0.8 }}>Purpose: {contract.purpose}</p>
                <p style={{ margin: '0.25rem 0', opacity: 0.8 }}>
                  Agreement: {contract.agreementDate} | Due: {contract.dueDate}
                </p>
                <span style={{
                  padding: '4px 8px',
                  background: contract.status === 'active' ? '#51cf66' : '#868e96',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  marginTop: '0.5rem',
                  display: 'inline-block'
                }}>
                  {contract.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{
                  background: '#339af0',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}>
                  View PDF
                </button>
                <button style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '8px 12px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}>
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const CalendarView = () => (
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>Contract Calendar</h3>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '1.5rem',
        borderRadius: '10px',
        color: 'white'
      }}>
        <p style={{ textAlign: 'center', opacity: 0.8 }}>
          Calendar view showing contract due dates and milestones
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
          {Array.from({ length: 31 }, (_, i) => (
            <div key={i} style={{
              padding: '0.5rem',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '5px',
              minHeight: '40px'
            }}>
              {i + 1}
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ color: 'white', marginBottom: '1rem' }}>Upcoming Due Dates:</h4>
          {contracts.filter(c => c.status === 'active').map(contract => (
            <div key={contract.id} style={{
              padding: '0.75rem',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '5px',
              marginBottom: '0.5rem'
            }}>
              <strong>{contract.dueDate}</strong>: {contract.lenderName} → {contract.borrowerName} - {contract.amount}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '2rem',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button 
            onClick={() => goTo('home')}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 16px',
              borderRadius: '20px',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
          
          <h2 style={{ color: 'white', margin: 0 }}>Contract Timeline & Calendar</h2>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setView('timeline')}
              style={{
                background: view === 'timeline' ? '#7e1047' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '8px 16px',
                borderRadius: '20px',
                cursor: 'pointer'
              }}
            >
              Timeline
            </button>
            <button
              onClick={() => setView('calendar')}
              style={{
                background: view === 'calendar' ? '#7e1047' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '8px 16px',
                borderRadius: '20px',
                cursor: 'pointer'
              }}
            >
              Calendar
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '1rem',
            borderRadius: '10px',
            flex: 1,
            textAlign: 'center',
            color: 'white'
          }}>
            <h3 style={{ margin: 0, fontSize: '2rem' }}>{contracts.length}</h3>
            <p style={{ margin: 0, opacity: 0.8 }}>Total Contracts</p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '1rem',
            borderRadius: '10px',
            flex: 1,
            textAlign: 'center',
            color: 'white'
          }}>
            <h3 style={{ margin: 0, fontSize: '2rem' }}>
              {contracts.filter(c => c.status === 'active').length}
            </h3>
            <p style={{ margin: 0, opacity: 0.8 }}>Active</p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '1rem',
            borderRadius: '10px',
            flex: 1,
            textAlign: 'center',
            color: 'white'
          }}>
            <h3 style={{ margin: 0, fontSize: '2rem' }}>
              {contracts.filter(c => c.status === 'completed').length}
            </h3>
            <p style={{ margin: 0, opacity: 0.8 }}>Completed</p>
          </div>
        </div>

        {/* View Content */}
        {view === 'timeline' ? <TimelineView /> : <CalendarView />}
      </div>
    </div>
  );
}

export default TimelinePage; // ← MAKE SURE THIS LINE IS AT THE END