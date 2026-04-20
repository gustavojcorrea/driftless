import numpy as np


def wrap_angle(angle: float) -> float:
    return (angle + np.pi) % (2 * np.pi) - np.pi


def motion_model(x: np.ndarray, u: np.ndarray, dt: float) -> np.ndarray:
    px, py, theta = x
    v, omega = u
    return np.array([
        px + v * np.cos(theta) * dt,
        py + v * np.sin(theta) * dt,
        wrap_angle(theta + omega * dt),
    ])


def jacobian_F(x: np.ndarray, u: np.ndarray, dt: float) -> np.ndarray:
    _, _, theta = x
    v, _ = u
    return np.array([
        [1.0, 0.0, -v * np.sin(theta) * dt],
        [0.0, 1.0,  v * np.cos(theta) * dt],
        [0.0, 0.0,  1.0],
    ])


def measurement_model(x: np.ndarray) -> np.ndarray:
    return np.array([x[0], x[1]])


def jacobian_H() -> np.ndarray:
    return np.array([
        [1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
    ])


def ekf_predict(x: np.ndarray, P: np.ndarray, u: np.ndarray, Q: np.ndarray, dt: float):
    x_pred = motion_model(x, u, dt)
    F = jacobian_F(x, u, dt)
    P_pred = F @ P @ F.T + Q
    return x_pred, P_pred


def ekf_update(x_pred: np.ndarray, P_pred: np.ndarray, z: np.ndarray, R: np.ndarray):
    H = jacobian_H()
    z_pred = measurement_model(x_pred)

    y = z - z_pred
    S = H @ P_pred @ H.T + R
    K = P_pred @ H.T @ np.linalg.inv(S)

    x_upd = x_pred + K @ y
    x_upd[2] = wrap_angle(x_upd[2])

    I = np.eye(len(x_pred))
    P_upd = (I - K @ H) @ P_pred

    return x_upd, P_upd
