import ee
from typing import List, Dict, Any, Optional

def analyze_historical_improved(points: list) -> Dict[str, Any]:
    """
    Improved historical analysis with:
    - Clean current vs baseline separation (2025 vs 2020-2024 average)
    - Statistical significance indicators
    - Trend direction
    """
    try:
        ee.Initialize()
        
        # Create polygon from points
        coords = [(p["lng"], p["lat"]) for p in points]
        polygon = ee.Geometry.Polygon(coords)
        
        # Current year (2025)
        current_year = 2025
        # Baseline years (2020-2024)
        baseline_years = [2020, 2021, 2022, 2023, 2024]
        
        # Seasonal window (same as current analysis)
        target_date = ee.Date.fromYMD(current_year, 1, 1)
        start = target_date.advance(-30, 'day')
        end = target_date.advance(30, 'day')
        
        results = {
            "current_year": current_year,
            "baseline_years": baseline_years,
            "current_ndvi": None,
            "baseline_mean": None,
            "baseline_std": None,
            "change_percent": None,
            "trend_direction": "Unknown",
            "trend_strength": "Unknown",
            "anomaly_score": None,
            "data_quality": "No data",
            "yearly_data": []
        }
        
        # Get current year NDVI
        sentinel = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        
        current = (
            sentinel
            .filterBounds(polygon)
            .filterDate(start, end)
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
        )
        
        def calculate_ndvi(image):
            ndvi = image.normalizedDifference(['B8', 'B4']).rename('ndvi')
            return image.addBands(ndvi)
        
        current_with_ndvi = current.map(calculate_ndvi)
        
        # Current NDVI
        current_ndvi = (
            current_with_ndvi
            .select('ndvi')
            .mean()
            .reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=polygon,
                scale=20,
                maxPixels=1e9
            )
            .get('ndvi')
        )
        
        current_val = current_ndvi.getInfo()
        results["current_ndvi"] = current_val if current_val else None
        
        # Historical yearly data
        yearly_ndvi = []
        baseline_values = []
        
        for year in baseline_years:
            target_date = ee.Date.fromYMD(year, 1, 1)
            start = target_date.advance(-30, 'day')
            end = target_date.advance(30, 'day')
            
            yearly = (
                sentinel
                .filterBounds(polygon)
                .filterDate(start, end)
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
            )
            
            yearly_with_ndvi = yearly.map(calculate_ndvi)
            
            yearly_mean = (
                yearly_with_ndvi
                .select('ndvi')
                .mean()
                .reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=polygon,
                    scale=20,
                    maxPixels=1e9
                )
                .get('ndvi')
            )
            
            val = yearly_mean.getInfo()
            if val is not None:
                yearly_ndvi.append({"year": year, "ndvi": round(val, 4)})
                baseline_values.append(val)
        
        results["yearly_data"] = yearly_ndvi
        
        # Calculate baseline stats
        if baseline_values:
            baseline_mean = sum(baseline_values) / len(baseline_values)
            variance = sum((x - baseline_mean) ** 2 for x in baseline_values) / len(baseline_values)
            baseline_std = variance ** 0.5
            
            results["baseline_mean"] = round(baseline_mean, 4)
            results["baseline_std"] = round(baseline_std, 4)
            results["data_quality"] = "Good"
            
            # Calculate change
            if current_val is not None:
                change = ((current_val - baseline_mean) / baseline_mean) * 100
                results["change_percent"] = round(change, 1)
                
                # Anomaly score (z-score)
                if baseline_std > 0:
                    z_score = (current_val - baseline_mean) / baseline_std
                    results["anomaly_score"] = round(z_score, 2)
                
                # Trend direction
                if len(baseline_values) >= 2:
                    # Simple linear trend
                    x = list(range(len(baseline_values)))
                    y = baseline_values
                    n = len(y)
                    slope = (n * sum(x[i] * y[i] for i in range(n)) - sum(x) * sum(y)) / (n * sum(x[i]**2 for i in range(n)) - (sum(x))**2)
                    results["trend_direction"] = "Increasing" if slope > 0.001 else "Decreasing" if slope < -0.001 else "Stable"
                    results["trend_strength"] = "Strong" if abs(slope) > 0.02 else "Moderate" if abs(slope) > 0.01 else "Weak"
        
        return results
        
    except Exception as e:
        return {
            "error": str(e),
            "data_quality": "Error",
            "current_ndvi": None,
            "baseline_mean": None
        }