import React, { useState, useEffect } from 'react';

function ProfilePage({ goTo }) {
  const [currentUser, setCurrentUser] = useState({});
  const [users, setUsers] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load current user and all users
  useEffect(() => {
    const usersData = JSON.parse(localStorage.getItem('payshier-users') || '[]');
    const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    setUsers(usersData);
    setCurrentUser(currentUserData);
    
    setFormData({
      username: currentUserData.username || '',
      email: currentUserData.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update profile information
  const updateProfile = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Basic validation
    if (!formData.username.trim() || !formData.email.trim()) {
      setErrorMessage('Username and email are required!');
      return;
    }

    if (!formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address!');
      return;
    }

    // Check if email is already taken (excluding current user)
    const emailExists = users.some(user => 
      user.email === formData.email && user.email !== currentUser.email
    );
    if (emailExists) {
      setErrorMessage('Email already exists! Please use a different email.');
      return;
    }

    // Update user data
    const updatedUsers = users.map(user => {
      if (user.email === currentUser.email) {
        return {
          ...user,
          username: formData.username,
          email: formData.email
        };
      }
      return user;
    });

    // Update currentUser in localStorage
    const updatedCurrentUser = {
      ...currentUser,
      username: formData.username,
      email: formData.email
    };

    // Save to localStorage
    localStorage.setItem('payshier-users', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));

    // Update state
    setUsers(updatedUsers);
    setCurrentUser(updatedCurrentUser);
    
    setSuccessMessage('✅ Profile updated successfully!');
    setTimeout(() => {
      setSuccessMessage('');
      setEditMode(false);
    }, 3000);
  };

  // Change password
  const changePassword = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    if (!formData.currentPassword) {
      setErrorMessage('Current password is required!');
      return;
    }

    if (!formData.newPassword) {
      setErrorMessage('New password is required!');
      return;
    }

    if (formData.newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long!');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage('New password and confirmation do not match!');
      return;
    }

    // Verify current password
    const currentUserData = users.find(user => user.email === currentUser.email);
    if (!currentUserData || currentUserData.password !== formData.currentPassword) {
      setErrorMessage('Current password is incorrect!');
      return;
    }

    // Update password
    const updatedUsers = users.map(user => {
      if (user.email === currentUser.email) {
        return {
          ...user,
          password: formData.newPassword
        };
      }
      return user;
    });

    // Save to localStorage
    localStorage.setItem('payshier-users', JSON.stringify(updatedUsers));
    
    setSuccessMessage('✅ Password changed successfully!');
    
    // Reset password fields
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
    
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // COMPLETE Delete account function with all data cleanup
  const deleteAccount = () => {
    if (window.confirm('⚠️ Are you sure you want to delete your account? This action cannot be undone!')) {
      try {
        const userEmail = currentUser.email;
        
        // 1. Remove user from users list
        const updatedUsers = users.filter(user => user.email !== userEmail);
        localStorage.setItem('payshier-users', JSON.stringify(updatedUsers));
        
        // 2. Clean up EXPENSES:
        const expenses = JSON.parse(localStorage.getItem('payshier-expenses') || '[]');
        const updatedExpenses = expenses.filter(expense => {
          // Remove expense if user is the creator
          if (expense.creator === userEmail) {
            return false;
          }
          
          // Remove user from participants
          if (expense.participants && expense.participants.includes(userEmail)) {
            expense.participants = expense.participants.filter(p => p !== userEmail);
            
            // If no participants left, remove the expense
            if (expense.participants.length === 0) {
              return false;
            }
          }
          
          // Remove user from splits
          if (expense.splits && expense.splits[userEmail]) {
            delete expense.splits[userEmail];
          }
          
          // Remove user from settlements
          if (expense.settlements) {
            expense.settlements = expense.settlements.filter(s => 
              s.from !== userEmail && s.to !== userEmail
            );
          }
          
          return true;
        });
        localStorage.setItem('payshier-expenses', JSON.stringify(updatedExpenses));
        
        // 3. Clean up LOANS:
        const loans = JSON.parse(localStorage.getItem('payshier-loans') || '[]');
        const updatedLoans = loans.filter(loan => 
          loan.lenderEmail !== userEmail && loan.borrowerEmail !== userEmail
        );
        localStorage.setItem('payshier-loans', JSON.stringify(updatedLoans));
        
        // 4. Clean up BILLS:
        const bills = JSON.parse(localStorage.getItem('payshier-bills') || '[]');
        const updatedBills = bills.filter(bill => bill.userEmail !== userEmail);
        localStorage.setItem('payshier-bills', JSON.stringify(updatedBills));
        
        // 5. Clean up TRANSACTIONS:
        const transactions = JSON.parse(localStorage.getItem('payshier-transactions') || '[]');
        const updatedTransactions = transactions.filter(t => 
          t.from !== userEmail && t.to !== userEmail
        );
        localStorage.setItem('payshier-transactions', JSON.stringify(updatedTransactions));
        
        // 6. Clean up GROUPS:
        const groups = JSON.parse(localStorage.getItem('payshier-groups') || '[]');
        const updatedGroups = groups.filter(group => {
          if (group.creator === userEmail) {
            return false; // Remove group if user is creator
          }
          
          if (group.members && group.members.includes(userEmail)) {
            group.members = group.members.filter(m => m !== userEmail);
            
            // If no members left, remove group
            if (group.members.length === 0) {
              return false;
            }
          }
          
          return true;
        });
        localStorage.setItem('payshier-groups', JSON.stringify(updatedGroups));
        
        // 7. Clean up NOTIFICATIONS:
        const notifications = JSON.parse(localStorage.getItem('payshier-notifications') || '[]');
        const updatedNotifications = notifications.filter(n => n.userEmail !== userEmail);
        localStorage.setItem('payshier-notifications', JSON.stringify(updatedNotifications));
        
        // 8. Remove old payshierAccounts data (for compatibility)
        const oldAccounts = JSON.parse(localStorage.getItem('payshierAccounts') || '[]');
        const updatedOldAccounts = oldAccounts.filter(acc => acc.email !== userEmail);
        localStorage.setItem('payshierAccounts', JSON.stringify(updatedOldAccounts));
        
        // 9. Clear current user session
        localStorage.removeItem('currentUser');
        
        // 10. Clean up any other user-specific data
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
          if (key.startsWith(`payshier-${userEmail}-`) || 
              key.includes(userEmail) && key.startsWith('payshier-')) {
            localStorage.removeItem(key);
          }
        });
        
        alert('✅ Account and all associated data deleted successfully!');
        goTo('home');
        
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('❌ Error deleting account. Please try again.');
      }
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    alert('Logged out successfully!');
    goTo('home');
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      {/* Navigation */}
      <nav style={{
        background: 'rgba(255,255,255,0.95)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '15px',
        marginBottom: '2rem'
      }}>
        <div style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          color: '#667eea',
          padding: '8px 16px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '12px',
        }}>
          👤 Profile Management
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => goTo('features')} style={navButtonStyle}>
            ← Back to Features
          </button>
          <button onClick={handleLogout} style={logoutButtonStyle}>
            🚪 Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Profile Card */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          {/* Success/Error Messages */}
          {successMessage && (
            <div style={{
              background: '#d4edda',
              color: '#155724',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              border: '1px solid #c3e6cb'
            }}>
              {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              border: '1px solid #f5c6cb'
            }}>
              {errorMessage}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              color: 'white',
              marginRight: '1.5rem'
            }}>
              {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 style={{ color: '#333', margin: '0 0 0.5rem 0' }}>
                {currentUser.username || 'User'}
              </h2>
              <p style={{ color: '#666', margin: '0' }}>
                📧 {currentUser.email || 'No email'}
              </p>
              <p style={{ color: '#666', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                Member since: {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Today'}
              </p>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              style={{
                marginLeft: 'auto',
                background: editMode ? '#6c757d' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {editMode ? 'Cancel Edit' : '✏️ Edit Profile'}
            </button>
          </div>

          {/* Edit Profile Form */}
          {editMode && (
            <form onSubmit={updateProfile} style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#333', marginBottom: '1.5rem' }}>Edit Profile Information</h3>
              
              <div style={formGroupStyle}>
                <label style={labelStyle}>Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  style={inputStyle}
                  required
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  style={inputStyle}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  ...primaryButtonStyle,
                  width: '100%',
                  padding: '12px'
                }}
              >
                💾 Save Changes
              </button>
            </form>
          )}

          {/* Change Password Form */}
          <form onSubmit={changePassword} style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#333', marginBottom: '1.5rem' }}>Change Password</h3>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>Current Password *</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter current password"
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>New Password *</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password (min. 6 characters)"
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Confirm New Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                style={inputStyle}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                ...primaryButtonStyle,
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)'
              }}
            >
              🔑 Change Password
            </button>
          </form>

          {/* Danger Zone */}
          <div style={{
            padding: '1.5rem',
            background: '#f8d7da',
            borderRadius: '10px',
            border: '2px solid #f5c6cb'
          }}>
            <h3 style={{ color: '#721c24', marginBottom: '1rem' }}>⚠️ Danger Zone</h3>
            <p style={{ color: '#721c24', marginBottom: '1rem' }}>
              Deleting your account will remove:
              <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                <li>Your profile</li>
                <li>All expenses you created or participated in</li>
                <li>All loans and transactions</li>
                <li>All bills and reminders</li>
                <li>All group memberships</li>
              </ul>
            </p>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={deleteAccount}
                style={{
                  background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🗑️ Delete Account & All Data
              </button>
              
              <button
                onClick={() => {
                  if (window.confirm('This will clear ALL app data for ALL users. Continue?')) {
                    localStorage.clear();
                    alert('All data cleared!');
                    goTo('home');
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🧹 Clear All App Data
              </button>
            </div>
          </div>
        </div>

        {/* Account Statistics */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ color: '#333', marginBottom: '1.5rem' }}>📊 Account Statistics</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={statCardStyle}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
              <h4 style={{ margin: '0', color: '#333' }}>Your Expenses</h4>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea', margin: '0.5rem 0 0 0' }}>
                {JSON.parse(localStorage.getItem('payshier-expenses') || '[]')
                  .filter(exp => exp.creator === currentUser.email || 
                    (exp.participants && exp.participants.includes(currentUser.email))).length}
              </p>
            </div>
            
            <div style={statCardStyle}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚖️</div>
              <h4 style={{ margin: '0', color: '#333' }}>Pending Settlements</h4>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffc107', margin: '0.5rem 0 0 0' }}>
                {JSON.parse(localStorage.getItem('payshier-expenses') || '[]')
                  .flatMap(exp => exp.settlements || [])
                  .filter(s => (s.from === currentUser.email || s.to === currentUser.email) && s.status === 'pending').length}
              </p>
            </div>
            
            <div style={statCardStyle}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
              <h4 style={{ margin: '0', color: '#333' }}>Total Friends</h4>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745', margin: '0.5rem 0 0 0' }}>
                {JSON.parse(localStorage.getItem('payshier-users') || '[]')
                  .filter(u => u.email !== currentUser.email).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles (same as before)
const navButtonStyle = {
  background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '25px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const logoutButtonStyle = {
  background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '25px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const primaryButtonStyle = {
  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '25px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const formGroupStyle = {
  marginBottom: '1.5rem'
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  fontWeight: 'bold',
  color: '#333'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '2px solid #e9ecef',
  borderRadius: '10px',
  fontSize: '1rem',
  background: 'white'
};

const statCardStyle = {
  background: '#f8f9fa',
  padding: '1.5rem',
  borderRadius: '15px',
  textAlign: 'center',
  border: '2px solid #e9ecef'
};

export default ProfilePage;