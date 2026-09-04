import axios from "axios";

const API_URL = "http://localhost:8080/api/reports";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const ReportService = {

  // ================= CREATE =================
  createReport(report) {
    return axios.post(API_URL, report, authHeader());
  },

  // ================= GET ALL =================
  getAllReports() {
    return axios.get(API_URL, authHeader());
  },

  // ================= GET BY DATABASE ID =================
  getReportById(id) {
    return axios.get(`${API_URL}/${id}`, authHeader());
  },

  // ================= GET BY REPORT ID =================
  getReportByReportId(reportId) {
    return axios.get(`${API_URL}/code/${reportId}`, authHeader());
  },

  // ================= UPDATE =================
  updateReport(id, report) {
    return axios.put(`${API_URL}/${id}`, report, authHeader());
  },

  // ================= DELETE =================
  deleteReport(id) {
    return axios.delete(`${API_URL}/${id}`, authHeader());
  },

  // ================= GET BY USER =================
  getReportsByUser(userId) {
    return axios.get(`${API_URL}/user/${userId}`, authHeader());
  },

  // ================= GET BY TYPE =================
  getReportsByType(type) {
    return axios.get(`${API_URL}/type/${type}`, authHeader());
  },

  // ================= GET BY STATUS =================
  getReportsByStatus(status) {
    return axios.get(`${API_URL}/status/${status}`, authHeader());
  },

  // ================= GET BY RISK =================
  getReportsByRisk(riskId) {
    return axios.get(`${API_URL}/risk/${riskId}`, authHeader());
  },

  // ================= GET BY KRI =================
  getReportsByKri(kriId) {
    return axios.get(`${API_URL}/kri/${kriId}`, authHeader());
  },

  // ================= GET BY MITIGATION =================
  getReportsByMitigation(mitigationId) {
    return axios.get(`${API_URL}/mitigation/${mitigationId}`, authHeader());
  },

  // ================= SEARCH =================
  searchReports(keyword) {
    return axios.get(
      `${API_URL}/search?keyword=${encodeURIComponent(keyword)}`,
      authHeader()
    );
  },

  // ================= DATE FILTER =================
  getReportsBetweenDates(start, end) {
    return axios.get(
      `${API_URL}/between?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
      authHeader()
    );
  },

  // ================= LATEST REPORTS =================
  getLatestReports() {
    return axios.get(`${API_URL}/latest`, authHeader());
  },

  // ================= DASHBOARD =================
  getDashboard() {
    return axios.get(`${API_URL}/dashboard`, authHeader());
  }

};

export default ReportService;