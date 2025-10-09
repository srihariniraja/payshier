import React, { useState, useEffect } from 'react'
import './App.css'
import Home from './pages/Home'
import Login from './pages/login'
import Features from './pages/Features'
import Landing from './pages/landing'
import Dashboard from './pages/dashboard'
import CreateLoan from './pages/createloan'
import SplitExpensesPage from './pages/SplitExpensesPage'
import LendingPage from './pages/LendingPage'
import DigitalContractsPage from './pages/DigitalContractspage'
import ContractReview from './pages/ContractReview'
import TimelinePage from './pages/TimelinePage'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [pageData, setPageData] = useState({})

  // Simple navigation that works
  const handleNavigation = (page, data = {}) => {
    console.log('🔄 NAVIGATION: Going to', page)
    setCurrentPage(page)
    setPageData(data)
  }

  const renderPage = () => {
    console.log('📄 Rendering page:', currentPage)
    
    switch(currentPage) {
      case 'splitexpenses': return <SplitExpensesPage goTo={handleNavigation} />
      case 'login': return <Login goTo={handleNavigation} />
      case 'features': return <Features goTo={handleNavigation} />
      case 'landing': return <Landing goTo={handleNavigation} />
      case 'dashboard': return <Dashboard goTo={handleNavigation} />
      case 'createloan': return <CreateLoan goTo={handleNavigation} />
      case 'lending': return <LendingPage goTo={handleNavigation} />
      case 'digitalcontracts': return <DigitalContractsPage goTo={handleNavigation} />
      case 'contractreview': return <ContractReview goTo={handleNavigation} formData={pageData} />
      case 'timeline': return <TimelinePage goTo={handleNavigation} />
      default: return <Home goTo={handleNavigation} />
    }
  }

  return (
    <div className="App">
      {renderPage()}
    </div>
  )
}

export default App