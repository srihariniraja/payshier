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
      // Check credentials
      if (formData.email === 'user1' && formData.password === '123456') {
        goTo('features')
      } else {
        setError('Wrong username or password!')
      }
    } else {
      // Signup logic
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match!')
        return
      }
      console.log('Signing up:', formData)
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