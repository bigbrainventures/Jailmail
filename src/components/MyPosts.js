import React, { useState, useEffect } from 'react'
import { supabase, getCurrentUser } from '../supabase'
import { Calendar, Clock, Image as ImageIcon, MessageSquare, User } from 'lucide-react'
import './MyPosts.css'
import GoBackButton from './GoBackButton'

function MyPosts() {
  // State to track user's posts and loading state
  const [myPosts, setMyPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('all') // 'all', 'text', 'photos'

  // Get current user and fetch their posts when component loads
  useEffect(() => {
    getCurrentUser().then(user => {
      setUser(user)
      if (user) {
        fetchMyPosts(user.id)
      }
    })
  }, [])

  // Fetch posts created by the current user
  const fetchMyPosts = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          recipients (
            name,
            address
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching my posts:', error)
      } else {
        setMyPosts(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter posts based on active tab
  const getFilteredPosts = () => {
    switch (activeTab) {
      case 'text':
        return myPosts.filter(post => post.content && !post.photo_url)
      case 'photos':
        return myPosts.filter(post => post.photo_url)
      default:
        return myPosts
    }
  }

  // Group posts by date
  const groupPostsByDate = (posts) => {
    const groups = {}
    
    posts.forEach(post => {
      const date = new Date(post.created_at)
      const dateKey = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(post)
    })
    
    return groups
  }

  // Format time for display
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get post count for each tab
  const getPostCount = (type) => {
    switch (type) {
      case 'text':
        return myPosts.filter(post => post.content && !post.photo_url).length
      case 'photos':
        return myPosts.filter(post => post.photo_url).length
      default:
        return myPosts.length
    }
  }

  const filteredPosts = getFilteredPosts()
  const groupedPosts = groupPostsByDate(filteredPosts)

  if (loading) {
    return (
      <div className="my-posts-loading">
        <div className="loading-spinner"></div>
        <p>Loading your letters...</p>
      </div>
    )
  }

  return (
    <div className="myposts-container">
      <GoBackButton />
      <div className="my-posts">
        <div className="my-posts-header">
          <h2>My Letters</h2>
          <p className="subtitle">View and manage your past letters and photos</p>
        </div>

        {/* Tab Navigation */}
        <div className="tabs-container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <MessageSquare size={16} />
              All Letters ({getPostCount('all')})
            </button>
            <button
              className={`tab ${activeTab === 'text' ? 'active' : ''}`}
              onClick={() => setActiveTab('text')}
            >
              <MessageSquare size={16} />
              Text Only ({getPostCount('text')})
            </button>
            <button
              className={`tab ${activeTab === 'photos' ? 'active' : ''}`}
              onClick={() => setActiveTab('photos')}
            >
              <ImageIcon size={16} />
              Photos ({getPostCount('photos')})
            </button>
          </div>
        </div>

        {/* Posts Content */}
        <div className="posts-content">
          {filteredPosts.length === 0 ? (
            <div className="no-posts">
              <div className="no-posts-icon">
                {activeTab === 'photos' ? <ImageIcon size={48} /> : <MessageSquare size={48} />}
              </div>
              <h3>No {activeTab === 'all' ? '' : activeTab} letters yet</h3>
              <p>
                {activeTab === 'photos' 
                  ? "You haven't sent any photos yet. Share some moments with your loved one!"
                  : activeTab === 'text'
                  ? "You haven't written any letters yet. Start sharing your thoughts!"
                  : "You haven't sent any letters yet. Start writing to stay connected!"
                }
              </p>
            </div>
          ) : (
            <div className="posts-timeline">
              {Object.entries(groupedPosts).map(([date, posts]) => (
                <div key={date} className="date-group">
                  <div className="date-header">
                    <Calendar size={16} />
                    <span className="date-label">{date}</span>
                    <span className="post-count">({posts.length} letter{posts.length !== 1 ? 's' : ''})</span>
                  </div>
                  
                  <div className="posts-for-date">
                    {posts.map((post) => (
                      <div key={post.id} className="post-item">
                        <div className="post-header">
                          <div className="post-time">
                            <Clock size={14} />
                            <span>{formatTime(post.created_at)}</span>
                          </div>
                          <div className="post-type">
                            {post.photo_url && <ImageIcon size={14} />}
                            {post.content && <MessageSquare size={14} />}
                          </div>
                        </div>
                        
                        <div className="post-recipient">
                          <User size={14} />
                          <span>To: {post.recipients?.name || 'Unknown Recipient'}</span>
                        </div>
                        
                        {post.content && (
                          <div className="post-content">
                            <div 
                              className="message-text" 
                              dangerouslySetInnerHTML={{ __html: post.content }} 
                            />
                          </div>
                        )}
                        
                        {post.photo_url && (
                          <div className="post-photo">
                            <img 
                              src={post.photo_url} 
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyPosts 