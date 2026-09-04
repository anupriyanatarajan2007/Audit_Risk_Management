import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// LOGIN
// ============================================================
export const login = async (data) => {
  const response = await API.post("/login", data);

  console.log("LOGIN RESPONSE:", response.data);

  const responseData = response.data?.data || response.data;

  const token =
    responseData?.token ||
    response.data?.token ||
    null;

  const user =
    responseData?.user ||
    responseData?.profile ||
    response.data?.user ||
    null;

  if (token) {
    localStorage.setItem("token", token);
  }

  if (user) {
    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    localStorage.setItem(
      "currentUser",
      JSON.stringify(user)
    );
  }

  return response;
};


// ============================================================
// REGISTER
// ============================================================
export const register = (data) => {
  const token = localStorage.getItem("token");

  return API.post("/register", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


// ============================================================
// FORGOT PASSWORD
// ============================================================
export const forgotPassword = (email) => {
  return API.post("/forgot-password", {
    email,
  });
};


// ============================================================
// VERIFY OTP
// ============================================================
export const verifyOtp = (data) => {
  return API.post("/verify-otp", data);
};


// ============================================================
// RESET PASSWORD
// ============================================================
export const resetPassword = (data) => {
  return API.post("/reset-password", data);
};


// ============================================================
// GET USERS BY ROLE
// Example:
// /users/by-role/INTERNAL_AUDITOR
// ============================================================
export const getUsersByRole = (role) => {

  const token = localStorage.getItem("token");

  return API.get(`/users/by-role/${role}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


// ============================================================
// UPDATE USER
// Example:
// /users/1
// ============================================================
export const updateUser = (id, data) => {

  const token = localStorage.getItem("token");

  return API.put(`/users/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


// ============================================================
// GET PROFILE
// ============================================================
export const getProfile = async () => {

  const token = localStorage.getItem("token");

  const response = await API.get("/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};


// ============================================================
// GET ALL USERS
// ============================================================
export const getAllUsers = () => {

  const token = localStorage.getItem("token");

  return API.get("/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};