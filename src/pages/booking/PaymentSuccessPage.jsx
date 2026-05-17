// src/pages/payment/PaymentSuccessPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearFinalisedVendor, clearVendorCompare } from "../../redux/listingFiltersSlice";
import SEO from "../../components/SEO";
import logo from "../../assets/logos/tendr-logo-secondary.png";
import Footer from "../../components/Footer";
import HamburgerNav from "../../components/HamburgerNav";
import { generateReferralCode, formatCode, DISCOUNT_PERCENT } from "../../utils/referral";

const PaymentSuccessPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { bookingDetails, orderId, paymentId, amount } = state || {};
  const [booking, setBooking] = useState(null);
  const user = useSelector((s) => s.auth.user);
  const referralCode = user?._id ? formatCode(generateReferralCode(user._id)) : null;
  const [referralCopied, setReferralCopied] = useState(false);
  useEffect(() => {
    // Clear finalised vendors + saved vendors — booking is complete
    dispatch(clearFinalisedVendor());
    dispatch(clearVendorCompare());
    // Close active vendor conversations now that payment is done
    const token = localStorage.getItem("tendr_token");
    if (token) {
      fetch(`${import.meta.env.VITE_BASE_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })
        .then(r => r.json())
        .then(data => {
          (data.conversations || [])
            .filter(c => c.chatType === "vendor" && c.chatApproved)
            .forEach(c => {
              fetch(`${import.meta.env.VITE_BASE_URL}/conversations/${c._id}/close`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
              }).catch(() => {});
            });
        })
        .catch(() => {});
    }
    // EventPlan flow — payment already verified and EventPlan updated in verify-plan-payment
    setBooking({
      _id: state?.eventPlanId || state?.orderId || state?.paymentId || "CONFIRMED",
      confirmed: true,
    });
  }, [bookingDetails, paymentId, navigate, state]);

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF6EF]">
        <h2 className="text-xl font-bold text-[#2e1b0f]">
          Finalizing your booking...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#FFF6EF]">
      <SEO title="Payment Successful" description="Your Tendr booking payment was successful." path="/booking/payment-success" noIndex={true} />
      <HamburgerNav />
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-green-700 mb-3">
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
            {bookingDetails?.eventName && (
              <p className="text-gray-800 mb-1"><strong>Event:</strong> {bookingDetails.eventName}</p>
            )}
            {bookingDetails?.schedule?.date && (
              <p className="text-gray-800 mb-1"><strong>Date:</strong> {bookingDetails.schedule.date}</p>
            )}
            {bookingDetails?.schedule?.timeSlot && (
              <p className="text-gray-800 mb-1"><strong>Time:</strong> {bookingDetails.schedule.timeSlot}</p>
            )}
            {bookingDetails?.service && (
              <p className="text-gray-800 mb-1"><strong>Plan:</strong> {bookingDetails.service}</p>
            )}
            {amount && (
              <p className="text-gray-800"><strong>Amount Paid:</strong> ₹{amount}</p>
            )}
          </div>

          {/* Referral Code */}
          {referralCode && (
            <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", borderRadius: 16, padding: "20px 22px", marginBottom: 24, textAlign: "left" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#CCAB4A", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>🎁 Share & Save — Your Referral Code</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "0.1em", fontFamily: "'Courier New', monospace" }}>{referralCode}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(referralCode); setReferralCopied(true); setTimeout(() => setReferralCopied(false), 2000); }}
                  style={{ padding: "5px 14px", borderRadius: 8, border: "1.5px solid rgba(204,171,74,0.4)", background: referralCopied ? "rgba(204,171,74,0.2)" : "transparent", color: "#CCAB4A", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {referralCopied ? "✓ Copied!" : "Copy"}
                </button>
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.55 }}>
                Share this code with friends — they get {DISCOUNT_PERCENT}% off their first Tendr booking. Your code is always the same, saved to your dashboard.
              </p>
            </div>
          )}

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
      <Footer/>
    </div>
  );
};

export default PaymentSuccessPage;