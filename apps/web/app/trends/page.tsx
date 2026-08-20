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
import { useEffect, useState } from "react";

const cities = {
  Lahore: { latitude: 31.5204, longitude: 74.3587 },
  Islamabad: { latitude: 33.6844, longitude: 73.0479 },
  Peshawar: { latitude: 34.0151, longitude: 71.5249 },
  Jheum: { latitude: 32.9425, longitude: 73.7257 },
  Jhelum: { latitude: 32.9425, longitude: 73.7257 },
  Gujranwala: { latitude: 32.1877, longitude: 74.1945 },
  Gujrat: { latitude: 32.5736, longitude: 74.0787 },
  Karachi: { latitude: 24.8607, longitude: 67.0011 },
  Quetta: { latitude: 30.1798, longitude: 66.975 },
  Faisalabad: { latitude: 31.4504, longitude: 73.135 },
  Hyderabad: { latitude: 25.396, longitude: 68.3578 },
} as const;

type CityName = keyof typeof cities;
type TrendPoint = { year?: string; month?: string; temperature: number; precipitation: number; ndvi?: number };
type WeatherResponse = { daily?: { time: string[]; temperature_2m_mean: (number | null)[]; precipitation_sum: (number | null)[] } };
type NdviResponse = { yearly_data?: { year: number; ndvi: number }[] };

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function aggregateWeather(data: WeatherResponse): TrendPoint[] {
  const daily = data.daily;
  if (!daily) return [];
  const buckets = new Map<string, { temperatures: number[]; precipitation: number }>();
  daily.time.forEach((date, index) => {
    const key = date.slice(0, 7);
    const bucket = buckets.get(key) || { temperatures: [], precipitation: 0 };
    const temperature = daily.temperature_2m_mean[index];
    if (typeof temperature === "number") bucket.temperatures.push(temperature);
    bucket.precipitation += daily.precipitation_sum[index] || 0;
    buckets.set(key, bucket);
  });
  const monthly = Array.from(buckets.entries()).map(([key, bucket]) => ({
    key,
    temperature: bucket.temperatures.reduce((sum, value) => sum + value, 0) / Math.max(bucket.temperatures.length, 1),
    precipitation: bucket.precipitation,
  }));
  return monthly.reduce<TrendPoint[]>((result, item) => {
    const year = item.key.slice(0, 4);
    const existing = result.find((entry) => entry.year === year);
    if (existing) {
      existing.temperature = (existing.temperature + item.temperature) / 2;
      existing.precipitation += item.precipitation;
    } else {
      result.push({ year, temperature: item.temperature, precipitation: item.precipitation });
    }
    return result;
  }, []);
}

