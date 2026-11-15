
import re
from dataclasses import dataclass


@dataclass
class Scenario:
    category: str
    keywords: tuple
    risk: str
    follow_up: str
    next_action: str


# ============================================================
# 1. OPERATIONAL SCENARIO KNOWLEDGE BASE
# ============================================================

SCENARIOS = [

    Scenario(
        "FIRE_OR_SMOKE",
        ("fire", "smoke", "burning smell", "flames", "spark"),
        "HIGH",
        "Arrange an urgent safety inspection and verify that the affected area is safe.",
        "Escalate immediately to the appropriate emergency and safety team."
    ),

    Scenario(
        "ELECTRICAL",
        ("electrical hazard", "exposed wiring", "electric shock",
         "short circuit", "power surge", "burnt wiring"),
        "HIGH",
        "Arrange an inspection by a qualified electrical technician.",
        "Isolate the affected equipment where appropriate and escalate to electrical support."
    ),

    Scenario(
        "GAS_LEAK",
        ("gas leak", "gas leakage", "gas smell", "gas pipeline"),
        "HIGH",
        "Arrange an urgent inspection by qualified gas safety personnel.",
        "Escalate immediately through the appropriate emergency safety procedure."
    ),

    Scenario(
        "WATER_LEAKAGE",
        ("water leakage", "water leak", "flooding", "burst pipe",
         "pipe burst", "water damage", "drainage blockage"),
        "HIGH",
        "Arrange plumbing support and inspect the affected area for further damage.",
        "Assign a plumber to identify and repair the source of leakage."
    ),

    Scenario(
        "EQUIPMENT_FAILURE",
        ("equipment failure", "machine failure", "machine stopped",
         "not functioning", "not working", "mechanical failure",
         "damaged motor", "broken motor"),
        "HIGH",
        "Schedule a technical inspection to identify the cause of equipment failure.",
        "Assign a technician to diagnose and repair the equipment."
    ),

    Scenario(
        "OVERHEATING",
        ("overheating", "excessive heat", "temperature rise",
         "cooling failure", "overheated"),
        "HIGH",
        "Arrange an inspection of the cooling system and monitor equipment temperature.",
        "Escalate the overheating issue to a qualified maintenance technician."
    ),

    Scenario(
        "MACHINE_NOISE",
        ("unusual noise", "strange noise", "abnormal vibration",
         "loud vibration", "grinding noise"),
        "MEDIUM",
        "Arrange a mechanical inspection to identify the source of abnormal noise.",
        "Schedule a technician to inspect moving parts and mechanical components."
    ),

    Scenario(
        "HVAC",
        ("air conditioning", "air conditioner", "hvac",
         "cooling unit", "heating system", "fan belt",
         "compressor issue"),
        "MEDIUM",
        "Schedule HVAC maintenance and verify system performance.",
        "Assign an HVAC technician to inspect the cooling or heating system."
    ),

    Scenario(
        "NETWORK",
        ("internet connectivity", "network outage", "no internet",
         "router failure", "wifi issue", "packet loss",
         "network disconnected", "connectivity issue"),
        "MEDIUM",
        "Monitor network connectivity and verify that service remains stable.",
        "Assign network support to diagnose and resolve the connectivity issue."
    ),

    Scenario(
        "SOFTWARE",
        ("software error", "application crash", "system crash",
         "login failure", "database error", "software bug",
         "application not responding", "system malfunction"),
        "MEDIUM",
        "Verify application stability after the corrective action.",
        "Assign IT support to investigate and resolve the software issue."
    ),

    Scenario(
        "SECURITY",
        ("security breach", "unauthorized access", "intrusion",
         "access control failure", "suspicious activity",
         "security alarm failure"),
        "HIGH",
        "Arrange a security assessment and verify access control integrity.",
        "Escalate the incident to the security operations team."
    ),

    Scenario(
        "CUSTOMER_COMPLAINT",
        ("customer complaint", "customer dissatisfied",
         "unhappy customer", "poor service", "service complaint",
         "customer escalation"),
        "MEDIUM",
        "Contact the customer to verify that their complaint has been addressed.",
        "Assign the complaint to the appropriate customer support representative."
    ),

    Scenario(
        "INSTALLATION",
        ("installation", "installed equipment", "new setup",
         "device configuration", "system deployment",
         "commissioning"),
        "LOW",
        "Verify installation quality and confirm that the system operates correctly.",
        "Complete installation checks and obtain customer confirmation."
    ),

    Scenario(
        "MAINTENANCE",
        ("maintenance required", "preventive maintenance",
         "routine servicing", "scheduled maintenance",
         "equipment servicing"),
        "LOW",
        "Schedule the next preventive maintenance inspection.",
        "Add the equipment to the maintenance schedule."
    ),

    Scenario(
        "INVENTORY",
        ("spare parts unavailable", "out of stock",
         "inventory shortage", "parts unavailable",
         "replacement component unavailable"),
        "MEDIUM",
        "Check inventory availability and coordinate procurement.",
        "Request the required replacement parts and schedule follow-up work."
    ),

    Scenario(
        "ENVIRONMENTAL",
        ("air quality", "chemical spill", "hazardous material",
         "chemical exposure", "environmental contamination"),
        "HIGH",
        "Arrange an environmental safety assessment.",
        "Escalate to the appropriate environmental health and safety team."
    ),

    Scenario(
        "FAILED_VISIT",
        ("customer unavailable", "customer absent",
         "visit unsuccessful", "could not access",
         "access denied", "visit not completed"),
        "MEDIUM",
        "Contact the customer and arrange another appointment.",
        "Reschedule the visit after confirming availability."
    ),

    Scenario(
        "ROUTINE_INSPECTION",
        ("routine inspection", "inspection completed",
         "all equipment normal", "no issues identified",
         "functioning normally"),
        "LOW",
        "Continue with the regular inspection schedule.",
        "Record the inspection results and schedule the next inspection."
    ),
]


