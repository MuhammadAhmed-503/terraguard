import ee
from typing import Dict, Any, Optional, List

def get_ndvi_layer(points: list, year: int = 2025) -> Dict[str, Any]:
    """
    Generate NDVI visualization layer for map.
    Returns visualization parameters and image ID.
    """
    try:
        ee.Initialize()
        
        coords = [(p["lng"], p["lat"]) for p in points]
        polygon = ee.Geometry.Polygon(coords)
        
        sentinel = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        
        target_date = ee.Date.fromYMD(year, 1, 1)
        start = target_date.advance(-30, 'day')
        end = target_date.advance(30, 'day')
        
        image = (
            sentinel
            .filterBounds(polygon)
            .filterDate(start, end)
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
            .first()
        )
        
        ndvi = image.normalizedDifference(['B8', 'B4'])
        
        # Visualization parameters
        vis_params = {
            'min': -0.2,
            'max': 0.8,
            'palette': [
                '#8B0000',  # Dark red (low vegetation)
                '#FF0000',  # Red
                '#FFA500',  # Orange
                '#FFFF00',  # Yellow
                '#90EE90',  # Light green
                '#008000',  # Green
                '#006400'   # Dark green (high vegetation)
            ]
        }
        
        return {
            "image_id": image.id().getInfo() if image else None,
            "year": year,
            "vis_params": vis_params,
            "exists": image is not None
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "exists": False
        }


def get_temperature_layer(points: list) -> Dict[str, Any]:
    """
    Generate temperature visualization layer.
    """
    try:
        ee.Initialize()
        
        coords = [(p["lng"], p["lat"]) for p in points]
        polygon = ee.Geometry.Polygon(coords)
        
        landsat8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
        landsat9 = ee.ImageCollection("LANDSAT/LC09/C02/T1_L2")
        
        # Combine both collections
        collection = landsat8.merge(landsat9)
        
        target_date = ee.Date.fromYMD(2025, 1, 1)
        start = target_date.advance(-30, 'day')
        end = target_date.advance(30, 'day')
        
        image = (
            collection
            .filterBounds(polygon)
            .filterDate(start, end)
            .filter(ee.Filter.lt('CLOUD_COVER', 20))
            .first()
        )
        
        # Convert to Celsius
        temp = image.select('ST_B10').multiply(0.00341802).add(149.0).subtract(273.15)
        
        vis_params = {
            'min': 10,
            'max': 45,
            'palette': [
                '#0000FF',  # Blue (cold)
                '#0080FF',  # Light blue
                '#00FFFF',  # Cyan
                '#00FF80',  # Green
                '#80FF00',  # Light green
                '#FFFF00',  # Yellow
                '#FF8000',  # Orange
                '#FF0000',  # Red
                '#8B0000'   # Dark red (hot)
            ]
        }
        
        return {
            "image_id": image.id().getInfo() if image else None,
            "vis_params": vis_params,
            "exists": image is not None
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "exists": False
        }


def get_water_layer(points: list) -> Dict[str, Any]:
    """
    Generate water extent visualization using JRC Global Surface Water.
    """
    try:
        ee.Initialize()
        
        coords = [(p["lng"], p["lat"]) for p in points]
        polygon = ee.Geometry.Polygon(coords)
        
        # JRC Global Surface Water
        gsw = ee.Image("JRC/GSW1_4/GlobalSurfaceWater")
        
        # Water occurrence (0-100%)
        occurrence = gsw.select('occurrence')
        
        vis_params = {
            'min': 0,
            'max': 100,
            'palette': [
                '#FFFFFF',  # White (no water)
                '#B0D4F1',  # Light blue
                '#4A90D9',  # Blue
                '#1A5276',  # Dark blue
                '#0B2E4A'   # Very dark blue (permanent water)
            ]
        }
        
        return {
            "source": "JRC Global Surface Water",
            "year": "1984-2021",
            "vis_params": vis_params,
            "exists": True
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "exists": False
        }


def get_risk_layer(points: list) -> Dict[str, Any]:
    """
    Generate risk visualization layer combining multiple indicators.
    """
    try:
        ee.Initialize()
        
        coords = [(p["lng"], p["lat"]) for p in points]
        polygon = ee.Geometry.Polygon(coords)
        
        # This is a simplified risk layer
        # In production, this would combine multiple images
        
        sentinel = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        
        target_date = ee.Date.fromYMD(2025, 1, 1)
        start = target_date.advance(-30, 'day')
        end = target_date.advance(30, 'day')
        
        image = (
            sentinel
            .filterBounds(polygon)
            .filterDate(start, end)
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
            .first()
        )
        
        ndvi = image.normalizedDifference(['B8', 'B4'])
        
        # Invert NDVI for risk (low NDVI = high risk)
        risk = ndvi.multiply(-1).add(1)
        
        vis_params = {
            'min': 0,
            'max': 1,
            'palette': [
                '#00FF00',  # Green (low risk)
                '#FFFF00',  # Yellow (moderate)
                '#FF8000',  # Orange (high)
                '#FF0000'   # Red (critical)
            ]
        }
        
        return {
            "source": "Sentinel-2 NDVI-derived Risk",
            "vis_params": vis_params,
            "exists": image is not None
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "exists": False
        }


def get_all_layers(points: list) -> Dict[str, Any]:
    """
    Get all available layers for the selected area.
    """
    return {
        "ndvi": get_ndvi_layer(points),
        "temperature": get_temperature_layer(points),
        "water": get_water_layer(points),
        "risk": get_risk_layer(points)
    }