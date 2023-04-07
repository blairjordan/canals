import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [playerName, setPlayerName] = useState('');

  const handlePlayerNameChange = (event) => {
    setPlayerName(event.target.value);
  };

  const handleLogin = (event) => {
    event.preventDefault();
    onLogin(playerName);
  };

  return (
    <form onSubmit={handleLogin}>
      <div className="flex flex-col items-center">
        <input
          type="text"
          placeholder="Player ID"
          value={playerName}
          onChange={handlePlayerNameChange}
          className="bg-white rounded-lg px-4 py-3 mb-4 border-gray-300 border text-gray-800"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          Login
        </button>
      </div>
    </form>
  );
};

Login.displayName = 'Login';

export default Login;
