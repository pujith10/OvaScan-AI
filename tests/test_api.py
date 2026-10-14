"""
Tests for OvaScan AI FastAPI application (FND-03).
"""

from fastapi.testclient import TestClient
from ovascan.api.main import app

client = TestClient(app)


def test_api_health():
    """Verify GET /api/health returns status and model versions."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "model_versions" in data
    assert "disclaimer" in data


def test_api_diagnose_json():
    """Verify POST /api/diagnose with JSON payload."""
    res = client.post(
        "/api/diagnose",
        json={"amh": 8.45, "bmi": 28.4, "cycleLength": 42.0},
    )
    assert res.status_code == 200
    data = res.json()
    assert "fusionRisk" in data
    assert "data_quality" in data
    assert "rotterdam" in data
    assert "pathway" in data
    assert data["verdict"] == "PCOS Positive"


def test_data_quality_gate_catches_invalid_values():
    """Verify that unrealistic inputs decrease data quality score."""
    from ovascan.pathway.data_quality import evaluate_data_quality
    score, issues = evaluate_data_quality({
        "height": 160,
        "weight": 50,
        "bmi": 45.0, # Gross mismatch
        "amh": -2.0, # Negative AMH
    })
    assert score < 60
    assert len(issues) >= 2
