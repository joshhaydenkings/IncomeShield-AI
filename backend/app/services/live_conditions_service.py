from __future__ import annotations

import json
from urllib.error import URLError
from urllib.parse import quote
from urllib.request import urlopen


def _fetch_json(url: str):
    try:
        with urlopen(url, timeout=8) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        raise RuntimeError(f"Live API request failed: {exc}") from exc


def _map_live_data_to_scenario(weather: dict, air: dict) -> tuple[str, str]:
    current_weather = weather.get("current", {}) or {}
    current_air = air.get("current", {}) or {}

    rain = float(current_weather.get("rain", 0) or 0)
    precipitation = float(current_weather.get("precipitation", 0) or 0)
    temperature = float(current_weather.get("temperature_2m", 0) or 0)
    european_aqi = float(current_air.get("european_aqi", 0) or 0)
    pm25 = float(current_air.get("pm2_5", 0) or 0)

    if rain >= 8 or precipitation >= 8:
        return "flood", f"Heavy rain detected ({rain} mm rain, {precipitation} mm precipitation)."

    if rain >= 2 or precipitation >= 2:
        return "rain", f"Rain disruption detected ({rain} mm rain, {precipitation} mm precipitation)."

    if european_aqi >= 100 or pm25 >= 75:
        return "aqi", f"Unsafe air quality detected (AQI {european_aqi}, PM2.5 {pm25})."

    if temperature >= 43:
        return "aqi", f"Extreme outdoor heat detected ({temperature}°C), mapped to unsafe work conditions."

    return "normal", "Conditions look normal from live public data."


def geocode_public_location(city: str, zone: str | None = None):
    queries: list[str] = []
    city_query = city.strip()

    if zone and zone.strip():
        queries.append(f"{zone.strip()}, {city_query}")
    queries.append(city_query)

    last_error: str | None = None

    for query in queries:
        url = (
            "https://geocoding-api.open-meteo.com/v1/search"
            f"?name={quote(query)}&count=1&language=en&format=json"
        )

        try:
            data = _fetch_json(url)
        except Exception as exc:
            last_error = f"Geocoding failed: {exc}"
            continue

        results = data.get("results") or []
        if not results:
            last_error = f"Could not find public location data for {query}."
            continue

        match = results[0]
        return {
            "error": False,
            "name": match.get("name", query),
            "latitude": match.get("latitude"),
            "longitude": match.get("longitude"),
            "admin1": match.get("admin1"),
            "country": match.get("country"),
            "queryUsed": query,
        }

    return {
        "error": True,
        "reason": last_error or f"Could not find public location data for {city_query}.",
    }


def get_live_weather_and_aqi(latitude: float, longitude: float):
    weather_url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={latitude}&longitude={longitude}"
        "&current=temperature_2m,precipitation,rain,wind_speed_10m&timezone=auto"
    )

    air_url = (
        "https://air-quality-api.open-meteo.com/v1/air-quality"
        f"?latitude={latitude}&longitude={longitude}"
        "&current=european_aqi,pm2_5&timezone=auto"
    )

    try:
        weather = _fetch_json(weather_url)
        air = _fetch_json(air_url)
        return {
            "error": False,
            "weather": weather,
            "air": air,
        }
    except Exception as exc:
        return {
            "error": True,
            "reason": f"Live weather/AQI fetch failed: {exc}",
        }


def get_live_condition_result_by_coordinates(
    latitude: float,
    longitude: float,
    location_name: str,
    query_used: str | None = None,
    admin1: str | None = None,
    country: str | None = None,
):
    live_data = get_live_weather_and_aqi(latitude, longitude)
    if live_data.get("error"):
        return {
            "error": True,
            "reason": live_data["reason"],
            "mappedScenario": "normal",
            "queryUsed": query_used or location_name,
            "location": {
                "name": location_name,
                "latitude": latitude,
                "longitude": longitude,
                "admin1": admin1,
                "country": country,
            },
        }

    mapped_scenario, reason = _map_live_data_to_scenario(
        live_data["weather"],
        live_data["air"],
    )

    return {
        "error": False,
        "mappedScenario": mapped_scenario,
        "reason": reason,
        "queryUsed": query_used or location_name,
        "location": {
            "name": location_name,
            "latitude": latitude,
            "longitude": longitude,
            "admin1": admin1,
            "country": country,
        },
        "weather": live_data["weather"],
        "air": live_data["air"],
    }


def get_live_condition_result(city: str, zone: str | None = None):
    location = geocode_public_location(city, zone)
    if location.get("error"):
        return {
            "error": True,
            "reason": location["reason"],
            "mappedScenario": "normal",
            "queryUsed": zone.strip() + ", " + city.strip() if zone and zone.strip() else city.strip(),
            "location": {
                "name": city,
                "latitude": None,
                "longitude": None,
            },
        }

    return get_live_condition_result_by_coordinates(
        latitude=location["latitude"],
        longitude=location["longitude"],
        location_name=location["name"],
        query_used=location["queryUsed"],
        admin1=location.get("admin1"),
        country=location.get("country"),
    )
