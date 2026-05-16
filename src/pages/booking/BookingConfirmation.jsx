// src/pages/confirmation/BookingConfirmationPage.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SEO from "../../components/SEO";
import logo from "../../assets/logos/tendr-logo-secondary.png";
import Footer from "../../components/Footer";

const BookingConfirmationPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const booking = state?.booking;  // 🔹 backend se aayi booking
  const amount = state?.amount;    // 🔹 total payment amount

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold text-red-600">
          No booking details found. Please check your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#FFF6EF]">
      <SEO title="Booking Confirmed" description="Your Tendr event booking is confirmed." path="/booking/confirmation" noIndex={true} />
      {/* Main Container */}
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 py-10">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 text-center">
          {/* Logo */}
          <img
            src={logo}
            alt="Tendr Logo"
            className="w-40 sm:w-48 mx-auto mb-6"
          />

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2e1b0f] mb-3">
            🎉 Booking Confirmed!
          </h2>
          <p className="text-gray-700 text-base sm:text-lg mb-8">
            Your payment was successful and your booking has been confirmed.
          </p>

          {/* Booking Details */}
          <div className="bg-orange-50 rounded-xl p-5 shadow-inner text-left mb-8">
            <p className="text-gray-800 mb-1">
              <strong>Booking ID:</strong> {booking._id}
            </p>
            <p className="text-gray-800 mb-1">
              <strong>Event:</strong> {booking.offerName || "Service Booking"}
            </p>
            <p className="text-gray-800 mb-1">
              <strong>Date:</strong> {booking.schedule?.date}
            </p>
            <p className="text-gray-800 mb-1">
              <strong>Time:</strong> {booking.schedule?.timeSlot}
            </p>
            <p className="text-gray-800 mb-1">
              <strong>Vendor:</strong> {booking.vendorName || "Assigned Vendor"}
            </p>
            <p className="text-gray-800 mb-1">
              <strong>Plan:</strong> {booking.plan || "Custom Plan"}
            </p>
            <p className="text-gray-800">
              <strong>Amount Paid:</strong> ₹{amount}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition"
              onClick={() => alert("Downloading Ticket...")}
            >
              Download Ticket
            </button>
            <button
              className="flex-1 bg-[#2e1b0f] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#2e1b0f]/80 transition"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default BookingConfirmationPage;