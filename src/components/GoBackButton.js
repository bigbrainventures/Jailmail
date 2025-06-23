import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GoBackButton.css';

function GoBackButton() {
  const navigate = useNavigate();
  return (
    <button
      className="go-back-btn"
      onClick={() => navigate('/dashboard')}
    >
      <span className="go-back-arrow">&larr;</span>
      Back to Dashboard
    </button>
  );
}

export default GoBackButton; 