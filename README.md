# IncomeShield AI
### Real-Time Income Protection for India’s Gig Workers

## Problem Statement

India’s delivery partners are the hidden infrastructure behind food, grocery, and e-commerce convenience. But their income is fragile. A flood, heatwave, pollution spike, curfew, or app outage can instantly wipe out hours of work and a large share of weekly earnings. Unlike salaried workers, they have no buffer, no paid leave, and no protection when external disruptions stop them from working. The challenge is to build an AI-enabled parametric insurance platform that protects gig workers against loss of income from external disruptions, using a weekly pricing model and built-in fraud detection. Coverage must focus only on lost income, not health, accidents, or vehicle repairs. 

---

## Our Core Idea

Most insurance products are designed to compensate damage after paperwork.

Gig workers do not have the luxury of waiting.

**IncomeShield AI** is not just an insurance app. It is a **livelihood continuity system** that detects when a worker’s earning ability is interrupted by verified external conditions, estimates the lost earning opportunity, and triggers fast support automatically.

Instead of asking:
> “Did something bad happen?”

we ask:
> “Did this worker lose a real earning window because of a verified disruption outside their control?”

That shift is what makes our solution different.

---

## The Persona We Designed For

### Primary Persona: Ravi, 24, Food Delivery Partner

Ravi is a Swiggy/Zomato-style food delivery worker in Chennai.

He:
- earns roughly ₹700–₹1,200 per day depending on demand
- works long hours and depends on daily cash flow
- uses his phone, maps, and delivery app constantly
- has no meaningful savings buffer
- is highly exposed to weather, pollution, and local disruption

### What hurts Ravi most

Ravi does not mainly fear long-term risk.  
He fears **today becoming a zero-income day**.

Examples:
- heavy rain causes orders to collapse or roads to flood
- severe heat or AQI makes outdoor work unsafe
- local closures or curfews block pickup/drop zones
- platform outages stop order flow
- sudden disruption removes his ability to earn for that shift

Traditional insurance does not solve this. IncomeShield AI does.

---

## What IncomeShield AI Does

IncomeShield AI is an AI-powered parametric platform that:

- monitors disruption signals in real time
- maps them to the worker’s active operating zone
- estimates probable income interruption
- automatically triggers claims logic
- pays valid users quickly
- blocks coordinated fraud attempts

This creates a **zero-touch, low-friction safety net** for gig workers while protecting the insurer from abuse.

---

## Why Our Approach Is Unique

Most teams will build:
- weather trigger + claim + payout

We go beyond that.

Our project is built around **livelihood interruption intelligence**.

We do not just detect whether it rained.  
We detect whether a real worker’s ability to earn was materially interrupted.

That means our system combines:

### 1. Disruption Intelligence
We identify real-world events that break earning conditions:
- heavy rain
- flooding
- severe heat
- pollution spikes
- curfews / zone closures
- app/platform outages

### 2. Earning Interruption Logic
We translate disruption into probable lost earning time using zone, shift timing, activity pattern, and disruption severity.

### 3. Trust & Fraud Defense
We defend against fake GPS, duplicate claims, ring fraud, and payout abuse using layered validation, anomaly detection, and reputation scoring.

This makes the platform both **worker-first** and **fraud-aware**.

---

## Problem Fit with the Hackathon Brief

The solution directly aligns with the challenge expectations:

- protects gig workers from **external disruption-based income loss**
- uses **AI-powered risk assessment**
- uses a **weekly pricing model**
- includes **intelligent fraud detection**
- supports **parametric automation**
- can integrate with weather, traffic, platform, and payment systems
- supports onboarding, policy creation, claims, payouts, and analytics thinking for future phases 
---

## How the System Works

## 1. Worker Onboarding
The worker signs up in a simple mobile-first flow.

Collected inputs:
- name and KYC basics
- platform type
- city / delivery zone
- work pattern
- preferred weekly plan
- payout destination (UPI / wallet)

The onboarding is optimized because the brief expects persona-first design and a simple experience for delivery workers. 

---

## 2. AI Risk Profiling
The system calculates a dynamic weekly risk profile using:

- hyperlocal weather history
- flood-prone area mapping
- AQI patterns
- disruption frequency
- zone access reliability
- platform activity trends
- worker operating time windows

Output:
- risk score
- suggested weekly premium tier
- projected disruption exposure
- payout cap recommendation

This directly addresses the requirement for AI-powered risk assessment and predictive risk modeling. 

---

## 3. Weekly Policy Creation
The worker chooses or is recommended a weekly plan.

