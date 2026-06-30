import React, { useState, useEffect } from 'react';

function BillTracker({ goTo }) {
  const [bills, setBills] = useState([]);
  const [newBill, setNewBill] = useState({
    name: '',
    amount: '',
    dueDate: '',
    category: 'utility',
    reminderDays: 3
  });

  // Load bills from localStorage
  useEffect(() => {
    const savedBills = JSON.parse(localStorage.getItem('payshier-bills') || '[]');
    setBills(savedBills);
    checkReminders(savedBills);
  }, []);

  const checkReminders = (billsList) => {
    const today = new Date();
    billsList.forEach(bill => {
      if (bill.status !== 'paid') {
        const dueDate = new Date(bill.dueDate);
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue <= bill.reminderDays && daysUntilDue >= 0) {
          console.log(`REMINDER: ${bill.name} is due in ${daysUntilDue} days!`);
        }
      }
    });
  };

  const addBill = () => {
    if (!newBill.name || !newBill.amount || !newBill.dueDate) {
      alert('Please fill all fields');
      return;
    }

    const bill = {
      id: Date.now(),
      ...newBill,
      amount: `₹${newBill.amount}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const updatedBills = [...bills, bill];
    setBills(updatedBills);
    localStorage.setItem('payshier-bills', JSON.stringify(updatedBills));
    
    setNewBill({
      name: '',
      amount: '',
      dueDate: '',
      category: 'utility',
      reminderDays: 3
    });
    
    alert('Bill added successfully!');
  };

  const deleteBill = (id) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      const updatedBills = bills.filter(bill => bill.id !== id);
      setBills(updatedBills);
      localStorage.setItem('payshier-bills', JSON.stringify(updatedBills));
    }
  };

  const markAsPaid = (id) => {
    const updatedBills = bills.map(bill => 
      bill.id === id ? { ...bill, status: 'paid', paidDate: new Date().toISOString() } : bill
    );
    setBills(updatedBills);
    localStorage.setItem('payshier-bills', JSON.stringify(updatedBills));
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const timeDiff = due - today;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (bill) => {
    if (bill.status === 'paid') return '#28a745';
    
    const daysUntilDue = getDaysUntilDue(bill.dueDate);
    if (daysUntilDue < 0) return '#dc3545'; // Overdue
    if (daysUntilDue <= 3) return '#ffc107'; // Due soon
    return '#17a2b8'; // Upcoming
  };

  const getStatusText = (bill) => {
    if (bill.status === 'paid') return 'PAID';
    
    const daysUntilDue = getDaysUntilDue(bill.dueDate);
    if (daysUntilDue < 0) return 'OVERDUE';
    if (daysUntilDue === 0) return 'DUE TODAY';
    if (daysUntilDue === 1) return 'DUE TOMORROW';
    if (daysUntilDue <= 3) return 'DUE SOON';
    return 'UPCOMING';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      utility: '💡',
      rent: '🏠',
      subscription: '📱',
      internet: '🌐',
      other: '📄'
    };
    return icons[category] || '📄';
  };

  const getTotalPendingAmount = () => {
    return bills
      .filter(bill => bill.status !== 'paid')
      .reduce((total, bill) => total + parseFloat(bill.amount.replace('₹', '') || 0), 0);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
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
          marginBottom: '20px'
        }}
      >
        ← Back to Features
      </button>

      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{
          textAlign: 'center',
          color: '#333',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '2.5rem'
        }}>
          ⏰ Bill Reminder & Tracker
        </h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
          Track all your bills in one place and never miss a payment deadline!
        </p>

        {/* Stats Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <h3>Total Bills</h3>
            <p style={{ fontSize: '2rem', margin: '0.5rem 0', fontWeight: 'bold' }}>{bills.length}</p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <h3>Pending Bills</h3>
            <p style={{ fontSize: '2rem', margin: '0.5rem 0', fontWeight: 'bold' }}>
              {bills.filter(bill => bill.status !== 'paid').length}
            </p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <h3>Total Amount Due</h3>
            <p style={{ fontSize: '2rem', margin: '0.5rem 0', fontWeight: 'bold' }}>
              ₹{getTotalPendingAmount()}
            </p>
          </div>
        </div>

        {/* Add New Bill Form */}
        <div style={{
          background: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '15px',
          marginBottom: '2rem',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>Add New Bill</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Bill Name</label>
              <input
                type="text"
                placeholder="e.g., Rent, Netflix, Electricity"
                value={newBill.name}
                onChange={(e) => setNewBill({...newBill, name: e.target.value})}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Amount</label>
              <input
                type="number"
                placeholder="e.g., 5000"
                value={newBill.amount}
                onChange={(e) => setNewBill({...newBill, amount: e.target.value})}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Due Date</label>
              <input
                type="date"
                value={newBill.dueDate}
                onChange={(e) => setNewBill({...newBill, dueDate: e.target.value})}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Category</label>
              <select
                value={newBill.category}
                onChange={(e) => setNewBill({...newBill, category: e.target.value})}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
              >
                <option value="utility">Utility</option>
                <option value="rent">Rent</option>
                <option value="subscription">Subscription</option>
                <option value="internet">Internet</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Reminder</label>
              <select
                value={newBill.reminderDays}
                onChange={(e) => setNewBill({...newBill, reminderDays: parseInt(e.target.value)})}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
              >
                <option value="1">1 day before</option>
                <option value="3">3 days before</option>
                <option value="7">1 week before</option>
              </select>
            </div>
          </div>
          <button
            onClick={addBill}
            style={{
              background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              width: '100%'
            }}
          >
            + Add Bill
          </button>
        </div>

        {/* Bills List */}
        <div>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>Your Bills</h3>
          {bills.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', padding: '3rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
              <h3 style={{ color: '#333' }}>No bills added yet</h3>
              <p>Add your first bill to get started with tracking!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bills.map((bill) => (
                <div key={bill.id} style={{
                  background: '#fff',
                  borderLeft: `6px solid ${getStatusColor(bill)}`,
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
                      background: getStatusColor(bill),
                      color: 'white',
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      {getCategoryIcon(bill.category)}
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
                        {bill.status !== 'paid' && (
                          <span style={{ 
                            color: getStatusColor(bill),
                            fontWeight: 'bold',
                            marginLeft: '0.5rem'
                          }}>
                            ({getDaysUntilDue(bill.dueDate)} days)
                          </span>
                        )}
                      </p>
                      <p style={{ margin: '0.2rem 0', color: '#666' }}>
                        <strong>Category:</strong> {bill.category.charAt(0).toUpperCase() + bill.category.slice(1)}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{
                      background: getStatusColor(bill),
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>
                      {getStatusText(bill)}
                    </span>
                    
                    {bill.status !== 'paid' && (
                      <button
                        onClick={() => markAsPaid(bill.id)}
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
                        Mark Paid
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteBill(bill.id)}
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
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BillTracker;