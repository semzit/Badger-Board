import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import Screen from "./components/Screen";
import ColorSelector from "./components/ColorSelector";
import LandingPage from "./components/LandingPage";
import { AdminPage } from "./features/admin/AdminPage";
import OutsideRegion from "./components/OutsideRegion";

import bg from "./assets/new_bg.png";

function BadgerBoard() {
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [showLanding, setShowLanding] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const handleEnterCanvas = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowLanding(false);
    }, 1500);
  };

  return (
    <div
      className="bg-image"
      style={{
        backgroundImage: `url(${bg})`,
        position: "fixed",
        inset: 0,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Landing Page Overlay */}
      {showLanding && <LandingPage onEnter={handleEnterCanvas} isExiting={isExiting} />}

      <TransformWrapper
        doubleClick={{ step: 0 }}
        initialScale={1}
        centerOnInit
        minScale={0.3}
        maxScale={5}
      >
        <TransformComponent
          wrapperStyle={{
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          <Screen selectedColor={selectedColor} />
        </TransformComponent>
      </TransformWrapper>

      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 30,
          display: "flex",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <ColorSelector selectedColor={selectedColor} onColorSelect={setSelectedColor} />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BadgerBoard />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/outside" element={<OutsideRegion />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
