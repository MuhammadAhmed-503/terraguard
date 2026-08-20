"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  BarChart3,
  LineChart as LineChartIcon,
} from "lucide-react";
import { useState } from "react";

const ndviTrendData = [
  { year: "2020", ndvi: 0.42, temperature: 22.1, precipitation: 450 },
  { year: "2021", ndvi: 0.38, temperature: 22.8, precipitation: 380 },
  { year: "2022", ndvi: 0.44, temperature: 21.9, precipitation: 520 },
  { year: "2023", ndvi: 0.40, temperature: 23.2, precipitation: 340 },
  { year: "2024", ndvi: 0.46, temperature: 22.5, precipitation: 490 },
  { year: "2025", ndvi: 0.50, temperature: 22.0, precipitation: 470 },
];

const monthlyData = [
  { month: "Jan", ndvi: 0.32, temp: 18.5, precip: 45 },
  { month: "Feb", ndvi: 0.35, temp: 19.2, precip: 38 },
  { month: "Mar", ndvi: 0.38, temp: 20.8, precip: 52 },
  { month: "Apr", ndvi: 0.42, temp: 22.4, precip: 61 },
  { month: "May", ndvi: 0.46, temp: 24.1, precip: 43 },
  { month: "Jun", ndvi: 0.50, temp: 25.8, precip: 58 },
  { month: "Jul", ndvi: 0.48, temp: 26.5, precip: 72 },
  { month: "Aug", ndvi: 0.44, temp: 26.2, precip: 68 },
  { month: "Sep", ndvi: 0.40, temp: 24.8, precip: 55 },
  { month: "Oct", ndvi: 0.37, temp: 22.6, precip: 42 },
  { month: "Nov", ndvi: 0.34, temp: 20.4, precip: 38 },
  { month: "Dec", ndvi: 0.31, temp: 18.9, precip: 48 },
];

const regionData = [
  { name: "Forest", value: 45, color: "#10b981" },
  { name: "Agriculture", value: 30, color: "#f59e0b" },
  { name: "Urban", value: 15, color: "#6366f1" },
  { name: "Water", value: 10, color: "#3b82f6" },
];

const riskTrendData = [
  { month: "Jan", risk: 35 },
  { month: "Feb", risk: 38 },
  { month: "Mar", risk: 42 },
  { month: "Apr", risk: 45 },
  { month: "May", risk: 52 },
  { month: "Jun", risk: 58 },
  { month: "Jul", risk: 62 },
  { month: "Aug", risk: 55 },
  { month: "Sep", risk: 48 },
  { month: "Oct", risk: 42 },
  { month: "Nov", risk: 38 },
  { month: "Dec", risk: 32 },
];

type ChartType = "line" | "bar" | "area";

export default function TrendsPage() {
  const [chartType, setChartType] = useState<ChartType>("line");
  const [timeRange, setTimeRange] = useState<"yearly" | "monthly">("yearly");

  const currentData = timeRange === "yearly" ? ndviTrendData : monthlyData;
  const dataKey = timeRange === "yearly" ? "year" : "month";

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <LineChart data={currentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={dataKey} stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                color: "#0f172a",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="ndvi"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
              name="NDVI"
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: "#f59e0b", r: 4 }}
              name="Temperature (C)"
            />
          </LineChart>
        );
      case "bar":
        return (
          <BarChart data={currentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={dataKey} stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                color: "#0f172a",
              }}
            />
            <Legend />
            <Bar dataKey="ndvi" fill="#10b981" name="NDVI" />
            <Bar dataKey="precipitation" fill="#3b82f6" name="Precipitation (mm)" />
          </BarChart>
        );
      case "area":
        return (
          <AreaChart data={currentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={dataKey} stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                color: "#0f172a",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="ndvi"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
              name="NDVI"
            />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.3}
              name="Temperature (C)"
            />
          </AreaChart>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <section className="relative overflow-hidden pt-20 pb-8 md:pt-28 md:pb-12">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-block px-4 py-1.5 mb-4 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  Environmental Trends
                </span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white"
              >
                Trends and Analytics
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-2 text-slate-600 dark:text-slate-400"
              >
                Historical environmental data and trend analysis
              </motion.p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setTimeRange("yearly")}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    timeRange === "yearly"
                      ? "bg-white dark:bg-slate-700 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Yearly
                </button>
                <button
                  onClick={() => setTimeRange("monthly")}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    timeRange === "monthly"
                      ? "bg-white dark:bg-slate-700 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Monthly
                </button>
              </div>

              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setChartType("line")}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    chartType === "line"
                      ? "bg-white dark:bg-slate-700 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <LineChartIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setChartType("bar")}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    chartType === "bar"
                      ? "bg-white dark:bg-slate-700 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setChartType("area")}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    chartType === "area"
                      ? "bg-white dark:bg-slate-700 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Activity className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  NDVI and Temperature Trends
                </h2>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span>{timeRange === "yearly" ? "2020-2025" : "Monthly"}</span>
                </div>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: "Avg NDVI", value: "0.43", change: "+8%", trend: "up" },
                { label: "Avg Temp", value: "22.5C", change: "+0.4C", trend: "up" },
                { label: "Peak NDVI", value: "0.50", change: "+12%", trend: "up" },
                { label: "Risk Score", value: "45/100", change: "-5%", trend: "down" },
              ].map((stat, index) => (
                <div key={index} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                  <p className={`text-xs mt-1 flex items-center gap-1 ${
                    stat.trend === "up" ? "text-emerald-500" : "text-red-500"
                  }`}>
                    {stat.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stat.change}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Risk Trend</h2>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={riskTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        color: "#0f172a",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="risk"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ fill: "#ef4444", r: 3 }}
                      name="Risk Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Land Cover</h2>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={regionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {regionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        color: "#0f172a",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {regionData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-slate-600 dark:text-slate-400">{item.name}</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Key Insights</h2>
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">NDVI is trending upward</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+8% increase over 5 years</p>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800/50">
                  <p className="text-xs text-amber-700 dark:text-amber-300">Temperature stable</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">22.5C average</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800/50">
                  <p className="text-xs text-blue-700 dark:text-blue-300">Precipitation</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Peaks in July-August</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}