import React, { useEffect, useState } from "react";
import { apiRequest } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiCheck, FiX, FiUser, FiMapPin, FiNavigation } from "react-icons/fi";

const DriverTracking = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [ride, setRide] = useState<any>(null);

  // Poll for ride status
  useEffect(() => {
    const fetchRide = async () => {
      try {
        const data = await apiRequest("/rides/my-active-ride", "GET", null, token);
        if (!data) {
          // If no active ride, go back home
          navigate("/"); 
        } else {
          setRide(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchRide(); // Initial fetch
    const interval = setInterval(fetchRide, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [token, navigate]);

  const updateStatus = async (status: string) => {
    if(!ride) return;
    try {
      await apiRequest(`/rides/status/${ride._id}`, "PUT", { status }, token);
      if (status === "completed") {
        navigate("/"); // Go home after finishing
      }
    } catch (err) {
      alert("Error updating status");
    }
  };

  if (!ride) return <div className="p-10 text-center">Loading Ride Details...</div>;

  // VIEW 1: Waiting for bookings
  if (ride.status === "open") {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-pulse mb-6">
           <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(59,130,246,0.5)]">
             <FiNavigation className="text-4xl text-white" />
           </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Waiting for Passengers...</h2>
        <p className="text-gray-400">Stay on this page. Requests will appear here.</p>
        
        <div className="mt-8 bg-gray-800 p-4 rounded-xl w-full max-w-xs">
          <p className="text-sm text-gray-400 mb-1">Your Route:</p>
          <div className="flex items-center justify-center gap-2 font-semibold">
            <span>{ride.from}</span>
            <span>➔</span>
            <span>{ride.to}</span>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 2: Booking Request (Pending Approval)
  // Backend logic: "booked" means passenger is attached. Driver needs to "Accept" (move to ongoing) or "Reject".
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
             {/* Accept Button -> Moves to "ongoing" */}
            <button 
              onClick={() => updateStatus("ongoing")}
              className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition transform active:scale-95"
            >
              <FiCheck className="text-xl" /> Accept Ride
            </button>
            
            {/* Reject Button -> Just alert for now as backend requires logic to remove passenger */}
            <button 
              onClick={() => alert("To reject, ideally we cancel the ride or remove passenger. For this demo, please Accept.")}
              className="w-full py-4 bg-red-100 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-200"
            >
              <FiX className="text-xl" /> Reject
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 3: Driving (Ongoing)
  if (ride.status === "ongoing") {
    return (
      <div className="min-h-screen bg-blue-600 flex flex-col p-6 text-white relative">
        <div className="mt-10 text-center">
            <h1 className="text-3xl font-bold mb-2">Driving Now</h1>
            <p className="opacity-80">Head to the destination</p>
        </div>

        <div className="mt-10 flex-1 flex flex-col items-center">
            <div className="w-full bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 mb-6">
                <div className="flex items-start gap-4 mb-4">
                    <FiMapPin className="mt-1" />
                    <div>
                        <p className="text-xs opacity-70">DROP OFF</p>
                        <p className="font-bold text-xl">{ride.to}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 border-t border-white/20 pt-4">
                    <div className="w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold">
                        {ride.passenger?.name.charAt(0)}
                    </div>
                    <span>{ride.passenger?.name} is on board</span>
                </div>
            </div>
        </div>

        <button 
          onClick={() => updateStatus("completed")}
          className="w-full bg-white text-red-600 py-4 rounded-xl font-bold shadow-xl mb-6 hover:bg-gray-100 transition"
        >
          End Ride
        </button>
      </div>
    );
  }

  return null;
};

export default DriverTracking;