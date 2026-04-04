import json
from urllib.parse import quote
from urllib.request import urlopen


def _fetch_json(url: str):
    with urlopen(url, timeout=15) as response:
        return json.loads(response.read().decode("utf-8"))


def geocode_place(query: str):
    url = (
        "https://geocoding-api.open-meteo.com/v1/search"
        f"?name={quote(query)}&count=1&language=en&format=json"
    )
    data = _fetch_json(url)
    results = data.get("results") or []
    if not results:
        return None

    first = results[0]
    return {
        "name": first.get("name", query),
        "latitude": first["latitude"],
        "longitude": first["longitude"],
        "country": first.get("country", ""),
        "admin1": first.get("admin1", ""),
    }


def resolve_worker_location(city: str, zone: str | None = None):
    queries = []

    if zone and zone.strip():
        queries.append(f"{zone}, {city}")
    queries.append(city)

    for query in queries:
        result = geocode_place(query)
        if result:
            return {
                "queryUsed": query,
                "location": result,
            }

    return None


def get_live_weather_and_aqi(latitude: float, longitude: float):
    weather_url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={latitude}&longitude={longitude}"
        "&current=temperature_2m,precipitation,rain,showers,weather_code,wind_speed_10m"
        "&timezone=auto"
    )

    air_url = (
        "https://air-quality-api.open-meteo.com/v1/air-quality"
        f"?latitude={latitude}&longitude={longitude}"
        "&current=us_aqi,pm2_5"
        "&timezone=auto"
    )

    weather = _fetch_json(weather_url)
    air = _fetch_json(air_url)

    current_weather = weather.get("current", {})
    current_air = air.get("current", {})

    return {
        "temperature": current_weather.get("temperature_2m"),
        "precipitation": current_weather.get("precipitation", 0),
        "rain": current_weather.get("rain", 0),
        "showers": current_weather.get("showers", 0),
        "weatherCode": current_weather.get("weather_code"),
        "windSpeed": current_weather.get("wind_speed_10m"),
        "aqi": current_air.get("us_aqi"),
        "pm25": current_air.get("pm2_5"),
    }


def map_live_data_to_scenario(data: dict):
    precipitation = float(data.get("precipitation") or 0)
    rain = float(data.get("rain") or 0)
    showers = float(data.get("showers") or 0)
    aqi = data.get("aqi")
    wind_speed = float(data.get("windSpeed") or 0)

    total_rain = precipitation + rain + showers

    if aqi is not None and float(aqi) >= 150:
        return {
            "scenario": "aqi",
            "reason": f"Live AQI is {aqi}, which is unhealthy.",
        }

    if total_rain >= 15 or wind_speed >= 45:
        return {
            "scenario": "flood",
            "reason": f"Heavy live precipitation or wind detected ({total_rain} mm, {wind_speed} km/h).",
        }

    if total_rain >= 2:
        return {
            "scenario": "rain",
            "reason": f"Live rain detected ({total_rain} mm).",
        }

    return {
        "scenario": "normal",
        "reason": "Live conditions look stable right now.",
    }


def get_live_condition_result(city: str, zone: str | None = None):
    resolved = resolve_worker_location(city, zone)
    if not resolved:
        place_text = f"{zone}, {city}" if zone else city
        return {
            "error": True,
            "reason": f"Could not find location for '{place_text}'.",
        }

    location = resolved["location"]
    live_data = get_live_weather_and_aqi(location["latitude"], location["longitude"])
    mapped = map_live_data_to_scenario(live_data)

    return {
        "error": False,
        "queryUsed": resolved["queryUsed"],
        "location": location,
        "liveData": live_data,
        "mappedScenario": mapped["scenario"],
        "reason": mapped["reason"],
    }