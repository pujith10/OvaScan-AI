"""
Cohort Harmonization and Unit Conversion Module (DAT-06).
Standardizes laboratory units across clinical centers and assay formats.
"""

from typing import Any, Dict


UNIT_CONVERSIONS = {
    # Testosterone: nmol/L to ng/dL (multiply by 28.84)
    "testosterone_nmol_to_ngdl": 28.84,
    "testosterone_ngdl_to_nmol": 1.0 / 28.84,

    # Glucose: mmol/L to mg/dL (multiply by 18.018)
    "glucose_mmol_to_mgdl": 18.018,
    "glucose_mgdl_to_mmol": 1.0 / 18.018,

    # Insulin: pmol/L to uIU/mL (divide by 6.0)
    "insulin_pmol_to_uiuml": 1.0 / 6.0,
    "insulin_uiuml_to_pmol": 6.0,

    # AMH: pmol/L to ng/mL (divide by 7.14)
    "amh_pmol_to_ngml": 1.0 / 7.14,
    "amh_ngml_to_pmol": 7.14,
}


def harmonize_lab_value(parameter: str, value: float, from_unit: str, to_unit: str) -> float:
    """Harmonizes a laboratory measurement across unit conventions."""
    if value is None:
        return None
    param_clean = parameter.lower()
    from_u = from_unit.lower().strip()
    to_u = to_unit.lower().strip()

    if from_u == to_u:
        return value

    if "amh" in param_clean:
        if from_u in ["pmol/l", "pmol"] and to_u in ["ng/ml", "ng"]:
            return round(value * UNIT_CONVERSIONS["amh_pmol_to_ngml"], 3)
        elif from_u in ["ng/ml", "ng"] and to_u in ["pmol/l", "pmol"]:
            return round(value * UNIT_CONVERSIONS["amh_ngml_to_pmol"], 3)

    if "glucose" in param_clean or "rbs" in param_clean:
        if "mmol" in from_u and "mg" in to_u:
            return round(value * UNIT_CONVERSIONS["glucose_mmol_to_mgdl"], 2)
        elif "mg" in from_u and "mmol" in to_u:
            return round(value * UNIT_CONVERSIONS["glucose_mgdl_to_mmol"], 2)

    return value
