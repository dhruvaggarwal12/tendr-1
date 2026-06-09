// src/pages/confirmation/BookingConfirmationPage.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import SEO from "../../components/SEO";
import logo from "../../assets/logos/tendr-logo-secondary.png";
import Footer from "../../components/Footer";
import { confirmVendorSlot } from "../../apis/vendorApi";
import {
  generateInvoicePDF,
  generateEventDetailsPDF,
  generateTimelinePDF,
  generateInvitationPDF,
} from "../../utils/pdfGenerator";

const BookingConfirmationPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const booking = state?.booking;
  const amount = state?.amount;
  const token = useSelector(s => s.auth.token);
  const authUser = useSelector(s => s.auth.user);
  const formData = useSelector(s => s.eventPlanning?.formData || {});

  // Confirm the held slot now that payment is done
  useEffect(() => {
    if (!booking) return;
    const vendorId = booking.vendorId || booking.vendor?._id;
    if (!vendorId) return;
    const held = (() => { try { return JSON.parse(localStorage.getItem(`tendr:held:${vendorId}`) || "null"); } catch { return null; } })();
    if (!held) return;
    confirmVendorSlot(vendorId, held.date, held.slot, booking._id, token);
    localStorage.removeItem(`tendr:held:${vendorId}`);
  }, [booking]);

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold text-red-600">
          No booking details found. Please check your dashboard.
        </p>
      </div>
    );
  }

  const userName = authUser?.name || authUser?.email || "Customer";

  const eventSummary = {
    eventType: formData.eventType || booking.offerName,
    date: formData.date || booking.schedule?.date,
    location: formData.location,
    guests: formData.guests,
  };

  const confirmedVendors = booking.vendorName
    ? [{ name: booking.vendorName, serviceType: booking.serviceType || "Vendor" }]
    : [];

  const pdfDocs = [
    {
      label: "Invoice",
      desc: "Payment receipt",
      fn: () => generateInvoicePDF({
        eventSummary,
        confirmedVendors,
        amount,
        orderId: booking._id,
        paymentId: booking.paymentId,
        userName,
      }),
    },
    {
      label: "Event Details",
      desc: "Vendor summary",
      fn: () => generateEventDetailsPDF({
        eventSummary,
        confirmedVendors,
        pinnedMessages: {},
        userName,
        orderId: booking._id,
        vendorPricing: {},
      }),
    },
    {
      label: "Day Schedule",
      desc: "Timeline slip",
      fn: () => generateTimelinePDF({
        slots: [],
        eventSummary,
        userName,
      }),
    },
    {
      label: "Invitation",
      desc: "Share with guests",
      fn: () => generateInvitationPDF({
        eventSummary,
        confirmedVendors,
        userName,
      }),
    },
  ];

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
            Booking Confirmed!
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
              <strong>Amount Paid:</strong> Rs. {amount}
            </p>
          </div>

          {/* Download Documents */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-[#2e1b0f] mb-3 text-left">Download Documents</p>
            <div className="grid grid-cols-2 gap-3">
              {pdfDocs.map(({ label, desc, fn }) => (
                <button
                  key={label}
                  onClick={fn}
                  className="bg-[#FFF8EE] border border-[#C47A2E]/30 rounded-xl p-3 text-left hover:bg-[#FFF0D6] active:scale-95 transition"
                >
                  <div className="font-semibold text-[#2e1b0f] text-sm">{label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dashboard */}
          <button
            className="w-full bg-[#2e1b0f] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#2e1b0f]/80 transition"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default BookingConfirmationPage;
