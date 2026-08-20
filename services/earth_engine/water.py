import ee

PROJECT_ID = "terraguard-505809"


def _initialize_earth_engine():
    ee.Initialize(project=PROJECT_ID)


def _polygon_from_points(points: list[dict]):
    coordinates = [
        [point["lng"], point["lat"]]
        for point in points
    ]

    if coordinates[0] != coordinates[-1]:
        coordinates.append(coordinates[0])

    return ee.Geometry.Polygon([coordinates])


def _ndwi_water_percent(polygon, start_date: str, end_date: str):
    """
    Calculate the percentage of the polygon covered by water using
    Sentinel-2 NDWI (McFeeters): (Green - NIR) / (Green + NIR).

    B3 = Green, B8 = NIR. NDWI > 0 is treated as water.

    Returns None if no cloud-free Sentinel-2 imagery is available.
    """

    collection = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterDate(start_date, end_date)
        .filterBounds(polygon)
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
        .sort("CLOUDY_PIXEL_PERCENTAGE")
    )

    if collection.size().getInfo() == 0:
        return None

    image = collection.first()
    ndwi = image.normalizedDifference(["B3", "B8"]).rename("NDWI")
    water_mask = ndwi.gt(0).rename("water")

    statistics = water_mask.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=polygon,
        scale=10,
        maxPixels=1_000_000,
    )

    fraction = statistics.get("water").getInfo()

    if fraction is None:
        return None

    return round(fraction * 100, 2)


def analyze_water_area(points: list[dict]):
    """
    Water intelligence for the selected polygon.

    Combines:
      - JRC Global Surface Water (long-term water occurrence, 1984-2021)
      - Sentinel-2 NDWI (current water percentage, same window as
        the current vegetation/temperature analysis)

    Returns a dict describing current water coverage and, where
    historical NDWI data is available, the percentage change versus
    a prior-year seasonal baseline.
    """

    _initialize_earth_engine()

    polygon = _polygon_from_points(points)

    # --- JRC Global Surface Water: long-term occurrence context ---
    gsw = ee.Image("JRC/GSW1_4/GlobalSurfaceWater")
    occurrence = gsw.select("occurrence")

    occurrence_stats = occurrence.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=polygon,
        scale=30,
        maxPixels=1_000_000,
    )

    historical_occurrence_percent = occurrence_stats.get("occurrence").getInfo()

    # --- Current Sentinel-2 NDWI water percentage ---
    current_window = ("2025-01-01", "2025-02-01")
    baseline_window = ("2023-01-01", "2023-02-01")

    current_water_percent = _ndwi_water_percent(polygon, *current_window)
    baseline_water_percent = _ndwi_water_percent(polygon, *baseline_window)

    water_change_percent = None
    if current_water_percent is not None and baseline_water_percent not in (None, 0):
        water_change_percent = round(
            ((current_water_percent - baseline_water_percent) / baseline_water_percent) * 100,
            1,
        )

    if current_water_percent is None:
        confidence = "no_data"
    elif baseline_water_percent is None:
        confidence = "limited"
    else:
        confidence = "available"

    return {
        "source": "Sentinel-2 NDWI + JRC Global Surface Water",
        "current_water_percent": current_water_percent,
        "baseline_water_percent": baseline_water_percent,
        "water_change_percent": water_change_percent,
        "historical_occurrence_percent": (
            round(historical_occurrence_percent, 2)
            if historical_occurrence_percent is not None
            else None
        ),
        "confidence": confidence,
    }