import React, { useEffect, useState } from "react";
import { apiRequest } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiStar } from "react-icons/fi";

const PassengerTracking = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [ride, setRide] = useState<any>(null);
  const [rating, setRating] = useState(0); // For modal

  // Poll logic
  useEffect(() => {
    const fetchRide = async () => {
      try {
        // We reuse the driver endpoint? No, the passenger needs to find THEIR ride.
        // The backend `getMyActiveRide` uses `req.user._id`.
        // If the backend was written correctly, `getMyActiveRide` should check 
        // if user is Driver OR Passenger.
        // *Looking at your backend code*: `Ride.findOne({ driver: req.user._id ... })`. 
        // This ONLY works for drivers. 
        // **Fix for Passenger**: We will assume for this frontend demo that we use the same endpoint 
        // but we might get null. 
        // Wait, the backend provided ONLY searches by driver.
        // We need to fetch ALL rides and find the one where I am the passenger?
        // Let's iterate available rides or use the fact that I stored the ID in the HomePage logic?
        // Better: Let's assume you fix the backend OR we filter client side for this demo.
        
        const allRides = await apiRequest("/rides", "GET"); // This only gets "open" rides usually.
        // We need a way to check status.
        
        // WORKAROUND: Since Backend `getOpenRides` only returns status='open', 
        // and `getMyActiveRide` is driver only,
        // The Passenger needs a way to see their ongoing ride.
        // We will TRY to use `getMyActiveRide` assuming you might have updated backend,
        // OR we just use a polling of a known ID passed via state/localstorage.
        
        // For this code to work with EXACT backend provided:
        // We actually can't easily get the passenger ride status without a new endpoint.
        // *However*, I will implement the UI. In a real scenario, add `passenger: req.user._id` to the query in `getMyActiveRide`.
        
        // I will simulate the check here:
        // This part relies on the HomePage logic navigating here only if status is ongoing.
        // To detect "Completed", we might fail if we can't poll.
        // Let's assume the backend `getMyActiveRide` was updated to:
        // const ride = await Ride.findOne({ $or: [{driver: id}, {passenger: id}], status: ... })
        
        const data = await apiRequest("/rides/my-active-ride", "GET", null, token);
        if(!data) {
             // If null, maybe it finished?
             // navigate("/"); 
        } else {
             setRide(data);
        }
        
      } catch (err) { console.error(err); }
    };
    
    // Polling simulation
    const interval = setInterval(fetchRide, 3000);
    return () => clearInterval(interval);
  }, [token]);


  const submitRating = async () => {
    if(!ride) return;
    try {
      await apiRequest("/users/rate", "POST", { userId: ride.driver._id, rating }, token);
      navigate("/");
    } catch(err) {
      alert("Failed to rate");
    }
  };

  // If we can't fetch the ride (due to backend limitation), we show a generic static waiting screen
  // that assumes the ride is in progress.
  
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
             <FiCheckCircle className="text-4xl text-green-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ride in Progress</h2>
        <p className="text-gray-500 mb-6">Sit back and relax! Your driver is taking you to your destination.</p>
        
        <div className="border-t pt-6">
          <p className="text-sm font-bold text-gray-400 mb-4">RATING (Simulated End)</p>
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar 
                key={star} 
                className={`text-3xl cursor-pointer ${rating >= star ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          
          <button 
            onClick={submitRating}
            disabled={rating === 0}
            className="w-full bg-black text-white py-3 rounded-xl font-bold disabled:bg-gray-300"
          >
            Submit Rating & Finish
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassengerTracking;