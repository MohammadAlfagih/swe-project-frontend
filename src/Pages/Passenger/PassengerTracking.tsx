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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Poll logic
  useEffect(() => {
    const fetchRide = async () => {
      try {
        const data = await apiRequest(
          "/rides/my-active-ride",
          "GET",
          null,
          token,
        );
        if (data) {
          setRide(data);
          setErrorMsg(null);
        } else {
          navigate("/");
        }
      } catch (err: any) {
        setErrorMsg(
          err.message || "Failed to fetch ride status. Reconnecting...",
        );
      }
    };

    // Polling simulation
    const interval = setInterval(fetchRide, 3000);
    return () => clearInterval(interval);
  }, [token, navigate]);

  const submitRating = async () => {
    if (!ride) return;
    try {
      await apiRequest(
        "/users/rate",
        "POST",
        { userId: ride.driver._id, rating },
        token,
      );
      navigate("/");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit rating. Please try again.");
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

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Ride in Progress
        </h2>
        <p className="text-gray-500 mb-6">
          Sit back and relax! Your driver is taking you to your destination.
        </p>
        {errorMsg && (
            <p className="text-sm font-medium text-red-500 mb-4 bg-red-50 p-2 rounded-lg border border-red-100">
                {errorMsg}
            </p>
        )}

        <div className="border-t pt-6">
          <p className="text-sm font-bold text-gray-400 mb-4">
            RATING (Simulated End)
          </p>
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
