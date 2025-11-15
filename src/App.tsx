import React from 'react';
import './App.css';
import { Route,Routes } from 'react-router-dom';
import HomePage from './Pages/Home/HomePage';
import Login from './Pages/Login/Login';
import SignUp from './Pages/Login/SignUp';


function App() {
  return (
    <div className="App">
      <Routes>
        <Route index path="/" element={<HomePage />} />
        <Route  path="/login" element={<Login />} />
        <Route  path="/signup" element={<SignUp />} />
      </Routes>
    </div>
  );
}

export default App;
