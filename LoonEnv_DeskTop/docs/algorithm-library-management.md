# Algorithm Library Management

This project now treats algorithm backends as repo-local modules managed by:

1. a registry file
2. per-module manifest files
3. module-owned binaries/configs/models

## Core Rule

Frontend does not define algorithms.

Frontend only reads algorithm catalog metadata returned by backend modules.

Backend modules own:

- algorithm inventory
- workflow template metadata
- execution binaries
- configs / models / result artifacts

## Layout

Registry root:

- [`backend/algorithm_library/registry.json`](/home/yhzhu/LoongEnv-ZHU_YH/LoonEnv_DeskTop/backend/algorithm_library/registry.json)

Module manifests:

- [`backend/algorithm_library/modules/perfopt/module.json`](/home/yhzhu/LoongEnv-ZHU_YH/LoonEnv_DeskTop/backend/algorithm_library/modules/perfopt/module.json)

Registry loader / resolver:

- [`backend/algorithm_library/loader.py`](/home/yhzhu/LoongEnv-ZHU_YH/LoonEnv_DeskTop/backend/algorithm_library/loader.py)
- [`backend/algorithm_library/resolve_module.py`](/home/yhzhu/LoongEnv-ZHU_YH/LoonEnv_DeskTop/backend/algorithm_library/resolve_module.py)

Current module binary:

- [`backend/perfopt_v0/scripts/perfopt_http_backend.py`](/home/yhzhu/LoongEnv-ZHU_YH/LoonEnv_DeskTop/backend/perfopt_v0/scripts/perfopt_http_backend.py)

## Module Manifest Responsibilities

Each module manifest must declare:

- module id / name / version
- runtime entry binary
- owned artifact directories
- algorithm entries exposed to frontend

Each algorithm entry should include:

- category
- name
- task type
- candidate structure
- workflow template
- validation gates
- interpretable metrics

## Loading and Replacement

The dev stack no longer hardcodes a backend script path.

[`scripts/start_dev_stack.sh`](/home/yhzhu/LoongEnv-ZHU_YH/LoonEnv_DeskTop/scripts/start_dev_stack.sh) resolves the backend binary through the registry using:

```bash
python3 backend/algorithm_library/resolve_module.py perfopt
```

This makes modules:

- modular
- loadable
- replaceable

If a future module replaces `PerfOpt`, the registry or manifest can be updated without rewriting frontend algorithm definitions.
