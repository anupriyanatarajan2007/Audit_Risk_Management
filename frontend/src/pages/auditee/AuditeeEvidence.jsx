// src/pages/auditee/AuditeeEvidence.jsx

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Search,
    Upload,
    FileText,
    Eye,
    Trash2,
    X,
    RefreshCw,
    CheckCircle2,
    Clock3,
    XCircle,
    ClipboardList,
    AlertCircle,
    FileWarning,
} from "lucide-react";

import {
    uploadEvidence,
    getEvidenceByAudit,
    deleteEvidence,
} from "../../service/EvidenceService";

import {
    getMyAuditeeAudits,
} from "../../service/AuditService";

import {
    getFindingsByAuditId,
} from "../../service/FindingService";

// ============================================================
// CONSTANTS
// ============================================================

const STATUS_OPTIONS = [
    "PENDING",
    "APPROVED",
    "REJECTED",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const FILE_BASE_URL = "http://localhost:8080";

// ============================================================
// COMMON ID HELPER
// ============================================================

const toValidId = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const number = Number(value);

    return Number.isInteger(number) && number > 0
        ? number
        : null;
};

// ============================================================
// AUDIT ID
// ============================================================

const getAuditId = (audit) => {
    if (!audit) return null;

    return (
        toValidId(audit.id) ??
        toValidId(audit.auditId) ??
        toValidId(audit.auditID) ??
        toValidId(audit.auditDbId) ??
        toValidId(audit.audit_id) ??
        toValidId(audit.audit?.id) ??
        toValidId(audit.audit?.auditId) ??
        toValidId(audit.audit?.auditDbId) ??
        toValidId(audit.data?.id) ??
        toValidId(audit.data?.auditId) ??
        null
    );
};

// ============================================================
// AUDIT NAME
// ============================================================

const getAuditName = (audit) => {
    if (!audit) {
        return "Unknown Audit";
    }

    return (
        audit.auditName ??
        audit.auditTitle ??
        audit.title ??
        audit.name ??
        audit.auditCode ??
        audit.audit?.auditName ??
        audit.audit?.auditTitle ??
        audit.audit?.title ??
        audit.audit?.name ??
        audit.audit?.auditCode ??
        `Audit #${getAuditId(audit) ?? ""}`
    );
};

// ============================================================
// FINDING ID
// ============================================================

const getFindingId = (finding) => {
    if (
        finding === null ||
        finding === undefined
    ) {
        return null;
    }

    // Backend may sometimes return just an ID
    if (
        typeof finding === "number" ||
        typeof finding === "string"
    ) {
        return toValidId(finding);
    }

    return (
        toValidId(finding.id) ??
        toValidId(finding.findingId) ??
        toValidId(finding.findingID) ??
        toValidId(finding.findingDbId) ??
        toValidId(finding.finding_id) ??
        toValidId(finding.finding?.id) ??
        toValidId(finding.finding?.findingId) ??
        toValidId(finding.finding?.findingID) ??
        toValidId(finding.finding?.findingDbId) ??
        toValidId(finding.finding?.finding_id) ??
        toValidId(finding.data?.id) ??
        toValidId(finding.data?.findingId) ??
        null
    );
};

// ============================================================
// FINDING TITLE
// ============================================================

const getFindingTitle = (finding) => {
    if (!finding) {
        return "Unknown Finding";
    }

    return (
        finding.findingTitle ??
        finding.title ??
        finding.name ??
        finding.findingName ??
        finding.description ??
        finding.findingDescription ??
        finding.issueDescription ??
        finding.observation ??
        finding.issue ??
        finding.finding?.findingTitle ??
        finding.finding?.title ??
        finding.finding?.name ??
        finding.finding?.findingName ??
        finding.finding?.description ??
        `Finding #${getFindingId(finding) ?? ""}`
    );
};

// ============================================================
// FINDING CODE
// ============================================================

const getFindingCode = (finding) => {
    if (!finding) {
        return null;
    }

    return (
        finding.findingCode ??
        finding.findingNumber ??
        finding.code ??
        finding.referenceNumber ??
        finding.reference ??
        finding.finding?.findingCode ??
        finding.finding?.findingNumber ??
        finding.finding?.code ??
        finding.finding?.referenceNumber ??
        null
    );
};

// ============================================================
// FINDINGS FROM AUDIT
//
// IMPORTANT:
// Findings are taken DIRECTLY from the audit response.
// No separate findings API is used.
// ============================================================

const getFindingsFromAudit = (audit) => {
    if (!audit) {
        return [];
    }

    // --------------------------------------------------------
    // Direct possible finding locations
    // --------------------------------------------------------

    const possibleSources = [
        audit.findings,
        audit.findingList,
        audit.auditFindings,
        audit.findingsList,
        audit.findingResponses,
        audit.findingDetails,

        audit.audit?.findings,
        audit.audit?.findingList,
        audit.audit?.auditFindings,
        audit.audit?.findingsList,
        audit.audit?.findingResponses,

        audit.data?.findings,
        audit.data?.findingList,
        audit.data?.auditFindings,
        audit.data?.findingsList,
        audit.data?.findingResponses,

        audit.result?.findings,
        audit.result?.findingList,
        audit.result?.auditFindings,
        audit.result?.findingsList,
        audit.result?.findingResponses,

        audit.response?.findings,
        audit.response?.findingList,
        audit.response?.auditFindings,

        audit.auditResponse?.findings,
        audit.auditResponse?.findingList,
        audit.auditResponse?.auditFindings,

        audit.auditExecution?.findings,
        audit.auditExecution?.findingList,
        audit.auditExecution?.auditFindings,

        audit.auditDetails?.findings,
        audit.auditDetails?.findingList,
        audit.auditDetails?.auditFindings,
    ];

    // --------------------------------------------------------
    // Check every source.
    //
    // IMPORTANT:
    // Empty [] must NOT stop the search.
    // --------------------------------------------------------

    for (const source of possibleSources) {
        let candidate = null;

        if (Array.isArray(source)) {
            candidate = source;
        } else if (
            source &&
            Array.isArray(source.content)
        ) {
            candidate = source.content;
        } else if (
            source &&
            Array.isArray(source.data)
        ) {
            candidate = source.data;
        } else if (
            source &&
            Array.isArray(source.items)
        ) {
            candidate = source.items;
        } else if (
            source &&
            Array.isArray(source.results)
        ) {
            candidate = source.results;
        }

        if (
            !candidate ||
            candidate.length === 0
        ) {
            continue;
        }

        const validFindings =
            candidate.filter(
                (finding) =>
                    getFindingId(finding) !== null
            );

        if (
            validFindings.length > 0
        ) {
            console.log(
                "✅ FINDINGS FOUND FROM AUDIT:",
                validFindings
            );

            return validFindings;
        }
    }

    // --------------------------------------------------------
    // Recursive fallback
    // --------------------------------------------------------

    const visited = new Set();

    const searchNested = (
        node,
        depth = 0
    ) => {
        if (
            !node ||
            depth > 7
        ) {
            return [];
        }

        if (
            typeof node !== "object"
        ) {
            return [];
        }

        if (
            visited.has(node)
        ) {
            return [];
        }

        visited.add(node);

        // ----------------------------------------------------
        // Array
        // ----------------------------------------------------

        if (Array.isArray(node)) {
            const valid =
                node.filter(
                    (item) =>
                        getFindingId(
                            item
                        ) !== null
                );

            if (
                valid.length > 0
            ) {
                return valid;
            }

            for (
                const item of node
            ) {
                const nested =
                    searchNested(
                        item,
                        depth + 1
                    );

                if (
                    nested.length > 0
                ) {
                    return nested;
                }
            }

            return [];
        }

        // ----------------------------------------------------
        // Object
        // ----------------------------------------------------

        for (
            const [
                key,
                value,
            ] of Object.entries(node)
        ) {
            // Any key containing "finding"
            if (
                /finding/i.test(key)
            ) {
                if (
                    Array.isArray(value)
                ) {
                    const valid =
                        value.filter(
                            (item) =>
                                getFindingId(
                                    item
                                ) !== null
                        );

                    if (
                        valid.length > 0
                    ) {
                        return valid;
                    }
                }

                if (
                    value &&
                    typeof value ===
                        "object"
                ) {
                    const nested =
                        searchNested(
                            value,
                            depth + 1
                        );

                    if (
                        nested.length > 0
                    ) {
                        return nested;
                    }
                }
            }
        }

        // ----------------------------------------------------
        // Common wrapper keys
        // ----------------------------------------------------

        const wrapperKeys = [
            "audit",
            "data",
            "result",
            "response",
            "content",
            "details",
            "auditDetails",
            "auditResponse",
            "auditExecution",
            "auditResult",
        ];

        for (
            const key of wrapperKeys
        ) {
            if (
                node[key] &&
                typeof node[key] ===
                    "object"
            ) {
                const nested =
                    searchNested(
                        node[key],
                        depth + 1
                    );

                if (
                    nested.length > 0
                ) {
                    return nested;
                }
            }
        }

        return [];
    };

    const nestedFindings =
        searchNested(audit);

    if (
        nestedFindings.length > 0
    ) {
        console.log(
            "✅ NESTED FINDINGS FOUND:",
            nestedFindings
        );

        return nestedFindings;
    }

    console.warn(
        "⚠️ NO FINDINGS FOUND INSIDE AUDIT:",
        audit
    );

    return [];
};

