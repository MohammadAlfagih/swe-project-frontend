import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api";
import { FiLogOut, FiPlusCircle, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [rides, setRides] = useState<any[]>([]);
  const [pendingRideId, setPendingRideId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Check for Active Rides on Mount (Polling)
  useEffect(() => {
    const checkActiveRide = async () => {
      try {
        const activeRide = await apiRequest("/rides/my-active-ride", "GET", null, token);
        
        if (activeRide) {
          if (user?._id === activeRide.driver) {
            // User is the driver of an active ride
            navigate("/driver-track");
          } else if (user?._id === activeRide.passenger) {
            // User is a passenger
            if (activeRide.status === "booked") {
              setPendingRideId(activeRide._id); // Lock UI, waiting for approval
            } else if (activeRide.status === "ongoing") {
              navigate("/passenger-track"); // Move to tracking
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkActiveRide();
    const interval = setInterval(checkActiveRide, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [user, token, navigate]);

  // 2. Fetch Open Rides
  useEffect(() => {
    const fetchRides = async () => {
      try {
        const data = await apiRequest("/rides", "GET");
        setRides(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  const handleBookRide = async (rideId: string) => {
    try {
      await apiRequest(`/rides/book/${rideId}`, "PUT", {}, token);
      setPendingRideId(rideId); // Gray out the screen
    } catch (err: any) {
      alert(err.message || "Failed to book");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 p-6 text-white rounded-b-3xl shadow-lg z-10 relative">
        <h1 className="text-2xl font-bold">Hello, {user?.name}</h1>
        <p className="opacity-90">Where do you want to go today?</p>
      </div>

      {/* Ride List */}
      <div className="p-4 pb-24 overflow-y-auto h-[calc(100vh-180px)]">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Available Rides</h2>
        
        {loading ? (
          <p className="text-center text-gray-500 mt-10">Loading rides...</p>
        ) : rides.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No rides available right now.</p>
        ) : (
          <div className="space-y-4">
            {rides.map((ride) => (
              <div
                key={ride._id}
                onClick={() => !pendingRideId && handleBookRide(ride._id)}
                className={`p-5 rounded-xl border shadow-sm transition-all duration-300 ${
                  pendingRideId
                    ? pendingRideId === ride._id
                      ? "bg-gray-200 border-gray-400 scale-100" // The booked one
                      : "opacity-30 pointer-events-none grayscale" // Others
                    : "bg-white border-gray-100 hover:shadow-md active:scale-95 cursor-pointer"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <FiUser />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{ride.driver?.name || "Driver"}</h3>
                      <div className="flex text-yellow-500 text-xs">
                        {"★".repeat(Math.round(ride.driver?.rating || 5))} 
                        <span className="text-gray-400 ml-1">({ride.driver?.rating || "New"})</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Departing</p>
                    <p className="font-bold text-blue-600">
                      {new Date(ride.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm">
                  <span className="font-medium text-gray-700">{ride.from}</span>
                  <span className="text-gray-400">➔</span>
                  <span className="font-medium text-gray-700">{ride.to}</span>
                </div>

                {/* Grayed Out Status Message */}
                {pendingRideId === ride._id && (
                  <div className="mt-3 text-center bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full text-xs font-bold animate-pulse">
                    Waiting for driver approval...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Floating Navigation */}
      <div className="absolute bottom-0 left-0 w-full bg-white border-t p-4 flex justify-between items-center shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <button
          onClick={logout}
          disabled={!!pendingRideId}
          className="flex flex-col items-center text-gray-400 hover:text-red-500 transition disabled:opacity-50"
        >
          <FiLogOut className="text-2xl mb-1" />
          <span className="text-xs font-medium">Sign Out</span>
        </button>

        <button
          onClick={() => navigate("/offer-ride")}
          disabled={!!pendingRideId}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition disabled:bg-gray-400"
        >
          <FiPlusCircle className="text-xl" />
          <span className="font-bold">Offer a Ride</span>
        </button>
      </div>
    </div>
  );
};

export default HomePage;