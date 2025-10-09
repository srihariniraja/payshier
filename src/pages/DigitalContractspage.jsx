import React, { useState } from 'react'

function DigitalContractsPage({ goTo }) {
  const [contracts, setContracts] = useState([
    { id: 1, title: 'Loan Agreement with John', parties: ['You', 'John'], amount: 5000, date: '2024-12-01', status: 'signed' },
    { id: 2, title: 'Personal Loan Contract', parties: ['You', 'Sarah'], amount: 2500, date: '2024-12-05', status: 'pending' },
    { id: 3, title: 'Business Loan Agreement', parties: ['You', 'Mike'], amount: 10000, date: '2024-11-20', status: 'signed' }
  ])

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          📄 Digital Contracts
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => goTo('features')} style={navButtonStyle}>
            ← Back to Features
          </button>
          <button onClick={() => alert('Create new contract modal')} style={primaryButtonStyle}>
            📝 Create New Contract
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={statCardStyle}>
            <div style={{ fontSize: '2rem' }}>📄</div>
            <h4>Total Contracts</h4>
            <p style={statNumberStyle}>3</p>
          </div>
          <div style={statCardStyle}>
            <div style={{ fontSize: '2rem' }}>✅</div>
            <h4>Signed</h4>
            <p style={statNumberStyle}>2</p>
          </div>
          <div style={statCardStyle}>
            <div style={{ fontSize: '2rem' }}>⏳</div>
            <h4>Pending</h4>
            <p style={statNumberStyle}>1</p>
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ color: '#333', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            Your Digital Contracts
          </h3>

          {contracts.map(contract => (
            <div key={contract.id} style={{
              background: '#f8f9fa',
              border: '2px solid #e9ecef',
              padding: '1.5rem',
              margin: '1rem 0',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: '#333', margin: '0 0 0.5rem 0' }}>{contract.title}</h4>
                <p style={{ color: '#666', margin: '0.2rem 0' }}>
                  <strong>Parties:</strong> {contract.parties.join(' ↔ ')}
                </p>
                <p style={{ color: '#666', margin: '0.2rem 0' }}>
                  <strong>Amount:</strong> ₹{contract.amount} | <strong>Date:</strong> {contract.date}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{
                  background: contract.status === 'signed' ? '#28a745' : '#ffc107',
                  color: 'white',
                  padding: '5px 15px',
                  borderRadius: '20px',
                  fontWeight: 'bold'
                }}>
                  {contract.status.toUpperCase()}
                </span>
                <button style={secondaryButtonStyle}>
                  View Contract
                </button>
                <button style={secondaryButtonStyle}>
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const statCardStyle = {
  background: 'rgba(255,255,255,0.95)',
  padding: '1.5rem',
  borderRadius: '15px',
  textAlign: 'center',
  boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
}

const statNumberStyle = {
  fontSize: '2rem',
  fontWeight: 'bold',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  margin: '0.5rem 0 0 0'
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

export default DigitalContractsPage