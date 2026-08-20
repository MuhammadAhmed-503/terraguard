import ee
from typing import Dict, Any, Optional

PROJECT_ID = "terraguard-505809"


def initialize_earth_engine():
    ee.Initialize(project=PROJECT_ID)


def analyze_area(points: list[dict]):
    initialize_earth_engine()

    # Convert frontend points into an Earth Engine polygon.
    coordinates = [
        [point["lng"], point["lat"]]
        for point in points
    ]

    # Close the polygon if necessary.
    if coordinates[0] != coordinates[-1]:
        coordinates.append(coordinates[0])

    polygon = ee.Geometry.Polygon([coordinates])

    # Sentinel-2 imagery.
    collection = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterDate("2025-01-01", "2025-02-01")
        .filterBounds(polygon)
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
        .sort("CLOUDY_PIXEL_PERCENTAGE")
    )

    image_count = collection.size().getInfo()

    if image_count == 0:
        raise ValueError(
            "No Sentinel-2 imagery found for the selected area and date range."
        )

    image = collection.first()

    # NDVI = (NIR - RED) / (NIR + RED)
    ndvi = image.normalizedDifference(["B8", "B4"]).rename("NDVI")

    # Calculate statistics across the entire selected polygon.
    statistics = ndvi.reduceRegion(
        reducer=ee.Reducer.mean()
        .combine(
            reducer2=ee.Reducer.min(),
            sharedInputs=True,
        )
        .combine(
            reducer2=ee.Reducer.max(),
            sharedInputs=True,
        ),
        geometry=polygon,
        scale=10,
        maxPixels=1_000_000,
    )

    image_id = image.get("system:index").getInfo()

    return {
        "image_id": image_id,
        "mean_ndvi": statistics.get("NDVI_mean").getInfo(),
        "min_ndvi": statistics.get("NDVI_min").getInfo(),
        "max_ndvi": statistics.get("NDVI_max").getInfo(),
    }


def analyze_temperature_area(points: list[dict]):
    initialize_earth_engine()

    coordinates = [
        [point["lng"], point["lat"]]
        for point in points
    ]

    if coordinates[0] != coordinates[-1]:
        coordinates.append(coordinates[0])

    polygon = ee.Geometry.Polygon([coordinates])
    collection = (
        ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
        .merge(ee.ImageCollection("LANDSAT/LC09/C02/T1_L2"))
        .filterDate("2025-01-01", "2025-02-01")
        .filterBounds(polygon)
        .filter(ee.Filter.lt("CLOUD_COVER", 30))
        .sort("CLOUD_COVER")
    )

    if collection.size().getInfo() == 0:
        return {
            "source": "Landsat 8/9 Collection 2 Level 2",
            "unit": "Celsius",
            "mean_celsius": None,
            "min_celsius": None,
            "max_celsius": None,
        }

    image = collection.first()
    temperature = image.select("ST_B10").multiply(0.00341802).add(149.0)
    temperature = temperature.subtract(273.15).rename("temperature_celsius")
    statistics = temperature.reduceRegion(
        reducer=ee.Reducer.mean()
        .combine(
            reducer2=ee.Reducer.min(),
            sharedInputs=True,
        )
        .combine(
            reducer2=ee.Reducer.max(),
            sharedInputs=True,
        ),
        geometry=polygon,
        scale=30,
        maxPixels=1_000_000,
    )

    return {
        "source": "Landsat 8/9 Collection 2 Level 2",
        "unit": "Celsius",
        "mean_celsius": statistics.get("temperature_celsius_mean").getInfo(),
        "min_celsius": statistics.get("temperature_celsius_min").getInfo(),
        "max_celsius": statistics.get("temperature_celsius_max").getInfo(),
    }


def analyze_historical_area(points: list[dict]):
    initialize_earth_engine()

    coordinates = [
        [point["lng"], point["lat"]]
        for point in points
    ]

    if coordinates[0] != coordinates[-1]:
        coordinates.append(coordinates[0])

    polygon = ee.Geometry.Polygon([coordinates])

    yearly_results = []

    # Analyze the same seasonal window for each year.
    for year in [2023, 2024, 2025]:

        start_date = f"{year}-01-01"
        end_date = f"{year}-02-01"

        collection = (
            ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
            .filterDate(start_date, end_date)
            .filterBounds(polygon)
            .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
            .sort("CLOUDY_PIXEL_PERCENTAGE")
        )

        image_count = collection.size().getInfo()

        # No suitable imagery for this year.
        if image_count == 0:
            yearly_results.append({
                "year": year,
                "image_id": None,
                "mean_ndvi": None,
            })
            continue

        image = collection.first()

        ndvi = image.normalizedDifference(
            ["B8", "B4"]
        ).rename("NDVI")

        statistics = ndvi.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=polygon,
            scale=10,
            maxPixels=1_000_000,
        )

        yearly_results.append({
            "year": year,
            "image_id": image.get("system:index").getInfo(),
            "mean_ndvi": statistics.get("NDVI").getInfo(),
        })

    return yearly_results


# Phase 5: Improved Historical Analysis
def analyze_historical_improved_area(points: list) -> Dict[str, Any]:
    """Wrapper for improved historical analysis"""
    from services.earth_engine.historical import analyze_historical_improved
    return analyze_historical_improved(points)