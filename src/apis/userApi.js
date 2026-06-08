import { Password, TrySharp } from "@mui/icons-material";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const signupUser = async (userData) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/signup/otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      credentials: 'include',
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Signup failed");
    }
    return result;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || result.message || "Login failed");
    }
    return result;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  // Placeholder for POST /logout
  console.log("Logout API called");
  return { message: "Logged out successfully" };
};

export const verifyOtp = async ({phoneNumber, name, email, password, otp, verificationId}) => {
  try{
    const response = await fetch(`${BASE_URL}/auth/signup/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber, name, email, password, otp, verificationId }),
      credentials: 'include',
    });

    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      throw new Error(`Expected JSON, but received: ${text.substring(0, 100)}...`);
    }

    const result = await response.json();
    if(!response.ok){
      throw new Error(result.message || "OTP verification failed");
    }
    return result;
  } catch (error) {
    console.log("OTP verification failed:", error);
    throw error;
}};

export const resendOtp = async ({phoneNumber, name, email, password}) => {
  try{
    const response = await fetch(`${BASE_URL}/auth/signup/otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber, name, email, password }),
      credentials: 'include',
    });
    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      throw new Error(`Expected JSON, but received: ${text.substring(0, 100)}...`);
    }

    const result = await response.json();
    if (!response.ok){
      throw new Error(result.message || "Resend OTP failed");
    }
    return result;
  }catch (error) {
    console.log("Resend OTP failed:", error);
    throw error;
}};

export const saveUserEventData = async (token, formData) => {
  try {
    const response = await fetch(`${BASE_URL}/consumers/event-data`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ formData }),
    });
    const result = await response.json().catch(() => ({}));
    return result;
  } catch { /* silently fail — localStorage is the fallback */ }
};

export const loadUserEventData = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/consumers/event-data`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      credentials: 'include',
    });
    if (!response.ok) return null;
    const result = await response.json();
    return result?.formData || null;
  } catch { return null; }
};

export const getUserProfile = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/consumers/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Include token in headers
      },
      credentials: 'include',
    });

    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(`Expected JSON, but received: ${text.substring(0, 100)}...`);
    }

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch user profile");
    }
    return result;
  } catch (error) {
    console.error("Get User Profile Error:", error);
    throw error;
  }
};