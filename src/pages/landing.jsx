import React from 'react'
import { useState } from 'react'
function Landing({ goTo }) {
  return (
    <div>
      <nav className="navbar">
        <div className="nav-brand">PAYSHIER</div>
        <div>
          <button className="nav-btn" onClick={() => goTo('login')}>Login</button>
          <button className="nav-btn" onClick={() => goTo('dashboard')}>Demo Dashboard</button>
        </div>
      </nav>

      <div className="hero">
        <h1>PAYSHIER</h1>
        <p>Track, Pay and Lend with Trust</p>
        <button className="btn" onClick={() => goTo('dashboard')}>
          Launch Demo
        </button>
      </div>

      <div className="container">
        <div className="features">
          <div className="feature-card">
            <h3>💰 Lending & Borrowing</h3>
            <p>Track informal loans with digital contracts</p>
          </div>
          <div className="feature-card">
            <h3>👥 Group Expenses</h3>
            <p>Split bills and track who owes whom</p>
          </div>
          <div className="feature-card">
  <h3>📅 Timeline & Calendar</h3>
  <p>Track all contracts with due dates and history</p>
</div>
          <div className="feature-card">
            <h3>🔔 Smart Reminders</h3>
            <p>Never miss a repayment deadline</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing  // ← THIS LINE IS CRITICAL!