import React, { useState, useEffect, useRef } from 'react'
import { supabase, getCurrentUser } from '../supabase'
import { Upload, Send, Image as ImageIcon, User, Plus, MapPin } from 'lucide-react'
import FloatingHearts from './FloatingHearts'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import './MessageBoard.css'
import GoBackButton from './GoBackButton'

// --- Font Configuration ---
// A curated list of 50 unique and expressive fonts.
// Font names with spaces are hyphenated to work correctly as CSS classes.
const fonts = [
  // Serif
  'Georgia', 'Times-New-Roman', 'Garamond', 'Palatino', 'Playfair-Display', 
  'Merriweather', 'Lora', 'Bitter', 'Crimson-Text', 'EB-Garamond',

  // Sans-Serif
  'Arial', 'Verdana', 'Helvetica', 'Roboto', 'Open-Sans', 'Lato', 
  'Montserrat', 'Oswald', 'Raleway', 'Ubuntu',

  // Monospace
  'Courier-New', 'Lucida-Console', 'Monaco', 'Inconsolata', 'Source-Code-Pro',

  // Script & Handwriting
  'Lobster', 'Pacifico', 'Caveat', 'Dancing-Script', 'Great-Vibes',
  'Sacramento', 'Tangerine', 'Allura', 'Alex-Brush', 'Kalam',

  // Display & Unique
  'Impact', 'Comic-Sans-MS', 'Anton', 'Alfa-Slab-One', 'Bebas-Neue',
  'Fredoka-One', 'Luckiest-Guy', 'Press-Start-2P', 'Abril-Fatface', 'Comfortaa'
];

// Add the fonts to the editor's whitelist
const Font = ReactQuill.Quill.import('formats/font');
Font.whitelist = fonts;
ReactQuill.Quill.register(Font, true);

