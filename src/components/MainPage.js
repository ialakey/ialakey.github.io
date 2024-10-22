import React from 'react';
import { exercises } from '../data/exercises.js';
import './MainPage.css';
import logo from '../logo.png';

function MainPage({ onSelectExercise, user }) {
  return (
    <div className="main-page">
      <div className="header">
        <img src={logo} alt="App Icon" className="app-icon"/>
        <h1>Добро пожаловать, {user.first_name}!</h1>
      </div>
      <h2>Готовы улучшить свои навыки?</h2>
      <h3>Выберите игру для тренировки:</h3>
      <div className="exercise-buttons">
        {exercises.map((exercise) => (
          <button
            key={exercise.id}
            onClick={() => onSelectExercise(exercise.name)}
          >
            {exercise.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MainPage;