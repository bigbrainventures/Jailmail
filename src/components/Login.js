import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import './Login.css'

function Login() {
  // --- TEMPORARY DEBUGGING ---
  // This will help us verify if Vercel is loading the environment variables correctly.
  useEffect(() => {
    console.log(
      'DEBUG: Supabase URL loaded:', 
      process.env.REACT_APP_SUPABASE_URL 
        ? `${process.env.REACT_APP_SUPABASE_URL.substring(0, 20)}...` 
        : 'Not Found'
    );
    console.log(
      'DEBUG: Supabase Key loaded:', 
      process.env.REACT_APP_SUPABASE_ANON_KEY 
        ? `${process.env.REACT_APP_SUPABASE_ANON_KEY.substring(0, 10)}...`
        : 'Not Found'
    );
  }, []);
  // --- END OF DEBUGGING CODE ---

  // State to track form inputs and loading state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  // Handle form submission for both sign up and sign in
  const handleSubmit = async (e) => {
    e.preventDefault() // Prevent the form from refreshing the page
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        // Create a new user account
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        
        if (error) {
          setMessage(`Error signing up: ${error.message}`)
        } else {
          setMessage('Check your email for a confirmation link!')
        }
      } else {
        // Sign in existing user
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) {
          setMessage(`Error signing in: ${error.message}`)
        }
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <img src="/logo.png" alt="Jailmail Logo" className="login-logo" />
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {message && (
            <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="toggle-mode">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp)
                setMessage('')
              }}
              className="toggle-btn"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login 