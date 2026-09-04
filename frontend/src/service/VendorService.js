import axios from "axios";

const BASE_URL = "http://localhost:8080/api/vendors";

const getToken = () => localStorage.getItem("token");

const axiosConfig = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json"
    }
});

const VendorService = {

    // Create Vendor
    createVendor: (vendor) => {
        return axios.post(BASE_URL, vendor, axiosConfig());
    },

    // Get All Vendors
    getAllVendors: () => {
        return axios.get(BASE_URL, axiosConfig());
    },

    // Get Vendor By Id
    getVendorById: (vendorId) => {
        return axios.get(`${BASE_URL}/${vendorId}`, axiosConfig());
    },

    // Get Vendors By Status
    getVendorsByStatus: (status) => {
        return axios.get(`${BASE_URL}/status/${status}`, axiosConfig());
    },

    // Get Vendors By Risk Level
    getVendorsByRiskLevel: (riskLevel) => {
        return axios.get(`${BASE_URL}/risk-level/${riskLevel}`, axiosConfig());
    },

    // Get My Vendors
    getMyVendors: () => {
        return axios.get(`${BASE_URL}/my-vendors`, axiosConfig());
    },

    // Update Vendor
    updateVendor: (vendorId, vendor) => {
        return axios.put(`${BASE_URL}/${vendorId}`, vendor, axiosConfig());
    },

    // Delete Vendor
    deleteVendor: (vendorId) => {
        return axios.delete(`${BASE_URL}/${vendorId}`, axiosConfig());
    }

};

export default VendorService;