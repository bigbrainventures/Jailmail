import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  // SVG icons with gradient fills
  const icons = [
    {
      label: 'Write a Message',
      onClick: () => navigate('/write'),
      svg: (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="writeGradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop stopColor="#667eea" />
              <stop offset="1" stopColor="#764ba2" />
            </linearGradient>
          </defs>
          <rect x="8" y="16" width="48" height="32" rx="8" fill="url(#writeGradient)"/>
          <rect x="16" y="24" width="32" height="4" rx="2" fill="#fff"/>
          <rect x="16" y="32" width="20" height="4" rx="2" fill="#fff"/>
          <circle cx="48" cy="34" r="4" fill="#fff"/>
        </svg>
      )
    },
    {
      label: 'Recipients',
      onClick: () => navigate('/recipients'),
      svg: (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="recipientsGradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop stopColor="#667eea" />
              <stop offset="1" stopColor="#764ba2" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="24" r="12" fill="url(#recipientsGradient)"/>
          <ellipse cx="32" cy="48" rx="16" ry="8" fill="url(#recipientsGradient)" opacity="0.7"/>
          <circle cx="22" cy="22" r="3" fill="#fff"/>
          <circle cx="42" cy="22" r="3" fill="#fff"/>
        </svg>
      )
    },
    {
      label: 'My Letters',
      onClick: () => navigate('/myposts'),
      svg: (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lettersGradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop stopColor="#667eea" />
              <stop offset="1" stopColor="#764ba2" />
            </linearGradient>
          </defs>
          <rect x="12" y="20" width="40" height="28" rx="6" fill="url(#lettersGradient)"/>
          <polyline points="16,24 32,38 48,24" fill="none" stroke="#fff" strokeWidth="3"/>
        </svg>
      )
    }
  ];

  return (
    <div className="dashboard-grid">
      {icons.map((icon, idx) => (
        <button key={icon.label} className="dashboard-icon" onClick={icon.onClick}>
          {icon.svg}
          <span className="dashboard-label">{icon.label}</span>
        </button>
      ))}
    </div>
  );
}

export default Dashboard; 