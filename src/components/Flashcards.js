import React, { useState } from 'react';
import Header from './Header';
import Card from './Card';
import ControlButtons from './ControlButtons';
import { wordsData } from '../data/wordsData.js';

function Flashcards({ onBackToMain }) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [exitConfirmation, setExitConfirmation] = useState(false);

  const currentCard = wordsData[currentCardIndex];

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prevIndex) =>
      prevIndex === wordsData.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleExitClick = () => {
    setExitConfirmation(true);
  };

  const confirmExit = () => {
    onBackToMain();
  };

  const cancelExit = () => {
    setExitConfirmation(false);
  };

  return (
    <div className="flashcards">
      <Header onExit={handleExitClick} />
      {exitConfirmation && (
        <div className="confirmation-modal">
          <p>Вы уверены, что хотите завершить игру?</p>
          <button onClick={confirmExit}>Да</button>
          <button onClick={cancelExit}>Нет</button>
        </div>
      )}
        <Card
          description={currentCard.description}
          word={currentCard.word}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
        />
        <ControlButtons onNext={handleNextCard} />
      </div>
        );
      }

export default Flashcards;
