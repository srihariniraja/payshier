import React, { useState } from 'react'

function Login({ goTo }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (isLogin) {
      // LOGIN: Check if account exists in payshier-users
      const users = JSON.parse(localStorage.getItem('payshier-users') || '[]')
      const account = users.find(acc => acc.email === formData.email && acc.password === formData.password)
      
      if (account) {
        // Save current user session
        localStorage.setItem('currentUser', JSON.stringify({
          email: formData.email,
          name: account.name,
          username: account.name
        }))
        goTo('features')
      } else {
        setError('Wrong username or password!')
      }
    } else {
      // SIGNUP: Save new account
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match!')
        return
      }

      // Check if email already exists
      const users = JSON.parse(localStorage.getItem('payshier-users') || '[]')
      const emailExists = users.some(user => user.email === formData.email)
      if (emailExists) {
        setError('Email already exists!')
        return
      }

      // Create new user with creation date
      const newUser = {
        name: formData.name,
        username: formData.name,
        email: formData.email,
        password: formData.password,
        createdAt: new Date().toISOString()
      }
      
      users.push(newUser)
      localStorage.setItem('payshier-users', JSON.stringify(users))
      setIsLogin(true)
      setError('Account created! Please login.')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '3rem',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Back Button */}
        <button 
          onClick={() => goTo('home')}
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
          {isLogin ? 'Login to PAYSHIER' : 'Create Account'}
        </h2>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(255,0,0,0.2)',
            color: '#ff6b6b',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid rgba(255,0,0,0.3)',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: 'white', display: 'block', marginBottom: '0.5rem' }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="off"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '1rem'
                }}
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: 'white', display: 'block', marginBottom: '0.5rem' }}>
              Username
            </label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="new-password"
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '10px',
                color: 'white',
                fontSize: '1rem'
              }}
              placeholder="Enter your username"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: 'white', display: 'block', marginBottom: '0.5rem' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '10px',
                color: 'white',
                fontSize: '1rem'
              }}
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ color: 'white', display: 'block', marginBottom: '0.5rem' }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '1rem'
                }}
                placeholder="Confirm your password"
              />
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #7e1047 0%, #2f040d 100%)',
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: '10px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}
          >
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1rem' }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
            }}
            style={{
              background: 'transparent',
              color: '#7e1047',
              border: '1px solid #7e1047',
              padding: '10px 20px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login