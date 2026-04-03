# Design Module Contract

This document defines the intended boundary between the `Design` frontend workflow and the backend services it should eventually orchestrate.

## Frontend Owns

- algorithm-design workflow presentation
- parameter editing surfaces
- optimization configuration input
- validation evidence presentation
- result comparison and design-artifact export UI
- orchestration of user actions and job state

## Backend Owns

- simulation execution
- controller rollout jobs
- optimization scheduling
- metric aggregation
- result persistence
- replayable artifact generation
- audit trail and experiment history

## Core Design Artifacts

The `Design` phase should center around these reusable artifacts:

1. Design Spec
2. Controller Config
3. Constraint Profile
4. Optimization Job
5. Validation Report
6. Design Result Package

## Suggested Backend Contract

The frontend should eventually be able to orchestrate the design workflow through stable backend-facing endpoints such as:

- `POST /api/design/jobs`
- `GET /api/design/jobs/:id`
- `GET /api/design/jobs/:id/metrics`
- `GET /api/design/jobs/:id/report`
- `GET /api/design/jobs/:id/result`

The exact transport can evolve, but the artifact and state boundaries should stay stable.

## Boundary Rule

This module only covers `Define + Design` concerns in the PerOpt sample path.

It may produce validated design artifacts that later systems could consume, but it does not implement `Deploy` or `Diagnose` workflows itself.

## Output Rule

The primary output of the Design module is a validated, reviewable design artifact package, not a deployment action.
