import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase, getCurrentUser } from './supabase'
import Login from './components/Login'
import MessageBoard from './components/MessageBoard'
import MyPosts from './components/MyPosts'
import Recipients from './components/Recipients'
import { Edit3, User, Users, LogOut } from 'lucide-react'
import './App.css'

function App() {
  // State to track if user is logged in
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('write') // 'write', 'my-posts', 'recipients'
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Check if user is logged in when app starts
  useEffect(() => {
    // Get the current user when the app loads
    getCurrentUser().then(user => {
      setUser(user)
      setLoading(false)
    })

    // Listen for authentication changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // Clean up the subscription when component unmounts
    return () => subscription.unsubscribe()
  }, [])

  // Show loading screen while checking authentication
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
            <img src="/logo.png" alt="Jailmail Logo" className="app-logo" />
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className="logout-button"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </header>

        {user && (
          <nav className="main-nav">
            <div className="nav-tabs">
              <button
                className={`nav-tab ${activeTab === 'write' ? 'active' : ''}`}
                onClick={() => setActiveTab('write')}
              >
                <Edit3 size={16} />
                Write a Message
              </button>
              <button
                className={`nav-tab ${activeTab === 'recipients' ? 'active' : ''}`}
                onClick={() => setActiveTab('recipients')}
              >
                <Users size={16} />
                Recipients
              </button>
              <button
                className={`nav-tab ${activeTab === 'my-posts' ? 'active' : ''}`}
                onClick={() => setActiveTab('my-posts')}
              >
                <User size={16} />
                My Letters
              </button>
            </div>
          </nav>
        )}

        <Routes>
          {/* If user is not logged in, show login page */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <Login />} 
          />
          
          {/* Main content - only accessible if logged in */}
          <Route 
            path="/" 
            element={
              user ? (
                <div className="main-content">
                  {activeTab === 'write' && <MessageBoard />}
                  {activeTab === 'recipients' && <Recipients />}
                  {activeTab === 'my-posts' && <MyPosts />}
                </div>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App 