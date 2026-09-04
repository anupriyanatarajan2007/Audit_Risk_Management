import axios from "axios";

const BASE_URL = "http://localhost:8080/api/report-generator";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const ReportGeneratorService = {

  // Download PDF
  downloadPdf(reportId) {
    return axios.get(`${BASE_URL}/pdf/${reportId}`, {
      ...authHeader(),
      responseType: "blob",
    });
  },

  // Download Word
  downloadWord(reportId) {
    return axios.get(`${BASE_URL}/word/${reportId}`, {
      ...authHeader(),
      responseType: "blob",
    });
  },

  // Save PDF in server
  savePdf(reportId) {
    return axios.get(
      `${BASE_URL}/pdf/save/${reportId}`,
      authHeader()
    );
  },

  // Save Word in server
  saveWord(reportId) {
    return axios.get(
      `${BASE_URL}/word/save/${reportId}`,
      authHeader()
    );
  },

};

export default ReportGeneratorService;