type TriggerRect = { left: number; top: number; bottom: number; width: number };
type Viewport = { left: number; top: number; width: number; height: number };

/** Fixed-position menu geometry, shared by resize, scrolling and keyboard updates. */
export function getDropdownPosition(rect: TriggerRect, viewport: Viewport, contentHeight: number) {
  const margin = Math.min(8, viewport.width / 4, viewport.height / 4);
  const gap = 7;
  const leftEdge = viewport.left + margin;
  const rightEdge = viewport.left + viewport.width - margin;
  const topEdge = viewport.top + margin;
  const bottomEdge = viewport.top + viewport.height - margin;
  const width = Math.max(0, Math.min(rect.width, rightEdge - leftEdge));
  const left = Math.max(leftEdge, Math.min(rect.left, rightEdge - width));
  const below = Math.max(0, bottomEdge - rect.bottom - gap);
  const above = Math.max(0, rect.top - topEdge - gap);
  const desiredHeight = Math.max(0, Math.min(320, contentHeight));
  const upwards = below < desiredHeight && above > below;
  const maxHeight = Math.min(desiredHeight, upwards ? above : below);
  const top = Math.max(topEdge, Math.min(
    upwards ? rect.top - gap - maxHeight : rect.bottom + gap,
    bottomEdge - maxHeight,
  ));

  return { left, top, width, maxHeight };
}
