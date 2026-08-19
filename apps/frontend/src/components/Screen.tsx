import { useBoardData } from "@badger-board/hooks/useBoardData";
import { useBoardSocket } from "@badger-board/hooks/useBoardSocket";
import { useBoardCanvas } from "@badger-board/hooks/useBoardCanvas";
import "./Screen.css";

const DEFAULT_SIZE = 100;

type ScreenProps = {
  selectedColor: string;
};

function Screen({ selectedColor }: ScreenProps) {
  const { session, board } = useBoardData();

  const width = board.data?.size.width ?? DEFAULT_SIZE;
  const height = board.data?.size.height ?? DEFAULT_SIZE;

  const {
    pixels,
    ripple,
    applyUpdate,
    handleMouseDown,
    handleMouseLeave,
    handleMouseUp,
    clearRipple,
  } = useBoardCanvas(board.data?.drawing, width, height, selectedColor);

  const { isConnected, sendPaint } = useBoardSocket(applyUpdate);

  const handleMouseUpOnGrid = (index: number) => {
    const painted = handleMouseUp(index);
    if (painted && session.data) {
      sendPaint(session.data.sessionId, painted.x, painted.y, painted.color);
    }
  };

  const building = session.data?.building ?? "Loading...";
  const pixelSize = 10;

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
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
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
            onMouseUp={() => handleMouseUpOnGrid(i)}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
          >
            {ripple && ripple.index === i && (
              <div key={ripple.id} className="ripple" onAnimationEnd={clearRipple} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Screen;
