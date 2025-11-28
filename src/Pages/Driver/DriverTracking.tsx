import React, { useEffect, useState } from "react";
import { apiRequest } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiCheck, FiX, FiUser, FiMapPin, FiNavigation } from "react-icons/fi";

const DriverTracking = () => {
  const { user, token } = useAuth(); // Import 'user' here
  const navigate = useNavigate();
  const [ride, setRide] = useState<any>(null);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const data = await apiRequest("/rides/my-active-ride", "GET", null, token);
        if (!data) {
          navigate("/"); 
        } else {
          setRide(data);
          
          // FIX: If I am the passenger, force me to the passenger page
          // Handle both populated object and raw string ID
          const passengerId = data.passenger?._id || data.passenger;
          if (user?._id === passengerId) {
             navigate("/passenger-track");
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchRide(); 
    const interval = setInterval(fetchRide, 3000); 
    return () => clearInterval(interval);
  }, [token, navigate, user?._id]); // Added user._id dependency

  const updateStatus = async (status: string) => {
    if(!ride) return;
    try {
      await apiRequest(`/rides/status/${ride._id}`, "PUT", { status }, token);
      if (status === "completed") {
        navigate("/"); 
      }
    } catch (err: any) {
      // Show the actual error from the backend for better debugging
      alert(`Error: ${err.message}`);
    }
  };

  if (!ride) return <div className="p-10 text-center">Loading...</div>;

  // ... (Keep View 1: Waiting) ...
  if (ride.status === "open") {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
            {/* Same code as before */}
            <h2 className="text-2xl font-bold mb-2">Waiting for Passengers...</h2>
        </div>
      )
  }

  // VIEW 2: Booking Request
  if (ride.status === "booked") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">New Booking Request!</h1>
        
        <div className="bg-white p-6 rounded-3xl shadow-xl flex-1 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiUser className="text-3xl text-gray-500" />
          </div>
          <h2 className="text-xl font-bold">{ride.passenger?.name}</h2>
          <p className="text-gray-500 mb-8">{ride.passenger?.email}</p>

          <div className="w-full space-y-3">
            <button 
              onClick={() => updateStatus("ongoing")}
              className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition transform active:scale-95"
            >
              <FiCheck className="text-xl" /> Accept Ride
            </button>
            
            <button 
              onClick={() => alert("Reject functionality not implemented yet")}
              className="w-full py-4 bg-red-100 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-200"
            >
              <FiX className="text-xl" /> Reject
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ... (Keep View 3: Driving) ...
  if (ride.status === "ongoing") {
      return (
          <div className="min-h-screen bg-blue-600 flex flex-col p-6 text-white relative">
             {/* Same code as before */}
             <h1 className="text-3xl font-bold mb-2">Driving Now</h1>
             <button onClick={() => updateStatus("completed")} className="w-full bg-white text-red-600 py-4 rounded-xl font-bold shadow-xl mb-6 hover:bg-gray-100 transition">End Ride</button>
          </div>
      )
  }

  return null;
};

export default DriverTracking;