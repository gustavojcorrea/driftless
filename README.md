# driftless

Minimal autonomy stack for the world!

Currently includes a from-scratch Extended Kalman Filter (EKF) for 2D robot localization under noisy sensing.

---

## What it does

- Simulates a 2D robot with state `(x, y, θ)`
- Adds noisy GPS measurements
- Runs EKF prediction + update loop
- Visualizes ground truth, noisy observations, and filtered estimate

---

## Why

Most robotics stacks abstract away the underlying math. This repo is meant to keep things simple and explicit so it’s easy to understand, modify, and extend.

---

## Repo structure

```text
driftless/
  estimation/
    ekf.py              # EKF implementation
  simulation/
    simulator.py        # simple robot + sensor simulation
  planning/             # (optional) A* / planning experiments
  examples/
    run_ekf_demo.py     # main entry point
  assets/
  README.md
  requirements.txt
```

---

## Running the code
```
git clone https://github.com/gustavojcorrea/driftless.git
cd driftless

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
export PYTHONPATH=.

python examples/run_ekf_demo.py