import React, { useState } from 'react';
import './App.css';

const exercises = [
  { id: 1, name: 'Карточки' }
];

const wordsData = [
  { description: 'A domesticated carnivorous mammal', word: 'Dog' },
  { description: 'A large plant-eating mammal with a trunk', word: 'Elephant' },
  { description: 'A small rodent', word: 'Mouse' }
];

function MainPage({ onSelectExercise }) {
  return (
    <div className="main-page">
      <h1>Упражнения</h1>
      {exercises.map(exercise => (
        <button key={exercise.id} onClick={() => onSelectExercise(exercise.name)}>
          {exercise.name}
        </button>
      ))}
    </div>
  );
}

function Flashcards() {
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
      <div className={`card ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
        <div className="card-front">
          <p>{currentCard.description}</p>
        </div>
        <div className="card-back">
          <p>{currentCard.word}</p>
        </div>
      </div>
      <button onClick={handleNextCard}>Вперед</button>
    </div>
  );
}

function App() {
  const [selectedExercise, setSelectedExercise] = useState(null);

  const renderExercise = () => {
    switch (selectedExercise) {
      case 'Карточки':
        return <Flashcards />;
      default:
        return <MainPage onSelectExercise={setSelectedExercise} />;
    }
  };

  return <div className="App">{renderExercise()}</div>;
}

export default App;