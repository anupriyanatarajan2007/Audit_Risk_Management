
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { getProfile } from "../service/AuthService";

// =========================
// Animation
// =========================

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

// =========================
// Skeleton
// =========================

function ProfileSkeleton() {
  return (
    <div className="p-8">
      <div className="max-w-4xl rounded-2xl border border-white/60 bg-white/70 p-8 shadow-sm backdrop-blur-xl">
        <div className="mb-8 flex items-center gap-5">
          <div className="h-24 w-24 animate-pulse rounded-full bg-slate-200" />

          <div className="space-y-2">
            <div className="h-7 w-48 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-4 w-32 animate-pulse rounded-lg bg-slate-100" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-slate-100"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// =========================
// Profile Item
// =========================

function ProfileItem({ icon: Icon, title, value, index }) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover={{
        y: -3,
        transition: { duration: 0.15 },
      }}
      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/80 p-4 shadow-sm backdrop-blur transition hover:border-emerald-200 hover:shadow-md"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400">{title}</p>

        <p className="truncate font-semibold text-slate-800">
          {value || "Not Available"}
        </p>
      </div>
    </motion.div>
  );
}

// =========================
// Profile
// =========================

export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getProfile();

      console.log("PROFILE RESPONSE:", data);

      setUser(data);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex max-w-4xl items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-600">
          <AlertCircle size={18} />

          <span>{error}</span>

          <button
            onClick={loadProfile}
            className="ml-auto font-medium underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // =========================
  // Entity-safe values
  // =========================

  const departmentName =
    typeof user.department === "object"
      ? user.department?.name
      : user.department;

  const roleName =
    typeof user.role === "object"
      ? user.role?.name
      : user.role;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.45,
          ease: "easeOut",
        }}
        className="max-w-4xl rounded-2xl border border-white/60 bg-white/80 p-8 shadow-sm backdrop-blur-xl"
      >
        {/* =========================
            Header
        ========================= */}

        <div className="mb-8 flex items-center gap-5">
          <motion.div
            initial={{
              scale: 0.7,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 18,
              delay: 0.1,
            }}
            className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-4xl font-bold text-white shadow-lg shadow-emerald-200"
          >
            <span className="absolute inset-0 animate-[pulseGlow_2.5s_ease-in-out_infinite] rounded-full" />

            {user.firstName?.charAt(0)?.toUpperCase() || "U"}
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: -10,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.2,
              duration: 0.4,
            }}
          >
            <h1 className="text-3xl font-bold text-slate-800">
              {user.firstName} {user.lastName}
            </h1>

            <p className="text-slate-400">
              {user.designation || "Not Available"}
            </p>
          </motion.div>
        </div>

        {/* =========================
            Details
        ========================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ProfileItem
            index={0}
            icon={User}
            title="Employee ID"
            value={user.employeeId}
          />

          <ProfileItem
            index={1}
            icon={Mail}
            title="Email"
            value={user.email}
          />

          <ProfileItem
            index={2}
            icon={Phone}
            title="Phone"
            value={user.phoneNumber}
          />

          {/* FIXED DEPARTMENT */}
          <ProfileItem
            index={3}
            icon={Building}
            title="Department"
            value={departmentName}
          />

          <ProfileItem
            index={4}
            icon={MapPin}
            title="Location"
            value={[user.city, user.state, user.country]
              .filter(Boolean)
              .join(", ")}
          />

          <ProfileItem
            index={5}
            icon={Calendar}
            title="Date of Birth"
            value={user.dateOfBirth}
          />
        </div>

        {/* =========================
            Role
        ========================= */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 0.5,
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className="mt-8"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            {roleName || "Role Not Available"}
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
