import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";

const ProgressTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0].payload;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md text-sm">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        <span className="font-medium text-slate-800">{name}</span>
      </div>
      <p className="mt-1 text-slate-500">{value}% average progress</p>
    </div>
  );
};

const AuditProgressChart = ({ data = [] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h3 className="text-base font-semibold text-slate-900">Audit Progress</h3>
      <p className="text-xs text-slate-400 mb-2">Average completion by status</p>

      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-slate-400">
          No progress data to display
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ProgressTooltip />} cursor={{ fill: "rgba(15,23,42,0.04)" }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={900} barSize={18}>
                {data.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default AuditProgressChart;