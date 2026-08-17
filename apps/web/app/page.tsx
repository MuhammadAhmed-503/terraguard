"use client";

import { useEffect, useState } from "react";
import TerraGuardMap from "./components/Map";

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

type AnalysisResult = {
  status: string;
  point_count: number;

  satellite: {
    source: string;
    image_id: string;
  };

  vegetation: {
    mean_ndvi: number;
    min_ndvi: number;
    max_ndvi: number;
  };

  risk: {
    condition: string;
    risk_level: string;
    description: string;
  };

  historical: HistoricalResult[];
};

export default function Home() {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [selectedArea, setSelectedArea] = useState<Point[]>([]);
  const [analysisResult, setAnalysisResult] =
    useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

      const data = await response.json();

      console.log("FULL TERRAGUARD RESPONSE:", data);
      console.log("HISTORICAL DATA:", data.historical);

      setAnalysisResult(data as AnalysisResult);
    } catch (error) {
      console.error("Analysis request failed:", error);
      alert("Unable to analyze the selected area.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-400">
              Planetary Intelligence
            </p>

            <h1 className="text-2xl font-bold">
              TerraGuard
            </h1>
          </div>

          <div className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2">
            {apiStatus ? (
              <span className="text-sm text-emerald-400">
                ● API Connected
              </span>
            ) : (
              <span className="text-sm text-red-400">
                ● API Offline
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-6 py-6">
        <div className="grid min-h-[600px] grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">

          {/* SIDEBAR */}

          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm font-medium text-slate-400">
              ANALYSIS
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Environmental Explorer
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Select an area to begin analyzing environmental change.
            </p>

            <div className="mt-8 space-y-3">

              {/* EARTH OBSERVATION */}

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  EARTH OBSERVATION
                </p>

                <p className="mt-1 font-medium">
                  Sentinel-2
                </p>
              </div>

              {/* CLIMATE */}

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  CLIMATE
                </p>

                <p className="mt-1 font-medium">
                  WeatherNext
                </p>
              </div>

              {/* AI */}

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">
                  AI ANALYSIS
                </p>

                <p className="mt-1 font-medium">
                  Gemini
                </p>
              </div>

            </div>

            {/* SELECTED AREA */}

            <div className="mt-8 border-t border-slate-800 pt-6">

              <p className="text-xs text-slate-500">
                SELECTED AREA
              </p>

              {selectedArea.length === 0 ? (
                <p className="mt-2 text-sm text-slate-400">
                  No area selected.
                </p>
              ) : (
                <div className="mt-3">

                  <p className="text-sm text-emerald-400">
                    {selectedArea.length} points selected
                  </p>

                  <div className="mt-3 max-h-32 overflow-auto rounded-lg bg-slate-950 p-3">
                    {selectedArea.map((point, index) => (
                      <div
                        key={index}
                        className="text-xs text-slate-400"
                      >
                        Point {index + 1}:{" "}
                        {point.lat.toFixed(5)},{" "}
                        {point.lng.toFixed(5)}
                      </div>
                    ))}
                  </div>

                  {selectedArea.length >= 3 && (
                    <button
                      disabled={isAnalyzing}
                      onClick={handleAnalyzeArea}
                      className="mt-4 w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isAnalyzing
                        ? "Analyzing Sentinel-2..."
                        : "Analyze Area"}
                    </button>
                  )}

                  {/* ANALYSIS RESULT */}

                  {analysisResult && (
                    <div className="mt-6 border-t border-slate-800 pt-6">

                      <p className="text-xs text-slate-500">
                        SENTINEL-2 ANALYSIS
                      </p>

                      <div className="mt-3 space-y-3">

                        {/* SATELLITE IMAGE */}

                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                          <p className="text-xs text-slate-500">
                            SATELLITE IMAGE
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {analysisResult.satellite.source}
                          </p>

                          <p className="mt-1 break-all text-xs text-slate-500">
                            {analysisResult.satellite.image_id}
                          </p>
                        </div>

                        {/* MEAN NDVI */}

                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                          <p className="text-xs text-slate-500">
                            MEAN NDVI
                          </p>

                          <p className="mt-1 text-2xl font-bold text-emerald-400">
                            {analysisResult.vegetation.mean_ndvi.toFixed(3)}
                          </p>
                        </div>

                        {/* MIN / MAX NDVI */}

                        <div className="grid grid-cols-2 gap-3">

                          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                            <p className="text-xs text-slate-500">
                              MIN NDVI
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                              {analysisResult.vegetation.min_ndvi.toFixed(3)}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                            <p className="text-xs text-slate-500">
                              MAX NDVI
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                              {analysisResult.vegetation.max_ndvi.toFixed(3)}
                            </p>
                          </div>

                        </div>

                        {/* ENVIRONMENTAL RISK */}

                        <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
                          <p className="text-xs text-slate-500">
                            ENVIRONMENTAL RISK
                          </p>

                          <p className="mt-1 text-2xl font-bold text-emerald-400">
                            {analysisResult.risk.risk_level}
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {analysisResult.risk.condition}
                          </p>

                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            {analysisResult.risk.description}
                          </p>
                        </div>

                        {/* HISTORICAL NDVI */}

                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                          <p className="text-xs text-slate-500">
                            HISTORICAL NDVI
                          </p>

                          <div className="mt-3 space-y-2">
                            {(analysisResult.historical ?? []).length === 0 ? (
                              <p className="text-sm text-slate-500">
                                No historical satellite imagery available.
                              </p>
                            ) : (
                              (analysisResult.historical ?? []).map((item) => (
                                <div
                                  key={item.year}
                                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-slate-200">
                                      {item.year}
                                    </p>

                                    <p className="mt-1 max-w-[180px] truncate text-[10px] text-slate-500">
                                      {item.image_id || "No imagery available"}
                                    </p>
                                  </div>

                                  <div className="text-right">
                                    <p className="text-[10px] text-slate-500">
                                      MEAN NDVI
                                    </p>

                                    <p className="text-sm font-semibold text-emerald-400">
                                      {item.mean_ndvi !== null &&
                                        item.mean_ndvi !== undefined
                                        ? item.mean_ndvi.toFixed(3)
                                        : "N/A"}
                                    </p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

          </aside>

          {/* MAP */}

          <section className="h-[700px] overflow-hidden rounded-2xl border border-slate-800 lg:h-auto">
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