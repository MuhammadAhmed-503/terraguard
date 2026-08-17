import ee

PROJECT_ID = "terraguard-505809"

ee.Initialize(project=PROJECT_ID)

# Test location: Islamabad
point = ee.Geometry.Point(73.0479, 33.6844)

# Find Sentinel-2 imagery
collection = (
    ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
    .filterDate("2025-01-01", "2025-02-01")
    .filterBounds(point)
    .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
)

image = collection.first()

# Calculate NDVI
ndvi = image.normalizedDifference(["B8", "B4"]).rename("NDVI")

# Get NDVI value at the test point
value = ndvi.reduceRegion(
    reducer=ee.Reducer.mean(),
    geometry=point,
    scale=10,
).get("NDVI")

print("Sentinel-2 image:", image.get("system:index").getInfo())
print("NDVI:", value.getInfo())