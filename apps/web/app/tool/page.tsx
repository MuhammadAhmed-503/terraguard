"use client";

import { useEffect, useState } from "react";
import TerraGuardMap from "../components/Map";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Point = {
  lat: number;
  lng: number;
};

type ApiStatus = {
  status: string;
  service: string;
  version: string;
};

type HistoricalResult = {
  year: number;
  image_id: string | null;
  mean_ndvi: number | null;
};

type TemperatureResult = {
  source: string;
  unit: string;
  mean_celsius: number | null;
  min_celsius: number | null;
  max_celsius: number | null;
};

type WaterResult = {
  source: string;
  current_water_percent: number | null;
  baseline_water_percent: number | null;
  water_change_percent: number | null;
  historical_occurrence_percent: number | null;
  confidence: "available" | "limited" | "no_data" | string;
};

type MoistureResult = {
  source: string;
  status?: string;
  current_precip_mm?: number;
  baseline_precip_mm?: number;
  change_percent?: number;
  moisture_status?: string;
  confidence: string;
};

type RiskComponent = {
  score: number;
  status: string;
  details: string;
};

type RiskResult = {
  condition: string;
  risk_level: string;
  description: string;
  score: number;
  components?: {
    vegetation_stress: RiskComponent;
    historical_decline: RiskComponent;
    temperature_anomaly: RiskComponent;
    water_decline: RiskComponent;
    moisture_stress: RiskComponent;
    historical_trend: RiskComponent;
  };
};

type AIAnalysisResult = {
  status: string;
  executive_summary: string;
  signals: string[];
  contributing_factors: string[];
  confidence: string;
  investigation_priority: string;
};

type InvestigationPriority = {
  level: string;
  score: number;
  description: string;
  components?: {
    risk_score: number;
    ndvi_change: number;
    temperature_anomaly: number;
    water_change: number;
  };
};

