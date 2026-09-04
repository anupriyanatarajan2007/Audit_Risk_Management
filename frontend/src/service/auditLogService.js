import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/audit-logs";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Get all audit logs
export const getAllAuditLogs = async () => {
  const response = await api.get("");
  return response.data;
};

// Get logs by user
export const getAuditLogsByUser = async (userId) => {
  const response = await api.get(`/user/${userId}`);
  return response.data;
};

// Get logs by module
export const getAuditLogsByModule = async (module) => {
  const response = await api.get(
    `/module/${encodeURIComponent(module)}`
  );

  return response.data;
};

// Get logs by action
export const getAuditLogsByAction = async (action) => {
  const response = await api.get(
    `/action/${encodeURIComponent(action)}`
  );

  return response.data;
};