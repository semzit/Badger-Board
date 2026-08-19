import { useCallback, useEffect, useState } from "react";
import type { Color, WsUpdateMessage } from "@badger/shared";

type Ripple = { index: number; id: string };

export type PaintedPixel = { x: number; y: number; color: string };

/**
 * Owns the pixel-grid state, optimistic painting and ripple UI state for a
 * canvas. Keeps the drawing logic out of the .tsx so components stay
 * presentational.
 */
export function useBoardCanvas(
  drawing: Color[][] | undefined,
  width: number,
  height: number,
  selectedColor: string,
) {
  const [pixels, setPixels] = useState<Color[]>([]);
  const [ripple, setRipple] = useState<Ripple | null>(null);
  const [clicked, setClicked] = useState(false);
  const [mouseMoved, setMouseMoved] = useState(false);

  useEffect(() => {
    if (drawing) {
      setPixels(drawing.flat());
    }
  }, [drawing]);

  const applyUpdate = useCallback(
    (message: WsUpdateMessage) => {
      setPixels((prev) => {
        const index = message.x * width + message.y;
        if (index < 0 || index >= prev.length) return prev;
        const copy = [...prev];
        copy[index] = message.color;
        return copy;
      });
    },
    [width],
  );

  const handleMouseDown = () => {
    setClicked(true);
    setMouseMoved(false);
  };

  const handleMouseLeave = () => {
    if (clicked) setMouseMoved(true);
  };

  const handleMouseUp = (index: number): PaintedPixel | null => {
    setClicked(false);
    if (mouseMoved) return null;

    const x = Math.floor(index / width);
    const y = index % width;

    setPixels((prev) => {
      const copy = [...prev];
      copy[index] = selectedColor;
      return copy;
    });

    setRipple({ index, id: crypto.randomUUID() });
    return { x, y, color: selectedColor };
  };

  return {
    pixels,
    ripple,
    applyUpdate,
    handleMouseDown,
    handleMouseLeave,
    handleMouseUp,
    clearRipple: () => setRipple(null),
    height,
  };
}
