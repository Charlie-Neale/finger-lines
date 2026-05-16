import { startTracking } from "./handTracker.js";
import { render } from "./renderer.js";
import { effects } from "./effects.js";
import { detectShape, createDebouncer } from "./shapeRecognizer.js";

const video = document.getElementById("webcam");
const canvas = document.getElementById("stage");
const hud = document.getElementById("hud");

let currentMode = "manual";
let currentEffect = "invert";

const effectKeys = {
  "1": "invert",
  "2": "grayscale",
  "3": "pixelate",
  "4": "glitch",
  "5": "hueRotate",
};

const shapeToEffect = {
  triangle: "grayscale",
  square: "invert",
  pentagon: "pixelate",
};

const shapeDebouncer = createDebouncer(300);

window.addEventListener("keydown", (e) => {
  if (effectKeys[e.key]) {
    currentMode = "manual";
    currentEffect = effectKeys[e.key];
  } else if (e.key === "6") {
    currentMode = "auto";
  }
});

function formatAngles(angles) {
  return `(${Math.round(angles[0])}°, ${Math.round(angles[1])}°)`;
}

startTracking(video, (hands) => {
  if (currentMode === "auto") {
    const detected = detectShape(hands);
    const stableShape = shapeDebouncer.update(detected?.shape ?? null);
    if (stableShape) currentEffect = shapeToEffect[stableShape];

    let label;
    if (detected) {
      label = `auto · ${stableShape ?? "—"} · ${currentEffect} ${formatAngles(detected.angles)}`;
    } else if (hands.length === 2) {
      label = `auto · mismatch · ${currentEffect}`;
    } else {
      label = `auto · ${hands.length === 0 ? "no hands" : "show both hands"} · ${currentEffect}`;
    }
    hud.textContent = label;
  } else {
    hud.textContent = `effect: ${currentEffect}`;
  }

  render(canvas, video, hands, effects[currentEffect]);
});

hud.textContent = `effect: ${currentEffect}`;
