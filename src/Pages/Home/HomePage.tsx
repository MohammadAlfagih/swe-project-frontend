import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api";
import { FiLogOut, FiPlusCircle, FiUser, FiLoader } from "react-icons/fi";
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
          // Handle Driver vs Passenger Logic
          const driverId = activeRide.driver._id || activeRide.driver;
          const passengerId = activeRide.passenger?._id || activeRide.passenger;
          const currentUserId = user?._id;

          if (currentUserId === driverId) {
            navigate("/driver-track");
          } else if (currentUserId === passengerId) {
            if (activeRide.status === "booked") {
              setPendingRideId(activeRide._id); // We are waiting for approval
            } else if (activeRide.status === "ongoing") {
              navigate("/passenger-track");
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkActiveRide();
    const interval = setInterval(checkActiveRide, 3000); 
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
  }, [pendingRideId]); // Refetch if pending status changes

  const handleBookRide = async (rideId: string) => {
    try {
      await apiRequest(`/rides/book/${rideId}`, "PUT", {}, token);
      setPendingRideId(rideId); 
      setRides([]); // Clear the list immediately to show the waiting UI
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

      <div className="p-4 pb-24 overflow-y-auto h-[calc(100vh-180px)]">
        
        {/* --- NEW: Waiting UI --- */}
        {pendingRideId ? (
          <div className="mt-10 p-6 bg-yellow-50 border border-yellow-200 rounded-2xl text-center animate-pulse">
            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <FiLoader className="text-3xl animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-yellow-800 mb-2">Request Sent!</h2>
            <p className="text-yellow-700">Waiting for the driver to accept...</p>
            <p className="text-xs text-yellow-500 mt-2">Please do not refresh.</p>
          </div>
        ) : (
          <>
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
                    onClick={() => handleBookRide(ride._id)}
                    className="p-5 rounded-xl border border-gray-100 shadow-sm bg-white active:scale-95 cursor-pointer hover:shadow-md transition-all"
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
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Floating Navigation */}
      <div className="absolute bottom-0 left-0 w-full bg-white border-t p-4 flex justify-between items-center shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <button
          onClick={logout}
          className="flex flex-col items-center text-gray-400 hover:text-red-500 transition"
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