from typing import List
import sys
import os
from dotenv import load_dotenv

# Load local .env (if present) so environment variables like GEMINI_API_KEY
# are available to imported modules at startup.
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Add project root to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from services.risk_engine.risk_engine import classify_ndvi, calculate_risk_score
from services.earth_engine.analysis import (
    analyze_area,
    analyze_historical_area,
    analyze_temperature_area,
)
from services.earth_engine.water import analyze_water_area
from services.earth_engine.moisture import analyze_moisture_area
from services.earth_engine.historical import analyze_historical_improved
from services.earth_engine.layers import get_all_layers
from services.ai.analyst import generate_environmental_analysis, generate_investigation_priority

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


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
        "https://terraguard-lilac.vercel.app",
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


class CityTrendRequest(BaseModel):
    latitude: float
    longitude: float


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "TerraGuard API",
        "version": "0.1.0",
    }


@app.get("/layers")
def get_layers(points: List[Point]):
    """Get map visualization layers for the selected area."""
    points_list = [{"lat": p.lat, "lng": p.lng} for p in points]
    return get_all_layers(points_list)


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

    # Historical Sentinel-2 analysis (original)
    historical_results = analyze_historical_area(points)

    # Improved historical analysis (Phase 5)
    improved_historical = analyze_historical_improved(points)

    # Optional Landsat surface temperature analysis.
    temperature = analyze_temperature_area(points)

    # Water analysis
    try:
        water = analyze_water_area(points)
    except Exception:
        water = {
            "source": "Sentinel-2 NDWI + JRC Global Surface Water",
            "current_water_percent": None,
            "baseline_water_percent": None,
            "water_change_percent": None,
            "historical_occurrence_percent": None,
            "confidence": "no_data",
        }

    # Moisture analysis
    try:
        moisture = analyze_moisture_area(points)
    except Exception:
        moisture = {
            "source": "CHIRPS Precipitation",
            "status": "unavailable",
            "confidence": "no_data"
        }

    # Get map layers (Phase 7)
    try:
        layers = get_all_layers(points)
    except Exception:
        layers = {"error": "Unable to load map layers"}

    # Calculate enhanced risk score (Phase 6)
    ndvi = current_result.get("mean_ndvi")
    ndvi_change = None
    if improved_historical.get("change_percent") is not None:
        ndvi_change = improved_historical["change_percent"]
    
    temperature_anomaly = None
    if temperature.get("mean_celsius") and temperature.get("historical_mean_celsius"):
        temperature_anomaly = temperature["mean_celsius"] - temperature["historical_mean_celsius"]
    
    water_change = water.get("water_change_percent")
    moisture_status = moisture.get("moisture_status")
    historical_trend = improved_historical.get("trend_direction")

    # Enhanced risk score
    enhanced_risk = calculate_risk_score(
        ndvi=ndvi,
        ndvi_change=ndvi_change,
        temperature_anomaly=temperature_anomaly,
        water_change=water_change,
        moisture_status=moisture_status,
        historical_trend=historical_trend
    )

    # Original risk for backward compatibility
    original_risk = classify_ndvi(ndvi)

    # AI Analysis (Phase 9)
    ai_data = {
        "ndvi": ndvi,
        "ndvi_change": ndvi_change,
        "temperature": temperature.get("mean_celsius"),
        "temperature_anomaly": temperature_anomaly,
        "water_percent": water.get("current_water_percent"),
        "water_change": water_change,
        "moisture_status": moisture_status,
        "risk_score": enhanced_risk.get("score"),
        "risk_level": enhanced_risk.get("risk_level")
    }
    
    ai_analysis = generate_environmental_analysis(ai_data)
    
    # Investigation Priority (Phase 10)
    investigation_priority = generate_investigation_priority({
        "risk_score": enhanced_risk.get("score", 0),
        "ndvi_change": ndvi_change if ndvi_change is not None else 0,
        "temperature_anomaly": temperature_anomaly if temperature_anomaly is not None else 0,
        "water_change": water_change if water_change is not None else 0
    })

    # Environmental summary
    mean_ndvi = current_result["mean_ndvi"]
    if mean_ndvi is None:
        environmental_summary = {
            "overall_status": "Insufficient Data",
            "key_signal": "Vegetation activity is unavailable.",
            "explanation": (
                "TerraGuard could not find valid vegetation pixels for "
                "the selected area and analysis period."
            ),
        }
    elif mean_ndvi < 0.20:
        environmental_summary = {
            "overall_status": "Critical Vegetation Stress",
            "key_signal": "NDVI is below the severe-stress range.",
            "explanation": (
                "The selected area shows very low vegetation activity. "
                "Land surface temperature is provided as environmental "
                "context where valid pixels are available."
            ),
        }
    elif mean_ndvi < 0.40:
        environmental_summary = {
            "overall_status": "High Vegetation Stress",
            "key_signal": "NDVI is below the healthy vegetation range.",
            "explanation": (
                "The selected area shows relatively low vegetation activity. "
                "Land surface temperature is provided as environmental "
                "context where valid pixels are available."
            ),
        }
    elif mean_ndvi < 0.60:
        environmental_summary = {
            "overall_status": "Moderate Vegetation Condition",
            "key_signal": "NDVI indicates moderate vegetation activity.",
            "explanation": (
                "Vegetation is present across the selected area but remains "
                "below the healthy range used by the prototype risk engine."
            ),
        }
    else:
        environmental_summary = {
            "overall_status": "Healthy Vegetation Condition",
            "key_signal": "NDVI is within the healthy vegetation range.",
            "explanation": (
                "The selected area shows relatively strong vegetation activity "
                "for the analyzed satellite observation."
            ),
        }

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
        "temperature": temperature,
        "water": water,
        "moisture": moisture,
        "risk": enhanced_risk,
        "risk_original": original_risk,
        "environmental_summary": environmental_summary,
        "historical": historical_results or [],
        "historical_improved": improved_historical,
        "layers": layers,
        "ai_analysis": ai_analysis,
        "investigation_priority": investigation_priority
    }


@app.post("/trends/city")
def city_trend_endpoint(request: CityTrendRequest):
    """Return yearly Sentinel-2 NDVI for a small area around a city center."""
    delta = 0.08
    points = [
        {"lat": request.latitude - delta, "lng": request.longitude - delta},
        {"lat": request.latitude - delta, "lng": request.longitude + delta},
        {"lat": request.latitude + delta, "lng": request.longitude + delta},
        {"lat": request.latitude + delta, "lng": request.longitude - delta},
    ]
    return analyze_historical_improved(points)