// ============================================================
// FINDING ID FROM EVIDENCE
// ============================================================

const getEvidenceFindingId = (
    item
) => {
    if (!item) return null;

    return (
        toValidId(item.findingId) ??
        toValidId(item.findingID) ??
        toValidId(item.findingDbId) ??
        toValidId(item.finding_id) ??
        toValidId(item.finding?.id) ??
        toValidId(item.finding?.findingId) ??
        toValidId(item.finding?.findingID) ??
        toValidId(item.finding?.findingDbId) ??
        toValidId(item.finding?.finding_id) ??
        toValidId(item.findingDetails?.id) ??
        toValidId(item.findingDetails?.findingId) ??
        null
    );
};

// Evidence API may return audit/finding as null.  Keep the relationship
// captured at upload time so the UI can still track evidence by finding.
const getEvidenceAuditId = (item) => {
    if (!item) return null;

    return (
        toValidId(item.auditId) ??
        toValidId(item.auditID) ??
        toValidId(item.auditDbId) ??
        toValidId(item.audit_id) ??
        toValidId(item.audit?.id) ??
        toValidId(item.audit?.auditId) ??
        toValidId(item.audit?.auditDbId) ??
        toValidId(item.auditDetails?.id) ??
        null
    );
};

const getEvidenceId = (item) => {
    if (!item) return null;

    return (
        toValidId(item.id) ??
        toValidId(item.evidenceId) ??
        toValidId(item.evidenceID) ??
        null
    );
};

const EVIDENCE_RELATIONS_KEY = "auditee_evidence_relations";

