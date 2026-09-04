import axios from "axios";

const BASE_URL = "http://localhost:8080/api/compliance";

const getToken = () => localStorage.getItem("token");

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

const ComplianceService = {
  // Get all evidence for compliance review
  getReviews: async () => {
    const response = await axios.get(
      `${BASE_URL}/reviews`,
      getHeaders()
    );
    return response.data;
  },

  // Approve or Reject evidence
  updateStatus: async (id, status) => {
    const response = await axios.put(
      `${BASE_URL}/review/${id}/${status}`,
      {},
      getHeaders()
    );
    return response.data;
  },
};

export default ComplianceService;