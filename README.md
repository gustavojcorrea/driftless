# driftless

**Driftless — a minimal autonomy stack for state estimation and navigation.**

A from-scratch Extended Kalman Filter (EKF) demo for 2D robot localization with noisy GPS and motion inputs.

## What it does
- Simulates a 2D robot with state `(x, y, theta)`
- Adds noisy GPS measurements
- Runs EKF predict + update
- Visualizes ground truth vs noisy measurements vs filtered estimate

## Why
Most robotics libraries hide the math. Driftless is built to make estimation understandable and hackable.

## Repo Structure
```text
driftless/
  estimation/
    ekf.py
  simulation/
    simulator.py
  examples/
    run_ekf_demo.py
  assets/
  README.md
  requirements.txt
