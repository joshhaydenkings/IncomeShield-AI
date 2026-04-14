from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx


APP_DIR = Path(__file__).resolve().parents[1]
STATE_FILE = APP_DIR / "monitoring_state.json"

WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast"
AIR_QUALITY_API_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"

HTTP_TIMEOUT = 15.0

# Approximate zone centers for your Chennai demo footprint.
# Later, replace this with worker zones from your database.
ZONE_CATALOG = [
    {"zone": "Chennai Central", "latitude": 13.0827, "longitude": 80.2707},
    {"zone": "Chennai North", "latitude": 13.1600, "longitude": 80.3000},
    {"zone": "Chennai South", "latitude": 12.9249, "longitude": 80.1275},
]

# Adjustable thresholds
HEAVY_RAIN_MM_15M = 5.0
EXTREME_RAIN_MM_15M = 10.0

UNSAFE_EUROPEAN_AQI = 80.0
EXTREME_EUROPEAN_AQI = 100.0

UNSAFE_PM25 = 55.0
EXTREME_PM25 = 75.0

HIGH_HEAT_C = 40.0
EXTREME_HEAT_C = 43.0


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _default_state() -> dict[str, Any]:
    return {
        "last_scan_at": None,
        "run_count": 0,
        "last_summary": {},
        "recent_events": [],
        "scan_history": [],
    }


