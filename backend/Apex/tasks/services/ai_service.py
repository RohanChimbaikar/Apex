import json
import ollama


SYSTEM_PROMPT = """
You are an AI assistant for a Field Operations Management System.

Analyze the visit notes.

Return ONLY a valid JSON object.

Required format:

{
    "summary": "",
    "recommendation": "",
    "risk_flag": "",
    "next_action": ""
}

Rules:

1. Return ONLY JSON.
2. Do not use markdown.
3. Do not use code blocks.
4. Do not explain anything.
5. Every field MUST contain a value.
6. Summary: maximum 50 words.
7. Recommendation: one practical recommendation.
8. Next_action: one clear follow-up action.
9. risk_flag must be EXACTLY one of:
   LOW
   MEDIUM
   HIGH

Example:

{
    "summary": "Network connectivity restored after replacing a faulty switch.",
    "recommendation": "Monitor network performance for the next 48 hours.",
    "risk_flag": "LOW",
    "next_action": "Schedule a follow-up inspection."
}
"""


def analyze_visit(notes):

    try:

        response = ollama.chat(
            model="gemma3:1b",
            format="json",
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": notes
                }
            ]
        )

        content = response["message"]["content"].strip()

        print("\n========== RAW AI RESPONSE ==========")
        print(content)
        print("=====================================\n")

        # Remove markdown if the model still returns it
        content = (
            content.replace("```json", "")
            .replace("```", "")
            .strip()
        )

        data = json.loads(content)

        # -------- Required Fields --------

        data["summary"] = data.get("summary") or "No summary generated."

        data["recommendation"] = (
            data.get("recommendation")
            or "Review the visit findings and monitor the situation."
        )

        data["next_action"] = (
            data.get("next_action")
            or "Schedule a follow-up visit."
        )

        risk = str(data.get("risk_flag", "MEDIUM")).upper()

        if "HIGH" in risk:
            data["risk_flag"] = "HIGH"
        elif "LOW" in risk:
            data["risk_flag"] = "LOW"
        else:
            data["risk_flag"] = "MEDIUM"

        # -------- Cleanup --------

        for field in [
            "summary",
            "recommendation",
            "next_action"
        ]:

            value = str(data[field])

            value = (
                value.replace("**", "")
                     .replace('"', "")
                     .replace("¿", "")
                     .strip()
            )

            data[field] = value

        return data

    except json.JSONDecodeError as e:

        print("\nJSON Decode Error")
        print(e)

    except Exception as e:

        print("\nAI Service Error")
        print(type(e).__name__)
        print(e)

    return {
        "summary": "Unable to generate summary.",
        "recommendation": "Manual review required.",
        "risk_flag": "MEDIUM",
        "next_action": "Review visit notes."
    }