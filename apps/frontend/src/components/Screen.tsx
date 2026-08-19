import { useCallback, useEffect, useState } from "react";
import type { Color, WsUpdateMessage } from "@badger/shared";
import { useBoardData } from "@/hooks/useBoardData";
import { useBoardSocket } from "@/hooks/useBoardSocket";
import "./Screen.css";

const DEFAULT_SIZE = 100;

type Ripple = { index: number; id: string };

type ScreenProps = {
  selectedColor: string;
};

function Screen({ selectedColor }: ScreenProps) {
  const { session, board } = useBoardData();
  const [pixels, setPixels] = useState<Color[]>([]);
  const [ripple, setRipple] = useState<Ripple | null>(null);
  const [clicked, setClicked] = useState(false);
  const [mouseMoved, setMouseMoved] = useState(false);

  const pixelSize = 10;
  const width = board.data?.size.width ?? DEFAULT_SIZE;
  const height = board.data?.size.height ?? DEFAULT_SIZE;

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

  const { isConnected, sendPaint } = useBoardSocket(applyUpdate);

  useEffect(() => {
    if (board.data) {
      setPixels(board.data.drawing.flat());
    }
  }, [board.data]);

  const handleMouseDown = () => {
    setClicked(true);
    setMouseMoved(false);
  };

  const handleMouseLeave = () => {
    if (clicked) setMouseMoved(true);
  };

  const handleMouseUp = (index: number) => {
    setClicked(false);

    if (mouseMoved) return;

    const x = Math.floor(index / width);
    const y = index % width;

    setPixels((prev) => {
      const copy = [...prev];
      copy[index] = selectedColor;
      return copy;
    });

    if (session.data) {
      sendPaint(session.data.sessionId, x, y, selectedColor);
    }

    setRipple({ index, id: crypto.randomUUID() });
  };

  const building = session.data?.building ?? "Loading...";

  return (
    <div
      className="screen-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        minHeight: "100vh",
        paddingTop: "40px",
      }}
    >
      {/* The Board Name Section */}
      <div
        style={{
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "2rem",
            color: "#333",
            fontFamily: "monospace",
          }}
        >
          Connected to <span style={{ color: "#007bff" }}>{building}</span>
        </h1>
        <p style={{ color: isConnected ? "green" : "red", margin: "5px 0" }}>
          {isConnected ? "● Connected" : "○ Disconnected"}
        </p>
      </div>

      {/* Pixel Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${width}, ${pixelSize}px)`,
          gridTemplateRows: `repeat(${height}, ${pixelSize}px)`,
          border: "5px solid rgb(210, 210, 200)",
          width: width * pixelSize,
          height: height * pixelSize,
          background: "white",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        {pixels.map((p, i) => (
          <div
            key={i}
            className="pixel"
            style={{
              background: p,
              width: pixelSize,
              height: pixelSize,
              position: "relative",
            }}
            onMouseUp={() => handleMouseUp(i)}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
          >
            {ripple && ripple.index === i && (
              <div key={ripple.id} className="ripple" onAnimationEnd={() => setRipple(null)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Screen;
