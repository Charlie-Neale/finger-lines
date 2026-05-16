const ANGLE_MATCH_TOLERANCE = 25;
const TRIANGLE_MAX = 75;
const SQUARE_MAX = 99;

export function detectShape(hands) {
  if (hands.length !== 2) return null;

  const angleA = angleAtWrist(hands[0].wrist, hands[0].tips[0], hands[0].tips[1]);
  const angleB = angleAtWrist(hands[1].wrist, hands[1].tips[0], hands[1].tips[1]);

  if (Math.abs(angleA - angleB) > ANGLE_MATCH_TOLERANCE) return null;

  const avg = (angleA + angleB) / 2;
  let shape;
  if (avg <= TRIANGLE_MAX) shape = "triangle";
  else if (avg <= SQUARE_MAX) shape = "square";
  else shape = "pentagon";

  return { shape, angles: [angleA, angleB] };
}

export function createDebouncer(holdMs = 300) {
  let candidate = null;
  let candidateSince = 0;
  let stable = null;

  return {
    update(next) {
      if (next === null) return stable;

      const now = performance.now();
      if (next !== candidate) {
        candidate = next;
        candidateSince = now;
      }
      if (candidate !== stable && now - candidateSince >= holdMs) {
        stable = candidate;
      }
      return stable;
    },
  };
}

function angleAtWrist(wrist, p1, p2) {
  const v1x = p1.x - wrist.x;
  const v1y = p1.y - wrist.y;
  const v2x = p2.x - wrist.x;
  const v2y = p2.y - wrist.y;
  const dot = v1x * v2x + v1y * v2y;
  const m1 = Math.hypot(v1x, v1y);
  const m2 = Math.hypot(v2x, v2y);
  if (m1 === 0 || m2 === 0) return 0;
  const cos = Math.max(-1, Math.min(1, dot / (m1 * m2)));
  return (Math.acos(cos) * 180) / Math.PI;
}
