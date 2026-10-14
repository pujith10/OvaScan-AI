"""
Experiment and run tracking utilities.
Records hyperparameters, metrics, data hashes, and environment info to reports/.
"""

import hashlib
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Dict


def compute_file_hash(filepath: str) -> str:
    """Compute sha256 checksum of a file."""
    if not os.path.exists(filepath):
        return "file_not_found"
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()[:16]


def log_run_artifacts(
    run_name: str,
    params: Dict[str, Any],
    metrics: Dict[str, Any],
    artifacts: Dict[str, str] = None,
    output_dir: str = "reports",
) -> str:
    """Save run details and metrics to reports directory."""
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    report_filename = f"{run_name}_{timestamp}.json"
    target_path = os.path.join(output_dir, report_filename)

    payload = {
        "run_name": run_name,
        "timestamp_utc": timestamp,
        "parameters": params,
        "metrics": metrics,
        "artifact_hashes": artifacts or {},
    }

    with open(target_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    return target_path
