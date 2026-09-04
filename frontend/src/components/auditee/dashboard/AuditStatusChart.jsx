import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const CustomTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0].payload;
  const pct = total ? Math.round((value / total) * 100) : 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md text-sm">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        <span className="font-medium text-slate-800">{name}</span>
      </div>
      <p className="mt-1 text-slate-500">
        {value} audit{value !== 1 ? "s" : ""} · {pct}%
      </p>
    </div>
  );
};

const AuditStatusChart = ({ data = [] }) => {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h3 className="text-base font-semibold text-slate-900">Audit Status Overview</h3>
      <p className="text-xs text-slate-400 mb-2">Distribution of your audits by current status</p>

      {total === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-slate-400">
          No audit data to display
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={2}
                animationDuration={800}
              >
                {data.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} stroke="white" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip total={total} />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default AuditStatusChart;