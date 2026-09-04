import axios from "axios";

const BASE_URL = "http://localhost:8080/api/compliance";

const authHeader = () => {
    const token = localStorage.getItem("token");

    console.log("COMPLIANCE REPORT TOKEN:", token);

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
};

// ============================================================
// HELPERS
// ============================================================

export const unwrap = (res) => {
    const body = res?.data;

    if (
        body &&
        typeof body === "object" &&
        Object.prototype.hasOwnProperty.call(body, "data")
    ) {
        return body.data;
    }

    return body;
};

export const pickField = (obj, ...keys) => {
    if (!obj) return "N/A";

    for (const key of keys) {
        const val = obj[key];

        if (
            val !== undefined &&
            val !== null &&
            val !== ""
        ) {
            return val;
        }
    }

    return "N/A";
};

// ============================================================
// SERVICE
// ============================================================

const complianceReportService = {

    // ========================================================
    // GET ALL COMPLIANCE REVIEWS
    //
    // Backend:
    // GET /api/compliance/reviews
    // ========================================================

    getReports() {
        return axios
            .get(
                `${BASE_URL}/reviews`,
                authHeader()
            )
            .then(unwrap);
    },

    // ========================================================
    // GET SINGLE REVIEW
    //
    // Backend does NOT have:
    // GET /api/compliance/reviews/{id}
    //
    // Therefore we get all reviews and find the required one
    // on the frontend.
    // ========================================================

    getReportById(id) {
        return axios
            .get(
                `${BASE_URL}/reviews`,
                authHeader()
            )
            .then((response) => {
                const reviews = unwrap(response) || [];

                if (!Array.isArray(reviews)) {
                    return null;
                }

                return reviews.find(
                    (review) =>
                        String(review.id) === String(id)
                ) || null;
            });
    },

    // ========================================================
    // GET BY REPORT ID
    //
    // Your current backend does NOT have a report-id endpoint.
    //
    // We search the existing reviews response instead.
    // ========================================================

    getReportByReportId(reportId) {
        return axios
            .get(
                `${BASE_URL}/reviews`,
                authHeader()
            )
            .then((response) => {
                const reviews = unwrap(response) || [];

                if (!Array.isArray(reviews)) {
                    return null;
                }

                return reviews.find(
                    (review) =>
                        String(
                            review.reviewId ??
                            review.reportId
                        ) === String(reportId)
                ) || null;
            });
    },

    // ========================================================
    // GENERATE REPORT
    //
    // IMPORTANT:
    // Your current backend DOES NOT have:
    // POST /api/compliance/reports/generate
    //
    // So don't call a non-existing backend endpoint.
    //
    // This function returns the currently available reviews
    // after applying frontend filters.
    // ========================================================

    generateReport(filters = {}) {
        return axios
            .get(
                `${BASE_URL}/reviews`,
                authHeader()
            )
            .then((response) => {

                let reviews = unwrap(response) || [];

                if (!Array.isArray(reviews)) {
                    reviews = [];
                }

                // --------------------------------------------
                // DATE FROM
                // --------------------------------------------

                if (filters.dateFrom) {
                    reviews = reviews.filter((item) => {

                        const date =
                            item.reviewDate ??
                            item.createdAt ??
                            item.createdDate ??
                            item.date;

                        if (!date) return true;

                        return (
                            String(date) >=
                            String(filters.dateFrom)
                        );
                    });
                }

                // --------------------------------------------
                // DATE TO
                // --------------------------------------------

                if (filters.dateTo) {
                    reviews = reviews.filter((item) => {

                        const date =
                            item.reviewDate ??
                            item.createdAt ??
                            item.createdDate ??
                            item.date;

                        if (!date) return true;

                        return (
                            String(date) <=
                            String(filters.dateTo)
                        );
                    });
                }

                // --------------------------------------------
                // DEPARTMENT
                // --------------------------------------------

                if (
                    filters.department &&
                    filters.department !== "ALL"
                ) {
                    reviews = reviews.filter(
                        (item) =>
                            String(
                                item.department
                            ) ===
                            String(
                                filters.department
                            )
                    );
                }

                // --------------------------------------------
                // AUDIT ID
                // --------------------------------------------

                if (
                    filters.auditId &&
                    filters.auditId !== "ALL"
                ) {
                    reviews = reviews.filter(
                        (item) =>
                            String(
                                item.auditId ??
                                item.audit?.auditId ??
                                item.audit?.id
                            ) ===
                            String(filters.auditId)
                    );
                }

                // --------------------------------------------
                // RISK LEVEL
                // --------------------------------------------

                if (
                    filters.riskLevel &&
                    filters.riskLevel !== "ALL"
                ) {
                    reviews = reviews.filter(
                        (item) =>
                            String(
                                item.riskLevel ??
                                item.risk?.riskLevel
                            ) ===
                            String(
                                filters.riskLevel
                            )
                    );
                }

                // --------------------------------------------
                // COMPLIANCE STATUS
                // --------------------------------------------

                if (
                    filters.complianceStatus &&
                    filters.complianceStatus !== "ALL"
                ) {
                    reviews = reviews.filter(
                        (item) =>
                            String(
                                item.complianceStatus ??
                                item.status
                            ) ===
                            String(
                                filters.complianceStatus
                            )
                    );
                }

                // --------------------------------------------
                // FINDING STATUS
                // --------------------------------------------

                if (
                    filters.findingStatus &&
                    filters.findingStatus !== "ALL"
                ) {
                    reviews = reviews.filter(
                        (item) =>
                            String(
                                item.findingStatus ??
                                item.finding?.status
                            ) ===
                            String(
                                filters.findingStatus
                            )
                    );
                }

                // --------------------------------------------
                // EVIDENCE STATUS
                // --------------------------------------------

                if (
                    filters.evidenceStatus &&
                    filters.evidenceStatus !== "ALL"
                ) {
                    reviews = reviews.filter(
                        (item) =>
                            String(
                                item.evidenceStatus ??
                                item.status
                            ) ===
                            String(
                                filters.evidenceStatus
                            )
                    );
                }

                return reviews;
            });
    },

    // ========================================================
    // APPROVE / REJECT
    //
    // Backend:
    // PUT /api/compliance/review/{id}/{status}
    //
    // Example:
    // PUT /api/compliance/review/1/APPROVED
    // ========================================================

    updateStatus(id, status) {
        return axios
            .put(
                `${BASE_URL}/review/${id}/${status}`,
                {},
                authHeader()
            )
            .then(unwrap);
    },

    // ========================================================
    // APPROVE
    // ========================================================

    approveReview(id) {
        return this.updateStatus(
            id,
            "APPROVED"
        );
    },

    // ========================================================
    // REJECT
    // ========================================================

    rejectReview(id) {
        return this.updateStatus(
            id,
            "REJECTED"
        );
    },

    // ========================================================
    // FILTER OPTIONS
    //
    // There is NO:
    // GET /api/compliance/reports/filters
    //
    // So get reviews and create filter options locally.
    // ========================================================

    getFilterOptions() {
        return axios
            .get(
                `${BASE_URL}/reviews`,
                authHeader()
            )
            .then((response) => {

                const reviews =
                    unwrap(response) || [];

                if (!Array.isArray(reviews)) {
                    return {
                        departments: [],
                        audits: [],
                        riskLevels: [],
                        complianceStatuses: [],
                        findingStatuses: [],
                        evidenceStatuses: [],
                    };
                }

                const unique = (values) => [
                    ...new Set(
                        values.filter(
                            (value) =>
                                value !== undefined &&
                                value !== null &&
                                value !== ""
                        )
                    ),
                ];

                return {
                    departments: unique(
                        reviews.map(
                            (item) =>
                                item.department
                        )
                    ),

                    audits: unique(
                        reviews.map(
                            (item) =>
                                item.auditId ??
                                item.audit?.auditId ??
                                item.audit?.id
                        )
                    ),

                    riskLevels: unique(
                        reviews.map(
                            (item) =>
                                item.riskLevel ??
                                item.risk?.riskLevel
                        )
                    ),

                    complianceStatuses: unique(
                        reviews.map(
                            (item) =>
                                item.complianceStatus ??
                                item.status
                        )
                    ),

                    findingStatuses: unique(
                        reviews.map(
                            (item) =>
                                item.findingStatus ??
                                item.finding?.status
                        )
                    ),

                    evidenceStatuses: unique(
                        reviews.map(
                            (item) =>
                                item.evidenceStatus ??
                                item.status
                        )
                    ),
                };
            })
            .catch((error) => {

                console.error(
                    "Failed to load compliance filter options:",
                    error
                );

                return {
                    departments: [],
                    audits: [],
                    riskLevels: [],
                    complianceStatuses: [],
                    findingStatuses: [],
                    evidenceStatuses: [],
                };
            });
    },

    // ========================================================
    // DELETE
    //
    // Backend currently has NO DELETE endpoint for compliance.
    // ========================================================

    deleteReport(id) {
        return Promise.reject(
            new Error(
                "Delete compliance report is not supported by the current backend."
            )
        );
    },

    // ========================================================
    // DOWNLOAD PDF
    //
    // Backend currently has NO PDF endpoint.
    // ========================================================

    downloadPdf(id) {
        return Promise.reject(
            new Error(
                "PDF download is not supported by the current backend."
            )
        );
    },

    // ========================================================
    // DOWNLOAD EXCEL
    //
    // Backend currently has NO Excel endpoint.
    // ========================================================

    downloadExcel(id) {
        return Promise.reject(
            new Error(
                "Excel download is not supported by the current backend."
            )
        );
    },
};

// ============================================================
// FILE SAVE HELPER
// ============================================================

export const saveBlobAsFile = (
    blobResponse,
    fileName
) => {

    const url =
        window.URL.createObjectURL(
            new Blob([
                blobResponse.data
            ])
        );

    const link =
        document.createElement("a");

    link.href = url;

    link.setAttribute(
        "download",
        fileName
    );

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
};

export default complianceReportService;