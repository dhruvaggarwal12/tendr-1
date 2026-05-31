import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  verifyOtpAction,
  resendOtpAction,
  clearError,
} from "../../redux/authSlice";
import logo from "../../assets/logos/tendr-logo-secondary.png";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import Footer from "../../components/Footer";

const OTPPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [localError, setLocalError] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { verificationId, userData, loading, error } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    const corporateData = localStorage.getItem("corporatePlan");
    const isReduxUser = verificationId && userData?.phoneNumber;
    if (!corporateData && !isReduxUser) {
      navigate("/signup");
    }
  }, [verificationId, userData, navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleChange = (e) => {
    const value = e.target.value;
    const index = e.target.dataset.index;

    if (value.length > 1) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-input-${parseInt(index) + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "") {
      if (index > 0) {
        document.getElementById(`otp-input-${index - 1}`).focus();
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) {
      setLocalError("Please enter the complete 6-digit OTP");
      return;
    }
    setLocalError("");

    // Corporate flow still uses mock OTP
    const corporateData = localStorage.getItem("corporatePlan");
    if (corporateData) {
      setLocalLoading(true);
      const expected = localStorage.getItem("corporateOtp");
      if (finalOtp === expected) {
        localStorage.removeItem("corporateOtp");
        localStorage.setItem("corporateLogin", JSON.stringify({ loginTime: new Date().toISOString() }));
        navigate("/corporate/dashboard");
      } else {
        setLocalError("Invalid OTP. Please try again.");
      }
      setLocalLoading(false);
      return;
    }

    // Real OTP verification via backend
    const result = await dispatch(verifyOtpAction({
      phoneNumber: userData.phoneNumber,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      otp: finalOtp,
      verificationId,
    }));
    if (result.meta.requestStatus === "fulfilled") {
      navigate("/dashboard");
    } else {
      setLocalError(result.payload || "Invalid OTP. Please try again.");
    }
  };

  const handleResend = () => {
    setTimeLeft(60);
    setCanResend(false);
    setLocalError("");
    setOtp(["", "", "", "", "", ""]);
    const corporateData = localStorage.getItem("corporatePlan");
    if (corporateData) {
      const generated = String(Math.floor(100000 + Math.random() * 900000));
      localStorage.setItem("corporateOtp", generated);
      console.info("Corporate OTP (dev):", generated);
    } else {
      dispatch(clearError());
      dispatch(resendOtpAction());
    }
  };

  return (
    <div className="w-screen min-h-screen flex flex-col bg-[#E8DED1]" style={{ position: "relative" }}>
      <BasicSpeedDial/>
      {/* Back arrow — mobile only */}
      <button onClick={() => navigate(-1)} className="auth-back-btn" style={{ display: "none", position: "fixed", top: 14, left: 14, zIndex: 100, width: 36, height: 36, borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "rgba(255,252,245,0.95)", cursor: "pointer", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#6B3A1F" }}>←</button>
      <style>{`@media(max-width:767px){ .auth-back-btn { display: flex !important; } }`}</style>
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-[#F7F4EF] rounded-2xl shadow-lg w-[454px] h-[530px] p-6 flex flex-col items-center">
          <img
            src={logo}
            alt="Tendr Logo"
            className="w-[325px] h-[106px] mb-4"
          />

          <div className="w-[424px] h-[312px] flex flex-col items-center">
            <h2 className="text-xl font-bold text-center mb-2">
              OTP verification
            </h2>
            <p className="text-sm text-center text-gray-700 font-bold mb-4">
              Please enter the OTP (One-Time Password) sent to your registered
              phone number to complete your verification.
            </p>
            {(error || localError) && (
              <div className="text-red-500 text-sm text-center mb-4">
                {localError || error}
              </div>
            )}
            <form onSubmit={handleVerify} className="space-y-4 w-full">
              <div className="flex justify-evenly gap-2 mb-1">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={handleChange}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    id={`otp-input-${index}`}
                    data-index={index}
                    className="w-9 h-10 text-center text-xl border border-yellow-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    disabled={loading || localLoading}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-700 font-medium px-1">
                <span>
                  Remaining Time:{" "}
                  <span className="text-yellow-600 font-bold">
                    00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
                  </span>
                </span>
                <span>
                  Didn't get the code?{" "}
                  <button
                    type="button"
                    className={`font-semibold hover:underline ${
                      canResend ? "text-yellow-600" : "text-gray-400"
                    }`}
                    onClick={handleResend}
                    disabled={!canResend || loading || localLoading}
                  >
                    Resend
                  </button>
                </span>
              </div>
              <div className="flex justify-center mt-2">
                <button
                  type="submit"
                  className="text-white font-semibold rounded-xl w-[137px] h-[37px]"
                  style={{ backgroundColor: "#CCAB4A" }}
                  disabled={loading || localLoading}
                >
                  {loading || localLoading ? "Verifying..." : "Verify"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  );
};

export default OTPPage;
