from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List


def workspace_root_from_any(path: Path) -> Path:
    resolved = path.resolve()
    if resolved.is_file():
        resolved = resolved.parent
    current = resolved
    while current != current.parent:
        if (current / "backend").exists() and (current / "src").exists():
            return current
        current = current.parent
    raise FileNotFoundError("workspace_root_not_found")


def registry_path(workspace_root: Path) -> Path:
    return workspace_root / "backend" / "algorithm_library" / "registry.json"


def load_registry(workspace_root: Path) -> Dict[str, Any]:
    path = registry_path(workspace_root)
    return json.loads(path.read_text(encoding="utf-8"))


def robot_registry_path(workspace_root: Path) -> Path:
    return workspace_root / "src" / "data" / "robotModels.json"


def load_robot_registry(workspace_root: Path) -> Dict[str, Any]:
    path = robot_registry_path(workspace_root)
    return json.loads(path.read_text(encoding="utf-8"))


def resolve_robot_model(workspace_root: Path, robot_model_id: str) -> Dict[str, Any]:
    registry = load_robot_registry(workspace_root)
    if robot_model_id not in registry:
        raise KeyError(f"robot_model_not_found:{robot_model_id}")
    return registry[robot_model_id]


def _resolve_manifest_path(workspace_root: Path, manifest_ref: str) -> Path:
    manifest_path = (workspace_root / manifest_ref).resolve()
    if not manifest_path.exists():
        raise FileNotFoundError(f"manifest_not_found:{manifest_ref}")
    return manifest_path


def load_enabled_modules(workspace_root: Path) -> List[Dict[str, Any]]:
    registry = load_registry(workspace_root)
    modules: List[Dict[str, Any]] = []
    for entry in registry.get("modules", []):
        if not entry.get("enabled", True):
            continue
        manifest_path = _resolve_manifest_path(workspace_root, str(entry["manifest"]))
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        manifest["_manifest_path"] = str(manifest_path)
        manifest["_workspace_root"] = str(workspace_root)
        modules.append(manifest)
    return modules


def resolve_module(workspace_root: Path, module_id: str) -> Dict[str, Any]:
    for module in load_enabled_modules(workspace_root):
        if str(module.get("id")) == module_id:
            return module
    raise KeyError(f"module_not_found:{module_id}")


def catalog_payload(workspace_root: Path, robot_model_id: str | None = None) -> Dict[str, Any]:
    modules = load_enabled_modules(workspace_root)
    filtered_modules = []
    for module in modules:
        algorithms = module.get("algorithms", [])
        if robot_model_id:
          algorithms = [
              algorithm
              for algorithm in algorithms
              if robot_model_id in (algorithm.get("supportedRobotModels") or [])
          ]
        filtered_modules.append(
            {
                "id": module["id"],
                "name": module["name"],
                "description": module["description"],
                "runtime": module.get("runtime", {}),
                "algorithms": algorithms,
            }
        )
    return {
        "ok": True,
        "modules": filtered_modules,
    }


def resolve_runtime_entry(workspace_root: Path, module_id: str) -> Path:
    module = resolve_module(workspace_root, module_id)
    runtime = module.get("runtime") or {}
    entry = runtime.get("entry")
    if not entry:
        raise KeyError(f"runtime_entry_missing:{module_id}")
    path = (workspace_root / str(entry)).resolve()
    if not path.exists():
        raise FileNotFoundError(f"runtime_entry_not_found:{path}")
    return path
