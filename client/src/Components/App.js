import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/App.css';
import logo from '../Assets/images/logo.png';

function App() {
  const [id, setId] = useState(localStorage.getItem('ID') || 1999)

  function changeValue(e) {
    console.log('changeValue')
    const value = e.target.value;
    setId(Number(value))
    localStorage.setItem('ID', JSON.stringify(Number(value)))

  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        
        <div className="field active ">
        <input
          id="input"
          type="text"
          value={id}
          placeholder={id}
          onChange={changeValue.bind(this)}
        />
        <label htmlFor={1}>
          Player ID
        </label>
      </div>
      <Link className="App-link" to={`/test/${id}`}>PLAY</Link>
      </header>
    </div>
  );
}

export default App;
