export function smooth(prev, next, factor = 0.7) {
  if (!prev) return next;
  return {
    x: prev.x * factor + next.x * (1 - factor),
    y: prev.y * factor + next.y * (1 - factor),
  };
}
