"""
Feature schema loader and validation utilities (DAT-01).
"""

import os
from pathlib import Path
from typing import Any, Dict, List
import yaml


def load_feature_registry(config_path: str = "config/features.yaml") -> Dict[str, Any]:
    """Load and parse the feature registry YAML."""
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Feature registry not found at: {config_path}")
    with open(config_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def get_feature_tier_sets(registry: Dict[str, Any] = None) -> Dict[str, List[str]]:
    """Returns lists of feature names segregated by Tier (A, B, C) and Excluded."""
    if registry is None:
        registry = load_feature_registry()

    features = registry.get("features", [])
    tier_sets = {
        "Tier_A": [],
        "Tier_B": [],
        "Tier_C": [],
        "Excluded": [],
    }

    for feat in features:
        name = feat.get("name")
        tier = feat.get("tier")
        if feat.get("exclude_from_models", False) or tier == "EXCLUDE":
            tier_sets["Excluded"].append(name)
        elif tier == "A":
            tier_sets["Tier_A"].append(name)
        elif tier == "B":
            tier_sets["Tier_B"].append(name)
        elif tier == "C":
            tier_sets["Tier_C"].append(name)

    return tier_sets