# ============================================================
# 2. TEXT PROCESSING
# ============================================================

def normalize_text(text):
    """Normalize text for consistent keyword matching."""

    text = str(text or "").lower()
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def contains_keyword(text, keywords):
    """Match whole phrases rather than arbitrary substrings."""

    return any(
        re.search(
            r"(?<!\w)" + re.escape(keyword) + r"(?!\w)",
            text
        )
        for keyword in keywords
    )


def find_scenarios(notes, outcome):
    """Identify operational scenarios from visit information."""

    text = normalize_text(f"{notes} {outcome}")

    matched = []

    for scenario in SCENARIOS:
        if contains_keyword(text, scenario.keywords):
            matched.append(scenario)

    return matched


# ============================================================
# 3. SUMMARY GENERATION
# ============================================================

def generate_summary(notes, outcome):
    """
    Create a concise report from the submitted visit information.

    This deliberately preserves the original facts rather than
    inventing a diagnosis or claiming an issue was resolved.
    """

    notes = str(notes or "").strip()
    outcome = str(outcome or "").strip()

    if notes and outcome:
        return f"{notes} Visit outcome: {outcome}"

    if notes:
        return notes

    if outcome:
        return outcome

    return "No visit information was provided."


# ============================================================
# 4. RISK CLASSIFICATION
# ============================================================

def generate_risk_flag(notes, outcome):
    """
    Estimate operational risk using scenario categories.

    HIGH takes priority over MEDIUM, which takes priority over LOW.
    """

    scenarios = find_scenarios(notes, outcome)

    risk_priority = {
        "LOW": 1,
        "MEDIUM": 2,
        "HIGH": 3,
    }

    if not scenarios:
        return "MEDIUM"

    return max(
        scenarios,
        key=lambda item: risk_priority[item.risk]
    ).risk


# ============================================================
# 5. FOLLOW-UP RECOMMENDATION
# ============================================================

def generate_follow_up(notes, outcome):
    """Generate recommendations based on detected scenarios."""

    scenarios = find_scenarios(notes, outcome)

    if not scenarios:
        return (
            "Review the visit report and contact the customer "
            "to confirm whether additional assistance is required."
        )

    recommendations = []

    for scenario in scenarios:
        if scenario.follow_up not in recommendations:
            recommendations.append(scenario.follow_up)

    return " ".join(recommendations)


# ============================================================
# 6. NEXT ACTION RECOMMENDATION
# ============================================================

def generate_next_action(notes, outcome):
    """Recommend operational actions based on detected scenarios."""

    scenarios = find_scenarios(notes, outcome)

    if not scenarios:
        return (
            "Review the visit findings and assign the appropriate "
            "follow-up action."
        )

    actions = []

    for scenario in scenarios:
        if scenario.next_action not in actions:
            actions.append(scenario.next_action)

    return " ".join(actions)


# ============================================================
# 7. MAIN SERVICE
# ============================================================

def analyze_visit(notes, outcome):
    """
    Generate all intelligence outputs for a completed Visit.
    """

    scenarios = find_scenarios(notes, outcome)

    return {
        "summary": generate_summary(notes, outcome),
        "follow_up": generate_follow_up(notes, outcome),
        "risk_flag": generate_risk_flag(notes, outcome),
        "next_action": generate_next_action(notes, outcome),
        "detected_categories": [
            scenario.category for scenario in scenarios
        ],
    }
