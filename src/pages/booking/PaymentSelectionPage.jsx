
// src/pages/payment/PaymentSelectionPage.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import axios from "axios";

const methods = [
  { id: "upi", label: "UPI", hint: "Google Pay, PhonePe, Paytm, BHIM" },
  { id: "card", label: "Credit/Debit Card", hint: "Visa, Mastercard, RuPay" },
  { id: "netbanking", label: "Net Banking", hint: "All major banks" },
  { id: "wallet", label: "Wallets", hint: "Paytm, Amazon, Mobikwik" },
];

export default function PaymentSelectionPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [method, setMethod] = useState("upi");
  const [loading, setLoading] = useState(false);

  const BACKEND_BASE_URL = "http://localhost:8080";
  const handleProceed = async () => {
    try {
      setLoading(true);

      // 🔹 Call backend to create order
      const res = await axios.post(
        `${BACKEND_BASE_URL}/api/payments/create-order`,
        {
          offerId: state?.booking?.offerId,
          customerId: state?.booking?.customerId,
          amount: state?.booking?.amount,
          paymentType: "BOOKING",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const { order, payment } = res.data;

      navigate("/booking/payment-processing", {
        state: {
          ...state,
          paymentId: payment._id,
          orderId: order.id,
          planName: state?.planName,
          amount: state?.booking?.amount,
        },
      });
    } catch (err) {
      console.error("Error creating order:", err);
      alert("Something went wrong while creating order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fefcf6] flex flex-col justify-between">
      <SEO title="Select Payment Method" description="Choose your payment method to complete your Tendr booking." path="/booking/payment" noIndex={true} />
      {/* Main Card */}
      <div className="flex flex-col items-center justify-center flex-grow py-10">
        <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-6xl min-h-[600px]">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2e1b0f]">
            Select Payment Method
          </h1>
          <p className="text-gray-600 mt-1">
            Choose your preferred option to complete the booking.
          </p>

          {/* Methods */}
          <div className="mt-6 space-y-3">
            {methods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`w-full flex items-center justify-between rounded-2xl border p-4 transition
                  ${method === m.id
                    ? "border-[#2e1b0f] bg-[#fefcf6]"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-3 text-left">
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${method === m.id ? "border-[#2e1b0f]" : "border-gray-300"}`}
                  >
                    {method === m.id && (
                      <span className="w-2.5 h-2.5 bg-[#2e1b0f] rounded-full" />
                    )}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900">{m.label}</div>
                    <div className="text-xs text-gray-500">{m.hint}</div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100">
                  Safe & Secure
                </span>
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-1/3 sm:w-1/4 h-11 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Back
            </button>
            <button
              onClick={handleProceed}
              className="flex-1 h-11 rounded-xl bg-[#2e1b0f] text-white font-semibold hover:bg-[#2e1b0f]/80 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Creating Order..." : "Proceed to Pay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}