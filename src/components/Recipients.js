import React, { useState, useEffect } from 'react'
import { supabase, getCurrentUser } from '../supabase'
import { Plus, Edit2, Trash2, User, MapPin, Mail } from 'lucide-react'
import './Recipients.css'
import GoBackButton from './GoBackButton'

function Recipients() {
  // State to track recipients, form inputs, and loading state
  const [recipients, setRecipients] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  })

  // Get current user and fetch recipients when component loads
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        const currentUser = await getCurrentUser()
        console.log('Current user:', currentUser) // Debug log
        setUser(currentUser)
        
        if (currentUser) {
          await fetchRecipients(currentUser.id)
        } else {
          setError('No user found')
          setLoading(false)
        }
      } catch (err) {
        console.error('Error initializing component:', err)
        setError('Error loading user data')
        setLoading(false)
      }
    }
    
    initializeComponent()
  }, [])

  // Fetch recipients for the current user
  const fetchRecipients = async (userId) => {
    console.log('Fetching recipients for user:', userId) // Debug log
    
    try {
      // We are now calling the database function to get recipients with their letter count
      const { data, error } = await supabase.rpc('get_recipients_with_message_count', {
        p_user_id: userId
      })

      console.log('Supabase RPC response:', { data, error }) // Debug log

      if (error) {
        console.error('Error fetching recipients:', error)
        setError(`Error fetching recipients: ${error.message}`)
      } else {
        console.log('Recipients fetched:', data) // Debug log
        setRecipients(data || [])
        setError(null)
      }
    } catch (error) {
      console.error('Error:', error)
      setError(`Unexpected error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      address: ''
    })
    setEditingId(null)
    setShowForm(false)
    setError(null)
  }

  // Handle form submission (create or update recipient)
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.address.trim()) {
      setError('Please fill in both name and address')
      return
    }

    if (!user) {
      setError('No user found. Please log in again.')
      return
    }

    console.log('Submitting recipient form:', formData) // Debug log

    try {
      if (editingId) {
        // Update existing recipient
        const { data, error } = await supabase
          .from('recipients')
          .update({
            name: formData.name.trim(),
            address: formData.address.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)
          .eq('user_id', user.id)
          .select()

        console.log('Update response:', { data, error }) // Debug log

        if (error) {
          console.error('Error updating recipient:', error)
          setError(`Error updating recipient: ${error.message}`)
        } else {
          await fetchRecipients(user.id)
          resetForm()
        }
      } else {
        // Create new recipient
        const { data, error } = await supabase
          .from('recipients')
          .insert([
            {
              name: formData.name.trim(),
              address: formData.address.trim(),
              user_id: user.id
            }
          ])
          .select()

        console.log('Create response:', { data, error }) // Debug log

        if (error) {
          console.error('Error creating recipient:', error)
          setError(`Error creating recipient: ${error.message}`)
        } else {
          console.log('Recipient created successfully:', data) // Debug log
          await fetchRecipients(user.id)
          resetForm()
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setError(`Unexpected error: ${error.message}`)
    }
  }

  // Start editing a recipient
  const handleEdit = (recipient) => {
    setFormData({
      name: recipient.name,
      address: recipient.address
    })
    setEditingId(recipient.id)
    setShowForm(true)
  }

  // Delete a recipient
  const handleDelete = async (recipientId) => {
    if (!window.confirm('Are you sure you want to delete this recipient?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('recipients')
        .delete()
        .eq('id', recipientId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting recipient:', error)
        setError(`Error deleting recipient: ${error.message}`)
      } else {
        await fetchRecipients(user.id)
      }
    } catch (error) {
      console.error('Error:', error)
      setError(`Unexpected error: ${error.message}`)
    }
  }

  // Format date for display
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="recipients-loading">
        <div className="loading-spinner"></div>
        <p>Loading recipients...</p>
      </div>
    )
  }

  return (
    <div className="recipients-container">
      <GoBackButton />
      <div className="recipients">
        <div className="recipients-header">
          <h2>Recipients</h2>
          <p className="subtitle">Manage the people you write letters to</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="recipient-form-container">
            <div className="form-header">
              <h3>{editingId ? 'Edit Recipient' : 'Add New Recipient'}</h3>
              <button 
                onClick={resetForm}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="recipient-form">
              <div className="form-group">
                <label htmlFor="name">
                  <User size={16} />
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter recipient's full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  <MapPin size={16} />
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter complete address including facility name, unit number, etc."
                  rows="4"
                  required
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                >
                  {editingId ? 'Update' : 'Add Recipient'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Recipients List */}
        <div className="recipients-content">
          {recipients.length === 0 ? (
            <div className="no-recipients">
              <div className="no-recipients-icon">
                <Mail size={48} />
              </div>
              <h3>No recipients yet</h3>
              <p>Add recipients to easily manage who you're writing letters to.</p>
              <button 
                onClick={() => setShowForm(true)}
                className="add-first-btn"
              >
                <Plus size={16} />
                Add Your First Recipient
              </button>
            </div>
          ) : (
            <div className="recipients-list">
              <div className="list-header">
                <h3>Your Recipients ({recipients.length})</h3>
                <button 
                  onClick={() => setShowForm(true)}
                  className="add-btn"
                >
                  <Plus size={16} />
                  Add Recipient
                </button>
              </div>
              
              <div className="recipients-grid">
                {recipients.map((recipient) => (
                  <div key={recipient.id} className="recipient-card">
                    <div className="recipient-info">
                      <div className="recipient-name">
                        <User size={16} />
                        <span>{recipient.name}</span>
                      </div>
                      <div className="recipient-address">
                        <MapPin size={14} />
                        <span>{recipient.address}</span>
                      </div>
                      <div className="recipient-stats">
                        <Mail size={14} />
                        <span>
                          {recipient.message_count} letter{recipient.message_count !== 1 ? 's' : ''} sent
                        </span>
                      </div>
                      <div className="recipient-date">
                        Added: {formatDate(recipient.created_at)}
                      </div>
                    </div>
                    
                    <div className="recipient-actions">
                      <button
                        onClick={() => handleEdit(recipient)}
                        className="edit-btn"
                        title="Edit recipient"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(recipient.id)}
                        className="delete-btn"
                        title="Delete recipient"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Recipients 