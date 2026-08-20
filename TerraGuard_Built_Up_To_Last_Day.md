# TerraGuard — What We Built Up to Last Day

## 1. Project Overview

TerraGuard is an AI-powered environmental intelligence prototype designed to analyze a user-selected area on a map using satellite and Earth observation data.

The core product direction is **software-only environmental monitoring**. We are not depending on physical sensors, field crews, hardware deployment, permits, or special access.

The system is designed around freely available or free-access APIs and public Earth observation datasets that can be queried remotely.

---

## 2. Product Direction Established

The original concept included ideas that could require physical hardware in the field, such as sensors or monitoring devices.

The project direction was then changed to a more practical accelerator-demo model:

- No hardware deployment
- No field sensors
- No field crews
- No permits
- No custom ground stations
- No special data-access agreements
- Use satellite, Earth observation, weather/model, and historical data instead
- Build something that can be demonstrated immediately on a laptop

The central idea became:

> Select any area on Earth → retrieve satellite/environmental data → calculate measurable environmental indicators → compare historical conditions → classify risk → present the result in a clear dashboard.

---

## 3. Technology Stack Already Started

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Interactive map component
- Browser-side API requests to the TerraGuard backend

### Backend

- Python
- FastAPI
- Pydantic
- FastAPI CORS middleware
- Google Earth Engine Python API

### Earth Observation

The first implemented satellite analysis uses:

- Sentinel-2 Surface Reflectance Harmonized
- Dataset:
  `COPERNICUS/S2_SR_HARMONIZED`

Additional environmental analysis was started using:

- Landsat 8/9 Collection 2 Level 2
- Dataset:
  `LANDSAT/LC08/C02/T1_L2`
  merged with
  `LANDSAT/LC09/C02/T1_L2`

### Risk Engine

A separate risk-engine module was created and is currently used to classify vegetation condition based on NDVI.

---

# 4. Frontend Already Built

The main frontend page is the TerraGuard environmental explorer.

It contains:

### Header

- TerraGuard branding
- "Planetary Intelligence" label
- API connection status
- Health check against the FastAPI backend

### Environmental Explorer Sidebar

The sidebar currently shows:

- Earth Observation → Sentinel-2
- Climate → WeatherNext
- AI Analysis → Gemini

These represent the intended multi-source environmental intelligence architecture.

### Interactive Area Selection

The user can draw/select an area on the map.

The selected area is represented as latitude/longitude points.

The frontend displays:

- Number of selected points
- Individual point coordinates
- Analyze Area button

The analysis button becomes available when at least 3 points have been selected.

### Analysis Workflow

The frontend sends:

```json
{
  "points": [
    {
      "lat": 0,
      "lng": 0
    }
  ]
}
```

to:

```text
POST http://127.0.0.1:8000/analysis/area
```

### Analysis Results UI

The frontend already displays:

- Sentinel-2 source
- Sentinel-2 image ID
- Mean NDVI
- Minimum NDVI
- Maximum NDVI
- Environmental risk level
- Environmental condition
- Risk description
- Historical NDVI results
- Historical year
- Historical image ID
- Historical mean NDVI
- Landsat temperature data was added to the backend response and is ready to be surfaced in the frontend

---

# 5. Important Bug That Was Fixed

The frontend previously crashed with:

```text
Cannot read properties of undefined (reading 'map')
```

at:

```text
analysisResult.historical.map(...)
```

The frontend was changed to safely handle missing historical data using:

```tsx
(analysisResult.historical ?? [])
```

and it now displays a fallback message when no historical imagery is available.

The API response was also logged for debugging:

```tsx
console.log("FULL TERRAGUARD RESPONSE:", data);
console.log("HISTORICAL DATA:", data.historical);
```

The system successfully returned historical data.

---

# 6. Backend API Already Built

The FastAPI application currently provides:

## Health endpoint

```text
GET /health
```

Example response:

```json
{
  "status": "ok",
  "service": "TerraGuard API",
  "version": "0.1.0"
}
```

## Area analysis endpoint

```text
POST /analysis/area
```

The request accepts a list of geographic points.

The backend converts those points into an Earth Engine polygon.

---

# 7. Current Sentinel-2 Analysis

The Earth Engine analysis module currently:

1. Initializes Google Earth Engine.
2. Converts frontend latitude/longitude points into polygon coordinates.
3. Closes the polygon if necessary.
4. Creates an Earth Engine geometry.
5. Queries Sentinel-2 imagery.
6. Uses the date range:

```text
2025-01-01 → 2025-02-01
```

7. Filters imagery to the selected polygon.
8. Filters imagery to less than 20% cloud cover.
9. Sorts by cloud percentage.
10. Selects the best available image.
11. Calculates NDVI.
12. Calculates mean NDVI.
13. Calculates minimum NDVI.
14. Calculates maximum NDVI.
15. Returns the Sentinel-2 image ID.

NDVI is calculated using:

```text
(NIR - RED) / (NIR + RED)
```

using:

```text
B8 = NIR
B4 = RED
```

---

# 8. Current Historical Analysis

A historical Sentinel-2 analysis function has been implemented.

It analyzes the same seasonal window for:

- 2023
- 2024
- 2025

For each year it:

1. Queries Sentinel-2.
2. Filters by the selected polygon.
3. Uses the January analysis window.
4. Filters cloud percentage below 20%.
5. Selects the least-cloudy image.
6. Calculates NDVI.
7. Calculates mean NDVI.
8. Returns the image ID.
9. Returns `None` values if no suitable imagery exists.

The returned structure is approximately:

