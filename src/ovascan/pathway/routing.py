"""
Clinical Care Pathway & Decision Support Layer (PTH-02, PTH-03, PTH-04).
Generates referral routing, next-best-test recommendations, and risk education.
"""

from typing import Any, Dict, List


def determine_clinical_pathway(
    payload: Dict[str, Any],
    rotterdam_result: Dict[str, Any],
    risk_level: str = "moderate",
) -> Dict[str, Any]:
    """
    Computes multidisciplinary referrals and cost-effective next-best-tests.
    """
    referrals = []
    rationale = []

    bmi = payload.get("bmi", 23.0)
    cycle_reg = str(payload.get("cycle_regularity", "")).lower()
    conception = str(payload.get("conception_status", "")).lower()

    # 1. Gynecology / Reproductive Medicine
    if "irregular" in cycle_reg or "absent" in cycle_reg or rotterdam_result.get("rotterdam_diagnosis"):
        referrals.append("Gynecology & Reproductive Health")
        rationale.append("Menstrual irregularity and/or Rotterdam criteria indications require pelvic evaluation.")

    # 2. Endocrinology
    if bmi >= 28.0 or len(rotterdam_result.get("exclusions_flagged", [])) > 0 or payload.get("dark_patches"):
        referrals.append("Reproductive Endocrinology & Metabolism")
        rationale.append("Markers of hyperinsulinemia (Acanthosis Nigricans, elevated BMI) or hormonal mimic flags.")

    # 3. Next-best-test recommendations (cost-effective order)
    next_tests: List[Dict[str, Any]] = []

    if payload.get("tsh") is None:
        next_tests.append({
            "test": "TSH (Thyroid Stimulating Hormone)",
            "tier": "B",
            "cost_illustrative": "$12.00",
            "clinical_purpose": "Rule out primary hypothyroidism as the cause of oligomenorrhea."
        })

    if payload.get("prl") is None:
        next_tests.append({
            "test": "Prolactin (PRL)",
            "tier": "B",
            "cost_illustrative": "$15.00",
            "clinical_purpose": "Exclude hyperprolactinemia before confirming PCOS."
        })

    if payload.get("amh") is None and rotterdam_result.get("criteria_breakdown", {}).get("polycystic_morphology") is False:
        next_tests.append({
            "test": "AMH (Anti-Müllerian Hormone)",
            "tier": "C",
            "cost_illustrative": "$45.00",
            "clinical_purpose": "Evaluate ovarian follicular reserve as an alternative/adjunct to pelvic ultrasound."
        })

    if "trying" in conception or "pregnant" in conception:
        next_tests.append({
            "test": "75g Oral Glucose Tolerance Test (OGTT) + Lipid Panel",
            "tier": "B",
            "cost_illustrative": "$25.00",
            "clinical_purpose": "Baseline cardiometabolic screening prior to conception."
        })

    # Pregnancy Education / Population Information
    pregnancy_info = None
    if "trying" in conception:
        pregnancy_info = {
            "notice": "Population-Level Educational Information",
            "key_points": [
                "PCOS is associated with higher rates of gestational diabetes mellitus (GDM) and hypertensive disorders.",
                "Pre-conception metabolic optimization (dietary modification, physical activity, inositol/metformin if prescribed) significantly improves ovulatory frequency and pregnancy outcomes.",
                "Consult an obstetrician / maternal-fetal specialist for individual preconception counseling."
            ],
            "citation": "Bahri Khomami M, et al. Pregnancy complications in polycystic ovary syndrome. Human Reproduction Update, 2024."
        }

    return {
        "referrals": referrals or ["Primary Care / General Practice"],
        "rationale": rationale or ["Routine annual wellness monitoring."],
        "next_best_tests": next_tests,
        "pregnancy_education": pregnancy_info,
    }
