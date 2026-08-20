from typing import Dict, Any, Optional


def classify_ndvi(mean_ndvi: float | None) -> dict:
    """
    Classify vegetation condition using mean NDVI.

    Prototype thresholds:
    >= 0.60  -> Healthy / Low Risk
    >= 0.40  -> Moderate / Moderate Risk
    >= 0.20  -> Stressed / High Risk
    <  0.20  -> Severely Stressed / Critical Risk
    """

    if mean_ndvi is None:
        return {
            "condition": "Unavailable",
            "risk_level": "Unavailable",
            "description": (
                "Vegetation risk could not be classified because "
                "no valid NDVI measurement was available."
            ),
        }

    if mean_ndvi >= 0.60:
        return {
            "condition": "Healthy",
            "risk_level": "Low",
            "description": (
                "Vegetation appears relatively healthy "
                "within the selected area."
            ),
        }

    if mean_ndvi >= 0.40:
        return {
            "condition": "Moderate",
            "risk_level": "Moderate",
            "description": (
                "Vegetation shows moderate health "
                "and may require monitoring."
            ),
        }

    if mean_ndvi >= 0.20:
        return {
            "condition": "Stressed",
            "risk_level": "High",
            "description": (
                "Vegetation shows signs of stress "
                "and should be investigated."
            ),
        }

    return {
        "condition": "Severely Stressed",
        "risk_level": "Critical",
        "description": (
            "Vegetation appears severely stressed "
            "within the selected area."
        ),
    }


def calculate_risk_score(
    ndvi: Optional[float] = None,
    ndvi_change: Optional[float] = None,
    temperature_anomaly: Optional[float] = None,
    water_change: Optional[float] = None,
    moisture_status: Optional[str] = None,
    historical_trend: Optional[str] = None
) -> Dict[str, Any]:
    """
    Multi-signal risk engine combining:
    - Vegetation stress (NDVI)
    - Historical vegetation decline
    - Temperature anomaly
    - Water decline
    - Moisture stress
    - Historical trend
    
    Returns comprehensive risk assessment with breakdown.
    """
    components = {}
    total_score = 0
    
    # 1. Vegetation stress (0-30 points)
    if ndvi is not None:
        if ndvi < 0.20:
            veg_score = 30
            veg_status = "Critical"
        elif ndvi < 0.30:
            veg_score = 25
            veg_status = "High"
        elif ndvi < 0.40:
            veg_score = 20
            veg_status = "Moderate"
        elif ndvi < 0.50:
            veg_score = 12
            veg_status = "Low"
        elif ndvi < 0.60:
            veg_score = 5
            veg_status = "Normal"
        else:
            veg_score = 0
            veg_status = "Healthy"
        
        components["vegetation_stress"] = {
            "score": veg_score,
            "status": veg_status,
            "details": f"NDVI = {ndvi:.3f}"
        }
        total_score += veg_score
    else:
        components["vegetation_stress"] = {"score": 0, "status": "No Data", "details": "NDVI unavailable"}
    
    # 2. Historical decline (0-20 points)
    if ndvi_change is not None:
        if ndvi_change < -30:
            hist_score = 20
            hist_status = "Severe Decline"
        elif ndvi_change < -20:
            hist_score = 15
            hist_status = "Moderate Decline"
        elif ndvi_change < -10:
            hist_score = 10
            hist_status = "Mild Decline"
        elif ndvi_change < -5:
            hist_score = 5
            hist_status = "Slight Decline"
        else:
            hist_score = 0
            hist_status = "Stable/Improving"
        
        components["historical_decline"] = {
            "score": hist_score,
            "status": hist_status,
            "details": f"Change = {ndvi_change:.1f}%"
        }
        total_score += hist_score
    else:
        components["historical_decline"] = {"score": 0, "status": "No Data", "details": "Historical change unavailable"}
    
    # 3. Temperature anomaly (0-20 points)
    if temperature_anomaly is not None:
        if temperature_anomaly > 5:
            temp_score = 20
            temp_status = "Extreme Heat"
        elif temperature_anomaly > 3:
            temp_score = 15
            temp_status = "High Heat"
        elif temperature_anomaly > 1:
            temp_score = 8
            temp_status = "Elevated"
        elif temperature_anomaly > 0:
            temp_score = 3
            temp_status = "Slightly Elevated"
        else:
            temp_score = 0
            temp_status = "Normal/Cooler"
        
        components["temperature_anomaly"] = {
            "score": temp_score,
            "status": temp_status,
            "details": f"Anomaly = {'+' if temperature_anomaly > 0 else ''}{temperature_anomaly:.1f}°C"
        }
        total_score += temp_score
    else:
        components["temperature_anomaly"] = {"score": 0, "status": "No Data", "details": "Temperature anomaly unavailable"}
    
    # 4. Water decline (0-15 points)
    if water_change is not None:
        if water_change < -20:
            water_score = 15
            water_status = "Critical Decline"
        elif water_change < -10:
            water_score = 10
            water_status = "Significant Decline"
        elif water_change < -5:
            water_score = 5
            water_status = "Moderate Decline"
        elif water_change < 0:
            water_score = 2
            water_status = "Slight Decline"
        else:
            water_score = 0
            water_status = "Stable/Increasing"
        
        components["water_decline"] = {
            "score": water_score,
            "status": water_status,
            "details": f"Change = {water_change:.1f}%"
        }
        total_score += water_score
    else:
        components["water_decline"] = {"score": 0, "status": "No Data", "details": "Water change unavailable"}
    
    # 5. Moisture stress (0-10 points)
    if moisture_status:
        moisture_mapping = {
            "DROUGHT STRESS": 10,
            "DRY": 7,
            "MODERATE": 3,
            "ADEQUATE": 0
        }
        moisture_score = moisture_mapping.get(moisture_status, 0)
        components["moisture_stress"] = {
            "score": moisture_score,
            "status": moisture_status,
            "details": f"Status: {moisture_status}"
        }
        total_score += moisture_score
    else:
        components["moisture_stress"] = {"score": 0, "status": "No Data", "details": "Moisture status unavailable"}
    
    # 6. Historical trend (0-5 points)
    if historical_trend:
        trend_mapping = {
            "Decreasing": 5,
            "Stable": 2,
            "Increasing": 0
        }
        trend_score = trend_mapping.get(historical_trend, 0)
        components["historical_trend"] = {
            "score": trend_score,
            "status": historical_trend,
            "details": f"Trend: {historical_trend}"
        }
        total_score += trend_score
    else:
        components["historical_trend"] = {"score": 0, "status": "Unknown", "details": "Historical trend unavailable"}
    
    # Final risk level
    if total_score >= 80:
        risk_level = "Critical"
        condition = "CRITICAL ENVIRONMENTAL STRESS"
        description = "Multiple signals indicate severe environmental stress requiring immediate investigation."
    elif total_score >= 60:
        risk_level = "High"
        condition = "HIGH ENVIRONMENTAL STRESS"
        description = "Multiple signals indicate significant environmental stress. Prioritize investigation."
    elif total_score >= 40:
        risk_level = "Moderate"
        condition = "MODERATE ENVIRONMENTAL STRESS"
        description = "Some environmental signals indicate stress. Monitor conditions closely."
    elif total_score >= 20:
        risk_level = "Low"
        condition = "LOW ENVIRONMENTAL STRESS"
        description = "Most environmental indicators are within normal ranges."
    else:
        risk_level = "Very Low"
        condition = "MINIMAL ENVIRONMENTAL STRESS"
        description = "Environmental conditions appear stable with no significant stress signals."
    
    return {
        "condition": condition,
        "risk_level": risk_level,
        "description": description,
        "score": min(total_score, 100),
        "components": components
    }