```json
[
  {
    "year": 2023,
    "image_id": "...",
    "mean_ndvi": 0.31
  },
  {
    "year": 2024,
    "image_id": "...",
    "mean_ndvi": 0.35
  },
  {
    "year": 2025,
    "image_id": "...",
    "mean_ndvi": 0.29
  }
]
```

---

# 9. Current Landsat Temperature Analysis

A land-surface-temperature analysis has also been added.

The backend queries:

```text
LANDSAT/LC08/C02/T1_L2
```

and:

```text
LANDSAT/LC09/C02/T1_L2
```

The two collections are merged.

The current analysis window is:

```text
2025-01-01 → 2025-02-01
```

The collection is filtered by:

- Selected polygon
- Cloud cover below 30%

The analysis uses:

```text
ST_B10
```

and applies the Landsat Collection 2 Level 2 scaling/offset to derive Celsius temperature.

The backend returns:

```json
{
  "source": "Landsat 8/9 Collection 2 Level 2",
  "unit": "Celsius",
  "mean_celsius": 0,
  "min_celsius": 0,
  "max_celsius": 0
}
```

If no suitable Landsat imagery exists, the backend returns `null` temperature values instead of crashing.

---

# 10. Current Environmental Risk Engine

The backend passes the current mean NDVI into:

```python
classify_ndvi(...)
```

The risk engine returns:

- condition
- risk level
- description

A successful real API response was already observed.

Example:

```json
{
  "condition": "Stressed",
  "risk_level": "High",
  "description": "Vegetation shows signs of stress and should be investigated."
}
```

---

# 11. Environmental Summary Added

The backend now also generates an `environmental_summary`.

It uses NDVI ranges to classify the selected area into:

### Below 0.20

```text
Critical Vegetation Stress
```

### 0.20–0.40

```text
High Vegetation Stress
```

### 0.40–0.60

```text
Moderate Vegetation Condition
```

### 0.60+

```text
Healthy Vegetation Condition
```

The summary includes:

- `overall_status`
- `key_signal`
- `explanation`

If NDVI is unavailable, the backend returns:

```text
Insufficient Data
```

instead of producing an invalid result.

---

# 12. Current API Response Structure

The area endpoint now returns the following overall structure:

```json
{
  "status": "success",
  "point_count": 4,

  "satellite": {
    "source": "Sentinel-2",
    "image_id": "..."
  },

  "vegetation": {
    "mean_ndvi": 0.297,
    "min_ndvi": 0.064,
    "max_ndvi": 0.876
  },

  "temperature": {
    "source": "Landsat 8/9 Collection 2 Level 2",
    "unit": "Celsius",
    "mean_celsius": 0,
    "min_celsius": 0,
    "max_celsius": 0
  },

  "risk": {
    "condition": "...",
    "risk_level": "...",
    "description": "..."
  },

  "environmental_summary": {
    "overall_status": "...",
    "key_signal": "...",
    "explanation": "..."
  },

  "historical": []
}
```

The exact numerical values depend on the selected area and available satellite imagery.

---

# 13. Successful End-to-End Test Already Completed

The system successfully returned a real TerraGuard analysis response from the backend.

A tested response included:

```text
point_count: 4
```

Sentinel-2 image:

```text
20250107T060231_20250107T060650_T42RXT
```

Vegetation:

```text
mean_ndvi: 0.2972084186592046
min_ndvi: 0.06461292258451691
max_ndvi: 0.8763471355643789
```

Risk:

```text
condition: Stressed
risk_level: High
description: Vegetation shows signs of stress and should be investigated.
```

Historical results:

```text
3 historical records
```

This confirms that the frontend → FastAPI → Earth Engine → analysis → risk engine → frontend pipeline is functioning.

---

# 14. Current Project Architecture

The project currently follows this general architecture:

```text
TerraGuard
│
├── Frontend
│   ├── Next.js
│   ├── React
│   ├── TypeScript
│   ├── Tailwind CSS
│   └── Interactive Map
│
├── Backend
│   ├── FastAPI
│   ├── Pydantic
│   └── CORS
│
├── Earth Engine Services
│   ├── Sentinel-2 NDVI
│   ├── Historical Sentinel-2
│   └── Landsat Land Surface Temperature
│
└── Risk Engine
    └── NDVI-based environmental risk classification
```

---

# 15. What We Had NOT Built Yet at the End of the Previous Day

The following were not yet completed and should not be considered finished:

- Full multi-hazard environmental intelligence engine
- Weather/forecast integration
- Soil moisture analysis
- Radar/SAR analysis
- Ocean/coastal analysis
- Deforestation/change detection beyond the current NDVI history
- Automated anomaly detection
- Long-term trend calculations
- Environmental alert generation
- Gemini/LLM explanation layer
- AI-generated recommendations
- Interactive historical charts
- Temperature visualization in the frontend
- Map overlays for NDVI/temperature
- Location search
- Saved analysis reports
- PDF export
- User accounts
- Production deployment
- Full automated testing
- Production-grade Earth Engine authentication
- Production error handling and rate limiting

These are future development tasks, not completed functionality.

---

# 16. Current Product Foundation

At this stage TerraGuard is no longer just a map mockup.

The working foundation is:

```text
Draw area
   ↓
Send coordinates
   ↓
Create Earth Engine polygon
   ↓
Query real satellite imagery
   ↓
Calculate NDVI
   ↓
Calculate historical NDVI
   ↓
Calculate land surface temperature
   ↓
Classify vegetation risk
   ↓
Return structured environmental intelligence
   ↓
Display results in the TerraGuard dashboard
```

This is the baseline system that was successfully built before the next development phase.
