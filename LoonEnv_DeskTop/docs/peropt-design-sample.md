# PerOpt as a Design Sample

This document explains how `/home/yhzhu/LoongEnv_R0.1/PerOpt` should inform the `Design` module in `LoonEnv_DeskTop`.

## Why PerOpt Matters

PerOpt is a concrete example of **control algorithm forward design**, not just optimization tooling.

Its value is that it already expresses a coherent engineering loop:

1. define a reference trajectory
2. compose a controller
3. enforce engineering constraints
4. simulate and evaluate
5. aggregate interpretable metrics
6. optimize and replay results

This is exactly the kind of workflow the `Design` phase in LoongEnv should elevate.

## Sample Workflow to Reuse

### Inputs

- robot model: ER15-1400 MJCF
- task trajectory: cosine position trajectory
- controller structure: per-joint PID + inverse dynamics feedforward
- optimization setup: weight configuration, baseline normalization, Optuna search
- engineering constraints: position, velocity, torque limits

### Core Processing Loop

Per simulation tick:

1. generate `q_ref`, `qd_ref`, `qdd_ref`
2. read `q_meas`, `qd_meas`
3. compute torque via one of the feedforward modes
4. apply joint/velocity/torque constraints
5. step MuJoCo
6. record sequences for evaluation

### Outputs

- validated controller parameters
- per-run metric JSON
- loss decomposition
- compare-ff visual comparisons
- Optuna search results and replayable best configuration
- a reusable design-result package that remains inside the `Define + Design` boundary

## LoongEnv Design Implication

The `Design` module should not be framed as a generic “AI training page”.

It should become a workflow surface for:

- controller synthesis
- optimization strategy selection
- validation evidence review
- export of validated design artifacts

PerOpt therefore serves as the first reference implementation of:

**forward controller design -> optimization -> validation**

## Modularization Guidance

When Product and UI evolve, keep these boundaries:

1. algorithm template definition
2. trajectory/task configuration
3. controller composition
4. optimization orchestration
5. evaluation and validation artifacts
6. reusable design-result packaging

Do not collapse these into one large page-level component.
