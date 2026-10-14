"""
Data Quality Engine (PTH-01).
Evaluates clinical inputs against physiological plausibility, unit consistency,
cross-field validity, and medication confounders.
"""

from typing import Any, Dict, List, Tuple


def evaluate_data_quality(input_dict: Dict[str, Any]) -> Tuple[int, List[Dict[str, str]]]:
    """
    Validate incoming clinical payload.
    Returns (score: 0-100, issues: list of dicts).
    """
    score = 100
    issues = []

    # 1. Height & Weight vs BMI consistency
    height = input_dict.get("height")
    weight = input_dict.get("weight")
    bmi = input_dict.get("bmi")

    if height is not None and weight is not None and height > 0:
        expected_bmi = weight / ((height / 100.0) ** 2)
        if bmi is not None and abs(expected_bmi - bmi) > 3.0:
            score -= 15
            issues.append({
                "field": "bmi",
                "code": "BMI_MISMATCH",
                "message": f"Reported BMI ({bmi}) diverges from height/weight calculation ({expected_bmi:.1f})."
            })

    # 2. AMH plausibility
    amh = input_dict.get("amh")
    if amh is not None:
        if amh < 0.0:
            score -= 30
            issues.append({
                "field": "amh",
                "code": "AMH_NEGATIVE",
                "message": "AMH level cannot be negative."
            })
        elif amh > 35.0:
            score -= 10
            issues.append({
                "field": "amh",
                "code": "AMH_EXTREME",
                "message": f"Reported AMH ({amh} ng/mL) is exceedingly high (>35 ng/mL); verify unit or assay scale."
            })

    # 3. Cycle length vs Regularity consistency
    cycle_reg = input_dict.get("cycle_regularity", "").lower()
    cycle_len = input_dict.get("cycle_length", input_dict.get("cycle_length_days"))

    if cycle_len is not None:
        if cycle_len > 45 and "regular" in cycle_reg and "irregular" not in cycle_reg:
            score -= 15
            issues.append({
                "field": "cycle_length",
                "code": "CYCLE_INCONSISTENCY",
                "message": f"Cycle interval is {cycle_len} days (>35 days) but flagged as 'Regular'."
            })
        elif cycle_len < 21 and cycle_len > 0:
            score -= 10
            issues.append({
                "field": "cycle_length",
                "code": "POLYMENORRHEA",
                "message": f"Cycle length is {cycle_len} days (<21 days), indicating polymenorrhea."
            })

    # 4. Age plausibility
    age = input_dict.get("age")
    if age is not None:
        if age < 12 or age > 60:
            score -= 25
            issues.append({
                "field": "age",
                "code": "AGE_OUT_OF_RANGE",
                "message": f"Age {age} falls outside the typical reproductive target window (12-60 years)."
            })
        elif age < 18:
            issues.append({
                "field": "age",
                "code": "ADOLESCENT_CAUTION",
                "message": "Adolescent patient: International guideline cautions against standard adult PCOM criteria within 8 years of menarche."
            })

    # 5. Medication Confounders
    meds = str(input_dict.get("current_meds", "")).lower()
    for med_keyword in ["birth control", "ocp", "oral contraceptive", "spironolactone", "metformin"]:
        if med_keyword in meds:
            issues.append({
                "field": "current_meds",
                "code": "MEDICATION_CONFOUNDER",
                "message": f"Patient reports taking '{med_keyword}'. Androgen levels and cycle regularity may be masked by active therapy."
            })

    score = max(0, min(100, score))
    return score, issues
