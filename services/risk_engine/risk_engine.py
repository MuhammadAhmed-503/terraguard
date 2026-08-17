def classify_ndvi(mean_ndvi: float) -> dict:
    """
    Classify vegetation condition using mean NDVI.

    Prototype thresholds:
    >= 0.60  -> Healthy / Low Risk
    >= 0.40  -> Moderate / Moderate Risk
    >= 0.20  -> Stressed / High Risk
    <  0.20  -> Severely Stressed / Critical Risk
    """

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