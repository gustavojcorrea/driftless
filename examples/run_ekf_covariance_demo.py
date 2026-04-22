import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse

from estimation.ekf import ekf_predict, ekf_update
from simulation.simulator import simulate_truth_and_measurements


def covariance_ellipse(P_xy: np.ndarray, n_std: float = 2.0):
    eigvals, eigvecs = np.linalg.eigh(P_xy)
    order = np.argsort(eigvals)[::-1]
    eigvals = eigvals[order]
    eigvecs = eigvecs[:, order]

    angle = np.degrees(np.arctan2(eigvecs[1, 0], eigvecs[0, 0]))
    width = 2 * n_std * np.sqrt(max(eigvals[0], 0.0))
    height = 2 * n_std * np.sqrt(max(eigvals[1], 0.0))
    return width, height, angle


def main():
    np.random.seed(7)

    dt = 0.1
    steps = 250

    true_states, controls, gps_meas = simulate_truth_and_measurements(
        steps=steps,
        dt=dt,
        gps_std=1.2,
    )

    x_est = np.array([0.0, 0.0, 0.0])
    P_est = np.diag([2.5, 2.5, 0.8])

    Q = np.diag([0.06, 0.06, 0.015])
    R = np.diag([1.2**2, 1.2**2])

    est_states = []
    covariances = []

    for k in range(steps):
        u = controls[k]
        z = gps_meas[k]

        x_pred, P_pred = ekf_predict(x_est, P_est, u, Q, dt)
        x_est, P_est = ekf_update(x_pred, P_pred, z, R)

        est_states.append(x_est.copy())
        covariances.append(P_est.copy())

    est_states = np.array(est_states)
    covariances = np.array(covariances)

    gps_rmse = np.sqrt(np.mean((gps_meas - true_states[:, :2]) ** 2))
    ekf_rmse = np.sqrt(np.mean((est_states[:, :2] - true_states[:, :2]) ** 2))

    print(f"GPS RMSE: {gps_rmse:.3f}")
    print(f"EKF RMSE: {ekf_rmse:.3f}")
    print(f"Final heading estimate: {est_states[-1, 2]:.3f} rad")

    fig, (ax_traj, ax_var) = plt.subplots(1, 2, figsize=(13, 5))

    ax_traj.plot(true_states[:, 0], true_states[:, 1], label="Ground Truth", linewidth=2)
    ax_traj.scatter(gps_meas[:, 0], gps_meas[:, 1], s=10, alpha=0.35, label="Noisy GPS")
    ax_traj.plot(est_states[:, 0], est_states[:, 1], label="EKF Estimate", linewidth=2)

    sample_indices = range(0, steps, 25)
    for idx in sample_indices:
        width, height, angle = covariance_ellipse(covariances[idx][:2, :2], n_std=2.0)
        ellipse = Ellipse(
            xy=(est_states[idx, 0], est_states[idx, 1]),
            width=width,
            height=height,
            angle=angle,
            facecolor="none",
            edgecolor="#2563eb",
            alpha=0.45,
            linewidth=1.5,
        )
        ax_traj.add_patch(ellipse)

    ax_traj.set_title("EKF Localization with Position Uncertainty")
    ax_traj.set_xlabel("X")
    ax_traj.set_ylabel("Y")
    ax_traj.axis("equal")
    ax_traj.grid(True)
    ax_traj.legend()

    variance_x = covariances[:, 0, 0]
    variance_y = covariances[:, 1, 1]
    variance_theta = covariances[:, 2, 2]
    time_axis = np.arange(steps) * dt

    ax_var.plot(time_axis, variance_x, label="Var(x)")
    ax_var.plot(time_axis, variance_y, label="Var(y)")
    ax_var.plot(time_axis, variance_theta, label="Var(theta)")
    ax_var.set_title("EKF State Uncertainty Over Time")
    ax_var.set_xlabel("Time [s]")
    ax_var.set_ylabel("Variance")
    ax_var.grid(True)
    ax_var.legend()

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    main()
