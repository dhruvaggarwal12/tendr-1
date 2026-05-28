const BASE_URL = import.meta.env.VITE_BASE_URL;

export const signupVendorOtp = async (phoneNumber) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/vsignup/otp`, {
      method: "POST",
      headers: {
        "Content-Type":"application/json",
      },
      body: JSON.stringify({ phoneNumber }),
      credentials: "include",
    });

    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(`Expected JSON, but received: ${text.substring(0, 100)}...`);
    }

    const result = await response.json();
    if (!response.ok) {
      if (result.errors) {
        throw new Error(JSON.stringify(result.errors));
      }
      throw new Error(result.message || "Failed to send OTP");
    }
    return result;
  } catch (error) {
    console.error("Vendor Signup OTP Error:", error);
    throw error;
  }
};

export const verifyVendorOtp = async ({ phoneNumber, otp }) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/vsignup/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber, otp }),
      credentials: "include",
    });

    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(`Expected JSON, but received: ${text.substring(0, 100)}...`);
    }

    const result = await response.json();
    if (!response.ok) {
      if (result.errors) {
        throw new Error(JSON.stringify(result.errors));
      }
      throw new Error(result.message || "OTP verification failed");
    }
    return result;
  } catch (error) {
    console.error("Vendor OTP Verification Error:", error);
    throw error;
  }
};

export const completeVendorSignup = async (vendorData) => {
  try {
    // Prepare the request body
    const body = {
      phoneNumber: vendorData.phoneNumber,
      name: vendorData.name,
      gstNumber: vendorData.gstNumber,
      teamSize: Number(vendorData.teamSize),
      locations: [vendorData.location],
      serviceType: vendorData.service === "others" ? vendorData.customService : vendorData.service,
      address: {
        street: vendorData.address,
        city: vendorData.location,
        state: vendorData.state,
      },
      yearsOfExperience: Number(vendorData.experience || 0),
      panNumber: vendorData.governmentId,
      aadhaarNumber: vendorData.aadhaarNumber,
      password: vendorData.password,
    };

    let response;
    if (vendorData.portfolioFiles && vendorData.portfolioFiles.length > 0) {
      // Use FormData if files are present
      const formData = new FormData();
      Object.entries(body).forEach(([key, value]) => {
        if (key === "address" || key === "locations") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });
      vendorData.portfolioFiles.forEach((file) => formData.append("portfolioFiles", file));

      response = await fetch(`${BASE_URL}/auth/vsignup`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
    } else {
      // Use JSON if no files
      response = await fetch(`${BASE_URL}/auth/vsignup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
    }

    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(`Expected JSON, but received: ${text.substring(0, 100)}...`);
    }

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.errors ? JSON.stringify(result.errors) : result.message || "Vendor signup failed");
    }
    return result;
  } catch (error) {
    console.error("Complete Vendor Signup Error:", error);
    throw error;
  }
};

// src/api/getVendors.js

export const getVendors = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.location) params.append('location', filters.location);
  if (filters.serviceTypes) params.append('serviceTypes', filters.serviceTypes.join(','));
  if (filters.minExperience) params.append('minExperience', filters.minExperience);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  // if (filters.serviceFilters) params.append('serviceFilters', JSON.stringify(filters.serviceFilters));
  

  try {
    const response = await fetch(`${BASE_URL}/vendors?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
    });

    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(`Expected JSON, but got: ${text.substring(0, 100)}...`);
    }

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch vendors");
    }

    return result; // includes vendors array + pagination
  } catch (error) {
    console.error("Get Vendors Error:", error);
    throw error;
  }
};


export const getVendorById = async (vendorId) => {
  try {
    const response = await fetch(`${BASE_URL}/vendors/${vendorId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
    });

    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(`Expected JSON, but got: ${text.substring(0, 100)}...`);
    }

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch vendor details");
    }

    return result; // returns vendor details
  } catch (error) {
    console.error("Get Vendor By ID Error:", error);
    throw error;
  }
}

export const getSmartPlan = async ({ eventType, guests, budget, location, categories }) => {
  const params = new URLSearchParams({
    eventType: eventType || '',
    guests: guests || '',
    budget: budget || '',
    location: location || '',
    categories: Array.isArray(categories) ? categories.join(',') : (categories || ''),
  });
  const response = await fetch(`${BASE_URL}/vendors/smart-plan?${params}`);
  if (!response.ok) throw new Error('Failed to fetch smart plan');
  return response.json();
};