Why weekly?
Because gig workers earn and spend week-to-week, and the brief explicitly requires a weekly pricing model aligned to their earnings cycle. 

### Sample Weekly Plans

| Plan | Weekly Premium | Best For | Max Weekly Protection |
|------|----------------|----------|-----------------------|
| Lite | ₹19 | low-risk zones | ₹500 |
| Core | ₹35 | moderate-risk urban workers | ₹1,000 |
| Shield+ | ₹55 | high-risk monsoon/pollution zones | ₹1,500 |

These are example tiers for Phase 1 concept design. Final pricing can be refined in Phase 2 using live and mock datasets.

---

## 4. Real-Time Trigger Monitoring
The platform continuously watches disruption signals.

### Indicative trigger sources
- weather API
- AQI / pollution feeds
- traffic / road closure signals
- local administrative closure alerts
- platform outage indicators
- simulated internal delivery activity data

### Trigger examples
- rainfall above threshold in active zone
- AQI above unsafe threshold
- flood warning or road blockage
- curfew / market closure announcement
- sharp order collapse linked to verified platform disruption

This matches the brief’s parametric automation requirement and the expectation to build trigger-driven claims logic. 

---

## 5. Automatic Claim Initiation
Once a disruption is verified, the system checks:
- was the worker active or expected to be active?
- was the zone genuinely impacted?
- was the disruption severe enough to interrupt earning?
- is the claim pattern trustworthy?

If yes, the system initiates the claim automatically.

The user does not need to fill out long forms or argue about whether the disruption happened.

That is the core power of parametric insurance.

---

## 6. Payout Decision
The payout engine estimates support using:
- policy tier
- disruption duration
- historical earning pattern
- verified activity window
- trust score

### Example logic
If Ravi normally works 5 PM–11 PM in a flood-prone area and verified flooding shuts down access from 6 PM–9 PM, the system calculates the lost earning window and processes support within the policy limit.

---

## Weekly Pricing Logic

Our pricing engine is dynamic, explainable, and fair.

### Inputs
- city and zone risk
- rainfall / flood exposure
- pollution frequency
- local closure history
- worker operating hours
- platform category
- historical disruption intensity

### Pricing principle
Higher exposure = higher weekly premium  
Lower exposure = lower weekly premium

### Why this matters
Instead of charging the same amount to everyone, we personalize weekly pricing based on real operating conditions. This makes the model more viable for insurers and more affordable for workers.

---

## Parametric Triggers We Use

The brief emphasizes that the insured item is **income lost due to external events**, not repair costs or personal injury. 

### Our proposed trigger set

| Trigger Category | Example Condition | Why It Matters |
|-----------------|------------------|----------------|
| Heavy Rain | rainfall beyond threshold | worker cannot safely or practically deliver |
| Flooding | flooded roads / waterlogging alert | pickup and drop routes break down |
| Severe Pollution | AQI above unsafe threshold | outdoor work becomes harmful |
| Curfew / Zone Closure | geo-zone restricted | access to orders disappears |
| Platform Outage | order assignment collapse | worker is available but cannot earn |

---

## AI/ML Strategy

AI in our project is not decoration. It has three real jobs:

### 1. Risk Prediction
Predict which workers/zones face higher disruption risk in the coming week.

Possible methods:
- regression models
- time-series forecasting
- classification by disruption likelihood

### 2. Dynamic Premium Recommendation
Use predicted risk to recommend the most appropriate weekly premium and coverage band.

### 3. Fraud Detection
Detect suspicious claims, fake location behavior, abnormal activity, and coordinated fraud rings.

This directly matches the brief’s requirement for premium calculation, fraud detection, and predictive risk modeling. 
---

## The Market Crash Problem: Our Adversarial Defense Strategy

One of the most important judging differentiators is the “Market Crash” scenario:
fraud rings use fake GPS and coordinated payout abuse to drain liquidity.

This is where IncomeShield AI becomes truly competitive.

### Our philosophy
A fraud-resistant system should not depend on one data source.

So we built **multi-layer trust validation**.

### Layer 1: GPS Spoof Detection
We compare:
- GPS location
- network consistency
- movement realism
- impossible travel jumps
- session/device behavior

If location behavior is physically unrealistic, the claim is flagged.

### Layer 2: Cross-Signal Verification
A claim is stronger only if:
- disruption data matches the zone
- timing aligns with platform/order inactivity
- route condition or local event data supports it

If the worker says the area was disrupted but external signals do not support it, trust drops.

### Layer 3: Behavioral Anomaly Detection
We look for:
- unusual frequency of claims
- repeated claims at edge-threshold timings
- abrupt change from normal activity pattern
- suspiciously similar submission timing across accounts

