# Design-Centric Architecture

This document refines the platform direction described in [`requirement.md`](/home/yhzhu/LoongEnv-ZHU_YH/LoonEnv_DeskTop/requirement.md) and [`docs/development-guidelines.md`](/home/yhzhu/LoongEnv-ZHU_YH/LoonEnv_DeskTop/docs/development-guidelines.md).

## Core Positioning

`LoonEnv_DeskTop` follows the `4D + Core` model:

`Define -> Design -> Deploy -> Diagnose`

with `Core` as hidden infrastructure.

However, these four phases are **not** equal in product weight.

## Product Thesis

The platform's highest-value capability is:

**intelligent design, tuning, and validation of new robot algorithms**

That means `Design` is the center of gravity for both product direction and engineering investment.

## Phase Hierarchy

### Design is the primary value engine

`Design` should eventually own:

- algorithm definition and selection
- parameter tuning and search
- simulation validation
- experiment comparison
- design iteration history
- AI-assisted proposal generation and optimization
- reviewable outputs that can be promoted to deployment

### Define is upstream preparation

`Define` exists to prepare clean inputs for `Design`, including:

- robot structure and model source
- task definition
- robot limits and constraints
- scene/environment setup
- reusable configuration artifacts

The purpose of `Define` is not to be a destination by itself. Its outputs should feed `Design`.

### Deploy is downstream operationalization

`Deploy` exists to take validated `Design` outputs and move them into real systems.

It should consume approved artifacts from `Design`, not bypass validation.

### Diagnose is the feedback loop

`Diagnose` exists to convert runtime evidence into the next iteration of `Design`.

Its outputs should be structured enough to answer:

- what failed
- why it failed
- what should be tuned next
- which design version should be revisited

### Core is hidden infrastructure

`Core` is not a user-facing development phase.

It should support the full loop through:

- shared data contracts
- state/action/log/model schemas
- cross-phase artifact identities
- storage and traceability
- common runtime infrastructure

Users should primarily experience `4D`, while `Core` remains embedded underneath.

## Frontend Implications

The frontend should reflect this hierarchy.

### What this means in practice

1. `Design` should become the richest workflow surface in the product.
2. `Define`, `Deploy`, and `Diagnose` should be organized around how they support `Design`.
3. `Core` should not appear as a peer workflow module for normal users.
4. Design outputs, validation status, and iteration history should become first-class UI concepts.
5. The frontend should emphasize workflow continuity between `Define -> Design -> Deploy -> Diagnose -> Design`.

## Backend Implications

The backend and service layer should increasingly center around `Design` needs.

That includes:

- experiment orchestration
- simulation job execution
- parameter sweep/tuning pipelines
- result storage and comparison
- validation artifact management
- traceable AI-assisted optimization services

## Architectural Decision Rule

When deciding what to build next, prefer the answer that strengthens `Design` as the central capability.

Use this test:

1. Does this feature improve how new algorithms are created, tuned, validated, compared, or promoted?
2. If not, does it clearly improve the inputs to `Design`, the outputs from `Design`, or the feedback back into `Design`?
3. If neither is true, it is probably not a priority feature for the platform.

## Current Development Priority Guidance

In practical terms, near-term development should bias toward:

- stronger `Design` workflows
- better `Define -> Design` handoff structure
- explicit validation artifacts inside `Design`
- clearer `Design -> Deploy` promotion rules
- better `Diagnose -> Design` feedback loops

UI polish is still valuable, but only insofar as it supports this design-centric engineering loop.
