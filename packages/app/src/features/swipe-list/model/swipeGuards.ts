/**
 * The deletion rule from the prototype: a swipe commits only when the row has
 * been dragged STRICTLY past the threshold in either direction
 * (`Math.abs(currentX) > SWIPE_THRESHOLD`).
 *
 * The 'worklet' directive lets gesture callbacks execute this helper directly
 * on the UI runtime (native); on web/vitest it stays a plain function.
 */
export function isDeleteCommitted(
  translationX: number,
  threshold: number,
): boolean {
  "worklet";
  return Math.abs(translationX) > threshold;
}
