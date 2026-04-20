import numpy as np
from estimation.ekf import motion_model


def simulate_truth_and_measurements(steps: int, dt: float, gps_std: float = 0.8):
    true_states = []
    controls = []
    gps_meas = []

    x_true = np.array([0.0, 0.0, 0.0])

    for k in range(steps):
        v = 1.0
        omega = 0.2 * np.sin(0.05 * k) + 0.1
        u = np.array([v, omega])

        x_true = motion_model(x_true, u, dt)

        z = np.array([
            x_true[0] + np.random.randn() * gps_std,
            x_true[1] + np.random.randn() * gps_std,
        ])

        true_states.append(x_true.copy())
        controls.append(u.copy())
        gps_meas.append(z.copy())

    return np.array(true_states), np.array(controls), np.array(gps_meas)
