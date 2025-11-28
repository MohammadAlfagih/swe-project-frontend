import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './Pages/Home/HomePage';
import Login from './Pages/Login/Login';
import SignUp from './Pages/Login/SignUp';
import OfferRide from './Pages/Driver/OfferRide';
import DriverTracking from './Pages/Driver/DriverTracking';
import PassengerTracking from './Pages/Passenger/PassengerTracking';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
      <AuthProvider>
        <div className="App min-h-screen bg-gray-100 font-sans text-gray-900">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/offer-ride" element={<ProtectedRoute><OfferRide /></ProtectedRoute>} />
            <Route path="/driver-track" element={<ProtectedRoute><DriverTracking /></ProtectedRoute>} />
            <Route path="/passenger-track" element={<ProtectedRoute><PassengerTracking /></ProtectedRoute>} />
          </Routes>
        </div>
      </AuthProvider>
  );
}

export default App;