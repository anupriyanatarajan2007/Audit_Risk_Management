// src/utils/apiNormalizer.js

/**
 * Your backend is inconsistent: some endpoints return raw arrays,
 * some wrap in { data }, some wrap in { data: { data } }, some return
 * a single object for dashboard counters. These helpers make every
 * consumer safe regardless of shape.
 */

export const normalizeList = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.content)) return response.data.content; // spring page
  if (Array.isArray(response?.content)) return response.content;
  return [];
};

export const normalizeObject = (response) => {
  if (!response) return {};
  if (response?.data?.data && typeof response.data.data === "object") return response.data.data;
  if (response?.data && typeof response.data === "object" && !Array.isArray(response.data)) return response.data;
  if (typeof response === "object" && !Array.isArray(response)) return response;
  return {};
};

/**
 * Some "dashboard" endpoints return a bare number (e.g. getTotalRisks
 * returns 42), others return { count: 42 } or { total: 42 }.
 */
export const normalizeCount = (response) => {
  const val = response?.data ?? response;
  if (typeof val === "number") return val;
  if (typeof val === "string" && !isNaN(Number(val))) return Number(val);
  if (val && typeof val === "object") {
    return (
      val.count ??
      val.total ??
      val.value ??
      (Array.isArray(val) ? val.length : 0) ??
      0
    );
  }
  return 0;
};

export const safeGet = async (promise, fallback = null) => {
  try {
    return await promise;
  } catch (err) {
    console.error("API call failed:", err?.config?.url, err?.message);
    return fallback;
  }
};