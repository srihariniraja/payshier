import React, { useState } from 'react'
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function LendingPage({ goTo }) {
  const [activeTab, setActiveTab] = useState('lend') // 'lend' or 'borrow'
  const [loans, setLoans] = useState(() => {
  // Load active loans from localStorage
  return JSON.parse(localStorage.getItem('payshier-transactions') || '[]');
})
  // Add these functions after the useState declarations
const approveContract = (contractId) => {
  const pendingContracts = JSON.parse(localStorage.getItem('payshier-pending-contracts') || '[]');
  const userAccounts = JSON.parse(localStorage.getItem('payshierAccounts') || '[]');
  const currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')).email : '';
  
  const updatedContracts = pendingContracts.map(contract => {
    if (contract.contractId === contractId) {
      const userRole = contract.lender === currentUser ? 'lender' : 
                       contract.borrower === currentUser ? 'borrower' : null;
      
      console.log('Current user:', currentUser);
      console.log('User role:', userRole);
      
      const updatedContract = {
        ...contract,
        approvals: {
          lender: userRole === 'lender' ? true : contract.approvals.lender,
          borrower: userRole === 'borrower' ? true : contract.approvals.borrower
        }
      };
      
      // If both approved, move to active loans
      if (updatedContract.approvals.lender && updatedContract.approvals.borrower) {
        console.log('Both approved, moving to active loans');
        moveToActiveLoans(updatedContract, currentUser);
        return null; // Remove from pending
      }
      
      return updatedContract;
    }
    return contract;
  }).filter(contract => contract !== null);

  localStorage.setItem('payshier-pending-contracts', JSON.stringify(updatedContracts));
  
  // ✅ FIXED: Update state instead of reloading
  setLoans(JSON.parse(localStorage.getItem('payshier-transactions') || '[]'));
};

const rejectContract = (contractId) => {
  const pendingContracts = JSON.parse(localStorage.getItem('payshier-pending-contracts') || '[]');
  const updatedContracts = pendingContracts.filter(contract => contract.contractId !== contractId);
  localStorage.setItem('payshier-pending-contracts', JSON.stringify(updatedContracts));
  
  // ✅ FIXED: Update state instead of reloading
  // No need to reload - the filtered contracts will re-render automatically
};
const moveToActiveLoans = (contract, currentUser) => {
  const activeLoans = JSON.parse(localStorage.getItem('payshier-transactions') || '[]');
  
  // Create TWO loan records - one for lender and one for borrower
  const lenderLoan = {
    id: contract.contractId,
    type: 'lent', // Always 'lent' for the lender
    title: `${contract.lender} → ${contract.borrower}`,
    amount: contract.amount,
    purpose: contract.purpose,
    parties: {
      person: contract.lender,
      otherParty: contract.borrower
    },
    dates: {
      created: contract.createdAt,
      due: contract.returnDate
    },
    status: 'active',
    lenderSigned: contract.lenderSigned || false,
    borrowerSigned: contract.borrowerSigned || false,
    lenderSignature: contract.lenderSignature || null,
    borrowerSignature: contract.borrowerSignature || null
  };

  const borrowerLoan = {
    id: contract.contractId,
    type: 'borrowed', // Always 'borrowed' for the borrower
    title: `${contract.lender} → ${contract.borrower}`,
    amount: contract.amount,
    purpose: contract.purpose,
    parties: {
      person: contract.borrower, // Borrower is the person for this record
      otherParty: contract.lender
    },
    dates: {
      created: contract.createdAt,
      due: contract.returnDate
    },
    status: 'active',
    lenderSigned: contract.lenderSigned || false,
    borrowerSigned: contract.borrowerSigned || false,
    lenderSignature: contract.lenderSignature || null,
    borrowerSignature: contract.borrowerSignature || null
  };

  // Add both records to active loans
  const updatedLoans = [...activeLoans, lenderLoan, borrowerLoan];
  localStorage.setItem('payshier-transactions', JSON.stringify(updatedLoans));
  
  // ✅ Update the loans state
  setLoans(updatedLoans);
};

const downloadContract = async (contractId) => {
  try {
    // Find the contract data
    const pendingContracts = JSON.parse(localStorage.getItem('payshier-pending-contracts') || '[]');
    const activeLoans = JSON.parse(localStorage.getItem('payshier-transactions') || '[]');
    
    let contractData = pendingContracts.find(contract => contract.contractId === contractId);
    
    if (!contractData) {
      const loan = activeLoans.find(loan => loan.id === contractId);
      if (loan) {
        contractData = {
          contractId: loan.id,
          lender: loan.parties?.person || 'Unknown',
          borrower: loan.parties?.otherParty || 'Unknown',
          amount: loan.amount,
          purpose: loan.purpose,
          agreementDate: loan.dates?.created || 'Unknown',
          returnDate: loan.dates?.due || 'Unknown',
          lenderSignature: loan.lenderSignature || null,
          borrowerSignature: loan.borrowerSignature || null,
          lenderSigned: loan.lenderSigned || false,
          borrowerSigned: loan.borrowerSigned || false
        };
      }
    }

    if (!contractData) {
      alert('Contract not found!');
      return;
    }

    // Create HTML that looks exactly like your contract
    const contractHTML = `
      <div style="background: white; padding: 20px; max-width: 800px; margin: 0 auto;">
        <h1 style="text-align: center;">Loan Agreement Contract</h1>
        
        <div>
          <h3>Contract Details</h3>
          <p><strong>Contract ID:</strong> ${contractData.contractId}</p>
          <p><strong>Agreement Date:</strong> ${contractData.agreementDate}</p>
        </div>

        <div>
          <h3>Parties</h3>
          <p><strong>Lender:</strong> ${contractData.lender}</p>
          <p><strong>Borrower:</strong> ${contractData.borrower}</p>
        </div>

        <div>
          <h3>Loan Terms</h3>
          <p><strong>Loan Amount:</strong> ${contractData.amount}</p>
          <p><strong>Purpose:</strong> ${contractData.purpose}</p>
          <p><strong>Due Date:</strong> ${contractData.returnDate}</p>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 40px;">
          <div style="text-align: center;">
            <h4>Lender Signature</h4>
            ${contractData.lenderSignature ? 
              `<img src="${contractData.lenderSignature}" style="width: 150px; border: 1px solid #ccc;" />` : 
              '<p>No signature</p>'
            }
          </div>

          <div style="text-align: center;">
            <h4>Borrower Signature</h4>
            ${contractData.borrowerSignature ? 
              `<img src="${contractData.borrowerSignature}" style="width: 150px; border: 1px solid #ccc;" />` : 
              '<p>No signature</p>'
            }
          </div>
        </div>
      </div>
    `;

    // Create a temporary container
    const container = document.createElement('div');
    container.innerHTML = contractHTML;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    // Take screenshot and make PDF (like ContractReview.js)
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF();
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`contract-${contractId}.pdf`);

    // Clean up
    document.body.removeChild(container);

  } catch (error) {
    console.error('Error:', error);
    alert('Failed to generate PDF');
  }
};
const markAsPaid = (loanId) => {
  const activeLoans = JSON.parse(localStorage.getItem('payshier-transactions') || '[]');
  const currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')).email : '';
  
  const updatedLoans = activeLoans.map(loan => {
    if (loan.id === loanId) {
      const isLender = loan.parties?.person === currentUser;
      
      // Initialize paidConfirmations if it doesn't exist
      const paidConfirmations = loan.paidConfirmations || { lender: false, borrower: false };
      
      // Update the current user's confirmation
      if (isLender) {
        paidConfirmations.lender = true;
      } else {
        paidConfirmations.borrower = true;
      }
      
      // Check if both parties have confirmed
      const isFullyPaid = paidConfirmations.lender && paidConfirmations.borrower;
      
      return {
        ...loan,
        paidConfirmations,
        status: isFullyPaid ? 'paid' : 'active'
      };
    }
    return loan;
  });
  
  localStorage.setItem('payshier-transactions', JSON.stringify(updatedLoans));
  setLoans(updatedLoans);
};
  const filteredLoans = loans.filter(loan => {
  const currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')).email : '';
  
  // For "Money I Lent" tab: show loans where current user is the lender AND type is 'lent'
  if (activeTab === 'lend') {
    return loan.type === 'lent' && loan.parties?.person === currentUser;
  }
  // For "Money I Borrowed" tab: show loans where current user is the borrower AND type is 'borrowed'
  else {
    return loan.type === 'borrowed' && loan.parties?.person === currentUser;
  }
});

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
          color: '#667eea',
          textShadow: '0 2px 4px rgba(102, 126, 234, 0.3)',
          padding: '8px 16px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '12px',
          border: '1px solid rgba(102, 126, 234, 0.2)',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
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
        {/* Pending Contracts Section */}
