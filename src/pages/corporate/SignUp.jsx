import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/logos/tendr-logo-secondary.png";
// import TendrPremiumBanner from "../../components/TendrPremiumBanner";
import PricingPlans from "../../components/PricingPlans";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const TEAM_SIZE_TO_COMPANY_SIZE = {
  "1-10": "SMALL",
  "11-50": "MEDIUM",
  "51-100": "MEDIUM",
  "101-500": "LARGE",
  "500+": "ENTERPRISE",
};

export default function CorporateSignup() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialPlan = location.state?.plan;
  
  // Plan details mapping
  const planDetails = {
    "Basic Plan": {
      title: "Basic Plan",
      price: "Free",
      tagline: "Ideal for Small Teams",
      features: ["Full vendor access", "Self-service booking", "24/7 support"],
      mandatoryAddon: "Basic event coordination",
      optionalAddons: ["Premium vendor access", "Advanced analytics", "Custom branding"]
    },
    "Pro Plan": {
      title: "Pro Plan",
      price: "₹12,000/year",
      tagline: "Growing Companies",
      features: ["Everything in Basic", "Priority support", "Real-time dashboard"],
      mandatoryAddon: "Professional event coordination",
      optionalAddons: ["Dedicated coordinator", "Custom integrations", "Priority booking"]
    },
    "Elite Plan": {
      title: "Elite Plan",
      price: "₹18,000/year",
      tagline: "Premium Management",
      features: ["Everything in Pro", "Dedicated coordinator", "All add-ons included"],
      mandatoryAddon: "Premium event coordination",
      optionalAddons: ["On-site support", "Custom reporting", "White-label options"]
    }
  };

  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [formData, setFormData] = useState({
    companyName: "",
    location: "",
    personName: "",
    designation: "",
    email: "",
    phone: "",
    teamSize: "",
    industry: "",
    annualEvents: "",
    plan: "",
    password: "",
    confirmPassword: "",
    gstNumber: "",
    gstRegistrationType: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Update selected plan when plan dropdown changes
    if (name === 'plan' && value) {
      setSelectedPlan(planDetails[value]);
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) newErrors.companyName = "Required";
    if (!formData.location.trim()) newErrors.location = "Required";
    if (!formData.personName.trim()) newErrors.personName = "Required";
    if (!formData.designation.trim()) newErrors.designation = "Required";
    if (!formData.email.trim()) newErrors.email = "Required";
    if (!formData.phone.trim()) newErrors.phone = "Required";
    if (!formData.teamSize) newErrors.teamSize = "Required";
    if (!formData.industry) newErrors.industry = "Required";
    if (!formData.annualEvents) newErrors.annualEvents = "Required";
    if (!formData.plan) newErrors.plan = "Required";
    if (!formData.password) newErrors.password = "Required";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords don't match";
    if (!formData.gstNumber.trim()) newErrors.gstNumber = "Required";
    if (!formData.gstRegistrationType) newErrors.gstRegistrationType = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        gstNumber: formData.gstNumber,
        companySize: TEAM_SIZE_TO_COMPANY_SIZE[formData.teamSize] || "SMALL",
        contactPerson: {
          name: formData.personName,
          phone: formData.phone,
          designation: formData.designation,
        },
      };

      const res = await fetch(`${BASE_URL}/auth/corporate/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.message || "Registration failed. Please try again.");
        return;
      }

      // Store extra fields not in the backend schema in localStorage
      localStorage.setItem("corporatePlan", JSON.stringify({
        plan: formData.plan,
        industry: formData.industry,
        annualEvents: formData.annualEvents,
        location: formData.location,
        gstRegistrationType: formData.gstRegistrationType,
        signupDate: new Date().toISOString(),
      }));

      // Store JWT for subsequent login
      if (data.token) {
        localStorage.setItem("corporate_token", data.token);
        localStorage.setItem("corporate_consumer", JSON.stringify(data.consumer));
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Signup error:", err);
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-screen min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FFF8DC' }}>
        <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 text-center">
          <img src={logo} alt="tendr logo" className="w-36 h-auto mx-auto mb-6" />
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Request Received!</h2>
          <p className="text-gray-600 mb-2">
            Thank you for signing up with Tendr Corporate.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Our team will verify your details and reach out within 1–2 business days to get you set up.
          </p>
          <button
            onClick={() => navigate("/corporate/login")}
            className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-semibold rounded-xl px-8 py-3 hover:from-amber-600 hover:to-yellow-700 transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-screen min-h-screen flex flex-col bg-cover bg-center relative"
      style={{
        backgroundColor: '#FFF8DC'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30 z-0" />

      <div className="flex-grow flex items-center justify-center px-4 pt-4 relative z-10">
        <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-4xl border border-gray-100">
          {/* Header */}
          <div className="flex justify-center mb-6">
            <div className="text-center">
              <img
                src={logo}
                alt="tendr logo"
                className="w-44 h-auto mb-1"
              />
            </div>
          </div>

          <h2 className="text-xl font-bold text-center mb-6 text-gray-800">
            Corporate Signup - Selected Plan
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Plan Details */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-lg font-bold text-amber-600 mb-4">Selected Plan Details</h3>
              {selectedPlan && planDetails[selectedPlan.title || selectedPlan] ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {/* Plan Header */}
                  <div className="text-center p-4 bg-white rounded-lg border border-amber-200">
                    <h4 className="text-xl font-bold text-amber-600 mb-2">{selectedPlan.title}</h4>
                    <div className="text-2xl font-bold text-amber-500 mb-2">{selectedPlan.price}</div>
                    <p className="text-gray-600 text-sm">{selectedPlan.tagline}</p>
                  </div>

                  {/* Features */}
                  <div className="bg-white p-4 rounded-lg border border-amber-200">
                    <h5 className="font-bold text-gray-800 mb-3">Plan Features:</h5>
                    <div className="space-y-2">
                      {selectedPlan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mandatory Add-on */}
                  <div className="bg-white p-4 rounded-lg border border-amber-200">
                    <h5 className="font-bold text-gray-800 mb-2">Mandatory Add-on:</h5>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm">{selectedPlan.mandatoryAddon}</span>
                    </div>
                  </div>

                  {/* Optional Add-ons */}
                  <div className="bg-white p-4 rounded-lg border border-amber-200">
                    <h5 className="font-bold text-gray-800 mb-2">Optional Add-ons:</h5>
                    <div className="space-y-2">
                      {selectedPlan.optionalAddons.map((addon, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{addon}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">No plan selected</p>
                  <p className="text-gray-400 text-xs">Please select a plan from the pricing section below</p>
                </div>
              )}
            </div>

            {/* Right Column - Signup Form */}
            <div>
              {submitError && (
                <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                  {submitError}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                        errors.companyName ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter company name"
                    />
                    {errors.companyName && (
                      <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                        errors.location ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter location"
                    />
                    {errors.location && (
                      <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="personName"
                      value={formData.personName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                        errors.personName ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter your name"
                    />
                    {errors.personName && (
                      <p className="text-red-500 text-xs mt-1">{errors.personName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Designation *
                    </label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                        errors.designation ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter designation"
                    />
                    {errors.designation && (
                      <p className="text-red-500 text-xs mt-1">{errors.designation}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                        errors.email ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter email"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                        errors.phone ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter phone"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Team Size *
                    </label>
                    <select
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                        errors.teamSize ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">Select Team Size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-100">51-100 employees</option>
                      <option value="101-500">101-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                    {errors.teamSize && (
                      <p className="text-red-500 text-xs mt-1">{errors.teamSize}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Industry *
                    </label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                        errors.industry ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">Select Industry</option>
                      <option value="technology">Technology</option>
                      <option value="finance">Finance</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education</option>
                      <option value="retail">Retail</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="consulting">Consulting</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.industry && (
                      <p className="text-red-500 text-xs mt-1">{errors.industry}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Annual Events *
                  </label>
                  <select
                    name="annualEvents"
                    value={formData.annualEvents}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                      errors.annualEvents ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select Frequency</option>
                    <option value="4">4 events/year (Quarterly)</option>
                    <option value="6">6 events/year (Bi-monthly)</option>
                    <option value="12">12 events/year (Monthly)</option>
                    <option value="24">24+ events/year (Bi-weekly)</option>
                  </select>
                  {errors.annualEvents && (
                    <p className="text-red-500 text-xs mt-1">{errors.annualEvents}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Plan *
                  </label>
                  <select
                    name="plan"
                    value={formData.plan}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                      errors.plan ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select Plan</option>
                    <option value="Basic Plan">Basic Plan - Free</option>
                    <option value="Pro Plan">Pro Plan - ₹12,000/year</option>
                    <option value="Elite Plan">Elite Plan - ₹18,000/year</option>
                  </select>
                  {errors.plan && (
                    <p className="text-red-500 text-xs mt-1">{errors.plan}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    GST Number *
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                      errors.gstNumber ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter GST Number"
                  />
                  {errors.gstNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.gstNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    GST Registration Type *
                  </label>
                  <select
                    name="gstRegistrationType"
                    value={formData.gstRegistrationType}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                      errors.gstRegistrationType ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select GST Registration Type</option>
                    <option value="regular">Regular</option>
                    <option value="composition">Composition</option>
                    <option value="unregistered">Unregistered</option>
                  </select>
                  {errors.gstRegistrationType && (
                    <p className="text-red-500 text-xs mt-1">{errors.gstRegistrationType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                      errors.confirmPassword ? 'border-red-500' : ''
                    }`}
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`text-white text-lg font-semibold rounded-xl px-12 py-4 transition-all ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 hover:scale-[1.02]'
                    }`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>


        

      {/* Exclusive Corporate Perks */}
      <div className="w-full py-20 px-4 relative overflow-hidden" style={{ backgroundColor: '#FFF8DC' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-amber-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-amber-300 rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full mx-auto"></div>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6 leading-tight">
              Exclusive Corporate Perks
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the unique benefits that make Tendr the preferred choice for corporate event planning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Centralized Vendor Access */}
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-amber-100 hover:shadow-2xl hover:scale-105 transition-all duration-500 hover:border-amber-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-amber-600 mb-4 group-hover:text-amber-700 transition-colors duration-300">Centralized Vendor Access</h3>
              <p className="text-gray-700 leading-relaxed">
                One platform to book decorators, caterers, anchors, and entertainers without back-and-forth.
              </p>
            </div>

            {/* Professional Planning */}
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-amber-100 hover:shadow-2xl hover:scale-105 transition-all duration-500 hover:border-amber-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-amber-600 mb-4 group-hover:text-amber-700 transition-colors duration-300">Professional Planning</h3>
              <p className="text-gray-700 leading-relaxed">
                Dedicated planning support with event execution & communication handled for you.
              </p>
            </div>

            {/* 24/7 HR Support */}
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-amber-100 hover:shadow-2xl hover:scale-105 transition-all duration-500 hover:border-amber-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-amber-600 mb-4 group-hover:text-amber-700 transition-colors duration-300">24/7 HR Support</h3>
              <p className="text-gray-700 leading-relaxed">
                Your company representative or HR can reach out to us anytime, stress-free.
              </p>
            </div>

            {/* Budget Friendly */}
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-amber-100 hover:shadow-2xl hover:scale-105 transition-all duration-500 hover:border-amber-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-amber-600 mb-4 group-hover:text-amber-700 transition-colors duration-300">Budget Friendly</h3>
              <p className="text-gray-700 leading-relaxed">
                Plans starting under ₹2000/month — with transparent, flexible billing.
              </p>
            </div>

            {/* Custom Branding */}
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-amber-100 hover:shadow-2xl hover:scale-105 transition-all duration-500 hover:border-amber-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-amber-600 mb-4 group-hover:text-amber-700 transition-colors duration-300">Custom Branding</h3>
              <p className="text-gray-700 leading-relaxed">
                Flyers, shoutouts, team visuals, and memorabilia — all tailored to your event.
              </p>
            </div>

            {/* Hassle-Free Execution */}
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-amber-100 hover:shadow-2xl hover:scale-105 transition-all duration-500 hover:border-amber-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-amber-600 mb-4 group-hover:text-amber-700 transition-colors duration-300">Hassle-Free Execution</h3>
              <p className="text-gray-700 leading-relaxed">
                No more tracking vendors. Our team manages on-ground operations and delivery.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tendr Premium Promotional Banner */}
      {/* <TendrPremiumBanner /> */}

      {/* Pricing Plans */}
      <PricingPlans />


    </div>
  );
}
