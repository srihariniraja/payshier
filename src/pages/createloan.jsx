import React, { useState } from 'react'

function CreateLoan({ goTo }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    personName: '',
    amount: '',
    loanType: 'lending',
    dueDate: '',
    returnDate: '', // 🆕 NEW FIELD
    purpose: '',
    otherPartyName: ''
  })
  const [errors, setErrors] = useState({})

// GET ALL PAYSHIER ACCOUNTS
const getPayshierAccounts = () => {
  const accounts = JSON.parse(localStorage.getItem('payshierAccounts') || '[]');
  return accounts;
};

  const validateStep1 = () => {
    const newErrors = {}
    if (!formData.personName.trim()) newErrors.personName = 'Person name is required'
    if (!formData.amount.trim()) newErrors.amount = 'Amount is required'
    if (!formData.otherPartyName.trim()) newErrors.otherPartyName = 'Other party name is required'
    if (!formData.dueDate.trim()) newErrors.dueDate = 'Current date is required'
    if (!formData.returnDate.trim()) newErrors.returnDate = 'Return date is required' // 🆕 NEW VALIDATION
    if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
  if (step === 1 && validateStep1()) {
    setStep(2)
  } else if (step === 2) {
    // Save loan data before going to contract review
    const loanTransaction = {
      id: 'LOAN' + Date.now(),
      type: 'loan',
      title: `${formData.personName} → ${formData.otherPartyName}`,
      amount: `₹${formData.amount}`,
      purpose: formData.purpose,
      parties: {
        person: formData.personName,
        otherParty: formData.otherPartyName
      },
      dates: {
        created: new Date().toISOString(),
        due: formData.returnDate
      },
      status: 'active',
      loanType: formData.loanType
    };
    
    // Save to localStorage
    const existingTransactions = JSON.parse(localStorage.getItem('payshier-transactions') || '[]');
    const updatedTransactions = [...existingTransactions, loanTransaction];
    localStorage.setItem('payshier-transactions', JSON.stringify(updatedTransactions));
    
    console.log('Loan saved:', loanTransaction);
    // After saveTransaction(loanTransaction); add:
console.log('💾 Loan saved, checking localStorage...');
const checkData = localStorage.getItem('payshier-transactions');
console.log('✅ Current transactions after save:', JSON.parse(checkData));
    goTo('contractreview', formData)

  }
}

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  // 🆕 DYNAMIC LABELS BASED ON LOAN TYPE
  const getDynamicLabels = () => {
    if (formData.loanType === 'lending') {
      return {
        personLabel: "Your Name (Lender) *",
        otherPartyLabel: "Borrower's Name *", 
        amountLabel: "Amount You're Lending (₹) *",
        dueDateLabel: "Current Date *",
        returnDateLabel: "Expected Return Date *",
        nextButton: "Next →"
      }
    } else {
      return {
        personLabel: "Your Name (Borrower) *",
        otherPartyLabel: "Lender's Name *",
        amountLabel: "Amount You're Borrowing (₹) *",
        dueDateLabel: "Current Date *", 
        returnDateLabel: "Expected Return Date *",
        nextButton: "Next →"
      }
    }
  }

  const labels = getDynamicLabels()

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '3rem',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        maxWidth: '600px',
        margin: '0 auto',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Back Button */}
        <button 
          onClick={() => goTo('lending')}
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ← Back
        </button>

        <h2 style={{ 
          color: 'white', 
          textAlign: 'center', 
          marginBottom: '2rem',
          fontSize: '2rem'
        }}>
          {step === 1 ? 'Create New Loan' : 'Review Details'}
        </h2>

        {/* Progress Steps */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            color: 'white'
          }}>
            <span style={{
              padding: '8px 16px',
              borderRadius: '20px',
              background: step >= 1 ? '#7e1047' : 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              1. Basic Info
            </span>
            <span style={{
              padding: '8px 16px',
              borderRadius: '20px',
              background: step >= 2 ? '#7e1047' : 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              2. Review
            </span>
            <span style={{
              padding: '8px 16px',
              borderRadius: '20px',
              background: step >= 3 ? '#7e1047' : 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              3. Contract
            </span>
          </div>
        </div>

        {step === 1 && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
  <label style={{ color: 'white', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
    {labels.personLabel}
  </label>
  <input
    type="text"
    name="personName"
    value={formData.personName}
    onChange={handleChange}
    list="userAccounts"
    required
    style={{
      width: '100%',
      padding: '12px',
      background: 'rgba(255, 255, 255, 0.1)',
      border: errors.personName ? '1px solid red' : '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '10px',
      color: 'white',
      fontSize: '1rem'
    }}
    placeholder="Type or select your username"
  />
  <datalist id="userAccounts">
    {getPayshierAccounts().map((account, index) => (
      <option key={index} value={account.email}>
        {account.name}
      </option>
    ))}
  </datalist>
  {errors.personName && <span style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>{errors.personName}</span>}
</div>

            <div style={{ marginBottom: '1.5rem' }}>
  <label style={{ color: 'white', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
    {labels.otherPartyLabel}
  </label>
  <input
    type="text"
    name="otherPartyName"
    value={formData.otherPartyName}
    onChange={handleChange}
    list="userAccounts"
    required
    style={{
      width: '100%',
      padding: '12px',
      background: 'rgba(255, 255, 255, 0.1)',
      border: errors.otherPartyName ? '1px solid red' : '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '10px',
      color: 'white',
      fontSize: '1rem'
    }}
    placeholder={`Type or select ${formData.loanType === 'lending' ? "borrower's" : "lender's"} username`}
  />
  <datalist id="userAccounts">
    {getPayshierAccounts().map((account, index) => (
      <option key={index} value={account.email}>
        {account.name}
      </option>
    ))}
  </datalist>
  {errors.otherPartyName && <span style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>{errors.otherPartyName}</span>}
</div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: 'white', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {labels.amountLabel}
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: errors.amount ? '1px solid red' : '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '1rem'
                }}
                placeholder="Enter amount"
              />
              {errors.amount && <span style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>{errors.amount}</span>}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: 'white', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Transaction Type
              </label>
              <select
                name="loanType"
                value={formData.loanType}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '1rem'
                }}
              >
                <option value="lending">Lending Money</option>
                <option value="borrowing">Borrowing Money</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: 'white', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {labels.dueDateLabel}
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: errors.dueDate ? '1px solid red' : '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
              {errors.dueDate && <span style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>{errors.dueDate}</span>}
            </div>

            {/* 🆕 RETURN DATE FIELD */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: 'white', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {labels.returnDateLabel}
              </label>
              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: errors.returnDate ? '1px solid red' : '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
              {errors.returnDate && <span style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>{errors.returnDate}</span>}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ color: 'white', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Purpose of Loan *
              </label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: errors.purpose ? '1px solid red' : '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '1rem'
                }}
                placeholder="e.g., Emergency, Education, Business, Personal"
              />
              {errors.purpose && <span style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>{errors.purpose}</span>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ color: 'white' }}>
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Review Your Loan Details</h3>
            
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '1.5rem',
              borderRadius: '10px',
              marginBottom: '2rem'
            }}>
              <p><strong>Your Name:</strong> {formData.personName}</p>
              <p><strong>{formData.loanType === 'lending' ? 'Borrower:' : 'Lender:'}</strong> {formData.otherPartyName}</p>
              <p><strong>Amount:</strong> ₹{formData.amount}</p>
              <p><strong>Type:</strong> {formData.loanType === 'lending' ? 'Lending' : 'Borrowing'}</p>
              <p><strong>Current Date:</strong> {formData.dueDate}</p>
              <p><strong>Return Date:</strong> {formData.returnDate}</p> {/* 🆕 NEW FIELD */}
              <p><strong>Purpose:</strong> {formData.purpose}</p>
            </div>

            <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
              Ready to generate the contract?
            </p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '12px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ← Previous
            </button>
          )}
          
          <button
            onClick={handleNext}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #7e1047 0%, #2f040d 100%)',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {step === 2 ? 'Generate Contract' : labels.nextButton}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateLoan