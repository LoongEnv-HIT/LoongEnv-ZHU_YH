# LoonEnv_DeskTop Development Guidelines

This document translates [`requirement.md`](/home/yhzhu/LoongEnv-ZHU_YH/LoonEnv_DeskTop/requirement.md) into implementation-oriented guidance for day-to-day development.

For product priority and workflow emphasis, also see [`docs/design-centric-architecture.md`](/home/yhzhu/LoongEnv-ZHU_YH/LoonEnv_DeskTop/docs/design-centric-architecture.md).

## Product Framing

`LoonEnv_DeskTop` is not a single-purpose simulator UI. It is the desktop/web presentation layer of a system-engineering platform for industrial robot development.

The platform goal is to support a full closed loop:

`Define -> Design -> Deploy -> Diagnose`

with `Core` as the shared data/model substrate across all phases.

## Non-Negotiable Architecture Rules

1. Every feature must map to one of `Define`, `Design`, `Deploy`, `Diagnose`, or `Core`.
2. Frontend and backend responsibilities should remain clearly separated.
3. Frontend should stay lightweight and interaction-focused.
4. Web and desktop runtimes must both be considered first-class targets.
5. AI-generated outputs must remain reviewable, traceable, and auditable.

## Phase Expectations

### Define

- Owns robot structure, model source, task definition, constraints, and scene setup.
- Output should be structured robot/task configuration rather than one-off UI-only state.

### Design

- Owns controller/algorithm design and simulation validation.
- Must not be treated as complete until validation artifacts exist.
- Design outputs should be promotable to Deploy, not trapped in frontend state.

### Deploy

- Owns packaging validated outputs into real execution environments.
- Real-time control loops are not owned by Python; realtime execution belongs to C++ lanes.

### Diagnose

- Owns logs, monitoring, anomaly analysis, and improvement feedback.
- Diagnose outputs should be able to flow back into Design as reusable engineering input.

### Core

- Owns shared state/action/log/model contracts and reusable platform data structures.
- Cross-phase objects should land here instead of being duplicated in multiple feature modules.

## Frontend Guidance

1. Keep rendering/viewer code isolated from robot metadata and business configuration.
2. Keep robot-specific constants in dedicated data/config modules.
3. Prefer composable panels and phase-specific modules over large mixed files.
4. Treat the frontend as an orchestrator of workflows and visual state, not as the home for heavy domain logic.
5. If a feature involves parsing, optimization, long-running jobs, or reusable engineering services, bias toward backend ownership.

## Backend Guidance

Backend or service layers should own:

- Model processing and conversion
- Heavy validation pipelines
- Long-running simulation or analysis jobs
- Durable logs and diagnostics pipelines
- Reusable robot metadata and capability registries

## Refactor Policy

When refactoring:

1. Prefer extracting stable configuration before changing behavior.
2. Keep changes reversible and scoped.
3. Avoid broad rewrites when a small boundary cleanup is enough.
4. Preserve existing workflows unless the phase contract is being intentionally improved.

## Current Practical Direction

For the current ER15-based desktop app:

- ER15 robot metadata should live in shared data modules.
- View components should consume shared configuration instead of redefining constants.
- Phase panels should evolve toward `Define/Design/Deploy/Diagnose` ownership instead of becoming generic miscellaneous dashboards.
