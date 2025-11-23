import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import { useWebSocket } from './hooks/webHooks'
import { authenticate } from './services/restService'
import './App.css'
import Screen from './components/Screen'
import ColorSelector from './components/ColorSelector'
import LandingPage from './components/LandingPage'
import BuildingForm from './components/BuildingForm'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"

import bg from './img/bg.png'

function BadgerBoard() {
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [auth, setAuth] = useState(null)
  const [building, setBuilding] = useState('morgridge-hall')
  const [showLanding, setShowLanding] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  const { isConnected, message, send } = useWebSocket('ws://localhost:8080/ws')

  const handleEnterCanvas = () => {
    setIsExiting(true)
    setTimeout(() => {
      setShowLanding(false)
    }, 1500)
  }

  return (
    <div className="bg-image" style={{
      backgroundImage: `url(${bg})`,
      position: "fixed",
      inset: 0,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      }}>

      {/* Admin Link */}
      <Link 
        to="/admin"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 2001,
          textDecoration: 'none'
        }}
      >
        <Button
          variant="light"
          size="sm"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            fontWeight: 'bold'
          }}
        >
          Admin
        </Button>
      </Link>

      {/* Landing Page Overlay */}
      {showLanding && (
        <LandingPage onEnter={handleEnterCanvas} isExiting={isExiting} />
      )}

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
        }}>

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
          gap: 8
        }}
      >
      <ColorSelector
        selectedColor={selectedColor}
        onColorSelect={setSelectedColor}
      />
      <Button onClick={async () => {
          const token = await authenticate()
          console.log('Got token:', token)
          setAuth(token.auth)
          const initialState = token.state
        }}>
          Authenticate
        </Button>

        <Button onClick={() => {
          const x = document.getElementById('xCoord')?.value
          const y = document.getElementById('yCoord')?.value
          const color = selectedColor
          const grid_data = send({ 
            type: 'paint', 
            auth: auth, 
            building: building, 
            x, 
            y, 
            color 
          })
        }}>
          Send Update
        </Button>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BadgerBoard />} />
        <Route path="/admin" element={<BuildingForm />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App