### Layer 4: Fraud Ring Detection
We cluster claims to detect:
- many users from same suspicious area pattern
- linked devices / IP signals
- synchronized claim bursts
- repeated claim similarity

This helps identify organized fraud rings rather than isolated suspicious users.

### Layer 5: Trust Score Engine
Each worker has a dynamic trust score built from:
- account age
- past verified activity
- past claims behavior
- device consistency
- fraud anomaly history

### Layer 6: Smart Payout Routing
- high-trust users → instant payout
- medium-risk users → soft verification
- high-risk users → delayed review / reduced confidence routing

This keeps genuine workers protected while making coordinated fraud expensive and difficult.

---

## Why This Fraud Strategy Is Strong

Our system is designed to answer the hardest question in the brief:

> How do you spot the faker without punishing the genuinely stranded worker?

Our answer:
- do not rely on a single signal
- combine environment + behavior + trust + cluster analysis
- prioritize honest repeat workers
- escalate only suspicious outliers

That balance is what makes the system effective.

---

## Platform Choice: Mobile First

We chose a **mobile-first platform** because delivery workers live through their phones.

Why mobile makes sense:
- always-on for gig workers
- location-aware
- easier for simple onboarding
- direct alerts and policy status
- seamless UPI-linked payouts
- faster adoption than a desktop-first experience

A lightweight admin dashboard can exist on web for insurer-side monitoring.

---

## High-Level User Workflow

1. Worker signs up  
2. AI generates risk score  
3. Weekly plan is recommended  
4. Worker activates coverage  
5. System monitors disruptions in real time  
6. Verified trigger occurs  
7. Claim logic starts automatically  
8. Fraud checks run in background  
9. Honest user receives payout  
10. Admin dashboard tracks portfolio, fraud flags, and zone risk

---

## Admin and Worker Dashboards

The brief mentions analytics dashboards as part of the expected solution thinking. 

### Worker Dashboard
- active weekly coverage
- risk status
- protected earning amount
- recent triggers
- claim / payout history

### Admin Dashboard
- active policies
- zone-wise risk heatmaps
- disruption trends
- fraud alerts
- payout volume
- projected next-week claims risk

---

## Tech Stack

### Frontend
- React
- Tailwind CSS
- mobile-first responsive UI

### Backend
- FastAPI or Node.js
- REST APIs for policy, triggers, payouts, and fraud scoring

### AI/ML
- Python
- Scikit-learn
- anomaly detection models
- risk scoring pipelines

### Data / Integrations
- weather APIs
- AQI / environmental feeds
- maps / location APIs
- mock traffic and platform APIs
- sandbox payout integration

### Database
- MongoDB or PostgreSQL

### DevOps
- Docker
- Vercel / Render / AWS for deployment

---

## Development Plan

### Phase 1: Ideation & Foundation
- define persona
- define trigger logic
- define weekly premium approach
- define AI/fraud architecture
- create workflow and README

### Phase 2: Automation & Protection
- build onboarding
- policy creation flow
- dynamic pricing prototype
- parametric trigger simulation
- automated claim flow

### Phase 3: Scale & Optimise
- advanced fraud detection
- simulated instant payouts
- insurer and worker dashboards
- stronger predictive analytics
- pitch deck and final demo

This aligns closely with the staged progression described in the use case document. 
---

## What Makes IncomeShield AI Competitive

### We are not just building:
- an insurance screen
- a weather trigger
- a payout demo

### We are building:
- a real-time income continuity engine
- a trust-aware decision system
- a fraud-resistant safety net for gig work

Our originality is not in using AI for the sake of using AI.

Our originality is in using AI to answer a much more human question:

**When a worker loses the chance to earn through no fault of their own, how can the system respond instantly without becoming easy to exploit?**

That is the heart of IncomeShield AI.

---

## Future Scope

- extend to grocery and e-commerce delivery partners
- add graph ML for fraud rings
- integrate real platform data feeds
- improve hyperlocal prediction accuracy
- build multilingual worker support
- partner with insurers and gig platforms for embedded protection

---

## Conclusion

IncomeShield AI rethinks insurance for the gig economy.

It replaces slow, paperwork-heavy claims with an intelligent system that:
- understands disruption
- protects income
- adapts weekly
- defends against fraud
- keeps honest workers at the center

Because for gig workers, resilience is not about replacing damage later.

It is about protecting livelihood when income stops now.

---

## Pitch Deck

Drive Link: https://drive.google.com/file/d/1Z2MV0jbdukysJhyowz8RPWOwh9P_k52Y/view?usp=sharing

