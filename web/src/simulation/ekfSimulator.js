import { diag3, ekfPredict, ekfUpdate, motionModel } from "../estimation/ekf";

function createSeededRandom(seed = 1) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;

  return function next() {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function gaussian(random) {
  const u1 = Math.max(random(), 1e-9);
  const u2 = random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function covarianceEllipse(covariance, nStd = 2) {
  const a = covariance[0][0];
  const b = covariance[0][1];
  const c = covariance[1][1];
  const trace = a + c;
  const detTerm = Math.sqrt(Math.max((a - c) * (a - c) + 4 * b * b, 0));
  const lambda1 = (trace + detTerm) / 2;
  const lambda2 = (trace - detTerm) / 2;
  const angle = 0.5 * Math.atan2(2 * b, a - c);

  return {
    major: 2 * nStd * Math.sqrt(Math.max(lambda1, 0)),
    minor: 2 * nStd * Math.sqrt(Math.max(lambda2, 0)),
    angle,
  };
}

export function simulateEkfDemo({
  steps = 260,
  dt = 0.1,
  gpsStd = 0.85,
  seed = 7,
} = {}) {
  const random = createSeededRandom(seed);

  let trueState = [0, 0, 0];
  let estimate = [-0.4, 0.3, 0.15];
  let covariance = diag3(1.8, 1.8, 0.5);

  const processNoise = diag3(0.045, 0.045, 0.01);
  const measurementNoise = [
    [gpsStd * gpsStd, 0],
    [0, gpsStd * gpsStd],
  ];

  const frames = [];

  for (let step = 0; step < steps; step++) {
    const t = step * dt;
    const control = [
      0.95 + 0.12 * Math.sin(t * 0.8),
      0.28 * Math.sin(t * 0.55) + 0.08 * Math.cos(t * 0.25),
    ];

    trueState = motionModel(trueState, control, dt);

    const measurement = [
      trueState[0] + gaussian(random) * gpsStd,
      trueState[1] + gaussian(random) * gpsStd,
    ];

    const predicted = ekfPredict(
      estimate,
      covariance,
      control,
      processNoise,
      dt
    );
    const updated = ekfUpdate(
      predicted.state,
      predicted.covariance,
      measurement,
      measurementNoise
    );

    estimate = updated.state;
    covariance = updated.covariance;

    frames.push({
      time: t,
      control,
      trueState: [...trueState],
      measurement: [...measurement],
      estimate: [...estimate],
      covariance: covariance.map((row) => [...row]),
      ellipse: covarianceEllipse(covariance),
      error: Math.hypot(estimate[0] - trueState[0], estimate[1] - trueState[1]),
    });
  }

  return frames;
}
