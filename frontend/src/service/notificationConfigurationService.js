import axios from "axios";

const API_URL =
  "http://localhost:8080/api/admin/notification-configuration";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// GET configuration
const getConfiguration = async () => {
  const response = await axios.get(API_URL, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// UPDATE configuration
const updateConfiguration = async (data) => {
  const response = await axios.put(API_URL, data, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export default {
  getConfiguration,
  updateConfiguration,
};
