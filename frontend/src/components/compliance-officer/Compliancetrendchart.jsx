import React from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ErrorState from "./ErrorState";
import { SkeletonChartCard } from "./Skeletons";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="text-slate-500 mb-0.5">{label}</p>
      <p className="text-slate-900 font-semibold">
        {payload[0].value}% compliant
      </p>
    </div>
  );
};

const ComplianceTrendChart = ({ data, loading, error, onRetry }) => {
  if (loading) {
    return <SkeletonChartCard />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="rounded-[20px] border border-slate-200 bg-white p-6 h-full shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-slate-900">
          Compliance Score Trend
        </h3>

        <p className="text-xs text-slate-500 mt-1">
          Monthly compliance score over the last 7 months
        </p>
      </div>

      {error ? (
        <ErrorState
          message="Unable to load compliance trend."
          onRetry={onRetry}
        />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -10,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />

            <Tooltip content={<CustomTooltip />} />

            <Line
              type="monotone"
              dataKey="score"
              stroke="#0d9488"
              strokeWidth={2.5}
              dot={{
                r: 3,
                fill: "#0d9488",
                strokeWidth: 0,
              }}
              activeDot={{
                r: 5,
              }}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
};

export default ComplianceTrendChart;