import React from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";
import { SkeletonChartCard } from "./Skeletons";
import { ShieldCheck } from "lucide-react";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const item = payload[0];

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="text-slate-900 font-semibold">
        {item.name}: {item.value}
      </p>
    </div>
  );
};

const FindingsSeverityChart = ({
  data,
  loading,
  error,
  onRetry,
}) => {
  if (loading) return <SkeletonChartCard />;

  const total =
    data?.reduce((sum, d) => sum + Number(d.value || 0), 0) ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="rounded-[20px] border border-slate-200 bg-white p-6 h-full shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Compliance Findings by Severity
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Distribution of currently open findings
          </p>
        </div>

        <div className="h-9 w-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
          <ShieldCheck size={17} className="text-rose-500" />
        </div>
      </div>

      {error ? (
        <ErrorState
          message="Unable to load findings."
          onRetry={onRetry}
        />
      ) : total === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No compliance findings"
          subtitle="Great! Your compliance status is clear."
        />
      ) : (
        <div className="relative">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                animationDuration={1000}
                animationEasing="ease-out"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs text-slate-600">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          <div
            className="absolute inset-0 top-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ height: 244 }}
          >
            <span className="text-2xl font-bold text-slate-900">
              {total}
            </span>

            <span className="text-[11px] text-slate-500">
              Total Findings
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FindingsSeverityChart;