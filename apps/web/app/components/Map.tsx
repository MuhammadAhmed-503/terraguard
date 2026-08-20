"use client";

import { APIProvider, Map, Polygon } from "@vis.gl/react-google-maps";
import { useState } from "react";

type Point = {
  lat: number;
  lng: number;
};

type TerraGuardMapProps = {
  onAreaCreated: (points: Point[]) => void;
};

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function TerraGuardMap({
  onAreaCreated,
}: TerraGuardMapProps) {
  const [points, setPoints] = useState<Point[]>([]);

  if (!API_KEY) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-900">
        <p className="text-red-400">
          Google Maps API key is not configured.
        </p>
      </div>
    );
  }

  function handleMapClick(event: any) {
    const latLng = event.detail?.latLng;

    if (!latLng) {
      return;
    }

    const newPoint = {
      lat: latLng.lat,
      lng: latLng.lng,
    };

    const updatedPoints = [...points, newPoint];

    setPoints(updatedPoints);
    onAreaCreated(updatedPoints);
  }

  function clearArea() {
    setPoints([]);
    onAreaCreated([]);
  }

  return (
    <div className="relative h-full w-full">
      <APIProvider apiKey={API_KEY}>
        <Map
          defaultCenter={{
            lat: 30.3753,
            lng: 69.3451,
          }}
          defaultZoom={5}
          mapTypeId="satellite"
          gestureHandling="greedy"
          onClick={handleMapClick}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          {points.length >= 2 && (
            <Polygon
              paths={points}
              fillColor="#10b981"
              fillOpacity={0.25}
              strokeColor="#10b981"
              strokeOpacity={0.9}
              strokeWeight={2}
              clickable={false}
            />
          )}
        </Map>
      </APIProvider>

      <div className="absolute left-4 top-4 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl dark:border-slate-700 dark:bg-slate-950/90">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          Select an area
        </p>

        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Click points on the map to define your area.
        </p>

        {points.length > 0 && (
          <p className="mt-2 text-xs text-emerald-400">
            {points.length} point{points.length !== 1 ? "s" : ""} selected
          </p>
        )}

        {points.length > 0 && (
          <button
            onClick={clearArea}
            className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}