const readEvidenceRelations = () => {
    try {
        const raw = localStorage.getItem(EVIDENCE_RELATIONS_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
};

const saveEvidenceRelation = (evidenceId, auditId, findingId) => {
    const id = toValidId(evidenceId);
    const audit = toValidId(auditId);
    const finding = toValidId(findingId);

    if (!id || !audit || !finding) return;

    try {
        const relations = readEvidenceRelations();
        relations[String(id)] = {
            auditId: audit,
            findingId: finding,
        };
        localStorage.setItem(
            EVIDENCE_RELATIONS_KEY,
            JSON.stringify(relations)
        );
    } catch {
        // Ignore localStorage failures.
    }
};

const removeEvidenceRelation = (evidenceId) => {
    const id = toValidId(evidenceId);
    if (!id) return;

    try {
        const relations = readEvidenceRelations();
        delete relations[String(id)];
        localStorage.setItem(
            EVIDENCE_RELATIONS_KEY,
            JSON.stringify(relations)
        );
    } catch {
        // Ignore localStorage failures.
    }
};

const normalizeEvidenceItem = (item) => {
    if (!item) return item;

    const evidenceId = getEvidenceId(item);
    const relations = readEvidenceRelations();
    const saved = evidenceId
        ? relations[String(evidenceId)]
        : null;

    const auditId =
        getEvidenceAuditId(item) ??
        toValidId(saved?.auditId);

    const findingId =
        getEvidenceFindingId(item) ??
        toValidId(saved?.findingId);

    return {
        ...item,
        auditId: auditId ?? item.auditId ?? null,
        findingId: findingId ?? item.findingId ?? null,
    };
};

// ============================================================
// FILE URL
// ============================================================

const getFullFileUrl = (
    fileUrl
) => {
    if (!fileUrl) {
        return null;
    }

    const value =
        String(fileUrl).trim();

    if (!value) {
        return null;
    }

    if (
        value.startsWith(
            "http://"
        ) ||
        value.startsWith(
            "https://"
        )
    ) {
        return value;
    }

    if (
        value.startsWith("/")
    ) {
        return `${FILE_BASE_URL}${value}`;
    }

    return `${FILE_BASE_URL}/${value}`;
};

// ============================================================
// FILE HELPERS
// ============================================================

const getFileExtension = (
    name
) => {
    if (!name) return "";

    const parts =
        String(name).split(".");

    return parts.length > 1
        ? parts.pop().toLowerCase()
        : "";
};

const isImageFile = (
    name
) => {
    return [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "bmp",
        "svg",
    ].includes(
        getFileExtension(name)
    );
};

const isPdfFile = (
    name
) => {
    return (
        getFileExtension(name) ===
        "pdf"
    );
};

// ============================================================
// CURRENT USER ID
// ============================================================

const getCurrentUserId = () => {
    const directKeys = [
        "userId",
        "user_id",
        "id",
        "currentUserId",
    ];

    for (
        const key of directKeys
    ) {
        const value =
            localStorage.getItem(
                key
            );

        const id =
            toValidId(value);

        if (id) {
            return id;
        }
    }

    const objectKeys = [
        "user",
        "currentUser",
        "loggedInUser",
        "profile",
        "current_user",
    ];

    for (
        const key of objectKeys
    ) {
        try {
            const raw =
                localStorage.getItem(
                    key
                );

            if (!raw) {
                continue;
            }

            const parsed =
                JSON.parse(raw);

            const possibleIds = [
                parsed?.id,
                parsed?.userId,
                parsed?.user_id,
                parsed?.user?.id,
                parsed?.user?.userId,
                parsed?.profile?.id,
                parsed?.profile?.userId,
            ];

            for (
                const value of possibleIds
            ) {
                const id =
                    toValidId(
                        value
                    );

                if (id) {
                    return id;
                }
            }
        } catch {
            // Ignore invalid JSON
        }
    }

    return null;
};

// ============================================================
// RESPONSE ARRAY HELPER
// ============================================================

const extractArray = (
    response,
    keys = []
) => {
    if (
        Array.isArray(response)
    ) {
        return response;
    }

    if (
        Array.isArray(
            response?.data
        )
    ) {
        return response.data;
    }

    if (
        Array.isArray(
            response?.content
        )
    ) {
        return response.content;
    }

    if (
        Array.isArray(
            response?.data?.content
        )
    ) {
        return response.data.content;
    }

    if (
        Array.isArray(
            response?.data?.data
        )
    ) {
        return response.data.data;
    }

    if (
        Array.isArray(
            response?.items
        )
    ) {
        return response.items;
    }

    if (
        Array.isArray(
            response?.results
        )
    ) {
        return response.results;
    }

    for (
        const key of keys
    ) {
        if (
            Array.isArray(
                response?.[key]
            )
        ) {
            return response[key];
        }

        if (
            Array.isArray(
                response?.data?.[key]
            )
        ) {
            return response.data[key];
        }

        if (
            Array.isArray(
                response?.data?.data?.[key]
            )
        ) {
            return response.data.data[key];
        }
    }

    return [];
};

// ============================================================
// DATE
// ============================================================

const formatDate = (
    date
) => {
    if (!date) {
        return "-";
    }

    const parsed =
        new Date(date);

    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {
        return "-";
    }

    return parsed.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};

// ============================================================
// FILE SIZE
// ============================================================

const formatFileSize = (
    bytes
) => {
    if (!bytes) {
        return "-";
    }

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (
        bytes <
        1024 * 1024
    ) {
        return `${(
            bytes / 1024
        ).toFixed(1)} KB`;
    }

    return `${(
        bytes /
        (1024 * 1024)
    ).toFixed(1)} MB`;
};

// ============================================================
// STATUS
// ============================================================

const normalizeStatus = (
    status
) => {
    const value =
        String(
            status || "PENDING"
        ).toUpperCase();

    return STATUS_OPTIONS.includes(
        value
    )
        ? value
        : "PENDING";
};

const getStatusClass = (
    status
) => {
    switch (
        normalizeStatus(status)
    ) {
        case "APPROVED":
            return "bg-green-50 text-green-700 border-green-200";

        case "REJECTED":
            return "bg-red-50 text-red-700 border-red-200";

        case "PENDING":
        default:
            return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
};

const StatusIcon = ({
    status,
}) => {
    const normalized =
        normalizeStatus(status);

    if (
        normalized ===
        "APPROVED"
    ) {
        return (
            <CheckCircle2
                size={15}
            />
        );
    }

    if (
        normalized ===
        "REJECTED"
    ) {
        return (
            <XCircle
                size={15}
            />
        );
    }

    return (
        <Clock3
            size={15}
        />
    );
};

// ============================================================
// COMPONENT
// ============================================================

const AuditeeEvidence = () => {
    // ========================================================
    // STATE
    // ========================================================

    const [
        audits,
        setAudits,
    ] = useState([]);

    const [
        evidence,
        setEvidence,
    ] = useState([]);

    const [
        findings,
        setFindings,
    ] = useState([]);

    const [
        selectedAuditId,
        setSelectedAuditId,
    ] = useState("");

    const [
        selectedFindingId,
        setSelectedFindingId,
    ] = useState("");

    const [
        userId,
        setUserId,
    ] = useState(null);

    const [
        loadingAudits,
        setLoadingAudits,
    ] = useState(true);

    const [
        loadingEvidence,
        setLoadingEvidence,
    ] = useState(false);

    const [
        uploading,
        setUploading,
    ] = useState(false);

    const [
        deletingId,
        setDeletingId,
    ] = useState(null);

    const [
        searchTerm,
        setSearchTerm,
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState("ALL");

    const [
        error,
        setError,
    ] = useState("");

    const [
        success,
        setSuccess,
    ] = useState("");

    const [
        showUploadModal,
        setShowUploadModal,
    ] = useState(false);

    const [
        viewingEvidence,
        setViewingEvidence,
    ] = useState(null);

    const [
        previewOpen,
        setPreviewOpen,
    ] = useState(false);

    const [
        form,
        setForm,
    ] = useState({
        auditId: "",
        findingId: "",
        description: "",
        file: null,
    });

    // ========================================================
    // CURRENT USER
    // ========================================================

    useEffect(() => {
        const id =
            getCurrentUserId();

        console.log(
            "CURRENT AUDITEE USER ID:",
            id
        );

        setUserId(id);
    }, []);

    // ========================================================
    // LOAD FINDINGS FOR AN AUDIT
    // ========================================================

    const loadFindings =
        useCallback(
            async (auditDbId) => {
                if (!auditDbId) {
                    setFindings([]);
                    setSelectedFindingId("");
                    return [];
                }

                try {
                    console.log(
                        "🔎 Loading findings for Audit DB ID:",
                        auditDbId
                    );

                    const response =
                        await getFindingsByAuditId(
                            auditDbId
                        );

                    console.log(
                        "📥 FINDINGS RESPONSE:",
                        response
                    );

                    const list =
                        extractArray(
                            response,
                            [
                                "findings",
                                "data",
                                "content",
                                "items",
                                "results",
                            ]
                        );

                    const validFindings =
                        (Array.isArray(list) ? list : [])
                            .filter(
                                (finding) =>
                                    getFindingId(finding) !== null
                            );

                    console.log(
                        "✅ ALL FINDINGS FOR AUDIT:",
                        validFindings
                    );

                    setFindings(
                        validFindings
                    );

                    return validFindings;
                } catch (err) {
                    console.error(
                        "❌ FAILED TO LOAD FINDINGS:",
                        err
                    );

                    setFindings([]);
                    setSelectedFindingId("");

                    setError(
                        err?.response?.data?.message ||
                            err?.response?.data?.error ||
                            err?.message ||
                            "Failed to load findings."
                    );

                    return [];
                }
            },
            []
        );

    // ========================================================
    // LOAD AUDITS
    // ========================================================

    const loadAudits =
        useCallback(
            async () => {
                try {
                    setLoadingAudits(
                        true
                    );

                    setError(
                        ""
                    );

                    const response =
                        await getMyAuditeeAudits();

                    console.log(
                        "📥 AUDITEE AUDITS RESPONSE:",
                        response
                    );

                    const auditList =
                        extractArray(
                            response,
                            [
                                "audits",
                                "data",
                                "content",
                                "items",
                                "results",
                            ]
                        ).filter(
                            (audit) =>
                                getAuditId(audit) !== null
                        );

                    console.log(
                        "✅ AUDIT LIST:",
                        auditList
                    );

                    setAudits(
                        auditList
                    );

                    if (
                        auditList.length === 0
                    ) {
                        setSelectedAuditId(
                            ""
                        );
                        setSelectedFindingId(
                            ""
                        );
                        setFindings([]);
                        setForm(
                            (prev) => ({
                                ...prev,
                                auditId: "",
                                findingId: "",
                            })
                        );
                        return;
                    }

                    const firstAudit =
                        auditList[0];

                    const firstAuditId =
                        getAuditId(
                            firstAudit
                        );

                    console.log(
                        "🎯 FIRST AUDIT:",
                        firstAudit
                    );

                    console.log(
                        "🎯 FIRST AUDIT DB ID:",
                        firstAuditId
                    );

                    setSelectedAuditId(
                        String(
                            firstAuditId
                        )
                    );

                    setForm(
                        (prev) => ({
                            ...prev,
                            auditId: String(
                                firstAuditId
                            ),
                            findingId: "",
                        })
                    );

                    // Findings are stored in the Finding table and
                    // linked to Audit through audit_id.
                    const firstFindings =
                        await loadFindings(
                            firstAuditId
                        );

                    if (
                        firstFindings.length > 0
                    ) {
                        const firstFindingId =
                            getFindingId(
                                firstFindings[0]
                            );

                        const findingValue =
                            firstFindingId !== null
                                ? String(
                                      firstFindingId
                                  )
                                : "";

                        setSelectedFindingId(
                            findingValue
                        );

                        setForm(
                            (prev) => ({
                                ...prev,
                                auditId: String(
                                    firstAuditId
                                ),
                                findingId:
                                    findingValue,
                            })
                        );
                    } else {
                        setSelectedFindingId(
                            ""
                        );
                    }
                } catch (err) {
                    console.error(
                        "❌ FAILED TO LOAD AUDITEE AUDITS:",
                        err
                    );

                    setAudits([]);
                    setFindings([]);
                    setSelectedAuditId(
                        ""
                    );
                    setSelectedFindingId(
                        ""
                    );

                    setError(
                        err?.response?.data?.message ||
                            err?.response?.data?.error ||
                            err?.message ||
                            "Failed to load assigned audits."
                    );
                } finally {
                    setLoadingAudits(
                        false
                    );
                }
            },
            [loadFindings]
        );

    // ========================================================
    // SELECTED AUDIT
    // ========================================================

    const selectedAudit =
        useMemo(() => {
            return audits.find(
                (audit) =>
                    String(
                        getAuditId(
                            audit
                        )
                    ) ===
                    String(
                        selectedAuditId
                    )
            );
        }, [
            audits,
            selectedAuditId,
        ]);

    // ========================================================
    // FINDINGS
    // ========================================================

    // Findings are loaded from FindingService using the selected
    // audit database ID. Do not read findings from the Audit object.

    // ========================================================
    // SELECTED FINDING
    // ========================================================

    const selectedFinding =
        useMemo(() => {
            return findings.find(
                (finding) =>
                    String(
                        getFindingId(
                            finding
                        )
                    ) ===
                    String(
                        selectedFindingId
                    )
            );
        }, [
            findings,
            selectedFindingId,
        ]);

    // ========================================================
    // LOAD EVIDENCE
    // ========================================================

    const loadEvidence =
        useCallback(
            async () => {
                if (
                    !selectedAuditId
                ) {
                    setEvidence(
                        []
                    );
                    return;
                }

                try {
                    setLoadingEvidence(
                        true
                    );

                    setError("");

                    const auditId =
                        toValidId(
                            selectedAuditId
                        );

                    if (!auditId) {
                        setEvidence(
                            []
                        );
                        return;
                    }

                    const response =
                        await getEvidenceByAudit(
                            auditId
                        );

                    console.log(
                        "📥 EVIDENCE RESPONSE:",
                        response
                    );

                    const list =
                        extractArray(
                            response,
                            [
                                "evidence",
                                "evidences",
                                "items",
                                "results",
                            ]
                        );

                    console.log(
                        "✅ EVIDENCE LIST:",
                        list
                    );

                    const normalizedList =
                        (Array.isArray(list) ? list : [])
                            .map(normalizeEvidenceItem);

                    setEvidence(normalizedList);
                } catch (
                    err
                ) {
                    console.error(
                        "❌ FAILED TO LOAD EVIDENCE:",
                        err
                    );

                    setEvidence([]);

                    setError(
                        err?.response
                            ?.data
                            ?.message ||
                            err?.response
                                ?.data
                                ?.error ||
                            err?.message ||
                            "Failed to load evidence."
                    );
                } finally {
                    setLoadingEvidence(
                        false
                    );
                }
            },
            [selectedAuditId]
        );

    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {
        loadAudits();
    }, [
        loadAudits,
    ]);

    useEffect(() => {
        loadEvidence();
    }, [
        loadEvidence,
    ]);

    // ========================================================
    // AUDIT CHANGE
    // ========================================================

    const handleAuditChange =
        async (value) => {
            console.log(
                "🔄 AUDIT CHANGED:",
                value
            );

            setSelectedAuditId(
                value
            );

            setSelectedFindingId(
                ""
            );

            setFindings([]);

            setForm(
                (prev) => ({
                    ...prev,
                    auditId: value,
                    findingId: "",
                })
            );

            setSearchTerm(
                ""
            );

            setStatusFilter(
                "ALL"
            );

            setError(
                ""
            );

            setSuccess(
                ""
            );

            const audit =
                audits.find(
                    (item) =>
                        String(
                            getAuditId(
                                item
                            )
                        ) ===
                        String(value)
                );

            console.log(
                "🎯 SELECTED AUDIT:",
                audit
            );

            if (!audit) {
                return;
            }

            const auditDbId =
                getAuditId(
                    audit
                );

            const auditFindings =
                await loadFindings(
                    auditDbId
                );

            console.log(
                "📋 ALL FINDINGS FOR SELECTED AUDIT:",
                auditFindings
            );

            // Select only the first finding by default.
            // All findings remain in `findings` and can be selected
            // from the dropdown.
            if (
                auditFindings.length > 0
            ) {
                const firstFindingId =
                    getFindingId(
                        auditFindings[0]
                    );

                const findingValue =
                    firstFindingId !== null
                        ? String(
                              firstFindingId
                          )
                        : "";

                setSelectedFindingId(
                    findingValue
                );

                setForm(
                    (prev) => ({
                        ...prev,
                        auditId: value,
                        findingId:
                            findingValue,
                    })
                );
            }
        };

    // ========================================================
    // FINDING CHANGE
    // ========================================================

    const handleFindingChange =
        (value) => {
            console.log(
                "🔄 FINDING CHANGED:",
                value
            );

            setSelectedFindingId(
                value
            );

            setForm(
                (prev) => ({
                    ...prev,
                    findingId:
                        value,
                })
            );

            setSearchTerm(
                ""
            );

            setStatusFilter(
                "ALL"
            );

            setError("");
        };

    // ========================================================
    // OPEN UPLOAD MODAL
    // ========================================================

    const openUploadModal =
        () => {
            setError("");
            setSuccess("");

            if (
                !selectedAuditId
            ) {
                setError(
                    "Please select an audit first."
                );
                return;
            }

            if (
                !selectedFindingId
            ) {
                setError(
                    "Please select a finding first."
                );
                return;
            }

            setForm({
                auditId:
                    selectedAuditId,
                findingId:
                    selectedFindingId,
                description:
                    "",
                file: null,
            });

            setShowUploadModal(
                true
            );
        };

    // ========================================================
    // CLOSE UPLOAD MODAL
    // ========================================================

    const closeUploadModal =
        () => {
            if (uploading) {
                return;
            }

            setShowUploadModal(
                false
            );

            setForm(
                (prev) => ({
                    ...prev,
                    description:
                        "",
                    file: null,
                })
            );
        };

    // ========================================================
    // FILE CHANGE
    // ========================================================

    const handleFileChange =
        (event) => {
            const file =
                event.target
                    .files?.[0];

            if (!file) {
                return;
            }

            if (
                file.size >
                MAX_FILE_SIZE
            ) {
                setError(
                    "File size must be 10 MB or less."
                );

                event.target.value =
                    "";

                return;
            }

            setError("");

            setForm(
                (prev) => ({
                    ...prev,
                    file,
                })
            );
        };

    // ========================================================
    // UPLOAD
    // ========================================================

    const handleUpload = async (event) => {
        event.preventDefault();
    
        setError("");
        setSuccess("");
    
        const auditId = toValidId(form.auditId);
        const findingId = toValidId(form.findingId);
        const currentUserId = toValidId(userId);
    
        // ==============================
        // VALIDATION
        // ==============================
    
        if (!currentUserId) {
            setError(
                "Current user ID was not found. Please login again."
            );
            return;
        }
    
        if (!auditId) {
            setError(
                "Please select an audit."
            );
            return;
        }
    
        if (!findingId) {
            setError(
                "Please select a finding."
            );
            return;
        }
    
        if (!form.file) {
            setError(
                "Please select an evidence file."
            );
            return;
        }
    
        if (form.file.size > MAX_FILE_SIZE) {
            setError(
                "File size must be 10 MB or less."
            );
            return;
        }
    
        try {
            setUploading(true);
    
            // ==============================
            // DEBUG LOG
            // ==============================
    
            console.log(
                "📤 UPLOADING EVIDENCE:",
                {
                    auditId,
                    findingId,
                    userId: currentUserId,
                    file: form.file?.name,
                    fileSize: form.file?.size,
                    description: form.description,
                }
            );
    
            // ==============================
            // UPLOAD EVIDENCE
            // ==============================
    
            const uploadResponse = await uploadEvidence(
                auditId,
                findingId,
                currentUserId,
                form.file,
                form.description
            );

            console.log("📥 UPLOAD RESPONSE:", uploadResponse);

            const refreshedResponse =
                await getEvidenceByAudit(auditId);

            const refreshedList = extractArray(
                refreshedResponse,
                [
                    "evidence",
                    "evidences",
                    "items",
                    "results",
                ]
            );

            const uploadedFileName = form.file?.name || "";
            let matchedEvidence = null;

            for (
                let index = refreshedList.length - 1;
                index >= 0;
                index -= 1
            ) {
                const candidate = refreshedList[index];
                const candidateName = String(
                    candidate?.fileName ??
                    candidate?.originalFileName ??
                    ""
                );

                if (candidateName === uploadedFileName) {
                    matchedEvidence = candidate;
                    break;
                }
            }

            const uploadObject =
                uploadResponse?.data &&
                typeof uploadResponse.data === "object" &&
                !Array.isArray(uploadResponse.data)
                    ? uploadResponse.data
                    : uploadResponse;

            const uploadedEvidenceId =
                getEvidenceId(uploadObject) ??
                getEvidenceId(matchedEvidence);

            if (uploadedEvidenceId) {
                saveEvidenceRelation(
                    uploadedEvidenceId,
                    auditId,
                    findingId
                );
            }

            const normalizedRefreshed =
                (Array.isArray(refreshedList) ? refreshedList : [])
                    .map(normalizeEvidenceItem)
                    .map((item) => {
                        const itemId = getEvidenceId(item);

                        return uploadedEvidenceId &&
                            itemId === uploadedEvidenceId
                            ? {
                                  ...item,
                                  auditId,
                                  findingId,
                              }
                            : item;
                    });

            setEvidence(normalizedRefreshed);


    
            // ==============================
            // SUCCESS
            // ==============================
    
            console.log(
                "✅ EVIDENCE UPLOADED SUCCESSFULLY"
            );
    
            setSuccess(
                `Evidence uploaded successfully for Finding #${findingId}.`
            );
    
            // ==============================
            // CLOSE MODAL
            // ==============================
    
            setShowUploadModal(false);
    
            // ==============================
            // RESET FORM
            // ==============================
    
            setForm({
                auditId: selectedAuditId,
                findingId: selectedFindingId,
                description: "",
                file: null,
            });
    
            // Evidence list was refreshed and normalized above.
    
        } catch (err) {
    
            console.error(
                "❌ EVIDENCE UPLOAD FAILED:",
                err
            );
    
            setError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Failed to upload evidence."
            );
    
        } finally {
    
            setUploading(false);
        }
    };

    // ========================================================
    // DELETE
    // ========================================================

    const handleDelete =
        async (item) => {
            const evidenceId =
                toValidId(
                    item?.id ??
                        item?.evidenceId
                );

            if (!evidenceId) {
                setError(
                    "Evidence ID is missing."
                );
                return;
            }

            const status =
                normalizeStatus(
                    item.status
                );

            if (
                status !==
                "PENDING"
            ) {
                setError(
                    "Only pending evidence can be deleted."
                );
                return;
            }

            const confirmed =
                window.confirm(
                    "Are you sure you want to delete this evidence?"
                );

            if (!confirmed) {
                return;
            }

            try {
                setDeletingId(
                    evidenceId
                );

                setError("");
                setSuccess("");

                await deleteEvidence(
                    evidenceId
                );

                removeEvidenceRelation(evidenceId);

                setEvidence((prev) =>
                    prev.filter(
                        (item) =>
                            getEvidenceId(item) !== evidenceId
                    )
                );

                setSuccess(
                    "Evidence deleted successfully."
                );

            } catch (
                err
            ) {
                console.error(
                    "❌ FAILED TO DELETE EVIDENCE:",
                    err
                );

                setError(
                    err?.response
                        ?.data
                        ?.message ||
                        err?.response
                            ?.data
                            ?.error ||
                        err?.message ||
                        "Failed to delete evidence."
                );
            } finally {
                setDeletingId(
                    null
                );
            }
        };

    // ========================================================
    // VIEW
    // ========================================================

    const closeViewModal =
        () => {
            setViewingEvidence(
                null
            );

            setPreviewOpen(
                false
            );
        };

    // ========================================================
    // VISIBLE EVIDENCE
    // ========================================================

    const visibleEvidence =
        useMemo(() => {
            if (
                !selectedFindingId
            ) {
                return [];
            }

            const selectedId =
                toValidId(
                    selectedFindingId
                );

            let result =
                evidence.filter((item) => {
                    const itemFindingId =
                        getEvidenceFindingId(item);

                    return itemFindingId === selectedId;
                });

            const search =
                searchTerm
                    .trim()
                    .toLowerCase();

            if (search) {
                result =
                    result.filter(
                        (item) => {
                            const fileName =
                                String(
                                    item?.fileName ??
                                        item?.originalFileName ??
                                        ""
                                ).toLowerCase();

                            const description =
                                String(
                                    item?.description ??
                                        ""
                                ).toLowerCase();

                            const status =
                                normalizeStatus(
                                    item?.status
                                ).toLowerCase();

                            const findingId =
                                String(
                                    getEvidenceFindingId(
                                        item
                                    ) ?? ""
                                );

                            return (
                                fileName.includes(
                                    search
                                ) ||
                                description.includes(
                                    search
                                ) ||
                                status.includes(
                                    search
                                ) ||
                                findingId.includes(
                                    search
                                )
                            );
                        }
                    );
            }

            if (
                statusFilter !==
                "ALL"
            ) {
                result =
                    result.filter(
                        (item) =>
                            normalizeStatus(
                                item?.status
                            ) ===
                            statusFilter
                    );
            }

            return result;
        }, [
            evidence,
            selectedFindingId,
            searchTerm,
            statusFilter,
        ]);

    // ========================================================
    // STATISTICS
    // ========================================================

    const totalEvidence =
        visibleEvidence.length;

    const pendingEvidence =
        visibleEvidence.filter(
            (item) =>
                normalizeStatus(
                    item?.status
                ) ===
                "PENDING"
        ).length;

    const approvedEvidence =
        visibleEvidence.filter(
            (item) =>
                normalizeStatus(
                    item?.status
                ) ===
                "APPROVED"
        ).length;

    const rejectedEvidence =
        visibleEvidence.filter(
            (item) =>
                normalizeStatus(
                    item?.status
                ) ===
                "REJECTED"
        ).length;

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="min-h-screen bg-[#f7f9fb] px-6 py-7">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">

                <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center">
                        <FileWarning
                            size={23}
                            className="text-teal-600"
                        />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Evidence
                        </h1>

                        <p className="text-sm text-slate-500 mt-1">
                            Manage evidence for each audit finding
                        </p>
                    </div>

                </div>

                <button
                    type="button"
                    onClick={
                        openUploadModal
                    }
                    disabled={
                        loadingAudits ||
                        !userId ||
                        !selectedAuditId ||
                        !selectedFindingId
                    }
                    className="flex items-center justify-center gap-2 bg-[#00C98B] hover:bg-[#00A874] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-sm transition"
                >
                    <Upload
                        size={17}
                    />

                    Upload Evidence
                </button>

            </div>

            {/* ==================================================
                SUCCESS
            ================================================== */}

            {success && (
                <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">

                    <div className="flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle2
                            size={18}
                        />

                        {success}
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccess(
                                ""
                            )
                        }
                    >
                        <X
                            size={17}
                        />
                    </button>

                </div>
            )}

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
                <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                    <div className="flex items-start gap-2 text-sm text-red-700">

                        <AlertCircle
                            size={18}
                            className="mt-0.5 shrink-0"
                        />

                        <span>
                            {error}
                        </span>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setError(
                                ""
                            )
                        }
                    >
                        <X
                            size={17}
                        />
                    </button>

                </div>
            )}

            {/* ==================================================
                AUDIT + FINDING
            ================================================== */}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-6">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* AUDIT */}

                    <div>

                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Select Assigned Audit
                        </label>

                        <select
                            value={
                                selectedAuditId
                            }
                            onChange={(e) =>
                                handleAuditChange(
                                    e.target.value
                                )
                            }
                            disabled={
                                loadingAudits
                            }
                            className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                        >

                            <option value="">
                                {loadingAudits
                                    ? "Loading assigned audits..."
                                    : audits.length ===
                                      0
                                    ? "No assigned audits"
                                    : "Select an audit"}
                            </option>

                            {audits.map(
                                (
                                    audit
                                ) => {
                                    const id =
                                        getAuditId(
                                            audit
                                        );

                                    return (
                                        <option
                                            key={
                                                id
                                            }
                                            value={
                                                id
                                            }
                                        >
                                            {getAuditName(
                                                audit
                                            )}
                                            {" — ID "}
                                            {
                                                id
                                            }
                                        </option>
                                    );
                                }
                            )}

                        </select>

                    </div>

                    {/* FINDING */}

                    <div>

                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Select Finding
                            <span className="text-red-500">
                                {" "}*
                            </span>
                        </label>

                        <select
                            value={
                                selectedFindingId
                            }
                            onChange={(e) =>
                                handleFindingChange(
                                    e.target.value
                                )
                            }
                            disabled={
                                !selectedAuditId ||
                                findings.length ===
                                    0
                            }
                            className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                        >

                            <option value="">
                                {!selectedAuditId
                                    ? "Select an audit first"
                                    : findings.length ===
                                      0
                                    ? "No findings available for this audit"
                                    : "Select a finding"}
                            </option>

                            {findings.map(
                                (
                                    finding
                                ) => {
                                    const id =
                                        getFindingId(
                                            finding
                                        );

                                    const code =
                                        getFindingCode(
                                            finding
                                        );

                                    return (
                                        <option
                                            key={
                                                id
                                            }
                                            value={
                                                id
                                            }
                                        >
                                            {code
                                                ? `${code} — `
                                                : ""}
                                            Finding #
                                            {
                                                id
                                            }
                                            {" — "}
                                            {getFindingTitle(
                                                finding
                                            )}
                                        </option>
                                    );
                                }
                            )}

                        </select>

                    </div>

                </div>

                {/* SELECTED INFO */}

                {selectedAudit && (
                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">

                        <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">

                            <p className="text-xs text-teal-600 font-semibold uppercase">
                                Selected Audit
                            </p>

                            <p className="text-sm font-bold text-slate-800 mt-1">
                                {getAuditName(
                                    selectedAudit
                                )}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                                Audit ID:{" "}
                                {
                                    getAuditId(
                                        selectedAudit
                                    )
                                }
                            </p>

                        </div>

                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">

                            <p className="text-xs text-indigo-600 font-semibold uppercase">
                                Findings in this audit
                            </p>

                            <p className="text-lg font-bold text-slate-800 mt-1">
                                {
                                    findings.length
                                }
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                                Findings loaded directly from audit
                            </p>

                        </div>

                    </div>
                )}

                {/* SELECTED FINDING */}

                {selectedFinding && (
                    <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">

                        <p className="text-xs text-indigo-600 font-semibold uppercase">
                            Selected Finding
                        </p>

                        <p className="text-sm font-bold text-slate-800 mt-1">
                            {getFindingCode(
                                selectedFinding
                            )
                                ? `${getFindingCode(
                                      selectedFinding
                                  )} — `
                                : ""}
                            Finding #
                            {
                                getFindingId(
                                    selectedFinding
                                )
                            }
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                            {getFindingTitle(
                                selectedFinding
                            )}
                        </p>

                    </div>
                )}

            </div>

            {/* ==================================================
                STATISTICS
            ================================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

                <StatCard
                    label="Total Evidence"
                    value={
                        totalEvidence
                    }
                    icon={
                        ClipboardList
                    }
                    iconClass="text-teal-600"
                    bgClass="bg-teal-50"
                />

                <StatCard
                    label="Pending"
                    value={
                        pendingEvidence
                    }
                    icon={
                        Clock3
                    }
                    iconClass="text-yellow-600"
                    bgClass="bg-yellow-50"
                />

                <StatCard
                    label="Approved"
                    value={
                        approvedEvidence
                    }
                    icon={
                        CheckCircle2
                    }
                    iconClass="text-green-600"
                    bgClass="bg-green-50"
                />

                <StatCard
                    label="Rejected"
                    value={
                        rejectedEvidence
                    }
                    icon={
                        XCircle
                    }
                    iconClass="text-red-600"
                    bgClass="bg-red-50"
                />

            </div>

            {/* ==================================================
                FILTERS
            ================================================== */}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-6">

                <div className="flex flex-col lg:flex-row gap-3">

                    <div className="relative flex-1">

                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            placeholder="Search evidence or finding ID..."
                            value={
                                searchTerm
                            }
                            onChange={(e) =>
                                setSearchTerm(
                                    e.target.value
                                )
                            }
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                        />

                    </div>

                    <select
                        value={
                            statusFilter
                        }
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                        className="h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-teal-400"
                    >

                        <option value="ALL">
                            All Status
                        </option>

                        {STATUS_OPTIONS.map(
                            (
                                status
                            ) => (
                                <option
                                    key={
                                        status
                                    }
                                    value={
                                        status
                                    }
                                >
                                    {status}
                                </option>
                            )
                        )}

                    </select>

                    <button
                        type="button"
                        onClick={
                            loadEvidence
                        }
                        disabled={
                            loadingEvidence ||
                            !selectedAuditId
                        }
                        className="h-11 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 disabled:opacity-50"
                    >

                        <RefreshCw
                            size={16}
                            className={
                                loadingEvidence
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>

                </div>

            </div>

            {/* ==================================================
                TABLE
            ================================================== */}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

                    <div>

                        <h2 className="font-bold text-slate-900">
                            Finding Evidence
                        </h2>

                        <p className="text-xs text-slate-500 mt-1">
                            {selectedFindingId
                                ? `Evidence for Finding #${selectedFindingId}`
                                : "Select a finding to view its evidence"}
                        </p>

                    </div>

                    {selectedFindingId && (
                        <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full">
                            {
                                visibleEvidence.length
                            } Evidence
                        </span>
                    )}

                </div>

                {/* LOADING */}

                {loadingEvidence ? (

                    <div className="p-6">

                        {[
                            1,
                            2,
                            3,
                            4,
                        ].map(
                            (
                                item
                            ) => (
                                <div
                                    key={
                                        item
                                    }
                                    className="h-16 border-b border-slate-100 animate-pulse flex items-center gap-4"
                                >

                                    <div className="w-10 h-10 rounded-lg bg-slate-100" />

                                    <div className="flex-1">

                                        <div className="h-4 w-48 bg-slate-100 rounded" />

                                        <div className="h-3 w-32 bg-slate-100 rounded mt-2" />

                                    </div>

                                </div>
                            )
                        )}

                    </div>

                ) : !selectedFindingId ? (

                    <EmptyState
                        icon={
                            ClipboardList
                        }
                        title="Select a finding"
                        message="Choose an audit and finding to view or upload evidence."
                    />

                ) : visibleEvidence.length ===
                  0 ? (

                    <div className="py-16 text-center">

                        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-4">

                            <FileText
                                size={27}
                                className="text-slate-400"
                            />

                        </div>

                        <h3 className="text-base font-semibold text-slate-800">
                            No evidence found
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                            No evidence has been uploaded for Finding #
                            {
                                selectedFindingId
                            }.
                        </p>

                        <button
                            type="button"
                            onClick={
                                openUploadModal
                            }
                            disabled={
                                !selectedFindingId
                            }
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00C98B] text-white text-sm font-semibold hover:bg-[#00A874] disabled:bg-gray-300"
                        >

                            <Upload
                                size={16}
                            />

                            Upload Evidence

                        </button>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1050px]">

                            <thead className="bg-slate-50">

                                <tr>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Evidence
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Finding
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Description
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Status
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Uploaded
                                    </th>

                                    <th className="px-5 py-4 text-right text-xs font-semibold text-slate-500 uppercase">
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {visibleEvidence.map(
                                    (
                                        item
                                    ) => {

                                        const findingId =
                                            getEvidenceFindingId(
                                                item
                                            );

                                        const findingTitle =
                                            item?.finding
                                                ?.findingTitle ??
                                            item?.finding
                                                ?.title ??
                                            item?.finding
                                                ?.name ??
                                            item?.findingTitle ??
                                            item?.findingName ??
                                            "";

                                        const fileName =
                                            item?.fileName ??
                                            item?.originalFileName ??
                                            "Evidence file";

                                        const status =
                                            normalizeStatus(
                                                item?.status
                                            );

                                        const evidenceId =
                                            item?.id ??
                                            item?.evidenceId;

                                        return (
                                            <tr
                                                key={
                                                    evidenceId ??
                                                    `${findingId}-${fileName}`
                                                }
                                                className="border-t border-slate-100 hover:bg-slate-50/70 transition"
                                            >

                                                {/* FILE */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 overflow-hidden">

                                                            {isImageFile(
                                                                fileName
                                                            ) &&
                                                            getFullFileUrl(
                                                                item.fileUrl
                                                            ) ? (

                                                                <img
                                                                    src={getFullFileUrl(
                                                                        item.fileUrl
                                                                    )}
                                                                    alt={
                                                                        fileName
                                                                    }
                                                                    className="w-full h-full object-cover"
                                                                />

                                                            ) : (

                                                                <FileText
                                                                    size={
                                                                        19
                                                                    }
                                                                    className="text-teal-600"
                                                                />

                                                            )}

                                                        </div>

                                                        <div className="min-w-0">

                                                            <p className="font-semibold text-slate-800 truncate max-w-[230px]">
                                                                {
                                                                    fileName
                                                                }
                                                            </p>

                                                            <p className="text-xs text-slate-400 mt-1">
                                                                Evidence #
                                                                {
                                                                    evidenceId ??
                                                                    "-"
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* FINDING */}

                                                <td className="px-5 py-4">

                                                    <div>

                                                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
                                                            #
                                                            {
                                                                findingId ??
                                                                "-"
                                                            }
                                                        </span>

                                                        {findingTitle && (
                                                            <p className="text-xs text-slate-500 mt-2 max-w-[220px] truncate">
                                                                {
                                                                    findingTitle
                                                                }
                                                            </p>
                                                        )}

                                                    </div>

                                                </td>

                                                {/* DESCRIPTION */}

                                                <td className="px-5 py-4 max-w-[250px]">

                                                    <p className="text-sm text-slate-600 truncate">
                                                        {item.description ||
                                                            "No description"}
                                                    </p>

                                                </td>

                                                {/* STATUS */}

                                                <td className="px-5 py-4">

                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${getStatusClass(
                                                            status
                                                        )}`}
                                                    >

                                                        <StatusIcon
                                                            status={
                                                                status
                                                            }
                                                        />

                                                        {
                                                            status
                                                        }

                                                    </span>

                                                </td>

                                                {/* DATE */}

                                                <td className="px-5 py-4 text-sm text-slate-600">

                                                    {formatDate(
                                                        item.createdAt ??
                                                            item.uploadedAt
                                                    )}

                                                </td>

                                                {/* ACTION */}

                                                <td className="px-5 py-4">

                                                    <div className="flex justify-end gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setViewingEvidence(
                                                                    item
                                                                )
                                                            }
                                                            className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 flex items-center justify-center"
                                                            title="View evidence"
                                                        >

                                                            <Eye
                                                                size={
                                                                    17
                                                                }
                                                            />

                                                        </button>

                                                        {status ===
                                                            "PENDING" && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        item
                                                                    )
                                                                }
                                                                disabled={
                                                                    deletingId ===
                                                                    evidenceId
                                                                }
                                                                className="w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center disabled:opacity-50"
                                                                title="Delete evidence"
                                                            >

                                                                {deletingId ===
                                                                evidenceId ? (
                                                                    <RefreshCw
                                                                        size={
                                                                            16
                                                                        }
                                                                        className="animate-spin"
                                                                    />
                                                                ) : (
                                                                    <Trash2
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                )}

                                                            </button>
                                                        )}

                                                    </div>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {/* ==================================================
                UPLOAD MODAL
            ================================================== */}

            {showUploadModal && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={
                        closeUploadModal
                    }
                >

                    <div
                        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">

                            <div>

                                <h2 className="text-xl font-bold text-slate-900">
                                    Upload Evidence
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Upload evidence specifically for the selected finding.
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeUploadModal
                                }
                                disabled={
                                    uploading
                                }
                                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
                            >
                                <X
                                    size={
                                        19
                                    }
                                />
                            </button>

                        </div>

                        <form
                            onSubmit={
                                handleUpload
                            }
                        >

                            <div className="p-6 space-y-5">

                                <InfoBox
                                    label="Audit ID"
                                    value={
                                        form.auditId
                                    }
                                />

                                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">

                                    <p className="text-xs text-indigo-600 font-bold uppercase">
                                        Finding
                                    </p>

                                    <p className="text-lg font-bold text-slate-800 mt-1">
                                        {selectedFinding
                                            ? getFindingCode(
                                                  selectedFinding
                                              )
                                                ? `${getFindingCode(
                                                      selectedFinding
                                                  )} — `
                                                : ""
                                            : ""}
                                        Finding #
                                        {
                                            form.findingId
                                        }
                                    </p>

                                    {selectedFinding && (
                                        <p className="text-sm text-slate-600 mt-1">
                                            {getFindingTitle(
                                                selectedFinding
                                            )}
                                        </p>
                                    )}

                                </div>

                                {/* FILE */}

                                <div>

                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Evidence File
                                        <span className="text-red-500">
                                            {" "}*
                                        </span>
                                    </label>

                                    <label className="block cursor-pointer">

                                        <div className="border-2 border-dashed border-slate-200 hover:border-teal-300 rounded-xl p-6 text-center transition">

                                            <Upload
                                                size={
                                                    25
                                                }
                                                className="mx-auto text-teal-500 mb-2"
                                            />

                                            <p className="text-sm font-medium text-slate-700 break-all">
                                                {form.file
                                                    ? form.file.name
                                                    : "Click to choose a file"}
                                            </p>

                                            <p className="text-xs text-slate-400 mt-1">
                                                Maximum file size: 10 MB
                                            </p>

                                        </div>

                                        <input
                                            type="file"
                                            onChange={
                                                handleFileChange
                                            }
                                            disabled={
                                                uploading
                                            }
                                            className="hidden"
                                        />

                                    </label>

                                    {form.file && (
                                        <p className="text-xs text-slate-500 mt-2">
                                            Size:{" "}
                                            {formatFileSize(
                                                form.file.size
                                            )}
                                        </p>
                                    )}

                                </div>

                                {/* DESCRIPTION */}

                                <div>

                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Description
                                    </label>

                                    <textarea
                                        value={
                                            form.description
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setForm(
                                                (
                                                    prev
                                                ) => ({
                                                    ...prev,
                                                    description:
                                                        e
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        disabled={
                                            uploading
                                        }
                                        rows={
                                            4
                                        }
                                        placeholder="Describe what this evidence supports..."
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none resize-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                                    />

                                </div>

                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={
                                        closeUploadModal
                                    }
                                    disabled={
                                        uploading
                                    }
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        uploading ||
                                        !form.auditId ||
                                        !form.findingId ||
                                        !form.file
                                    }
                                    className="px-5 py-2.5 rounded-xl bg-[#00C98B] hover:bg-[#00A874] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center gap-2"
                                >

                                    {uploading ? (
                                        <>
                                            <RefreshCw
                                                size={
                                                    16
                                                }
                                                className="animate-spin"
                                            />

                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload
                                                size={
                                                    16
                                                }
                                            />

                                            Upload Evidence
                                        </>
                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* ==================================================
                VIEW MODAL
            ================================================== */}

            {viewingEvidence && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={
                        closeViewModal
                    }
                >

                    <div
                        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between">

                            <div>

                                <p className="text-xs font-bold uppercase text-teal-600">
                                    Evidence #
                                    {
                                        viewingEvidence.id ??
                                        viewingEvidence.evidenceId ??
                                        "-"
                                    }
                                </p>

                                <h2 className="text-xl font-bold text-slate-900 mt-1 break-all">
                                    {viewingEvidence.fileName ??
                                        viewingEvidence.originalFileName ??
                                        "Evidence"}
                                </h2>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeViewModal
                                }
                                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center shrink-0"
                            >
                                <X
                                    size={
                                        19
                                    }
                                />
                            </button>

                        </div>

                        <div className="p-6 space-y-5">

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                <InfoBox
                                    label="Audit ID"
                                    value={
                                        viewingEvidence?.audit?.id ??
                                        viewingEvidence?.auditId ??
                                        selectedAuditId ??
                                        "-"
                                    }
                                />

                                <InfoBox
                                    label="Finding ID"
                                    value={
                                        getEvidenceFindingId(
                                            viewingEvidence
                                        ) ??
                                        "-"
                                    }
                                />

                                <InfoBox
                                    label="Status"
                                    value={
                                        normalizeStatus(
                                            viewingEvidence.status
                                        )
                                    }
                                />

                                <InfoBox
                                    label="Uploaded At"
                                    value={formatDate(
                                        viewingEvidence.createdAt ??
                                            viewingEvidence.uploadedAt
                                    )}
                                />

                            </div>

                            {/* DESCRIPTION */}

                            <div>

                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                                    Description
                                </p>

                                <div className="p-4 rounded-xl bg-slate-50 text-sm text-slate-600 whitespace-pre-wrap leading-6">
                                    {viewingEvidence.description ||
                                        "No description provided."}
                                </div>

                            </div>

                            {/* FILE */}

                            <div>

                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                                    File
                                </p>

                                {viewingEvidence.fileUrl ? (

                                    isImageFile(
                                        viewingEvidence.fileName ??
                                            viewingEvidence.originalFileName
                                    ) ? (

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPreviewOpen(
                                                    true
                                                )
                                            }
                                            className="w-full block rounded-xl overflow-hidden border border-slate-200 hover:border-teal-300 transition"
                                        >

                                            <img
                                                src={getFullFileUrl(
                                                    viewingEvidence.fileUrl
                                                )}
                                                alt={
                                                    viewingEvidence.fileName ??
                                                    "Evidence"
                                                }
                                                className="w-full max-h-72 object-contain bg-slate-50"
                                            />

                                            <div className="px-4 py-2.5 bg-teal-50 text-left">

                                                <p className="text-sm font-semibold text-slate-800 truncate">
                                                    {
                                                        viewingEvidence.fileName ??
                                                        viewingEvidence.originalFileName
                                                    }
                                                </p>

                                                <p className="text-xs text-teal-600 mt-0.5">
                                                    Click to view full image
                                                </p>

                                            </div>

                                        </button>

                                    ) : isPdfFile(
                                        viewingEvidence.fileName ??
                                            viewingEvidence.originalFileName
                                    ) ? (

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPreviewOpen(
                                                    true
                                                )
                                            }
                                            className="w-full p-4 rounded-xl bg-teal-50 border border-teal-100 hover:border-teal-300 transition text-left flex items-center gap-3"
                                        >

                                            <div className="w-11 h-11 rounded-lg bg-white flex items-center justify-center shrink-0">

                                                <FileText
                                                    size={
                                                        22
                                                    }
                                                    className="text-teal-600"
                                                />

                                            </div>

                                            <div className="min-w-0">

                                                <p className="text-sm font-semibold text-slate-800 truncate">
                                                    {
                                                        viewingEvidence.fileName ??
                                                        viewingEvidence.originalFileName
                                                    }
                                                </p>

                                                <p className="text-xs text-teal-600 mt-0.5">
                                                    Click to view PDF
                                                </p>

                                            </div>

                                        </button>

                                    ) : (

                                        <a
                                            href={getFullFileUrl(
                                                viewingEvidence.fileUrl
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full p-4 rounded-xl bg-teal-50 border border-teal-100 hover:border-teal-300 transition text-left flex items-center gap-3"
                                        >

                                            <FileText
                                                size={
                                                    22
                                                }
                                                className="text-teal-600"
                                            />

                                            <div className="min-w-0">

                                                <p className="text-sm font-semibold text-slate-800 truncate">
                                                    {
                                                        viewingEvidence.fileName ??
                                                        viewingEvidence.originalFileName ??
                                                        "Evidence file"
                                                    }
                                                </p>

                                                <p className="text-xs text-teal-600 mt-0.5">
                                                    Click to open file
                                                </p>

                                            </div>

                                        </a>

                                    )

                                ) : (

                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">

                                        <p className="text-sm text-slate-500">
                                            File not available
                                        </p>

                                    </div>

                                )}

                            </div>

                            <div className="flex justify-end pt-3 border-t border-slate-100">

                                <button
                                    type="button"
                                    onClick={
                                        closeViewModal
                                    }
                                    className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900"
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                </div>
            )}

            {/* ==================================================
                FULLSCREEN PREVIEW
            ================================================== */}

            {previewOpen &&
                viewingEvidence && (
                    <div
                        className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
                        onClick={() =>
                            setPreviewOpen(
                                false
                            )
                        }
                    >

                        <div
                            className="relative w-full h-full max-w-5xl max-h-[90vh] flex flex-col"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="flex items-center justify-between mb-3">

                                <p className="text-white text-sm font-medium truncate pr-4">
                                    {
                                        viewingEvidence.fileName ??
                                        viewingEvidence.originalFileName ??
                                        "Evidence"
                                    }
                                </p>

                                <div className="flex items-center gap-2">

                                    <a
                                        href={getFullFileUrl(
                                            viewingEvidence.fileUrl
                                        )}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                                    >
                                        Open in new tab
                                    </a>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPreviewOpen(
                                                false
                                            )
                                        }
                                        className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                                    >
                                        <X
                                            size={
                                                19
                                            }
                                        />
                                    </button>

                                </div>

                            </div>

                            <div className="flex-1 min-h-0 bg-white rounded-xl overflow-hidden">

                                {isImageFile(
                                    viewingEvidence.fileName ??
                                        viewingEvidence.originalFileName
                                ) ? (

                                    <img
                                        src={getFullFileUrl(
                                            viewingEvidence.fileUrl
                                        )}
                                        alt={
                                            viewingEvidence.fileName ??
                                            "Evidence"
                                        }
                                        className="w-full h-full object-contain"
                                    />

                                ) : isPdfFile(
                                    viewingEvidence.fileName ??
                                        viewingEvidence.originalFileName
                                ) ? (

                                    <iframe
                                        src={getFullFileUrl(
                                            viewingEvidence.fileUrl
                                        )}
                                        title={
                                            viewingEvidence.fileName ??
                                            "Evidence PDF"
                                        }
                                        className="w-full h-full"
                                    />

                                ) : (

                                    <div className="w-full h-full flex items-center justify-center">

                                        <div className="text-center">

                                            <FileText
                                                size={
                                                    40
                                                }
                                                className="mx-auto text-slate-300 mb-3"
                                            />

                                            <p className="text-sm text-slate-500">
                                                Preview not available for this file type.
                                            </p>

                                            <a
                                                href={getFullFileUrl(
                                                    viewingEvidence.fileUrl
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex mt-4 px-4 py-2 rounded-lg bg-teal-500 text-white text-sm font-semibold"
                                            >
                                                Open File
                                            </a>

                                        </div>

                                    </div>

                                )}

                            </div>

                        </div>

                    </div>
                )}

        </div>
    );
};

// ============================================================
// EMPTY STATE
// ============================================================

const EmptyState = ({
    icon: Icon,
    title,
    message,
}) => {
    return (
        <div className="py-16 text-center">

            <Icon
                size={38}
                className="mx-auto text-slate-300 mb-3"
            />

            <h3 className="text-base font-semibold text-slate-800">
                {title}
            </h3>

            <p className="text-sm text-slate-500 mt-1">
                {message}
            </p>

        </div>
    );
};

// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
    label,
    value,
    icon: Icon,
    iconClass,
    bgClass,
}) => {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-sm text-slate-500">
                        {label}
                    </p>

                    <p className="text-2xl font-bold text-slate-900 mt-2">
                        {value}
                    </p>

                </div>

                <div
                    className={`w-11 h-11 rounded-xl ${bgClass} flex items-center justify-center`}
                >

                    <Icon
                        size={21}
                        className={
                            iconClass
                        }
                    />

                </div>

            </div>

        </div>
    );
};

// ============================================================
// INFO BOX
// ============================================================

const InfoBox = ({
    label,
    value,
}) => {
    return (
        <div className="p-4 rounded-xl bg-slate-50">

            <p className="text-xs text-slate-500">
                {label}
            </p>

            <p className="text-sm font-semibold text-slate-800 mt-1 break-words">
                {value || "-"}
            </p>

        </div>
    );
};

export default AuditeeEvidence;