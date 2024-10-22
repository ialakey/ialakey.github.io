import React from 'react';

function Card({ description, word, isFlipped, onFlip }) {
  return (
    <div
      className={`card ${isFlipped ? 'flipped' : ''}`}
      onClick={onFlip}
    >
      <div className="card-inner">
        <div className="card-front">
          <p>{description}</p>
        </div>
        <div className="card-back">
          <p>{word}</p>
        </div>
      </div>
    </div>
  );
}

export default Card;
