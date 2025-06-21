import React from 'react';
import './FloatingHearts.css';

function FloatingHearts() {
  // Create an array to easily render multiple hearts
  const hearts = Array.from({ length: 7 });

  return (
    <div className="hearts-container" aria-hidden="true">
      {hearts.map((_, i) => (
        <div key={i} className="heart">
          ❤️
        </div>
      ))}
    </div>
  );
}

export default FloatingHearts; 