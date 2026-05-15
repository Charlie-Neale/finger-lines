import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { smooth } from "./smoothing.js";

const FINGERTIP_INDICES = [4, 8, 12, 16, 20];
const SMOOTHING_FACTOR = 0.7;

export function startTracking(videoElement, onResults) {
  const hands = new Hands({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  const smoothedByHand = new Map();

  hands.onResults((results) => {
    const landmarksPerHand = results.multiHandLandmarks ?? [];
    const handednessPerHand = results.multiHandedness ?? [];

    const seenKeys = new Set();
    const hands = landmarksPerHand.map((landmarks, i) => {
      const label = handednessPerHand[i]?.label ?? `hand-${i}`;
      seenKeys.add(label);

      const prevTips = smoothedByHand.get(label);
      const tips = FINGERTIP_INDICES.map((idx, j) => {
        const raw = { x: 1 - landmarks[idx].x, y: landmarks[idx].y };
        return smooth(prevTips?.[j], raw, SMOOTHING_FACTOR);
      });
      smoothedByHand.set(label, tips);

      return { handedness: label, tips };
    });

    for (const key of smoothedByHand.keys()) {
      if (!seenKeys.has(key)) smoothedByHand.delete(key);
    }

    onResults(hands);
  });

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({ image: videoElement });
    },
    width: 1280,
    height: 720,
  });

  camera.start();
}