type AnalysisResult = {
  status: string;
  point_count: number;
  satellite: {
    source: string;
    image_id: string | null;
  };
  vegetation: {
    mean_ndvi: number | null;
    min_ndvi: number | null;
    max_ndvi: number | null;
  };
  temperature: TemperatureResult;
  water: WaterResult;
  moisture: MoistureResult | null;
  risk: RiskResult;
  risk_original: {
    condition: string;
    risk_level: string;
    description: string;
  };
  environmental_summary: {
    overall_status: string;
    key_signal: string;
    explanation: string;
  };
  historical: HistoricalResult[];
  historical_improved?: {
    current_ndvi: number | null;
    baseline_mean: number | null;
    change_percent: number | null;
    trend_direction: string;
    yearly_data: { year: number; ndvi: number }[];
  };
  ai_analysis?: AIAnalysisResult;
  investigation_priority?: InvestigationPriority;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function parseAnalysisResult(value: unknown): AnalysisResult | null {
  if (!isRecord(value)) {
    return null;
  }

  const satellite = isRecord(value.satellite) ? value.satellite : null;
  const vegetation = isRecord(value.vegetation) ? value.vegetation : null;
  const temperature = isRecord(value.temperature) ? value.temperature : null;
  const water = isRecord(value.water) ? value.water : null;
  const moisture = isRecord(value.moisture) ? value.moisture : null;
  const risk = isRecord(value.risk) ? value.risk : null;
  const riskOriginal = isRecord(value.risk_original) ? value.risk_original : null;
  const summary = isRecord(value.environmental_summary)
    ? value.environmental_summary
    : null;
  const historicalImproved = isRecord(value.historical_improved) ? value.historical_improved : null;
  const aiAnalysis = isRecord(value.ai_analysis) ? value.ai_analysis : null;
  const investigationPriority = isRecord(value.investigation_priority) ? value.investigation_priority : null;

  if (
    typeof value.point_count !== "number" ||
    !satellite ||
    !vegetation ||
    !risk ||
    !summary
  ) {
    return null;
  }

  const historical = Array.isArray(value.historical)
    ? value.historical.flatMap((item): HistoricalResult[] => {
        if (!isRecord(item) || typeof item.year !== "number") {
          return [];
        }
        return [{
          year: item.year,
          image_id: typeof item.image_id === "string" ? item.image_id : null,
          mean_ndvi: readNullableNumber(item.mean_ndvi),
        }];
      })
    : [];

  const parseComponent = (comp: unknown): RiskComponent => {
    if (isRecord(comp)) {
      return {
        score: typeof comp.score === "number" ? comp.score : 0,
        status: typeof comp.status === "string" ? comp.status : "Unknown",
        details: typeof comp.details === "string" ? comp.details : "",
      };
    }
    return { score: 0, status: "Unknown", details: "" };
  };

  const riskComponents = isRecord(risk.components) ? risk.components : {};
  const getCompValue = (obj: unknown, key: string, fallback: number = 0): number => {
    if (isRecord(obj) && typeof obj[key] === "number") {
      return obj[key] as number;
    }
    return fallback;
  };

  return {
    status: readString(value.status, "unknown"),
    point_count: value.point_count,
    satellite: {
      source: readString(satellite.source, "Unknown satellite source"),
      image_id: typeof satellite.image_id === "string" ? satellite.image_id : null,
    },
    vegetation: {
      mean_ndvi: readNullableNumber(vegetation.mean_ndvi),
      min_ndvi: readNullableNumber(vegetation.min_ndvi),
      max_ndvi: readNullableNumber(vegetation.max_ndvi),
    },
    temperature: {
      source: readString(temperature?.source, "Temperature data unavailable"),
      unit: readString(temperature?.unit, "Celsius"),
      mean_celsius: readNullableNumber(temperature?.mean_celsius),
      min_celsius: readNullableNumber(temperature?.min_celsius),
      max_celsius: readNullableNumber(temperature?.max_celsius),
    },
    water: {
      source: readString(water?.source, "Water data unavailable"),
      current_water_percent: readNullableNumber(water?.current_water_percent),
      baseline_water_percent: readNullableNumber(water?.baseline_water_percent),
      water_change_percent: readNullableNumber(water?.water_change_percent),
      historical_occurrence_percent: readNullableNumber(
        water?.historical_occurrence_percent
      ),
      confidence: readString(water?.confidence, "no_data"),
    },
    moisture: moisture
      ? {
          source: readString(moisture.source, "Moisture data unavailable"),
          status: readString(moisture.status, "unavailable"),
          current_precip_mm: readNullableNumber(moisture.current_precip_mm) ?? undefined,
          baseline_precip_mm: readNullableNumber(moisture.baseline_precip_mm) ?? undefined,
          change_percent: readNullableNumber(moisture.change_percent) ?? undefined,
          moisture_status: readString(moisture.moisture_status, "Unknown"),
          confidence: readString(moisture.confidence, "no_data"),
        }
      : null,
    risk: {
      condition: readString(risk.condition, "Unavailable"),
      risk_level: readString(risk.risk_level, "Unavailable"),
      description: readString(risk.description, "Risk description unavailable."),
      score: typeof risk.score === "number" ? risk.score : 0,
      components: {
        vegetation_stress: parseComponent(riskComponents.vegetation_stress),
        historical_decline: parseComponent(riskComponents.historical_decline),
        temperature_anomaly: parseComponent(riskComponents.temperature_anomaly),
        water_decline: parseComponent(riskComponents.water_decline),
        moisture_stress: parseComponent(riskComponents.moisture_stress),
        historical_trend: parseComponent(riskComponents.historical_trend),
      },
    },
    risk_original: {
      condition: readString(riskOriginal?.condition, "Unavailable"),
      risk_level: readString(riskOriginal?.risk_level, "Unavailable"),
      description: readString(riskOriginal?.description, "Risk description unavailable."),
    },
    environmental_summary: {
      overall_status: readString(summary.overall_status, "Assessment unavailable"),
      key_signal: readString(summary.key_signal, "No key signal available."),
      explanation: readString(summary.explanation, "No environmental summary available."),
    },
    historical,
    historical_improved: historicalImproved
      ? {
          current_ndvi: readNullableNumber(historicalImproved.current_ndvi),
          baseline_mean: readNullableNumber(historicalImproved.baseline_mean),
          change_percent: readNullableNumber(historicalImproved.change_percent),
          trend_direction: readString(historicalImproved.trend_direction, "Unknown"),
          yearly_data: Array.isArray(historicalImproved.yearly_data)
            ? historicalImproved.yearly_data.map((item: unknown) => {
                if (isRecord(item) && typeof item.year === "number") {
                  return {
                    year: item.year,
                    ndvi: typeof item.ndvi === "number" ? item.ndvi : 0,
                  };
                }
                return { year: 0, ndvi: 0 };
              })
            : [],
        }
      : undefined,
    ai_analysis: aiAnalysis
      ? {
          status: readString(aiAnalysis.status, "unavailable"),
          executive_summary: readString(aiAnalysis.executive_summary, "AI analysis unavailable."),
          signals: Array.isArray(aiAnalysis.signals) ? aiAnalysis.signals.map(String) : [],
          contributing_factors: Array.isArray(aiAnalysis.contributing_factors)
            ? aiAnalysis.contributing_factors.map(String)
            : [],
          confidence: readString(aiAnalysis.confidence, "Unknown"),
          investigation_priority: readString(aiAnalysis.investigation_priority, "Unknown"),
        }
      : undefined,
    investigation_priority: investigationPriority
      ? {
          level: readString(investigationPriority.level, "Unknown"),
          score: typeof investigationPriority.score === "number" ? investigationPriority.score : 0,
          description: readString(investigationPriority.description, ""),
          components: {
            risk_score: getCompValue(investigationPriority.components, "risk_score"),
            ndvi_change: getCompValue(investigationPriority.components, "ndvi_change"),
            temperature_anomaly: getCompValue(investigationPriority.components, "temperature_anomaly"),
            water_change: getCompValue(investigationPriority.components, "water_change"),
          },
        }
      : undefined,
  };
}

function formatNumber(value: number | null | undefined, digits = 3): string {
  return value === null || value === undefined ? "N/A" : value.toFixed(digits);
}

function formatPercent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined) {
    return "N/A";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

function getRiskColor(level: string): string {
  const colors: Record<string, string> = {
    "Critical": "text-red-500",
    "High": "text-orange-500",
    "Moderate": "text-yellow-500",
    "Low": "text-green-500",
    "Very Low": "text-emerald-500",
  };
  return colors[level] || "text-gray-500";
}

function getPriorityColor(level: string): string {
  const colors: Record<string, string> = {
    "CRITICAL": "border-red-500 bg-red-950/20 text-red-400",
    "HIGH": "border-orange-500 bg-orange-950/20 text-orange-400",
    "MEDIUM": "border-yellow-500 bg-yellow-950/20 text-yellow-400",
    "LOW": "border-green-500 bg-green-950/20 text-green-400",
    "VERY LOW": "border-emerald-500 bg-emerald-950/20 text-emerald-400",
  };
  return colors[level] || "border-gray-500 bg-gray-950/20 text-gray-400";
}

export default function ToolPage() {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [selectedArea, setSelectedArea] = useState<Point[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/health")
      .then((response) => {
        if (!response.ok) {
          throw new Error("API request failed");
        }
        return response.json();
      })
      .then((data: ApiStatus) => {
        setApiStatus(data);
      })
      .catch(() => {
        setApiStatus(null);
      });
  }, []);

  async function handleAnalyzeArea() {
    try {
      setIsAnalyzing(true);
      setAnalysisResult(null);
      setAnalysisError(null);

      const response = await fetch(
        "http://127.0.0.1:8000/analysis/area",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            points: selectedArea,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Analysis request failed");
      }

      const parsedResult = parseAnalysisResult(await response.json());

      if (!parsedResult) {
        throw new Error("The API returned an incomplete analysis.");
      }

      setAnalysisResult(parsedResult);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Unable to analyze the selected area.";
      console.error("Analysis request failed:", error);
      setAnalysisError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  const chartData = analysisResult?.historical_improved?.yearly_data || [];
  const hasChartData = chartData.length > 0;

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200">
      <header className="border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 transition-colors">
              Planetary Intelligence
            </p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">TerraGuard</h1>
          </div>
          <div className="rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 transition-colors">
            {apiStatus ? (
              <span className="text-sm text-emerald-600 dark:text-emerald-400 transition-colors">● API Connected</span>
            ) : (
              <span className="text-sm text-red-600 dark:text-red-400 transition-colors">● API Offline</span>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-6 py-6">
        <div className="grid min-h-[600px] grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
          <aside className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 overflow-y-auto max-h-[90vh] transition-colors">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors">ANALYSIS</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white transition-colors">Environmental Explorer</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400 transition-colors">
              Select an area to begin analyzing environmental change.
            </p>

            <div className="mt-8 space-y-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
                <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">EARTH OBSERVATION</p>
                <p className="mt-1 font-medium text-slate-900 dark:text-white transition-colors">Sentinel-2</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
                <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">CLIMATE</p>
                <p className="mt-1 font-medium text-slate-900 dark:text-white transition-colors">WeatherNext</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
                <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">AI ANALYSIS</p>
                <p className="mt-1 font-medium text-slate-900 dark:text-white transition-colors">Gemini</p>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 transition-colors">
              <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">SELECTED AREA</p>
              {selectedArea.length === 0 ? (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 transition-colors">No area selected.</p>
              ) : (
                <div className="mt-3">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 transition-colors">
                    {selectedArea.length} points selected
                  </p>
                  <div className="mt-3 max-h-32 overflow-auto rounded-lg bg-slate-100 dark:bg-slate-950 p-3 transition-colors">
                    {selectedArea.map((point, index) => (
                      <div key={index} className="text-xs text-slate-600 dark:text-slate-400 transition-colors">
                        Point {index + 1}: {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
                      </div>
                    ))}
                  </div>

                  {selectedArea.length >= 3 && (
                    <button
                      disabled={isAnalyzing}
                      onClick={handleAnalyzeArea}
                      className="mt-4 w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-500 dark:hover:bg-emerald-400 px-4 py-3 text-sm font-semibold text-white dark:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    >
                      {isAnalyzing ? "Analyzing satellite data..." : "Analyze Area"}
                    </button>
                  )}

                  {analysisError && (
                    <p className="mt-4 rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
                      {analysisError}
                    </p>
                  )}

                  {analysisResult && (
                    <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4 transition-colors">
                      {analysisResult.investigation_priority && (
                        <div className={`rounded-xl border-2 p-4 ${getPriorityColor(analysisResult.investigation_priority.level)} transition-colors`}>
                          <p className="text-xs uppercase tracking-wider opacity-70">INVESTIGATION PRIORITY</p>
                          <p className="mt-1 text-2xl font-bold">{analysisResult.investigation_priority.level}</p>
                          <p className="mt-2 text-sm opacity-80">{analysisResult.investigation_priority.description}</p>
                          {analysisResult.investigation_priority.components && (
                            <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                              <div><p className="opacity-50">Risk</p><p className="font-bold">{Math.round(analysisResult.investigation_priority.components.risk_score)}</p></div>
                              <div><p className="opacity-50">NDVI Change</p><p className="font-bold">{Math.round(analysisResult.investigation_priority.components.ndvi_change)}</p></div>
                              <div><p className="opacity-50">Temperature</p><p className="font-bold">{Math.round(analysisResult.investigation_priority.components.temperature_anomaly)}</p></div>
                              <div><p className="opacity-50">Water</p><p className="font-bold">{Math.round(analysisResult.investigation_priority.components.water_change)}</p></div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
                        <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">ENVIRONMENTAL RISK</p>
                        <p className={`mt-1 text-3xl font-bold ${getRiskColor(analysisResult.risk.risk_level)}`}>
                          {analysisResult.risk.risk_level}
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white transition-colors">
                          {analysisResult.risk.condition}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-500 transition-colors">
                          Score: {analysisResult.risk.score}/100
                        </p>
                        <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400 transition-colors">
                          {analysisResult.risk.description}
                        </p>
                        {analysisResult.risk.components && (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            {Object.entries(analysisResult.risk.components).map(([key, comp]) => (
                              <div key={key} className="rounded-lg bg-slate-200 dark:bg-slate-800/50 p-2 transition-colors">
                                <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase transition-colors">{key.replace('_', ' ')}</p>
                                <p className="text-xs font-bold text-slate-900 dark:text-white transition-colors">{comp.score}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 transition-colors">{comp.status}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
                        <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">SATELLITE IMAGE</p>
                        <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white transition-colors">{analysisResult.satellite.source}</p>
                        <p className="mt-1 break-all text-xs text-slate-600 dark:text-slate-500 transition-colors">
                          {analysisResult.satellite.image_id || "No image ID available"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
                        <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">MEAN NDVI</p>
                        <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400 transition-colors">
                          {formatNumber(analysisResult.vegetation.mean_ndvi)}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
                          <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">MIN NDVI</p>
                          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white transition-colors">
                            {formatNumber(analysisResult.vegetation.min_ndvi)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
                          <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">MAX NDVI</p>
                          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white transition-colors">
                            {formatNumber(analysisResult.vegetation.max_ndvi)}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
                        <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">TEMPERATURE</p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-500 transition-colors">{analysisResult.temperature.source}</p>
                        <p className="mt-3 text-2xl font-bold text-amber-600 dark:text-amber-300 transition-colors">
                          {formatNumber(analysisResult.temperature.mean_celsius, 1)}°C
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">MIN</p>
                            <p className="text-slate-900 dark:text-white transition-colors">{formatNumber(analysisResult.temperature.min_celsius, 1)}°C</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">MAX</p>
                            <p className="text-slate-900 dark:text-white transition-colors">{formatNumber(analysisResult.temperature.max_celsius, 1)}°C</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
                        <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">WATER</p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-500 transition-colors">{analysisResult.water.source}</p>
                        {analysisResult.water.confidence === "no_data" ? (
                          <p className="mt-3 text-sm text-slate-600 dark:text-slate-500 transition-colors">Water data unavailable.</p>
                        ) : (
                          <>
                            <p className="mt-3 text-2xl font-bold text-sky-600 dark:text-sky-300 transition-colors">
                              {formatNumber(analysisResult.water.current_water_percent, 1)}%
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">of selected area covered by water</p>
                            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">CHANGE VS BASELINE</p>
                                <p className={(analysisResult.water.water_change_percent ?? 0) < 0 ? "text-red-600 dark:text-red-300" : "text-emerald-600 dark:text-emerald-300"}>
                                  {formatPercent(analysisResult.water.water_change_percent)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">LONG-TERM OCCURRENCE</p>
                                <p className="text-slate-900 dark:text-white transition-colors">{formatNumber(analysisResult.water.historical_occurrence_percent, 1)}%</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {analysisResult.moisture && analysisResult.moisture.moisture_status && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
                          <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">MOISTURE</p>
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-500 transition-colors">{analysisResult.moisture.source}</p>
                          <p className="mt-3 text-2xl font-bold text-cyan-600 dark:text-cyan-300 transition-colors">
                            {analysisResult.moisture.moisture_status}
                          </p>
                          {analysisResult.moisture.current_precip_mm !== undefined && analysisResult.moisture.current_precip_mm !== null && (
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 transition-colors">
                              {analysisResult.moisture.current_precip_mm}mm precipitation
                            </p>
                          )}
                          {analysisResult.moisture.change_percent !== undefined && analysisResult.moisture.change_percent !== null && (
                            <p className={`mt-2 text-sm ${analysisResult.moisture.change_percent < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                              {analysisResult.moisture.change_percent > 0 ? '+' : ''}{analysisResult.moisture.change_percent}% vs baseline
                            </p>
                          )}
                        </div>
                      )}

                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
                        <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">HISTORICAL NDVI</p>
                        <div className="mt-3 space-y-2">
                          {(analysisResult.historical ?? []).length === 0 ? (
                            <p className="text-sm text-slate-600 dark:text-slate-500 transition-colors">No historical data available.</p>
                          ) : (
                            (analysisResult.historical ?? []).map((item) => (
                              <div key={item.year} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 transition-colors">
                                <div>
                                  <p className="text-sm font-medium text-slate-900 dark:text-white transition-colors">{item.year}</p>
                                  <p className="mt-1 max-w-[180px] truncate text-[10px] text-slate-500 dark:text-slate-500 transition-colors">
                                    {item.image_id || "No imagery available"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] text-slate-500 dark:text-slate-500 transition-colors">MEAN NDVI</p>
                                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 transition-colors">
                                    {item.mean_ndvi !== null && item.mean_ndvi !== undefined
                                      ? item.mean_ndvi.toFixed(3)
                                      : "N/A"}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        {analysisResult.historical_improved && (
                          <div className="mt-3 rounded-lg bg-slate-100 dark:bg-slate-800/30 p-3 transition-colors">
                            <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">BASELINE STATS (2020-2024)</p>
                            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <p className="text-slate-500 dark:text-slate-500 transition-colors">Mean</p>
                                <p className="font-bold text-emerald-600 dark:text-emerald-300 transition-colors">
                                  {formatNumber(analysisResult.historical_improved.baseline_mean)}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500 dark:text-slate-500 transition-colors">Change</p>
                                <p className={`font-bold ${(analysisResult.historical_improved.change_percent ?? 0) < 0 ? 'text-red-600 dark:text-red-300' : 'text-emerald-600 dark:text-emerald-300'}`}>
                                  {formatPercent(analysisResult.historical_improved.change_percent)}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500 dark:text-slate-500 transition-colors">Trend</p>
                                <p className="font-bold text-amber-600 dark:text-amber-300 transition-colors">
                                  {analysisResult.historical_improved.trend_direction}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {hasChartData && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
                          <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">NDVI TREND</p>
                          <div className="mt-3 h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} domain={[0, 1]} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    color: '#0f172a'
                                  }}
                                  formatter={(value: number) => value.toFixed(3)}
                                />
                                <Legend />
                                <Line
                                  type="monotone"
                                  dataKey="ndvi"
                                  stroke="#10b981"
                                  strokeWidth={2}
                                  dot={{ fill: '#10b981', r: 4 }}
                                  name="NDVI"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      <div className="rounded-xl border border-emerald-600 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 transition-colors">
                        <p className="text-xs text-emerald-600 dark:text-emerald-300 transition-colors">ENVIRONMENTAL SUMMARY</p>
                        <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white transition-colors">
                          {analysisResult.environmental_summary.overall_status}
                        </p>
                        <p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-200 transition-colors">
                          {analysisResult.environmental_summary.key_signal}
                        </p>
                        <p className="mt-2 text-sm leading-5 text-slate-700 dark:text-slate-300 transition-colors">
                          {analysisResult.environmental_summary.explanation}
                        </p>
                      </div>

                      {analysisResult.ai_analysis && (
                        <div className="rounded-xl border border-purple-600 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 p-4 transition-colors">
                          <p className="text-xs text-purple-600 dark:text-purple-300 flex items-center gap-2 transition-colors">
                            <span>AI ANALYSIS</span>
                            <span className="text-[10px] opacity-60">Powered by Gemini</span>
                          </p>
                          <p className="mt-3 text-sm leading-6 text-slate-900 dark:text-white transition-colors">
                            {analysisResult.ai_analysis.executive_summary}
                          </p>
                          {analysisResult.ai_analysis.signals.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-purple-600 dark:text-purple-300 transition-colors">Key Signals</p>
                              <ul className="mt-1 space-y-1">
                                {analysisResult.ai_analysis.signals.map((signal, i) => (
                                  <li key={i} className="text-sm text-slate-700 dark:text-slate-300 transition-colors">• {signal}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {analysisResult.ai_analysis.contributing_factors.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-purple-600 dark:text-purple-300 transition-colors">Contributing Factors</p>
                              <ul className="mt-1 space-y-1">
                                {analysisResult.ai_analysis.contributing_factors.map((factor, i) => (
                                  <li key={i} className="text-sm text-slate-700 dark:text-slate-300 transition-colors">• {factor}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="mt-3 flex flex-wrap gap-4 text-xs">
                            <span className="text-purple-600 dark:text-purple-300 transition-colors">Confidence: {analysisResult.ai_analysis.confidence}</span>
                            <span className="text-purple-600 dark:text-purple-300 transition-colors">Priority: {analysisResult.ai_analysis.investigation_priority}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>

          <section className="h-[700px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 lg:h-auto transition-colors">
            <TerraGuardMap
              onAreaCreated={(points) => {
                setSelectedArea(points);
                setAnalysisResult(null);
              }}
            />
          </section>
        </div>
      </div>
    </main>
  );
}