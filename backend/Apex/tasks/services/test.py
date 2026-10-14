from .ai_service import analyze_visit
notes = """
Visited ABC Medical Store.

Owner was available.

Inventory verified.

Found expired medicines on one shelf.

Requested immediate removal.

Store owner agreed to comply within 24 hours.
"""

result = analyze_visit(notes)

print(result)