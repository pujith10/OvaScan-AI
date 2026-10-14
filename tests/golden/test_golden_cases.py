"""
Golden-Case Regression Suite (VAL-01).
Maintains reproducible regression benchmarks across rules, data quality, and referral pathways.
"""

import pytest
from ovascan.pathway.data_quality import evaluate_data_quality
from ovascan.pathway.routing import determine_clinical_pathway
from ovascan.rules.rotterdam import evaluate_rotterdam_criteria
from ovascan.interop.fhir import generate_fhir_r4_bundle


def test_golden_case_classic_rotterdam_phenotype_a():
    """Golden Case 1: Full-syndrome classic PCOS patient meets Phenotype A."""
    payload = {
        "age": 24,
        "bmi": 28.5,
        "cycle_regularity": "irregular",
        "cycle_length": 45,
        "hirsutism": "severe",
        "acne": "moderate",
        "follicle_count": 22,
        "ovarian_volume_ml": 11.5,
        "amh": 8.4,
    }
    res = evaluate_rotterdam_criteria(payload)
    assert res["rotterdam_diagnosis"] is True
    assert res["criteria_met_count"] == 3
    assert "Phenotype A" in res["phenotype"]


def test_golden_case_ovulatory_pcos_phenotype_c():
    """Golden Case 2: Regular cycles with hyperandrogenism and polycystic ovaries (Phenotype C)."""
    payload = {
        "age": 28,
        "bmi": 23.0,
        "cycle_regularity": "regular",
        "cycle_length": 28,
        "hirsutism": "moderate",
        "follicle_count": 24,
        "amh": 5.2,
    }
    res = evaluate_rotterdam_criteria(payload)
    assert res["rotterdam_diagnosis"] is True
    assert res["criteria_met_count"] == 2
    assert "Phenotype C" in res["phenotype"]


def test_golden_case_healthy_control_negative():
    """Golden Case 3: Physiological control with no criteria met."""
    payload = {
        "age": 29,
        "bmi": 21.8,
        "cycle_regularity": "regular",
        "cycle_length": 29,
        "hirsutism": "none",
        "acne": "none",
        "follicle_count": 4,
        "amh": 2.1,
    }
    res = evaluate_rotterdam_criteria(payload)
    assert res["rotterdam_diagnosis"] is False
    assert res["criteria_met_count"] == 0
    assert res["phenotype"] == "None"


def test_golden_case_thyroid_exclusion_flagged():
    """Golden Case 4: Abnormal TSH correctly marks status as provisional exclusions not cleared."""
    payload = {
        "cycle_regularity": "irregular",
        "cycle_length": 50,
        "hirsutism": "moderate",
        "tsh": 7.8, # Elevated TSH
    }
    res = evaluate_rotterdam_criteria(payload)
    assert res["rotterdam_diagnosis"] is True
    assert "provisional_exclusions_not_cleared" in res["status"]
    assert len(res["exclusions_flagged"]) > 0


def test_golden_case_fhir_r4_structure():
    """Golden Case 5: FHIR export produces valid resource collection."""
    patient = {"patientId": "PT-GOLDEN-01", "age": 26, "bmi": 24.2, "amh": 4.5}
    risk = {"fusionRisk": 0.72, "verdict": "PCOS Positive", "riskCategory": "high"}
    bundle = generate_fhir_r4_bundle(patient, risk)
    assert bundle["resourceType"] == "Bundle"
    assert bundle["type"] == "collection"
    assert bundle["total"] >= 3
