"""
Canonical disclaimer definitions for OvaScan AI.
Single source of truth for all API responses, reports, FHIR bundles, and UI headers.
"""

CLINICAL_DISCLAIMER_TEXT = (
    "OvaScan AI is an investigational decision-support and educational tool. "
    "It does not provide a formal medical diagnosis and has not been cleared as a standalone software "
    "medical device. All risk assessments, phenotypic clusters, and triage classifications must be "
    "verified by a qualified healthcare professional in accordance with the Rotterdam Consensus Guidelines."
)

DISCLAIMER_VERSION = "2026.10.1"


def get_disclaimer() -> str:
    """Return the official disclaimer text."""
    return CLINICAL_DISCLAIMER_TEXT
