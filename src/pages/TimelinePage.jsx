import React, { useState, useEffect } from 'react';

function TimelinePage({ goTo }) {
  const [transactions, setTransactions] = useState([]);
  const [bills, setBills] = useState([]);
  const [allDueItems, setAllDueItems] = useState([]);
  const [view, setView] = useState('timeline');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Load transactions and bills from localStorage
  useEffect(() => {
    console.log('🔍 CHECKING LOCALSTORAGE FOR DATA...');
    
    const savedTransactions = localStorage.getItem('payshier-transactions');
    const savedBills = localStorage.getItem('payshier-bills');
    const currentUser = localStorage.getItem('currentUser') ? 
      JSON.parse(localStorage.getItem('currentUser')).email : '';
    
    console.log('📦 payshier-transactions raw:', savedTransactions);
    console.log('📦 payshier-bills raw:', savedBills);
    console.log('👤 Current user:', currentUser);
    
    // Process Loans
    if (savedTransactions) {
      const parsed = JSON.parse(savedTransactions);
      console.log('🔄 Parsed transactions:', parsed);
      
      const transactionMap = new Map();
      
      parsed.forEach(transaction => {
        const parties = [transaction.parties?.person, transaction.parties?.otherParty].sort();
        const uniqueKey = `${parties[0]}-${parties[1]}-${transaction.amount}-${transaction.purpose}-${transaction.dates?.due}`;
        
        const existingTransaction = transactionMap.get(uniqueKey);
        
        if (!existingTransaction) {
          transactionMap.set(uniqueKey, transaction);
        } else {
          if (transaction.status === 'paid' && existingTransaction.status !== 'paid') {
            transactionMap.set(uniqueKey, transaction);
          }
        }
      });
      
      const uniqueTransactions = Array.from(transactionMap.values()).map(transaction => {
        const isLender = transaction.type === 'lent';
        const isCurrentUserLender = transaction.parties?.person === currentUser;
        const isCurrentUserBorrower = transaction.parties?.otherParty === currentUser;
        
        return {
          id: transaction.id || `loan-${Date.now()}-${Math.random()}`,
          lenderName: isLender ? transaction.parties?.person : transaction.parties?.otherParty,
          borrowerName: isLender ? transaction.parties?.otherParty : transaction.parties?.person,
          amount: transaction.amount,
          purpose: transaction.purpose,
          agreementDate: transaction.dates?.created,
          dueDate: transaction.dates?.due,
          status: transaction.status === 'paid' ? 'completed' : 'active',
          type: transaction.type,
          category: 'loan',
          currentUserRole: isCurrentUserLender ? 'lender' : isCurrentUserBorrower ? 'borrower' : 'unknown',
          isCurrentUserInvolved: isCurrentUserLender || isCurrentUserBorrower,
          itemType: 'loan'
        };
      });

      console.log('✅ Final unique transactions:', uniqueTransactions);
      setTransactions(uniqueTransactions);
    } else {
      console.log('❌ No payshier-transactions found in localStorage');
      setTransactions([]);
    }

    // Process Bills
    if (savedBills) {
      const parsedBills = JSON.parse(savedBills);
      console.log('📋 Parsed bills:', parsedBills);
      
      const uniqueBills = parsedBills.map(bill => ({
        id: bill.id || `bill-${Date.now()}-${Math.random()}`,
        title: bill.title || 'Untitled Bill',
        amount: bill.amount || 0,
        description: bill.description || '',
        dueDate: bill.dueDate,
        status: bill.status === 'paid' ? 'completed' : 'pending',
        category: bill.category || 'general',
        payer: bill.payer || currentUser,
        itemType: 'bill'
      }));

      console.log('✅ Final bills:', uniqueBills);
      setBills(uniqueBills);
    } else {
      console.log('❌ No payshier-bills found in localStorage');
      setBills([]);
    }
  }, []);

  // Combine loans and bills for calendar view
  useEffect(() => {
    const allItems = [
      ...transactions.map(item => ({ ...item, itemType: 'loan' })),
      ...bills.map(item => ({ ...item, itemType: 'bill' }))
    ];
    console.log('📅 All due items:', allItems);
    setAllDueItems(allItems);
  }, [transactions, bills]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Generate timeline events based on transaction status
  const generateTimeline = (transaction) => {
    const timeline = [];
    
    timeline.push({
      step: 'Transaction Initiated',
      status: 'completed',
      timestamp: formatDate(transaction.agreementDate),
      description: `Loan request created for ₹${transaction.amount}`,
      icon: '📝'
    });

    timeline.push({
      step: 'Contract Signed',
      status: 'completed', 
      timestamp: formatDate(transaction.agreementDate),
      description: 'Both parties signed the digital contract',
      icon: '✍️'
    });

    if (transaction.status === 'completed') {
      timeline.push({
        step: 'Loan Repaid',
        status: 'completed',
        timestamp: formatDate(transaction.dueDate),
        description: transaction.currentUserRole === 'lender' 
          ? 'You received the full repayment' 
          : 'You completed the repayment',
        icon: '✅'
      });
      
      timeline.push({
        step: 'Transaction Completed',
        status: 'completed',
        timestamp: formatDate(transaction.dueDate),
        description: 'Transaction successfully closed by both parties',
        icon: '💰'
      });
    } else {
      timeline.push({
        step: transaction.currentUserRole === 'lender' ? 'Awaiting Repayment' : 'To Repay',
        status: 'pending',
        timestamp: `Due: ${formatDate(transaction.dueDate)}`,
        description: transaction.currentUserRole === 'lender'
          ? `Waiting for ${transaction.borrowerName} to repay`
          : `You need to repay ${transaction.lenderName}`,
        icon: transaction.currentUserRole === 'lender' ? '⏳' : '📤'
      });
    }

    return timeline;
  };

  const TimelineView = () => {
    const currentUser = localStorage.getItem('currentUser') ? 
      JSON.parse(localStorage.getItem('currentUser')).email : '';

    return (
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: 'white', marginBottom: '1.5rem', textAlign: 'center' }}>Loan Transaction Timeline</h3>
        
        <div style={{ 
          textAlign: 'center', 
          color: 'white', 
          opacity: 0.7, 
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}>
          Showing {transactions.length} loan transaction{transactions.length !== 1 ? 's' : ''}
          {currentUser && ` for ${currentUser}`}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {transactions.map((transaction) => (
            <div key={transaction.id} style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '1.5rem',
              borderRadius: '15px',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              borderLeft: `4px solid ${transaction.status === 'completed' ? '#51cf66' : '#ffa94d'}`
            }}>
              {/* Transaction Header with User Role */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <h4 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>
                      {transaction.lenderName} → {transaction.borrowerName}
                    </h4>
                    <span style={{
                      padding: '2px 8px',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '10px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      {transaction.currentUserRole === 'lender' ? 'You lent' : 
                       transaction.currentUserRole === 'borrower' ? 'You borrowed' : 'Observer'}
                    </span>
                  </div>
                  <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>
                    <div><strong>Amount:</strong> ₹{transaction.amount}</div>
                    <div><strong>Purpose:</strong> {transaction.purpose}</div>
                    <div><strong>Created:</strong> {formatDate(transaction.agreementDate)}</div>
                    <div><strong>Due:</strong> {formatDate(transaction.dueDate)}</div>
                  </div>
                </div>
                <span style={{
                  padding: '6px 12px',
                  background: transaction.status === 'completed' ? '#51cf66' : '#ffa94d',
                  borderRadius: '15px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}>
                  {transaction.status}
                </span>
              </div>

              {/* Timeline Steps */}
              <div style={{ position: 'relative' }}>
                {generateTimeline(transaction).map((step, index, array) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: index === array.length - 1 ? 0 : '1.5rem',
                    position: 'relative'
                  }}>
                    {/* Timeline line */}
                    {index < array.length - 1 && (
                      <div style={{
                        position: 'absolute',
                        left: '20px',
                        top: '40px',
                        bottom: '-20px',
                        width: '2px',
                        background: step.status === 'completed' ? '#51cf66' : 'rgba(255,255,255,0.2)'
                      }}></div>
                    )}
                    
                    {/* Step Icon */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: step.status === 'completed' ? '#51cf66' : 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1rem',
                      flexShrink: 0,
                      fontSize: '1.2rem',
                      border: step.status === 'pending' ? '2px solid #ffa94d' : 'none'
                    }}>
                      {step.icon}
                    </div>
                    
                    {/* Step Details */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.25rem'
                      }}>
                        <h5 style={{ 
                          margin: 0, 
                          color: 'white',
                          fontSize: '1rem',
                          opacity: step.status === 'pending' ? 1 : 0.9
                        }}>
                          {step.step}
                        </h5>
                        <span style={{
                          fontSize: '0.8rem',
                          opacity: 0.7,
                          background: 'rgba(255,255,255,0.1)',
                          padding: '2px 8px',
                          borderRadius: '10px'
                        }}>
                          {step.timestamp}
                        </span>
                      </div>
                      <p style={{ 
                        margin: 0, 
                        opacity: 0.8,
                        fontSize: '0.9rem'
                      }}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {transactions.length === 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '3rem',
              borderRadius: '15px',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ margin: '0 0 1rem 0' }}>No Loan Transactions</h3>
              <p style={{ margin: 0, opacity: 0.8 }}>Your lending and borrowing transactions will appear here</p>
              <button 
                style={primaryButtonStyle}
                onClick={() => goTo('lending')}
              >
                Go to Lending
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Calendar View Component with Bills
  const CalendarView = () => {
    const currentUser = localStorage.getItem('currentUser') ? 
      JSON.parse(localStorage.getItem('currentUser')).email : '';

    // Get current month/year
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    // Get all due items (loans + bills) grouped by due date
    const itemsByDate = allDueItems.reduce((acc, item) => {
      if (item.dueDate) {
        const dueDate = new Date(item.dueDate);
        const dateKey = dueDate.toISOString().split('T')[0];
        
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(item);
      }
      return acc;
    }, {});

    // Generate calendar days
    const calendarDays = [];
    
    // Previous month days
    for (let i = 0; i < startingDay; i++) {
      calendarDays.push(null);
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toISOString().split('T')[0];
      const dayItems = itemsByDate[dateKey] || [];
      
      calendarDays.push({
        date,
        day,
        items: dayItems,
        isToday: date.toDateString() === new Date().toDateString()
      });
    }

    // Navigation functions
    const prevMonth = () => {
      setCurrentMonth(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
      setCurrentMonth(new Date(year, month + 1, 1));
    };

    // Get color based on item type and status
    const getItemColor = (item) => {
      if (item.status === 'completed') return '#51cf66'; // Green for completed
      if (item.itemType === 'loan') return '#ff6b6b'; // Red for active loans
      if (item.itemType === 'bill') return '#ffa94d'; // Orange for bills
      return '#868e96'; // Default gray
    };

    // Get icon based on item type
    const getItemIcon = (item) => {
      if (item.itemType === 'loan') return '💰';
      if (item.itemType === 'bill') return '🧾';
      return '📅';
    };

    return (
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: 'white', marginBottom: '1.5rem', textAlign: 'center' }}>
          Payment Calendar - {currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </h3>

        {/* Calendar Navigation */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem',
          color: 'white'
        }}>
          <button onClick={prevMonth} style={calendarNavButton}>
            ← Previous
          </button>
          <button 
            onClick={() => setCurrentMonth(new Date())}
            style={calendarNavButton}
          >
            Today
          </button>
          <button onClick={nextMonth} style={calendarNavButton}>
            Next →
          </button>
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontSize: '0.8rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#ff6b6b', borderRadius: '2px' }}></div>
            <span>Loans</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontSize: '0.8rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#ffa94d', borderRadius: '2px' }}></div>
            <span>Bills</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontSize: '0.8rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#51cf66', borderRadius: '2px' }}></div>
            <span>Completed</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '15px',
          padding: '1.5rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          {/* Weekday Headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{
                color: 'white',
                fontWeight: 'bold',
                padding: '0.5rem',
                opacity: 0.8
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px'
          }}>
            {calendarDays.map((dayInfo, index) => (
              <div
                key={index}
                style={{
                  minHeight: '80px',
                  background: dayInfo ? 
                    (dayInfo.isToday ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)') : 'transparent',
                  border: dayInfo && dayInfo.isToday ? '2px solid #ffa94d' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '8px',
                  color: 'white',
                  position: 'relative'
                }}
              >
                {dayInfo && (
                  <>
                    <div style={{
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      marginBottom: '4px',
                      opacity: dayInfo.items.length > 0 ? 1 : 0.7
                    }}>
                      {dayInfo.day}
                    </div>
                    
                    {/* Due Date Indicators */}
                    {dayInfo.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        style={{
                          background: getItemColor(item),
                          color: 'white',
                          fontSize: '0.7rem',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          marginBottom: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                        title={`${getItemIcon(item)} ${item.itemType === 'loan' ? 
                          `Loan: ${item.lenderName} → ${item.borrowerName}` : 
                          `Bill: ${item.title}`} - ₹${item.amount}`}
                      >
                        <span style={{ fontSize: '0.6rem' }}>{getItemIcon(item)}</span>
                        <span>₹{item.amount}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Due Items List */}
        <div style={{ marginTop: '2rem' }}>
          <h4 style={{ color: 'white', marginBottom: '1rem' }}>Due Items This Month</h4>
          
          {Object.keys(itemsByDate).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(itemsByDate)
                .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                .map(([date, dateItems]) => (
                  <div key={date} style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      opacity: 0.8
                    }}>
                      <span style={{ marginRight: '0.5rem' }}>📅</span>
                      Due: {formatDate(date)}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {dateItems.map(item => (
                        <div key={item.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem',
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: '8px',
                          borderLeft: `4px solid ${getItemColor(item)}`
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>{getItemIcon(item)}</span>
                            <div>
                              <div style={{ fontWeight: 'bold' }}>
                                {item.itemType === 'loan' ? 
                                  `${item.lenderName} → ${item.borrowerName}` : 
                                  item.title}
                              </div>
                              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                {item.itemType === 'loan' ? 
                                  `${item.purpose} • ${item.currentUserRole === 'lender' ? 'You lent' : 'You borrowed'}` : 
                                  `${item.description || 'Bill payment'} • ${item.category}`}
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                              ₹{item.amount}
                            </div>
                            <span style={{
                              padding: '2px 8px',
                              background: getItemColor(item),
                              borderRadius: '10px',
                              fontSize: '0.7rem',
                              fontWeight: 'bold'
                            }}>
                              {item.itemType === 'loan' ? item.status : 
                               item.status === 'completed' ? 'paid' : 'pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              }
            </div>
          ) : (
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '2rem',
              borderRadius: '10px',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📅</div>
              <p style={{ margin: 0, opacity: 0.8 }}>No due items this month</p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button 
                  style={primaryButtonStyle}
                  onClick={() => goTo('lending')}
                >
                  Create Loan
                </button>
                <button 
                  style={primaryButtonStyle}
                  onClick={() => goTo('bills')}
                >
                  Add Bill
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '2rem 0'
    }}>
      {/* Navigation Header */}
      <nav style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        padding: '1rem 2rem',
        boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
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
          Loan Timeline
        </div>
        <div>
          <button style={navButtonStyle} onClick={() => goTo('features')}>
            ← Back to Features
          </button>
          <button style={navButtonStyle} onClick={() => goTo('lending')}>
            Lending
          </button>
          <button style={navButtonStyle} onClick={() => goTo('bills')}>
            Bills
          </button>
          <button style={navButtonStyle} onClick={() => goTo('dashboard')}>
            Dashboard
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '2rem',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* View Toggle Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={() => setView('timeline')}
              style={{
                background: view === 'timeline' ? '#7e1047' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '12px 24px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              📊 Loan Timeline
            </button>
            <button
              onClick={() => setView('calendar')}
              style={{
                background: view === 'calendar' ? '#7e1047' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '12px 24px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              📅 Payment Calendar
            </button>
          </div>

          {/* View Content */}
          {view === 'timeline' ? <TimelineView /> : <CalendarView />}
        </div>
      </div>
    </div>
  );
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
};

const primaryButtonStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '25px',
  cursor: 'pointer',
  fontWeight: 'bold',
  marginTop: '1rem'
};

const calendarNavButton = {
  background: 'rgba(255,255,255,0.1)',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.3)',
  padding: '8px 16px',
  borderRadius: '20px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 'bold'
};

export default TimelinePage;