<div style={{
  background: 'rgba(255,255,255,0.95)',
  borderRadius: '20px',
  padding: '2rem',
  marginBottom: '2rem',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
}}>
  <h3 style={{ color: '#333', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
    ⏳ Pending Contracts
  </h3>

  {(() => {
    const pendingContracts = JSON.parse(localStorage.getItem('payshier-pending-contracts') || '[]');
    const userAccounts = JSON.parse(localStorage.getItem('payshierAccounts') || '[]');
    // Get the currently logged in user
const currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')).email : '';
    
    const userPendingContracts = pendingContracts.filter(contract => 
      contract.lender === currentUser || contract.borrower === currentUser
    );

    return userPendingContracts.length > 0 ? (
      userPendingContracts.map(contract => (
        <div key={contract.contractId} style={{
          background: '#fff3cd',
          border: '2px solid #ffc107',
          padding: '1.5rem',
          margin: '1rem 0',
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h4 style={{ color: '#333', margin: '0 0 0.5rem 0' }}>
                {contract.lender} → {contract.borrower}
              </h4>
              <p style={{ color: '#666', margin: '0.2rem 0' }}>
                <strong>Amount:</strong> {contract.amount}
              </p>
              <p style={{ color: '#666', margin: '0.2rem 0' }}>
                <strong>Purpose:</strong> {contract.purpose}
              </p>
              <p style={{ color: '#666', margin: '0.2rem 0' }}>
                <strong>Return Date:</strong> {contract.returnDate}
              </p>
              <p style={{ color: '#666', margin: '0.2rem 0' }}>
                <strong>Contract ID:</strong> {contract.contractId}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => approveContract(contract.contractId)}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ✅ Approve
              </button>
              <button 
                onClick={() => rejectContract(contract.contractId)}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ❌ Reject
              </button>
            </div>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#856404' }}>
  <strong>Approval Status:</strong> 
  {contract.approvals.lender ? ' [APPROVED] Lender' : ' [PENDING] Lender'} | 
  {contract.approvals.borrower ? ' [APPROVED] Borrower' : ' [PENDING] Borrower'}
</div>
        </div>
      ))
    ) : (
      <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <p>No pending contracts</p>
      </div>
    );
  })()}
</div>

        {/* Loans List */}
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

  {(() => {
    const currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')).email : '';
    
    return filteredLoans.length > 0 ? (
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
            <h4 style={{ color: '#333', margin: '0 0 0.5rem 0' }}>{loan.title}</h4>
            <p style={{ color: '#666', margin: '0.2rem 0' }}>
              <strong>Amount:</strong> {loan.amount}
            </p>
            <p style={{ color: '#666', margin: '0.2rem 0' }}>
              <strong>Purpose:</strong> {loan.purpose}
            </p>
            <p style={{ color: '#666', margin: '0.2rem 0' }}>
              <strong>Created:</strong> {new Date(loan.dates.created).toLocaleDateString()} | <strong>Due:</strong> {loan.dates.due}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{
              background: loan.status === 'paid' ? '#28a745' : 
                          loan.paidConfirmations ? '#17a2b8' : '#ffc107',
              color: 'white',
              padding: '5px 15px',
              borderRadius: '20px',
              fontWeight: 'bold'
            }}>
              {loan.status === 'paid' ? 'PAID' : 
               loan.paidConfirmations ? 'CONFIRMING' : 'ACTIVE'}
            </span>
            
            {loan.status !== 'paid' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                {/* Show who the current user is */}
                <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold' }}>
                  {loan.parties?.person === currentUser ? '👤 You are LENDER' : 
                   loan.parties?.otherParty === currentUser ? '👤 You are BORROWER' : '👤 Not involved'}
                </div>
                
                {(() => {
  const isLender = loan.parties?.person === currentUser;
  const isBorrower = loan.parties?.otherParty === currentUser;
  const hasCurrentUserConfirmed = isLender ? loan.paidConfirmations?.lender : 
                                  isBorrower ? loan.paidConfirmations?.borrower : false;

  if (!hasCurrentUserConfirmed && (isLender || isBorrower)) {
    // Current user hasn't confirmed yet - show Confirm Paid button
    return (
      <button 
        onClick={() => markAsPaid(loan.id)}
        style={{
          background: '#28a745',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '20px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '0.9rem'
        }}
      >
        ✅ Confirm Paid
      </button>
    );
  } else if (hasCurrentUserConfirmed) {
    // Current user has confirmed - show checkmark
    return (
      <div style={{ 
        background: '#17a2b8', 
        color: 'white', 
        padding: '8px 16px', 
        borderRadius: '20px',
        fontWeight: 'bold',
        fontSize: '0.9rem'
      }}>
        ✅ Confirmed
      </div>
    );
  } else {
    // User not involved in this loan
    return null;
  }
})()}
                
                {/* Show confirmation status */}
                <div style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
                  <div>Lender: {loan.paidConfirmations?.lender ? '✅' : '⏳'}</div>
                  <div>Borrower: {loan.paidConfirmations?.borrower ? '✅' : '⏳'}</div>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => downloadContract(loan.id)}
              style={secondaryButtonStyle}
            >
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
    );
  })()}
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