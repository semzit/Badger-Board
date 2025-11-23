import { useState } from 'react'
import './Screen.css'

function Screen({ selectedColor }) {
  const [pixels, setPixels] = useState(Array(100 * 100).fill('rgb(255, 255, 255)'))
  const [clicked, setClicked] = useState(false);
  const [mouseMoved, setMouseMoved] = useState(false);
  const [ripple, setRipple] = useState(null); // { index, id }
  const pixelSize = 10;

  const handleMouseDown = () => {
    setClicked(true);
    setMouseMoved(false);
  };

  const handleMouseLeave = () => {
    if (clicked) setMouseMoved(true);
  };

  const handleMouseUp = (event, i) => {
    setClicked(false);

    if (!mouseMoved) {

      setPixels(prevPixels => {
        const copy = [...prevPixels];
        copy[i] = selectedColor || 'black';
        return copy;
      });

      
      setRipple({ index: i, id: Date.now() });
    }
  };

  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(100, ${pixelSize}px)`,
        gridTemplateRows: `repeat(100, ${pixelSize}px)`,
        border: '3px solid rgb(210, 210, 200)',
        width: (100 * pixelSize + 5),
        background: 'white',
        margin: '20px auto'
      }}
    >
      {pixels.map((p, i) => (
        <div
          key={i}
          className="pixel"
          style={{ background: p }}
          onMouseUp={(e) => handleMouseUp(e, i)}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
        >
          {ripple && ripple.index === i && (
            <div
              // id in key helps restart the CSS animation on each click
              key={ripple.id}
              className="ripple"
              onAnimationEnd={() => setRipple(null)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default Screen;