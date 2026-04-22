function wrapAngle(angle) {
  const twoPi = 2 * Math.PI;
  return ((((angle + Math.PI) % twoPi) + twoPi) % twoPi) - Math.PI;
}

export function motionModel(state, control, dt) {
  const [x, y, theta] = state;
  const [v, omega] = control;

  return [
    x + v * Math.cos(theta) * dt,
    y + v * Math.sin(theta) * dt,
    wrapAngle(theta + omega * dt),
  ];
}

function jacobianF(state, control, dt) {
  const [, , theta] = state;
  const [v] = control;

  return [
    [1, 0, -v * Math.sin(theta) * dt],
    [0, 1, v * Math.cos(theta) * dt],
    [0, 0, 1],
  ];
}

function jacobianH() {
  return [
    [1, 0, 0],
    [0, 1, 0],
  ];
}

function measurementModel(state) {
  return [state[0], state[1]];
}

function matMul(a, b) {
  const rows = a.length;
  const cols = b[0].length;
  const inner = b.length;
  const out = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (let k = 0; k < inner; k++) {
        out[r][c] += a[r][k] * b[k][c];
      }
    }
  }

  return out;
}

function matAdd(a, b) {
  return a.map((row, r) => row.map((value, c) => value + b[r][c]));
}

function matSub(a, b) {
  return a.map((row, r) => row.map((value, c) => value - b[r][c]));
}

function transpose(m) {
  return m[0].map((_, c) => m.map((row) => row[c]));
}

function matVecMul(m, v) {
  return m.map((row) => row.reduce((sum, value, i) => sum + value * v[i], 0));
}

function vecAdd(a, b) {
  return a.map((value, i) => value + b[i]);
}

function vecSub(a, b) {
  return a.map((value, i) => value - b[i]);
}

function identity(n) {
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => (r === c ? 1 : 0))
  );
}

function inverse2x2(m) {
  const [[a, b], [c, d]] = m;
  const det = a * d - b * c;

  if (Math.abs(det) < 1e-9) {
    throw new Error("EKF update failed: singular innovation matrix");
  }

  const invDet = 1 / det;
  return [
    [d * invDet, -b * invDet],
    [-c * invDet, a * invDet],
  ];
}

export function ekfPredict(state, covariance, control, processNoise, dt) {
  const predictedState = motionModel(state, control, dt);
  const F = jacobianF(state, control, dt);
  const predictedCovariance = matAdd(
    matMul(matMul(F, covariance), transpose(F)),
    processNoise
  );

  return { state: predictedState, covariance: predictedCovariance };
}

export function ekfUpdate(predictedState, predictedCovariance, measurement, measurementNoise) {
  const H = jacobianH();
  const predictedMeasurement = measurementModel(predictedState);
  const innovation = vecSub(measurement, predictedMeasurement);
  const S = matAdd(
    matMul(matMul(H, predictedCovariance), transpose(H)),
    measurementNoise
  );
  const K = matMul(
    matMul(predictedCovariance, transpose(H)),
    inverse2x2(S)
  );

  const updatedState = vecAdd(predictedState, matVecMul(K, innovation));
  updatedState[2] = wrapAngle(updatedState[2]);

  const I = identity(predictedState.length);
  const updatedCovariance = matMul(matSub(I, matMul(K, H)), predictedCovariance);

  return { state: updatedState, covariance: updatedCovariance };
}

export function diag3(a, b, c) {
  return [
    [a, 0, 0],
    [0, b, 0],
    [0, 0, c],
  ];
}
