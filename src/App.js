import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { supabase, getCurrentUser } from './supabase'
import Login from './components/Login'
import MessageBoard from './components/MessageBoard'
import MyPosts from './components/MyPosts'
import Recipients from './components/Recipients'
import Dashboard from './components/Dashboard'
import { LogOut } from 'lucide-react'
import './App.css'

function App() {
  // State to track if user is logged in
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Check if user is logged in when app starts
  useEffect(() => {
    getCurrentUser().then(user => {
      setUser(user)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading Jailmail...</p>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="logo-container">
            <Link to="/dashboard">
              <img src="/logo.png" alt="Jailmail Logo" className="app-logo" />
            </Link>
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className="logout-button"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </header>

        <Routes>
          {/* If user is not logged in, show login page */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login />} 
          />
          {/* Dashboard landing page */}
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/recipients" 
            element={user ? <Recipients /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/myposts" 
            element={user ? <MyPosts /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/write" 
            element={user ? <MessageBoard /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App 