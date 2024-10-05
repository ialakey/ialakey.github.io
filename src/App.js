import React, { useState, useEffect } from 'react';
import './App.css';

const exercises = [
  { id: 1, name: 'Карточки' },
  { id: 2, name: 'Тесты' }
];

const wordsData = [
  { description: 'A domesticated carnivorous mammal', word: 'Dog' },
  { description: 'A large plant-eating mammal with a trunk', word: 'Elephant' },
  { description: 'A small rodent', word: 'Mouse' }
];

function MainPage({ onSelectExercise, user }) {
  return (
    <div className="main-page">
      <h1>Привет, {user.first_name} {user.last_name}</h1>
      <h2>Выберите упражнение:</h2>
      <div className="exercise-buttons">
        {exercises.map(exercise => (
          <button key={exercise.id} onClick={() => onSelectExercise(exercise.name)}>
            {exercise.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function Flashcards({ onBackToMain }) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = wordsData[currentCardIndex];

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prevIndex) =>
      prevIndex === wordsData.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="flashcards">
      <h1>Карточки</h1>
      <div
        className={`card ${isFlipped ? 'flipped' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="card-inner">
          <div className="card-front">
            <p>{currentCard.description}</p>
          </div>
          <div className="card-back">
            <p>{currentCard.word}</p>
          </div>
        </div>
      </div>
      <div className="buttons">
        <button onClick={handleNextCard} className="next-btn">Вперед</button>
        <button onClick={onBackToMain} className="exit-btn">Выйти</button>
      </div>
    </div>
  );
}

function App() {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [user, setUser] = useState({ first_name: 'User', last_name: '' });

  useEffect(() => {
    if (window.Telegram.WebApp) {
      const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user;
      if (telegramUser) {
        setUser({
          first_name: telegramUser.first_name || 'User',
          last_name: telegramUser.last_name || ''
        });
      }
    }
  }, []);

  const handleBackToMain = () => {
    setSelectedExercise(null);
  };

  const renderExercise = () => {
    switch (selectedExercise) {
      case 'Карточки':
        return <Flashcards onBackToMain={handleBackToMain} />;
      default:
        return <MainPage onSelectExercise={setSelectedExercise} user={user} />;
    }
  };

  return <div className="App">{renderExercise()}</div>;
}

export default App;