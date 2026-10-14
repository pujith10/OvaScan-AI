"""
Pydantic v2 schemas for the OvaScan API.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "healthy"
    model_versions: Dict[str, str] = Field(default_factory=dict)
    legacy_mode: bool = True
    timestamp: str


class TabularPredictionInput(BaseModel):
    age: Optional[float] = Field(default=25.0, ge=10.0, le=65.0)
    bmi: Optional[float] = Field(default=23.0, ge=12.0, le=70.0)
    cycle_regularity: Optional[str] = "irregular"
    cycle_length_days: Optional[float] = Field(default=35.0, ge=15.0, le=150.0)
    hirsutism_flag: Optional[int] = Field(default=0, ge=0, le=1)
    acne_flag: Optional[int] = Field(default=0, ge=0, le=1)
    hair_loss_flag: Optional[int] = Field(default=0, ge=0, le=1)
    dark_patches_flag: Optional[int] = Field(default=0, ge=0, le=1)
    
    # Tier B
    fsh: Optional[float] = None
    lh: Optional[float] = None
    tsh: Optional[float] = None
    prl: Optional[float] = None
    vit_d3: Optional[float] = None
    rbs: Optional[float] = None

    # Tier C
    amh: Optional[float] = Field(default=4.2, ge=0.0, le=50.0)
    beta_hcg_1: Optional[float] = None
    beta_hcg_2: Optional[float] = None


class DataQualityReport(BaseModel):
    score: int = Field(ge=0, le=100)
    is_valid: bool = True
    issues: List[Dict[str, str]] = Field(default_factory=list)


class ExplanationItem(BaseModel):
    feature: str
    impact: float
    value: str


class PredictionResponseV2(BaseModel):
    request_id: str
    tier: str
    model_versions: Dict[str, str]
    data_quality: DataQualityReport
    tabular: Dict[str, Any]
    vision: Dict[str, Any]
    fusion: Dict[str, Any]
    phenotype: Dict[str, Any]
    rotterdam: Dict[str, Any]
    pathway: Dict[str, Any]
    verdict: str
    disclaimer: str
