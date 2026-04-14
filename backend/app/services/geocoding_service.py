from __future__ import annotations

from typing import Any

import httpx


GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search"
HTTP_TIMEOUT = 15.0


def _fetch_json(url: str, params: dict[str, Any]) -> dict[str, Any]:
    with httpx.Client(
        timeout=HTTP_TIMEOUT,
        headers={"User-Agent": "IncomeShield-AI/1.0"},
    ) as client:
        response = client.get(url, params=params)
        response.raise_for_status()
        return response.json()


def geocode_indian_location(
    city: str,
    zone: str = "",
    pincode: str = "",
) -> dict[str, Any]:
    city = (city or "").strip()
    zone = (zone or "").strip()
    pincode = (pincode or "").strip()

    if not city and not pincode:
        raise ValueError("City or pincode is required")

    search_candidates: list[str] = []

    if pincode and city:
        if zone:
            search_candidates.append(f"{zone}, {city}, {pincode}")
        search_candidates.append(f"{city}, {pincode}")

    if city:
        if zone:
            search_candidates.append(f"{zone}, {city}")
        search_candidates.append(city)

    if pincode:
        search_candidates.append(pincode)

    results: list[dict[str, Any]] = []

    for query in search_candidates:
        data = _fetch_json(
            GEOCODING_API_URL,
            {
                "name": query,
                "count": 5,
                "language": "en",
                "countryCode": "IN",
                "format": "json",
            },
        )
        results = data.get("results") or []
        if results:
            break

    if not results:
        raise ValueError(
            f"Could not resolve Indian location from city='{city}', zone='{zone}', pincode='{pincode}'"
        )

    best = results[0]

    resolved_name = best.get("name", city or pincode)
    resolved_admin1 = best.get("admin1", "")
    resolved_country = best.get("country", "India")
    timezone = best.get("timezone", "Asia/Kolkata")

    normalized_label_parts = [part for part in [zone, city] if part]
    normalized_label = ", ".join(normalized_label_parts) if normalized_label_parts else resolved_name

    return {
        "input_city": city,
        "input_zone": zone,
        "input_pincode": pincode,
        "normalized_location": normalized_label,
        "resolved_name": resolved_name,
        "resolved_admin1": resolved_admin1,
        "resolved_country": resolved_country,
        "latitude": float(best["latitude"]),
        "longitude": float(best["longitude"]),
        "timezone": timezone,
    }