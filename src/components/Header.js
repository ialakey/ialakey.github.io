import React from 'react';

function Header({ onExit }) {
  return (
    <div className="header">
      <button className="exit-btn" onClick={onExit}>
        ✖
      </button>
    </div>
  );
}

export default Header;
