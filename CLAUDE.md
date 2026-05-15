# finger-lines — Core Features

## Project Structure

```
finger-lines/
├── index.html
├── src/
│   ├── main.js          # entry point
│   ├── handTracker.js   # MediaPipe setup & fingertip extraction
│   ├── renderer.js      # canvas draw loop
│   ├── effects.js       # visual effects library
│   └── smoothing.js     # coordinate smoothing / stabilization
├── style.css
└── README.md
```

---

## handTracker.js

- Initialize MediaPipe Hands with `maxNumHands: 2`
- Extract only fingertip landmarks (indices `4, 8, 12, 16, 20`) from each detected hand
- Apply exponential smoothing to fingertip coordinates to reduce jitter (smoothing factor ~0.7)
- Export a `startTracking(videoElement, onResults)` function

---

## renderer.js

- Set up a full-screen canvas overlaid on the webcam feed
- Every animation frame: draw the raw video, then overlay effects
- Connect fingertips with lines (all tips to all other tips)
- Compute the convex hull of all fingertip positions to define the "effect region"
- Draw subtle glowing dots at each fingertip

---

## effects.js

Each effect takes `(ctx, polygon)` as arguments and modifies the canvas in place.

| Key | Effect | Description |
|-----|--------|-------------|
| `1` | `invert` | Invert pixel colors inside the region |
| `2` | `grayscale` | Desaturate pixels inside the region |
| `3` | `pixelate` | Mosaic / blocky pixels (~10px block size) |
| `4` | `glitch` | Horizontal slice displacement |
| `5` | `hueRotate` | Shift hue by a given angle |

---

## main.js

- Wire up webcam → MediaPipe → canvas pipeline
- Keyboard shortcuts `1–5` to cycle through effects
- On-screen label showing the current active effect
- Graceful handling of camera permission errors with a user-friendly message

---

## Controls

| Key | Action |
|-----|--------|
| `1` | Invert effect |
| `2` | Grayscale effect |
| `3` | Pixelate effect |
| `4` | Glitch effect |
| `5` | Hue rotate effect |

---

## Dependencies

```
@mediapipe/hands
@mediapipe/camera_utils
@mediapipe/drawing_utils
```

Run with:

```bash
npm install
npm run dev
```

---

## Next Steps

- Add more effects (chromatic aberration, ripple, kaleidoscope)
- GUI effect picker (click/tap instead of keyboard)
- Multi-hand blending — different effects per hand
- Record and export a clip of the output
- Adjustable effect intensity via finger spread distance
- Mobile support via touch / front-facing camera
