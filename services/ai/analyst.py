import os
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# Try new SDK first, fallback to old SDK
try:
    from google import genai
    USE_NEW_SDK = True
except ImportError:
    try:
        import google.generativeai as genai
        USE_NEW_SDK = False
    except ImportError:
        genai = None
        USE_NEW_SDK = False

# Load API key from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


def initialize_gemini():
    """Initialize Gemini with API key."""
    if not GEMINI_API_KEY:
        return None

    if USE_NEW_SDK:
        # New SDK
        return genai.Client(api_key=GEMINI_API_KEY)
    else:
        # Old SDK (deprecated) — gemini-1.5-flash is retired/shutdown,
        # use a currently supported model instead.
        genai.configure(api_key=GEMINI_API_KEY)
        return genai.GenerativeModel("gemini-2.5-flash-lite")


def generate_environmental_analysis(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate AI-powered environmental analysis using Gemini.

    Args:
        data: Analysis data containing vegetation, temperature, water, moisture, risk

    Returns:
        Dict with executive_summary, signals, factors, confidence, investigation_priority
    """
    try:
        if not GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY not set — skipping AI analysis.")
            return {
                "status": "unavailable",
                "message": "Gemini API key not configured",
                "executive_summary": "AI analysis unavailable.",
                "signals": [],
                "contributing_factors": [],
                "confidence": "No AI analysis available",
                "investigation_priority": "Unknown"
            }

        # Prepare prompt
        prompt = f"""
You are TerraGuard, an environmental intelligence AI. Analyze this environmental data and provide:

1. Executive Summary (2-3 sentences)
2. Main Environmental Signals (bullet list)
3. Likely Contributing Factors (based on data)
4. Confidence Level (High/Medium/Low with reason)
5. Investigation Priority (Critical/High/Medium/Low) with reason

Data:
- NDVI: {data.get('ndvi', 'N/A')}
- Historical NDVI Change: {data.get('ndvi_change', 'N/A')}%
- Temperature: {data.get('temperature', 'N/A')}°C
- Temperature Anomaly: {data.get('temperature_anomaly', 'N/A')}°C
- Water Coverage: {data.get('water_percent', 'N/A')}%
- Water Change: {data.get('water_change', 'N/A')}%
- Moisture Status: {data.get('moisture_status', 'N/A')}
- Risk Score: {data.get('risk_score', 'N/A')}/100
- Risk Level: {data.get('risk_level', 'N/A')}

Important:
- Do NOT fabricate measurements
- Base analysis ONLY on provided data
- Be honest about data limitations
- If a metric is N/A, say "data unavailable"

Format your response as JSON:
{{
    "executive_summary": "...",
    "signals": ["signal1", "signal2"],
    "contributing_factors": ["factor1", "factor2"],
    "confidence": "High/Medium/Low - reason",
    "investigation_priority": "Critical/High/Medium/Low - reason"
}}
"""

        # Generate response
        if USE_NEW_SDK:
            # New SDK
            client = initialize_gemini()
            response = client.models.generate_content(
                model="gemini-3.5-flash-lite",
                contents=prompt
            )
        else:
            # Old SDK
            model = initialize_gemini()
            response = model.generate_content(prompt)

        # Parse JSON from response
        try:
            # Extract JSON from markdown if present
            text = response.text
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]

            result = json.loads(text.strip())

            return {
                "status": "success",
                "executive_summary": result.get("executive_summary", "Analysis complete."),
                "signals": result.get("signals", []),
                "contributing_factors": result.get("contributing_factors", []),
                "confidence": result.get("confidence", "Medium - AI analysis based on available data"),
                "investigation_priority": result.get("investigation_priority", "Medium - Further investigation recommended")
            }
        except json.JSONDecodeError:
            # Fallback: use raw text
            return {
                "status": "partial",
                "executive_summary": response.text[:200] + "...",
                "signals": ["AI analysis generated"],
                "contributing_factors": ["See executive summary"],
                "confidence": "Medium - Raw AI response",
                "investigation_priority": "Medium - Review AI analysis"
            }

    except Exception as e:
        # Log the real error so it shows up in Render logs for debugging.
        logger.exception("Gemini AI analysis failed: %s", e)
        return {
            "status": "error",
            "message": str(e),
            "executive_summary": "AI analysis temporarily unavailable.",
            "signals": [],
            "contributing_factors": [],
            "confidence": "Error - AI service unavailable",
            "investigation_priority": "Unknown"
        }


def generate_investigation_priority(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate investigation priority based on multiple signals.
    This is a rule-based fallback when AI is unavailable.
    """
    risk_score = data.get('risk_score', 0)
    ndvi_change = data.get('ndvi_change', 0)
    temp_anomaly = data.get('temperature_anomaly', 0)
    water_change = data.get('water_change', 0)

    # Calculate priority score
    priority_score = 0

    # Risk score contribution (0-50)
    priority_score += min(risk_score * 0.5, 50)

    # NDVI change contribution (0-25)
    if ndvi_change is not None:
        if ndvi_change < -30:
            priority_score += 25
        elif ndvi_change < -20:
            priority_score += 18
        elif ndvi_change < -10:
            priority_score += 10
        elif ndvi_change < -5:
            priority_score += 5

    # Temperature anomaly contribution (0-15)
    if temp_anomaly is not None:
        if temp_anomaly > 5:
            priority_score += 15
        elif temp_anomaly > 3:
            priority_score += 10
        elif temp_anomaly > 1:
            priority_score += 5

    # Water change contribution (0-10)
    if water_change is not None:
        if water_change < -20:
            priority_score += 10
        elif water_change < -10:
            priority_score += 7
        elif water_change < -5:
            priority_score += 4

    # Determine priority level
    if priority_score >= 70:
        level = "CRITICAL"
        description = "Multiple severe environmental signals detected. Immediate investigation required."
    elif priority_score >= 50:
        level = "HIGH"
        description = "Significant environmental stress detected. Prioritize investigation."
    elif priority_score >= 30:
        level = "MEDIUM"
        description = "Moderate environmental signals detected. Monitor and investigate when possible."
    elif priority_score >= 15:
        level = "LOW"
        description = "Minor environmental signals detected. Routine monitoring recommended."
    else:
        level = "VERY LOW"
        description = "No significant environmental stress detected. Continue routine monitoring."

    return {
        "level": level,
        "score": round(priority_score, 1),
        "description": description,
        "components": {
            "risk_score": min(risk_score * 0.5, 50),
            "ndvi_change": priority_score - min(risk_score * 0.5, 50) - (temp_anomaly or 0) - (water_change or 0) if ndvi_change is not None else 0,
            "temperature_anomaly": min(temp_anomaly or 0, 15),
            "water_change": min(water_change or 0, 10)
        }
    }