import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const helloWorld = 'Welcome!';
  const user = {
    first_name: 'Popescu',
    last_name: 'Pop'
  }
  return (
    <div className="App">
      <h1>{helloWorld}</h1>
      <p>{user.first_name}</p><br />
      <p>{user["last_name"]}</p>
    </div>
  );
}

export default App;
