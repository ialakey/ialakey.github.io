import React from 'react';

function ControlButtons({ onNext }) {
  return (
    <div className="buttons">
      <button
        onClick={onNext}
        className="dont-know-btn"
        style={{ backgroundColor: 'red' }}
      >
        НЕ ЗНАЮ
      </button>
       <button
         onClick={onNext}
         className="know-btn"
         style={{ backgroundColor: 'green' }}
       >
         ЗНАЮ
       </button>
    </div>
  );
}

export default ControlButtons;
