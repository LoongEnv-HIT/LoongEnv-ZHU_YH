#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

CURRENT_FILE = Path(__file__).resolve()
BACKEND_ROOT = CURRENT_FILE.parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from algorithm_library.loader import resolve_module, resolve_runtime_entry, workspace_root_from_any


def main() -> None:
    parser = argparse.ArgumentParser(description="Resolve an algorithm module from the repo-local registry.")
    parser.add_argument("module_id", help="Module id, for example 'perfopt'")
    parser.add_argument("--field", choices=("runtime_entry", "json"), default="runtime_entry")
    args = parser.parse_args()

    workspace_root = workspace_root_from_any(Path(__file__))
    if args.field == "json":
        print(json.dumps(resolve_module(workspace_root, args.module_id), ensure_ascii=False, indent=2))
        return

    print(resolve_runtime_entry(workspace_root, args.module_id))


if __name__ == "__main__":
    main()
