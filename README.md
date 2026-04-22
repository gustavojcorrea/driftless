# Driftless

Building a simple autonomy stack.

Driftless is a lightweight robotics sandbox for understanding the major pieces of an autonomous system without hiding the ideas behind a large framework. The repo includes small estimation and planning modules, plus a browser-based visualization app that makes the stack easier to inspect.

## What is in here

- A simple EKF localization implementation in Python
- Basic planning experiments including A*, Dijkstra, weighted A*, and APF
- A Three.js web app with demos for:
  - sensor fusion
  - SLAM and loop closure
  - traversability and costmaps
  - global vs local planning
  - mission-level reasoning
  - classical grid planning

## Repo layout

```text
driftless/
  estimation/          # Python estimation modules
  simulation/          # Python simulation helpers
  planning/            # Python planning experiments
  examples/            # Runnable Python demos
  web/                 # React + Three.js visualization app
  README.md
  requirements.txt
```

## Installation

### Python demos

```bash
git clone https://github.com/gustavojcorrea/driftless.git
cd driftless

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

export PYTHONPATH=.
python examples/run_ekf_demo.py
```

You can also run:

```bash
python examples/run_ekf_covariance_demo.py
```

### Web app

```bash
cd web
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Notes

- The web app is meant to make each subsystem visually understandable, not to be a production autonomy stack.
- The Python side is intentionally small and easy to modify so new demos can be added without much ceremony.
