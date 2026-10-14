"""
FHIR R4 Interoperability Module (INT-01).
Exports structured clinical observations, patient risk assessments, and triage summaries
into HL7 FHIR Release 4 compliant JSON bundles.
"""

import uuid
from datetime import datetime
from typing import Any, Dict
from ovascan.governance.disclaimer import get_disclaimer


def generate_fhir_r4_bundle(patient_data: Dict[str, Any], risk_result: Dict[str, Any]) -> Dict[str, Any]:
    """Generates an HL7 FHIR R4 compliant Bundle."""
    bundle_id = str(uuid.uuid4())
    patient_id = patient_data.get("patientId", f"PT-{uuid.uuid4().hex[:6].upper()}")
    timestamp = datetime.utcnow().isoformat() + "Z"

    entries = []

    # 1. Patient Resource (Pseudonymized)
    patient_resource = {
        "fullUrl": f"urn:uuid:{uuid.uuid4()}",
        "resource": {
            "resourceType": "Patient",
            "id": patient_id,
            "active": True,
            "gender": "female",
            "birthDate": f"{datetime.now().year - int(patient_data.get('age', 25))}-01-01"
        }
    }
    entries.append(patient_resource)

    # 2. Observations (LOINC Coded)
    # BMI LOINC: 39156-5
    bmi = patient_data.get("bmi", patient_data.get("biomarkers", {}).get("bmi"))
    if bmi:
        entries.append({
            "fullUrl": f"urn:uuid:{uuid.uuid4()}",
            "resource": {
                "resourceType": "Observation",
                "status": "final",
                "code": {
                    "coding": [{
                        "system": "http://loinc.org",
                        "code": "39156-5",
                        "display": "Body mass index (BMI) [Ratio]"
                    }]
                },
                "subject": {"reference": f"Patient/{patient_id}"},
                "valueQuantity": {
                    "value": float(bmi),
                    "unit": "kg/m2",
                    "system": "http://unitsofmeasure.org",
                    "code": "kg/m2"
                }
            }
        })

    # AMH LOINC: 55437-8
    amh = patient_data.get("amh", patient_data.get("biomarkers", {}).get("amh"))
    if amh:
        entries.append({
            "fullUrl": f"urn:uuid:{uuid.uuid4()}",
            "resource": {
                "resourceType": "Observation",
                "status": "final",
                "code": {
                    "coding": [{
                        "system": "http://loinc.org",
                        "code": "55437-8",
                        "display": "Anti-Mullerian hormone [Mass/volume] in Serum or Plasma"
                    }]
                },
                "subject": {"reference": f"Patient/{patient_id}"},
                "valueQuantity": {
                    "value": float(amh),
                    "unit": "ng/mL",
                    "system": "http://unitsofmeasure.org",
                    "code": "ng/mL"
                }
            }
        })

    # 3. RiskAssessment Resource
    risk_assessment = {
        "fullUrl": f"urn:uuid:{uuid.uuid4()}",
        "resource": {
            "resourceType": "RiskAssessment",
            "status": "final",
            "subject": {"reference": f"Patient/{patient_id}"},
            "occurrenceDateTime": timestamp,
            "condition": {
                "coding": [{
                    "system": "http://snomed.info/sct",
                    "code": "237055002",
                    "display": "Polycystic ovary syndrome (disorder)"
                }]
            },
            "prediction": [{
                "outcome": {
                    "text": risk_result.get("verdict", "PCOS Risk Assessment")
                },
                "probabilityDecimal": float(risk_result.get("fusionRisk", 0.5)),
                "qualitativeRisk": {
                    "text": risk_result.get("riskCategory", "moderate")
                }
            }],
            "note": [{
                "text": get_disclaimer()
            }]
        }
    }
    entries.append(risk_assessment)

    return {
        "resourceType": "Bundle",
        "id": bundle_id,
        "type": "collection",
        "timestamp": timestamp,
        "total": len(entries),
        "entry": entries
    }