def _load_state() -> dict[str, Any]:
    if not STATE_FILE.exists():
        return _default_state()

    try:
        data = json.loads(STATE_FILE.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            return _default_state()

        default = _default_state()
        default.update(data)
        return default
    except Exception:
        return _default_state()


def _save_state(state: dict[str, Any]) -> None:
    STATE_FILE.write_text(json.dumps(state, indent=2), encoding="utf-8")


def _fetch_json(url: str, params: dict[str, Any]) -> dict[str, Any]:
    with httpx.Client(timeout=HTTP_TIMEOUT, headers={"User-Agent": "IncomeShield-AI/1.0"}) as client:
        response = client.get(url, params=params)
        response.raise_for_status()
        return response.json()


def _fetch_zone_conditions(zone_record: dict[str, Any]) -> dict[str, Any]:
    latitude = zone_record["latitude"]
    longitude = zone_record["longitude"]

    weather_data = _fetch_json(
        WEATHER_API_URL,
        {
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,precipitation,rain,wind_speed_10m",
            "timezone": "auto",
        },
    )

    air_data = _fetch_json(
        AIR_QUALITY_API_URL,
        {
            "latitude": latitude,
            "longitude": longitude,
            "current": "european_aqi,pm2_5",
            "timezone": "auto",
        },
    )

    weather_current = weather_data.get("current", {})
    air_current = air_data.get("current", {})

    return {
        "zone": zone_record["zone"],
        "latitude": latitude,
        "longitude": longitude,
        "temperature_c": float(weather_current.get("temperature_2m", 0.0) or 0.0),
        "precipitation_mm": float(weather_current.get("precipitation", 0.0) or 0.0),
        "rain_mm": float(weather_current.get("rain", 0.0) or 0.0),
        "wind_speed_kmh": float(weather_current.get("wind_speed_10m", 0.0) or 0.0),
        "european_aqi": float(air_current.get("european_aqi", 0.0) or 0.0),
        "pm2_5": float(air_current.get("pm2_5", 0.0) or 0.0),
    }


def _detect_events(signal: dict[str, Any], detected_at: str) -> list[dict[str, Any]]:
    zone = signal["zone"]
    events: list[dict[str, Any]] = []

    precipitation_mm = signal["precipitation_mm"]
    rain_mm = signal["rain_mm"]
    temperature_c = signal["temperature_c"]
    european_aqi = signal["european_aqi"]
    pm2_5 = signal["pm2_5"]

    if precipitation_mm >= HEAVY_RAIN_MM_15M or rain_mm >= HEAVY_RAIN_MM_15M:
        high = precipitation_mm >= EXTREME_RAIN_MM_15M or rain_mm >= EXTREME_RAIN_MM_15M
        severity = "high" if high else "medium"
        payout = 350 if high else 250

        events.append(
            {
                "event_type": "HEAVY_RAIN",
                "zone": zone,
                "severity": severity,
                "reason": (
                    f"Live weather scan detected heavy rain "
                    f"(precipitation {precipitation_mm:.1f} mm, rain {rain_mm:.1f} mm)"
                ),
                "estimated_payout": payout,
                "detected_at": detected_at,
                "source": "open-meteo-weather",
            }
        )

    if european_aqi >= UNSAFE_EUROPEAN_AQI or pm2_5 >= UNSAFE_PM25:
        high = european_aqi >= EXTREME_EUROPEAN_AQI or pm2_5 >= EXTREME_PM25
        severity = "high" if high else "medium"
        payout = 300 if high else 220

        events.append(
            {
                "event_type": "UNSAFE_AQI",
                "zone": zone,
                "severity": severity,
                "reason": (
                    f"Live air-quality scan detected unsafe conditions "
                    f"(European AQI {european_aqi:.0f}, PM2.5 {pm2_5:.1f} µg/m³)"
                ),
                "estimated_payout": payout,
                "detected_at": detected_at,
                "source": "open-meteo-air-quality",
            }
        )

    if temperature_c >= HIGH_HEAT_C:
        high = temperature_c >= EXTREME_HEAT_C
        severity = "high" if high else "medium"
        payout = 280 if high else 200

        events.append(
            {
                "event_type": "HEAT_STRESS",
                "zone": zone,
                "severity": severity,
                "reason": f"Live weather scan detected high outdoor heat ({temperature_c:.1f}°C)",
                "estimated_payout": payout,
                "detected_at": detected_at,
                "source": "open-meteo-weather",
            }
        )

    return events


def run_monitoring_scan() -> dict[str, Any]:
    state = _load_state()
    scan_timestamp = _now_iso()

    signals: list[dict[str, Any]] = []
    fetch_errors: list[dict[str, str]] = []

    for zone_record in ZONE_CATALOG:
        try:
            signals.append(_fetch_zone_conditions(zone_record))
        except Exception as exc:
            fetch_errors.append(
                {
                    "zone": zone_record["zone"],
                    "error": str(exc),
                }
            )

    new_events: list[dict[str, Any]] = []
    for signal in signals:
        new_events.extend(_detect_events(signal, scan_timestamp))

    summary = {
        "scan_timestamp": scan_timestamp,
        "zones_checked": len(signals),
        "zones_with_errors": len(fetch_errors),
        "events_detected": len(new_events),
        "event_types": sorted(list({event["event_type"] for event in new_events})),
        "data_source": "live_open_meteo",
    }

    scan_record = {
        "scan_timestamp": scan_timestamp,
        "summary": summary,
        "events": new_events,
        "signals": signals,
        "errors": fetch_errors,
    }

    scan_history = state.get("scan_history", [])
    scan_history.insert(0, scan_record)

    state["last_scan_at"] = scan_timestamp
    state["run_count"] = int(state.get("run_count", 0)) + 1
    state["last_summary"] = summary
    state["recent_events"] = new_events
    state["scan_history"] = scan_history[:10]

    _save_state(state)

    return {
        "message": "Live monitoring scan completed",
        "summary": summary,
        "new_events": new_events,
        "errors": fetch_errors,
    }


def get_monitoring_status() -> dict[str, Any]:
    state = _load_state()
    return {
        "last_scan_at": state.get("last_scan_at"),
        "run_count": state.get("run_count", 0),
        "last_summary": state.get("last_summary", {}),
        "recent_events": state.get("recent_events", []),
        "scan_history": state.get("scan_history", []),
    }