function MessageBoard() {
  // State to track messages, form inputs, and loading states
  const [messages, setMessages] = useState([])
  const [recipients, setRecipients] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedRecipient, setSelectedRecipient] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  
  // Recipient creation form state
  const [showRecipientForm, setShowRecipientForm] = useState(false)
  const [recipientForm, setRecipientForm] = useState({
    name: '',
    address: ''
  })

  const [showHearts, setShowHearts] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [justSent, setJustSent] = useState(false)

  // Custom toolbar configuration for the text editor
  const modules = {
    toolbar: [
      [{ 'font': fonts }],
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link'],
      ['clean']
    ],
  }

  // Get current user when component loads
  useEffect(() => {
    // Function to initialize the component by fetching user and then data
    const initializeComponent = async () => {
      try {
        setLoading(true); // Start loading
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        // Only proceed if we have a valid user
        if (currentUser && currentUser.id) {
          // Fetch both messages and recipients at the same time
          await Promise.all([
            fetchMessages(currentUser.id),
            fetchRecipients(currentUser.id)
          ]);
        } else {
          // If no user, we can't fetch anything
          console.log("No user found, skipping data fetch.");
        }
      } catch (error) {
        console.error("Error during component initialization:", error);
        setError("There was a problem loading your data. Please refresh the page.");
      } finally {
        setLoading(false); // Stop loading
      }
    };

    initializeComponent();

    // Set up a listener for authentication changes (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setMessages([]);
        setRecipients([]);
        setNewMessage('');
        setSelectedFile(null);
        setSelectedRecipient('');
        setLoading(false);
        setUploading(false);
        setUser(null);
        setRecipientForm({ name: '', address: '' });
        setShowRecipientForm(false);
      }
    });

    // Cleanup the listener when the component unmounts
    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, []);

  // Fetch messages for the current user
  const fetchMessages = async (userId) => {
    if (!userId) {
      console.error("Cannot fetch messages without a userId.");
      return;
    }
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:user_id (
            email
          ),
          recipients (
            name,
            address
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching messages:', error)
      } else {
        setMessages(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Fetch recipients for the current user
  const fetchRecipients = async (userId) => {
    if (!userId) {
      console.error("Cannot fetch recipients without a userId.");
      return;
    }
    try {
      const { data, error } = await supabase
        .from('recipients')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching recipients:', error)
      } else {
        setRecipients(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Handle recipient form input changes
  const handleRecipientInputChange = (e) => {
    const { name, value } = e.target
    setRecipientForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Create a new recipient
  const handleCreateRecipient = async (e) => {
    e.preventDefault()
    
    if (!recipientForm.name.trim() || !recipientForm.address.trim()) {
      alert('Please fill in both name and address')
      return
    }

    try {
      const { data, error } = await supabase
        .from('recipients')
        .insert([
          {
            name: recipientForm.name.trim(),
            address: recipientForm.address.trim(),
            user_id: user.id
          }
        ])
        .select()

      if (error) {
        console.error('Error creating recipient:', error)
        alert('Error creating recipient')
      } else {
        // Add the new recipient to the list and select it
        const newRecipient = data[0]
        setRecipients(prev => [newRecipient, ...prev])
        setSelectedRecipient(newRecipient.id)
        setRecipientForm({ name: '', address: '' })
        setShowRecipientForm(false)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error creating recipient')
    }
  }

  // Handle file selection for photo upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
    } else {
      alert('Please select an image file')
    }
  }

  // Upload photo to Supabase storage
  const uploadPhoto = async (file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `photos/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    // Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath)

    return publicUrl
  }

  // Handle form submission to post a new message
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedRecipient) {
      alert('Please select a recipient for your letter')
      return
    }
    
    if (!newMessage.trim() && !selectedFile) {
      alert('Please write a message or add a photo')
      return
    }

    setIsSending(true)

    try {
      let photoUrl = null

      // Upload photo if one is selected
      if (selectedFile) {
        photoUrl = await uploadPhoto(selectedFile)
      }

      // Insert the message into the database
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            content: newMessage.trim(),
            photo_url: photoUrl,
            recipient_id: selectedRecipient,
            user_id: user.id
          }
        ])

      if (error) {
        console.error('Error posting message:', error)
        alert('Error sending your letter')
      } else {
        // Clear form and refresh messages
        setNewMessage('')
        setSelectedFile(null)
        setSelectedRecipient('')
        fetchMessages(user.id)
        
        // Trigger floating hearts!
        setShowHearts(true)
        setTimeout(() => setShowHearts(false), 4000) // Hide after 4 seconds (the animation duration)

        setJustSent(true)
        setTimeout(() => setJustSent(false), 2000)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error sending your letter')
    } finally {
      setIsSending(false)
    }
  }

  // Format timestamp for display
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="message-board-container">
      <GoBackButton />
      {showHearts && <FloatingHearts />}
      <div className="message-board">
        <div className="post-form-container">
          <div className="write-header">
            <h2>Write a Letter</h2>
            <p>Share your thoughts, photos, and messages with your loved one</p>
          </div>
          
          <form onSubmit={handleSubmit} className="post-form">
            {/* Recipient Selection */}
            <div className="recipient-selection">
              <label htmlFor="recipient-select">
                <User size={16} />
                Recipient *
              </label>
              <div className="recipient-controls">
                <select
                  id="recipient-select"
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                  required
                  className="recipient-select"
                >
                  <option value="">Select a recipient...</option>
                  {recipients.map((recipient) => (
                    <option key={recipient.id} value={recipient.id}>
                      {recipient.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowRecipientForm(true)}
                  className="add-recipient-btn"
                >
                  <Plus size={16} />
                  Add New
                </button>
              </div>
            </div>

            {/* Recipient Creation Form */}
            {showRecipientForm && (
              <div className="recipient-form-overlay">
                <div className="recipient-form-modal">
                  <div className="form-header">
                    <h3>Add New Recipient</h3>
                    <button 
                      type="button"
                      onClick={() => setShowRecipientForm(false)}
                      className="close-btn"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <form onSubmit={handleCreateRecipient} className="recipient-form">
                    <div className="form-group">
                      <label htmlFor="recipient-name">
                        <User size={16} />
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="recipient-name"
                        name="name"
                        value={recipientForm.name}
                        onChange={handleRecipientInputChange}
                        placeholder="Enter recipient's full name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="recipient-address">
                        <MapPin size={16} />
                        Address
                      </label>
                      <textarea
                        id="recipient-address"
                        name="address"
                        value={recipientForm.address}
                        onChange={handleRecipientInputChange}
                        placeholder="Enter complete address including facility name, unit number, etc."
                        rows="3"
                        required
                      />
                    </div>

                    <div className="form-actions">
                      <button 
                        type="button" 
                        onClick={() => setShowRecipientForm(false)}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="save-btn"
                      >
                        Add Recipient
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="message-input-container">
              <ReactQuill 
                theme="snow" 
                value={newMessage} 
                onChange={setNewMessage}
                modules={modules}
                placeholder="Start writing your letter here..."
              />
              
              <div className="form-actions">
                <div className="file-upload">
                  <label htmlFor="photo-upload" className="upload-btn">
                    <ImageIcon size={20} />
                    {selectedFile ? selectedFile.name : 'Add Photo'}
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="remove-file-btn"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="post-btn"
                  disabled={isSending || !selectedRecipient || (!newMessage.trim() && !selectedFile)}
                >
                  {isSending ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <>
                      <Send size={16} />
                      {justSent ? '✓ Letter Sent!' : 'Send Letter'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="no-messages">
              <div className="no-messages-icon">📝</div>
              <h3>Start Writing</h3>
              <p>Write your first letter to share your thoughts and stay connected.</p>
            </div>
          ) : (
            <div className="recent-letters">
              <h3>Recent Letters</h3>
              {messages.map((message) => (
                <div key={message.id} className="message-card">
                  <div className="message-header">
                    <div className="message-info">
                      <span className="author">{message.profiles?.email || 'Unknown'}</span>
                      <span className="recipient">To: {message.recipients?.name || 'Unknown Recipient'}</span>
                    </div>
                    <span className="timestamp">{formatTime(message.created_at)}</span>
                  </div>
                  
                  {message.content && (
                    <div className="message-content">
                      {message.content}
                    </div>
                  )}
                  
                  {message.photo_url && (
                    <div className="message-photo">
                      <img 
                        src={message.photo_url} 
                        alt="Letter attachment"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageBoard 