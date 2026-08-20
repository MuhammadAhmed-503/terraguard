import ee
from typing import Dict, Any, Optional

PROJECT_ID = "terraguard-505809"

def analyze_moisture_area(points: list) -> Dict[str, Any]:
    """Analyze moisture/drought conditions using CHIRPS precipitation data."""
    try:
        ee.Initialize(project=PROJECT_ID)
        
        # Create polygon from points
        coords = [(p["lng"], p["lat"]) for p in points]
        polygon = ee.Geometry.Polygon(coords)
        
        # CHIRPS precipitation data (1981-present)
        chirps = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
        
        # Current year (2025)
        current_year = 2025
        start_date = f"{current_year}-01-01"
        end_date = f"{current_year}-12-31"
        
        # Historical baseline (2015-2024)
        baseline_start = "2015-01-01"
        baseline_end = "2024-12-31"
        
        # Get current precipitation
        current = chirps.filterDate(start_date, end_date).sum()
        
        # Get historical baseline
        historical = chirps.filterDate(baseline_start, baseline_end)
        baseline_mean = historical.mean()
        
        # Reduce regions
        current_precip = current.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=polygon,
            scale=5000,
            maxPixels=1e9
        ).get("precipitation")
        
        baseline_precip = baseline_mean.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=polygon,
            scale=5000,
            maxPixels=1e9
        ).get("precipitation")
        
        current_val = current_precip.getInfo()
        baseline_val = baseline_precip.getInfo()
        
        if current_val is None:
            return {
                "source": "CHIRPS Precipitation",
                "status": "unavailable",
                "confidence": "no_data",
                "message": "No precipitation data available for this area"
            }
        
        # Calculate change - only if baseline is meaningful (> 1mm)
        change_percent = None
        if baseline_val is not None and baseline_val > 1:  # Threshold added
            change_percent = ((current_val - baseline_val) / baseline_val) * 100
            # Hide extreme changes (> 1000%)
            if abs(change_percent) > 1000:
                change_percent = None
        
        # Determine moisture status
        if current_val < 100:  # mm per year threshold
            status = "DROUGHT STRESS"
        elif current_val < 300:
            status = "DRY"
        elif current_val < 600:
            status = "MODERATE"
        else:
            status = "ADEQUATE"
        
        return {
            "source": "CHIRPS Precipitation",
            "current_precip_mm": round(current_val, 1),
            "baseline_precip_mm": round(baseline_val, 1) if baseline_val is not None else None,
            "change_percent": round(change_percent, 1) if change_percent is not None else None,
            "moisture_status": status,
            "confidence": "available",
            "period": "Annual (Jan-Dec 2025)",
            "baseline_period": "2015-2024"
        }
        
    except Exception as e:
        return {
            "source": "CHIRPS Precipitation",
            "status": "unavailable",
            "confidence": "no_data",
            "error": str(e)
        }