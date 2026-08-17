from typing import List
import sys

sys.path.insert(0, "services/earth_engine")
sys.path.insert(0, "services/risk_engine")

from risk_engine import classify_ndvi

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from analysis import analyze_area, analyze_historical_area


app = FastAPI(
    title="TerraGuard API",
    description="AI-powered nature and climate resilience platform",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Point(BaseModel):
    lat: float
    lng: float


class AreaAnalysisRequest(BaseModel):
    points: List[Point]


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "TerraGuard API",
        "version": "0.1.0",
    }


@app.post("/analysis/area")
def analyze_area_endpoint(request: AreaAnalysisRequest):
    points = [
        {
            "lat": point.lat,
            "lng": point.lng,
        }
        for point in request.points
    ]

    # Current Sentinel-2 analysis
    current_result = analyze_area(points)

    # Historical Sentinel-2 analysis
    historical_results = analyze_historical_area(points)

    # Environmental risk
    risk = classify_ndvi(current_result["mean_ndvi"])

    return {
        "status": "success",
        "point_count": len(request.points),

        "satellite": {
            "source": "Sentinel-2",
            "image_id": current_result["image_id"],
        },

        "vegetation": {
            "mean_ndvi": current_result["mean_ndvi"],
            "min_ndvi": current_result["min_ndvi"],
            "max_ndvi": current_result["max_ndvi"],
        },

        "risk": risk,

        "historical": historical_results,
    }