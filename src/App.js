import React, { useState, useEffect } from 'react';
import './App.css';
import MainPage from './components/MainPage';
import Flashcards from './components/Flashcards';

function App() {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [user, setUser] = useState({ first_name: 'User', last_name: '' });

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user;
      if (telegramUser) {
        setUser({
          first_name: telegramUser.first_name || 'User',
          last_name: telegramUser.last_name || '',
          id: telegramUser.id || '',
          username: telegramUser.username || '',
          languageCode: telegramUser.language_code || ''
        });
      }
    } else {
      console.warn('Это приложение не запущено в Telegram. Пользователь будет загружен с стандартными данными.');
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