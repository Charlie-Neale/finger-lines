import { startTracking } from "./handTracker.js";
import { render } from "./renderer.js";
import { effects } from "./effects.js";

const video = document.getElementById("webcam");
const canvas = document.getElementById("stage");
const hud = document.getElementById("hud");

let currentEffect = "invert";

const effectKeys = {
  "1": "invert",
  "2": "grayscale",
  "3": "pixelate",
  "4": "glitch",
  "5": "hueRotate",
};

window.addEventListener("keydown", (e) => {
  const next = effectKeys[e.key];
  if (next) {
    currentEffect = next;
    hud.textContent = `effect: ${next}`;
  }
});

hud.textContent = `effect: ${currentEffect}`;

startTracking(video, (hands) => {
  render(canvas, video, hands, effects[currentEffect]);
});
