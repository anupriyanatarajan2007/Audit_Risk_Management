// src/components/dashboard/shared/normalize.js

/**
 * Builds an { id -> name } map from a list of entities.
 * Works whether the entity uses `id`/`name`, `departmentId`/`departmentName`,
 * `roleId`/`roleName`, or `organizationId`/`organizationName`.
 */
export function buildNameMap(list = [], idKeys = ["id"], nameKeys = ["name"]) {
    const map = {};
    (list || []).forEach((item) => {
        const idKey = idKeys.find((k) => item?.[k] !== undefined);
        const nameKey = nameKeys.find((k) => item?.[k] !== undefined);
        if (idKey && nameKey) {
            map[item[idKey]] = item[nameKey];
        }
    });
    return map;
}

/**
 * Given one data row from a dashboard "by-X" endpoint, resolve a safe,
 * renderable label — never an [object Object].
 *
 * Handles three backend shapes:
 * 1. { name: "IT Department", count: 42 }
 * 2. { departmentId: 3, departmentName: "IT Department", count: 42 }
 * 3. { departmentId: 3, count: 42 }  -> resolved via nameMap
 */
export function resolveLabel(row, { directKeys = [], idKey, nameMap = {} } = {}) {
    for (const key of directKeys) {
        const val = row?.[key];
        if (typeof val === "string" && val.trim()) return val;
    }

    if (idKey && row?.[idKey] !== undefined) {
        const resolved = nameMap[row[idKey]];
        if (resolved) return resolved;
        return `#${row[idKey]}`;
    }

    return "Unknown";
}

export function resolveCount(row, keys = ["count", "userCount", "total", "value"]) {
    for (const key of keys) {
        if (typeof row?.[key] === "number") return row[key];
    }
    return 0;
}