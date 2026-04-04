from .schemas import PlanInfo, ScenarioInfo, ScenarioKey

plans = {
    "Lite": PlanInfo(
        name="Lite",
        premium=19,
        protection=500,
        badge="Best for safer zones",
    ),
    "Core": PlanInfo(
        name="Core",
        premium=35,
        protection=1000,
        badge="Balanced protection",
    ),
    "Shield+": PlanInfo(
        name="Shield+",
        premium=55,
        protection=1500,
        badge="For high-risk zones",
    ),
}

scenario_data: dict[ScenarioKey, ScenarioInfo] = {
    "normal": ScenarioInfo(
        score=88,
        issue="Conditions are stable. Deliveries are active in your area.",
        payout=0,
        payoutStatus="none",
        risk="low",
        fraudFlag=False,
        reasons=[
            "No major disruption was detected in the worker's zone.",
            "Road access and platform activity look normal.",
            "No suspicious account or location behavior was found.",
        ],
        workerMessage="Everything looks normal. No payout action is needed right now.",
    ),
    "rain": ScenarioInfo(
        score=43,
        issue="Heavy rain is slowing deliveries in your area.",
        payout=260,
        payoutStatus="checking",
        risk="medium",
        fraudFlag=False,
        reasons=[
            "Rainfall threshold was crossed in the worker's zone.",
            "The worker is within their usual shift window.",
            "We are verifying disruption severity before final payout.",
        ],
        workerMessage="Heavy rain is affecting your area. We are checking your payout.",
    ),
    "flood": ScenarioInfo(
        score=18,
        issue="Flooded roads are blocking delivery routes in your zone.",
        payout=420,
        payoutStatus="approved",
        risk="high",
        fraudFlag=False,
        reasons=[
            "Flood conditions were verified in the active delivery zone.",
            "Road movement is heavily restricted and earning ability is very low.",
            "The worker's activity pattern looks normal and trusted.",
        ],
        workerMessage="Flooding is affecting your area. Your payout has been approved.",
    ),
    "aqi": ScenarioInfo(
        score=35,
        issue="Air quality is unsafe for long outdoor work right now.",
        payout=280,
        payoutStatus="checking",
        risk="medium",
        fraudFlag=False,
        reasons=[
            "AQI crossed the unsafe threshold for outdoor work.",
            "The worker normally operates during this time.",
            "We are checking the final impact before payout confirmation.",
        ],
        workerMessage="Air quality is unsafe. We are checking your payout.",
    ),
    "outage": ScenarioInfo(
        score=27,
        issue="Platform outage is reducing order assignments sharply.",
        payout=350,
        payoutStatus="approved",
        risk="high",
        fraudFlag=False,
        reasons=[
            "Platform order flow dropped sharply in the worker's area.",
            "The worker was available during expected earning hours.",
            "The disruption matched system-wide order failure signals.",
        ],
        workerMessage="Platform outage detected. Your payout has been approved.",
    ),
    "gps_spoof": ScenarioInfo(
        score=22,
        issue="Location mismatch detected. We need to review this case.",
        payout=0,
        payoutStatus="review",
        risk="high",
        fraudFlag=True,
        reasons=[
            "GPS and network location do not match.",
            "Movement pattern appears unrealistic for the time window.",
            "This claim needs review before any payout is made.",
        ],
        workerMessage="We found unusual activity. This case needs review.",
    ),
}