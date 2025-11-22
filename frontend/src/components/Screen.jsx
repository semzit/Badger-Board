import { useState, useRef, useEffect } from 'react'
import { Button, Card } from 'react-bootstrap'
import './Screen.css'

function Screen({ selectedColor }) {
  const [pixels, setPixels] = useState(Array(100*100).fill('rgb(255, 255, 255)'))
  const [colored, setColored] = useState(-1)
  const pixelSize = 20

  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(100, ${pixelSize}px)`,
        gridTemplateRows: `repeat(100, ${pixelSize}px)`,
        border: '2px solid black',
        width: (100*pixelSize + 30),
        background: 'white',
        margin: '20px auto'
      }}
    >
      {
        pixels.map((p, i) => (
          <div
            key={i}
            className='pixel'
            style={{
              background: p
            }}
            onMouseDown={() => {
              setPixels(
                prevPixels => {
                  const copy = [...prevPixels]
                  copy[i] = selectedColor || 'black'
                  return copy
                }
              )
            }}
          />
        ))
      }
    </div>
  )
}

export default Screen