function monthlyWeather(data: WeatherResponse): TrendPoint[] {
  const daily = data.daily;
  if (!daily) return [];
  return monthNames.map((month, monthIndex) => {
    const values = daily.time.reduce<{ temperatures: number[]; precipitation: number }>((result, date, index) => {
      if (Number(date.slice(5, 7)) === monthIndex + 1) {
        const temperature = daily.temperature_2m_mean[index];
        if (typeof temperature === "number") result.temperatures.push(temperature);
        result.precipitation += daily.precipitation_sum[index] || 0;
      }
      return result;
    }, { temperatures: [], precipitation: 0 });
    return { month, temperature: values.temperatures.reduce((sum, value) => sum + value, 0) / Math.max(values.temperatures.length, 1), precipitation: values.precipitation };
  });
}

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
  const [selectedCity, setSelectedCity] = useState<CityName>("Lahore");
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [ndviData, setNdviData] = useState<NdviResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    const city = cities[selectedCity];
    const params = new URLSearchParams({
      latitude: String(city.latitude),
      longitude: String(city.longitude),
      start_date: "2020-01-01",
      end_date: "2025-12-31",
      daily: "temperature_2m_mean,precipitation_sum",
      timezone: "Asia/Karachi",
    });
    setIsLoading(true);
    setWeatherError(null);
    const weatherRequest = fetch(`https://archive-api.open-meteo.com/v1/archive?${params}`)
      .then((response) => {
        if (!response.ok) throw new Error("Historical weather service is unavailable.");
        return response.json() as Promise<WeatherResponse>;
      })
    const ndviRequest = fetch("http://127.0.0.1:8000/trends/city", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(city),
    }).then((response) => response.ok ? response.json() as Promise<NdviResponse> : null).catch(() => null);

    Promise.all([weatherRequest, ndviRequest])
      .then(([weather, ndvi]) => {
        setWeatherData(weather);
        setNdviData(ndvi);
      })
      .catch((error: unknown) => setWeatherError(error instanceof Error ? error.message : "Unable to load historical trends."))
      .finally(() => setIsLoading(false));
  }, [selectedCity]);

  const weatherTrendData = weatherData ? (timeRange === "yearly" ? aggregateWeather(weatherData) : monthlyWeather(weatherData)) : [];
  const currentData = weatherTrendData.map((point) => {
    const ndvi = point.year ? ndviData?.yearly_data?.find((item) => String(item.year) === point.year)?.ndvi : undefined;
    return { ...point, temperature: Number(point.temperature.toFixed(1)), ndvi };
  });
  const dataKey = timeRange === "yearly" ? "year" : "month";
  const averageTemperature = currentData.length ? currentData.reduce((sum, item) => sum + item.temperature, 0) / currentData.length : 0;
  const peakTemperature = currentData.length ? Math.max(...currentData.map((item) => item.temperature)) : 0;
  const ndviValues = currentData.flatMap((item) => typeof item.ndvi === "number" ? [item.ndvi] : []);
  const averageNdvi = ndviValues.length ? ndviValues.reduce((sum, value) => sum + value, 0) / ndviValues.length : null;

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
              dataKey="temperature"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: "#f59e0b", r: 4 }}
              name="Temperature (C)"
            />
            {timeRange === "yearly" && <Line
              type="monotone"
              dataKey="ndvi"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
              name="NDVI"
              connectNulls
            />}
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
            <Bar dataKey="temperature" fill="#f59e0b" name="Temperature (°C)" />
            <Bar dataKey="precipitation" fill="#3b82f6" name="Precipitation (mm)" />
            {timeRange === "yearly" && <Bar dataKey="ndvi" fill="#10b981" name="NDVI" />}
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
              dataKey="temperature"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.3}
              name="Temperature (C)"
            />
            {timeRange === "yearly" && <Area
              type="monotone"
              dataKey="ndvi"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
              name="NDVI"
              connectNulls
            />}
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
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">City</span>
                <select
                  value={selectedCity}
                  onChange={(event) => setSelectedCity(event.target.value as CityName)}
                  className="bg-transparent font-semibold outline-none"
                  aria-label="Select a Pakistani city"
                >
                  {Object.keys(cities).map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
              </label>
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
                  {selectedCity} Temperature and NDVI Trends
                </h2>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span>{timeRange === "yearly" ? "2020-2025" : "Monthly averages"}</span>
                </div>
              </div>
              {isLoading ? <div className="flex h-[400px] items-center justify-center text-sm text-slate-500">Loading historical weather for {selectedCity}...</div> : weatherError ? <div className="flex h-[400px] items-center justify-center text-sm text-red-500">{weatherError}</div> : <div className="h-[400px]"><ResponsiveContainer width="100%" height="100%">{renderChart()}</ResponsiveContainer></div>}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: "Average temperature", value: `${averageTemperature.toFixed(1)}°C`, change: selectedCity, trend: "up" },
                { label: "Peak temperature", value: `${peakTemperature.toFixed(1)}°C`, change: "Historical daily mean", trend: "up" },
                { label: "Data source", value: "Open-Meteo", change: "2020-2025 archive", trend: "up" },
                { label: "Location", value: selectedCity, change: "Pakistan", trend: "up" },
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
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">Historical NDVI</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{averageNdvi === null ? "Unavailable" : `${averageNdvi.toFixed(2)} average from Sentinel-2`}</p>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800/50">
                  <p className="text-xs text-amber-700 dark:text-amber-300">{selectedCity} temperature average</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{averageTemperature.toFixed(1)}°C across the selected range</p>
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