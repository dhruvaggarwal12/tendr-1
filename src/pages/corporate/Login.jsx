import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginbackground from "../../assets/backgrounds/login-bg.png";
import logo from "../../assets/logos/tendr-logo-secondary.png";
import Footer from "../../components/Footer";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const CorporateLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BASE_URL}/auth/corporate/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      localStorage.setItem("corporate_token", data.token);
      localStorage.setItem("corporate_consumer", JSON.stringify(data.consumer));

      navigate("/corporate/dashboard");
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpClick = () => {
    navigate("/corporate-signup");
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    console.log("Forgot password clicked");
  };

  return (
    <div
      className="w-screen min-h-screen flex flex-col bg-cover bg-center relative"
      style={{ 
        backgroundImage: `url(${loginbackground})`,
        backgroundColor: '#FFF8DC' // Soft light beige background
      }}
    >
      {/* Subtle floral pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30 z-0" />

             <div className="flex-grow flex items-center justify-center px-4 pt-4 relative z-10">
         <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
           {/* Logo and Tagline */}
           <div className="flex justify-center mb-8">
             <div className="text-center">
               <img
                 src={logo}
                 alt="tendr logo"
                 className="w-40 h-auto mb-2"
               />
               <p className="text-sm text-gray-600 font-medium">WE CURATE YOU CELEBRATE</p>
             </div>
           </div>

           <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
             Corporate Login
           </h2>

          {error && (
            <div className="text-red-500 text-sm text-center mb-6 bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

                     <form className="space-y-6" onSubmit={handleSubmit}>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Email
               </label>
               <input
                 type="email"
                 name="email"
                 value={formData.email}
                 onChange={handleChange}
                 className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                 placeholder="Enter your corporate email"
                 disabled={loading}
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Password
               </label>
               <input
                 type="password"
                 name="password"
                 value={formData.password}
                 onChange={handleChange}
                 className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                 placeholder="Enter your password"
                 disabled={loading}
               />
             </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 focus:ring-2"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700 font-medium">
                  Remember me
                </span>
              </label>
              
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
              >
                Forgot Password?
              </button>
            </div>

                                                   <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className={`text-white text-sm font-semibold rounded-lg w-full py-3 transition-all ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 hover:scale-[1.02]'
                  }`}
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </div>
           </form>

           <div className="mt-6 flex flex-col items-center justify-center text-xs text-gray-600 font-medium gap-1 bg-gray-50 rounded-lg p-3 border border-gray-200">
             <span>Don't have a corporate account?</span>
             <button
               onClick={handleSignUpClick}
               className="text-amber-600 hover:text-amber-800 hover:underline cursor-pointer transition-colors font-semibold"
             >
               Sign Up
             </button>
           </div>

           <div className="mt-4 text-center">
             <button
               onClick={() => navigate("/login")}
               className="text-xs text-gray-500 hover:text-gray-700 hover:underline cursor-pointer transition-colors flex items-center justify-center mx-auto"
             >
               <span className="mr-1">←</span> Back to regular login
             </button>
           </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CorporateLogin; 