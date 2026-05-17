// COMMENTED OUT — Corporate pre-registration not yet live
// Will be re-enabled when corporate onboarding is ready
/* eslint-disable */
import React, { useState } from "react";

export default function PreRegisterForm({ onSuccess }) {
  const [data, setData] = useState({
    name: "",
    gstNumber: "",
    phoneNumber: "",
    address: "",
    email: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const { name, gstNumber, phoneNumber, address, email } = data;
    if (!name || !gstNumber || !phoneNumber || !address || !email) {
      setError("Please fill all fields.");
      return;
    }

    // T&C notification — notification service not yet integrated
    onSuccess(data); // Proceed to full form
  };

  const inputClass =
    "border border-[#6B4226] p-3 rounded-xl text-sm text-[#6B4226] w-full";

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-xl border border-[#6B4226] space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#6B4226]">
            Contact Details
          </h2>
        </div>

        {["name", "gstNumber", "phoneNumber", "address", "email"].map(
          (field, i) => (
            <input
              key={i}
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={data[field]}
              onChange={handleChange}
              className={inputClass}
            />
          )
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-xl w-full"
        >
          Send Terms & Continue
        </button>
      </div>
    </div>
  );
}
