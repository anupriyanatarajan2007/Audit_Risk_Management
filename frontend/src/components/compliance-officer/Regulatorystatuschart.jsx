import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import ErrorState from "./ErrorState";
import { SkeletonChartCard } from "./Skeletons";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const item = payload[0];

  return (
    <div className="rounded-2xl border border-teal-400/20 bg-[#0b141b]/95 backdrop-blur-xl px-4 py-3 shadow-2xl shadow-black/30">
      <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
        {item.payload.name}
      </p>

      <p className="text-lg font-semibold text-white">
        {item.value}
        <span className="text-xs font-normal text-slate-400 ml-1">
          requirements
        </span>
      </p>
    </div>
  );
};

const RegulatoryStatusChart = ({
  data = [],
  loading,
  error,
  onRetry,
}) => {
  const navigate = useNavigate();

  if (loading) return <SkeletonChartCard />;

  const total = data.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.015] backdrop-blur-2xl p-6 h-full shadow-xl shadow-black/10"
    >
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-teal-400/10 blur-3xl opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="relative flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl border border-teal-400/20 bg-teal-400/10 flex items-center justify-center">
              <BarChart size={15} className="text-teal-300" />
            </div>

            <h3 className="text-sm font-semibold text-white">
              Regulatory Requirements
            </h3>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Requirements grouped by current compliance status
          </p>
        </div>

        {/* Total */}
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Total
          </p>

          <p className="text-xl font-semibold text-white">
            {total}
          </p>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <ErrorState
          message="Unable to load regulatory requirements."
          onRetry={onRetry}
        />
      ) : !data.length ? (
        <div className="h-[280px] flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center">
            <BarChart size={20} className="text-slate-500" />
          </div>

          <p className="text-sm text-slate-300 mt-3">
            No regulatory data available
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Requirements will appear here once added.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={data}
            margin={{
              top: 15,
              right: 10,
              left: -15,
              bottom: 5,
            }}
            barCategoryGap="25%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.055)"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              stroke="rgba(148,163,184,0.55)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={0}
              height={45}
            />

            <YAxis
              stroke="rgba(148,163,184,0.55)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                fill: "rgba(45,212,191,0.035)",
              }}
            />

            <Bar
              dataKey="value"
              radius={[10, 10, 3, 3]}
              animationDuration={1100}
              animationEasing="ease-out"
              onClick={(entry) =>
                navigate(
                  `/regulatory-requirements?status=${entry.key}`
                )
              }
              cursor="pointer"
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.key ?? index}
                  fill={entry.color || "#2dd4bf"}
                  className="transition-opacity hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Footer */}
      {!error && data.length > 0 && (
        <div className="mt-2 pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            Click any bar to view requirements
          </span>

          <button
            type="button"
            onClick={() => navigate("/regulatory-requirements")}
            className="text-[10px] font-medium text-teal-300 hover:text-teal-200 transition-colors"
          >
            View all →
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default RegulatoryStatusChart;