import { motion } from "framer-motion";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, LineChart, Line
} from "recharts";
import { STATUS_META, DEPARTMENT, RISK_CATEGORY } from "../../../constants/KriEnums";
import { readableEnum } from "../../../utils/kriHelpers";

const panelVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } })
};

function ChartPanel({ index, title, subtitle, children }) {
  return (
    <motion.div
      custom={index}
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl"
    >
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </motion.div>
  );
}

export function StatusPieChart({ kris }) {
  const data = ["GREEN", "AMBER", "RED"].map((s) => ({
    name: STATUS_META[s].label,
    value: kris.filter((k) => k.status === s).length,
    color: STATUS_META[s].color
  }));
  return (
    <ChartPanel index={0} title="Status Distribution" subtitle="Share of KRIs by threshold zone">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={82} paddingAngle={3} animationDuration={900}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={24} />
        </PieChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}

export function DepartmentBarChart({ kris }) {
  const data = DEPARTMENT.map((d) => ({
    department: readableEnum(d).split(" ")[0],
    count: kris.filter((k) => k.department === d).length
  })).filter((d) => d.count > 0);

  return (
    <ChartPanel index={1} title="KRIs by Department" subtitle="Distribution across business units">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="department" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip cursor={{ fill: "#f8fafc" }} />
          <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} animationDuration={800} />
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}

export function CategoryAreaChart({ kris }) {
  const data = RISK_CATEGORY.map((c) => ({
    category: readableEnum(c).split(" ")[0],
    count: kris.filter((k) => k.riskCategory === c).length
  })).filter((d) => d.count > 0);

  return (
    <ChartPanel index={2} title="Category Exposure" subtitle="Where risk concentration sits">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="catFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="category" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={55} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#catFill)" animationDuration={1000} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}

// Trend needs a per-record timestamp — uses updatedAt/createdAt if your entity has it,
// falls back to a flat cumulative line if not (kept honest, not fabricated data).
export function TrendLineChart({ kris }) {
  const withDates = kris.filter((k) => k.updatedAt || k.createdAt);
  const source = withDates.length ? withDates : kris;

  const grouped = source.reduce((acc, k) => {
    const raw = k.updatedAt || k.createdAt;
    const key = raw ? new Date(raw).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const data = Object.entries(grouped).map(([date, count]) => ({ date, count }));

  return (
    <ChartPanel index={3} title="Update Activity" subtitle={withDates.length ? "KRIs updated over time" : "No timestamp field found — showing snapshot"}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} animationDuration={1000} />
        </LineChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}