# Algorithm Design Workflow

This document defines the normalized workflow that every future `Design` algorithm path in `LoonEnv_DeskTop` should follow.

The current PerOpt controller-design path is the first concrete example, not a special-case architecture.

## Goal

The purpose of `Design` is not to host one-off optimizer pages.

It should provide a reusable engineering workflow for:

1. defining an algorithm candidate
2. configuring its task and constraints
3. running simulation-backed search or evaluation
4. producing validation evidence
5. exporting a reusable result package

This same workflow should support:

- controller design
- trajectory planning
- motion generation
- parameter identification
- policy search

## Canonical Stages

Every algorithm-design flow should be expressed through the same three stage groups:

### 1. Synthesis

Owns:

- algorithm family selection
- task profile selection
- candidate structure definition
- search space definition
- evaluation protocol definition

Primary artifact output:

- `Design Spec`

### 2. Optimization

Owns:

- job creation
- backend execution
- trial comparison
- interpretable metric tracking
- replay/result generation

Primary artifact outputs:

- `Algorithm Candidate Config`
- `Optimization Job`
- `Replayable Result`

### 3. Validation

Owns:

- gate checks
- constraint verification
- reviewable summaries
- approval / export readiness

Primary artifact outputs:

- `Validation Report`
- `Design Result Package`

## Required Artifacts

Every algorithm profile should map into the following reusable artifact set:

1. `Design Spec`
   Includes algorithm family, task profile, optimization objective, validation gates.
2. `Algorithm Candidate Config`
   Includes parameters, structures, heuristics, or solver settings under evaluation.
3. `Optimization Job`
   Includes backend execution identity, study/job configuration, progress, and traceability.
4. `Validation Report`
   Includes metrics, constraint checks, pass/fail reasoning, and reviewer-facing evidence.
5. `Design Result Package`
   Includes approved config, replay/result payload, and metadata needed by downstream phases.

## Normalized Backend Responsibilities

The frontend should orchestrate the workflow, but the backend must own:

- long-running execution
- search/scheduling
- metrics aggregation
- replay/result generation
- durable result persistence
- exportable validation/result artifacts

## Minimal Endpoint Surface

Each algorithm profile may vary internally, but the frontend should converge on this stable backend-facing contract:

- `POST /api/design/jobs`
- `GET /api/design/jobs/:id`
- `GET /api/design/jobs/:id/metrics`
- `GET /api/design/jobs/:id/report`
- `GET /api/design/jobs/:id/result`

Temporary adapters, such as the current PerfOpt HTTP bridge, should evolve toward this contract rather than introducing profile-specific UI behavior.

## Algorithm Profile Model

A new algorithm path should be onboarded as a profile, not a new workflow.

Each profile should declare:

- `profile id`
- `algorithm family`
- `task type`
- `candidate structure`
- `backend execution mode`
- `interpretable metrics`
- `validation gates`
- `profile-specific synthesis steps`

## Current First Profile

The first implemented profile is:

- `peropt_forward_controller`
- family: controller design
- task type: fixed reference trajectory tracking
- candidate structure: PID + inverse dynamics feedforward
- backend: MuJoCo CPU + Optuna

Future profiles such as trajectory planning should reuse the same workflow while swapping only the profile description and backend implementation details.
