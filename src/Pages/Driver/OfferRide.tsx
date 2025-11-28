import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { FiMapPin, FiClock, FiArrowLeft } from "react-icons/fi";

const OfferRide = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ from: "", to: "", startTime: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create ride
      await apiRequest("/rides/offer", "POST", form, token);
      // Immediately go to driver tracking/waiting page
      navigate("/driver-track");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <FiArrowLeft className="text-xl" />
        </button>
        <h1 className="text-xl font-bold">Offer a Ride</h1>
      </div>

      <div className="p-6 flex-1">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pick Up Point</label>
            <div className="relative">
              <FiMapPin className="absolute top-3 left-3 text-gray-400" />
              <input
                required
                type="text"
                className="w-full pl-10 p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Building 105"
                onChange={(e) => setForm({ ...form, from: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
            <div className="relative">
              <FiMapPin className="absolute top-3 left-3 text-blue-500" />
              <input
                required
                type="text"
                className="w-full pl-10 p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Gate 3"
                onChange={(e) => setForm({ ...form, to: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <div className="relative">
              <FiClock className="absolute top-3 left-3 text-gray-400" />
              <input
                required
                type="datetime-local"
                className="w-full pl-10 p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
            </div>
          </div>

          <button className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 transition">
            Create Ride
          </button>
        </form>
      </div>
    </div>
  );
};

export default OfferRide;