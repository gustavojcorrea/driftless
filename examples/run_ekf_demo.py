import numpy as np
import matplotlib.pyplot as plt

from estimation.ekf import ekf_predict, ekf_update
from simulation.simulator import simulate_truth_and_measurements


def main():
    np.random.seed(42)

    dt = 0.1
    steps = 300

    true_states, controls, gps_meas = simulate_truth_and_measurements(
        steps=steps,
        dt=dt,
        gps_std=0.8,
    )

    x_est = np.array([0.0, 0.0, 0.0])
    P_est = np.diag([1.0, 1.0, 0.5])

    Q = np.diag([0.05, 0.05, 0.01])
    R = np.diag([0.8**2, 0.8**2])

    est_states = []

    for k in range(steps):
        u = controls[k]
        z = gps_meas[k]

        x_pred, P_pred = ekf_predict(x_est, P_est, u, Q, dt)
        x_est, P_est = ekf_update(x_pred, P_pred, z, R)

        est_states.append(x_est.copy())

    est_states = np.array(est_states)

    gps_rmse = np.sqrt(np.mean((gps_meas - true_states[:, :2]) ** 2))
    ekf_rmse = np.sqrt(np.mean((est_states[:, :2] - true_states[:, :2]) ** 2))

    print(f"GPS RMSE: {gps_rmse:.3f}")
    print(f"EKF RMSE: {ekf_rmse:.3f}")

    plt.figure(figsize=(8, 6))
    plt.plot(true_states[:, 0], true_states[:, 1], label="Ground Truth")
    plt.scatter(gps_meas[:, 0], gps_meas[:, 1], s=10, label="Noisy GPS")
    plt.plot(est_states[:, 0], est_states[:, 1], label="EKF Estimate")
    plt.xlabel("X")
    plt.ylabel("Y")
    plt.title("Driftless: 2D EKF Localization")
    plt.legend()
    plt.axis("equal")
    plt.grid(True)
    plt.show()


if __name__ == "__main__":
    main()
