import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiChevronDown } from "react-icons/fi";

// Kept as its own top-level component — nesting this inside the modal
// would remount it on every keystroke and break focus, same bug as before.
export default function UserAutocomplete({ users, value, onSelect, error }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedUser = users.find((u) => u.id === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return users.slice(0, 8);
    const q = query.toLowerCase();
    return users
      .filter(
        (u) =>
          u.fullName?.toLowerCase().includes(q) ||
          u.employeeId?.toLowerCase().includes(q) ||
          u.department?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [users, query]);

  const handleSelect = (user) => {
    onSelect(user.id);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {selectedUser && !open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm ${
            error ? "border-rose-300" : "border-slate-200"
          } hover:bg-slate-50`}
        >
          <span className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-600">
              {selectedUser.fullName?.slice(0, 2).toUpperCase()}
            </span>
            <span className="text-slate-700">{selectedUser.fullName}</span>
            <span className="text-xs text-slate-400">· {selectedUser.employeeId}</span>
          </span>
          <FiChevronDown size={14} className="text-slate-400" />
        </button>
      ) : (
        <div className="relative">
          <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Search by name, employee ID, or email..."
            className={`w-full rounded-lg border py-2 pl-8 pr-3 text-sm outline-none transition focus:ring-2 ${
              error ? "border-rose-300 focus:ring-rose-100" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
            }`}
          />
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg"
          >
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-400">No users found</p>
            ) : (
              filtered.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelect(u)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-indigo-50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
                    {u.fullName?.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700">{u.fullName}</p>
                    <p className="truncate text-xs text-slate-400">
                      {u.employeeId} · {u.department} · {u.email}
                    </p>
                  </span>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}