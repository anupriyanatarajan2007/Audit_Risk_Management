import React from "react";
import { motion } from "framer-motion";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

const statusColor = {
  Good: "text-teal-700 bg-teal-50 border-teal-200",
  Fair: "text-amber-700 bg-amber-50 border-amber-200",
  "Needs Attention":
    "text-rose-700 bg-rose-50 border-rose-200",
};

const ComplianceScoreCard = ({
  score = 0,
  status = "Good",
  compliant = 0,
  partial = 0,
  nonCompliant = 0,
}) => {
  const chartData = [
    {
      name: "score",
      value: score,
      fill: "#0d9488",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
      }}
      whileHover={{
        y: -3,
      }}
      className="
        rounded-[20px]
        border
        border-slate-200
        bg-white
        p-6
        h-full
        shadow-sm
        hover:shadow-lg
        transition-all
        duration-300
      "
    >
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-slate-900">
          Overall Compliance Health
        </h3>

        <p className="text-xs text-slate-500 mt-1">
          Composite score across all active requirements
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-7">
        {/* Score Chart */}
        <div className="relative h-44 w-44 shrink-0">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="72%"
              outerRadius="100%"
              barSize={12}
              data={chartData}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />

              <RadialBar
                background={{
                  fill: "#e2e8f0",
                }}
                dataKey="value"
                cornerRadius={20}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </RadialBarChart>
          </ResponsiveContainer>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-900">
              {score}%
            </span>

            <span className="text-[11px] text-slate-500 mt-0.5">
              Compliance Score
            </span>

            <span
              className={`
                mt-2
                text-[10px]
                font-semibold
                px-2.5
                py-1
                rounded-full
                border
                ${
                  statusColor[status] ??
                  statusColor.Good
                }
              `}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex-1 w-full space-y-4">
          {[
            {
              label: "Compliant",
              value: compliant,
              dot: "bg-teal-500",
              text: "text-teal-700",
            },
            {
              label: "Partial",
              value: partial,
              dot: "bg-amber-500",
              text: "text-amber-700",
            },
            {
              label: "Non-Compliant",
              value: nonCompliant,
              dot: "bg-rose-500",
              text: "text-rose-700",
            },
          ].map((row) => (
            <div
              key={row.label}
              className="
                flex
                items-center
                justify-between
                rounded-xl
                border
                border-slate-100
                bg-slate-50
                px-3
                py-2.5
                transition-all
                hover:bg-slate-100
              "
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`
                    h-2.5
                    w-2.5
                    rounded-full
                    ${row.dot}
                  `}
                />

                <span className="text-sm font-medium text-slate-600">
                  {row.label}
                </span>
              </div>

              <span
                className={`
                  text-sm
                  font-bold
                  ${row.text}
                `}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ComplianceScoreCard;