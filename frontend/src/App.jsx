import { useState } from 'react'
import { Button, Card } from 'react-bootstrap'
import { useWebSocket } from './hooks/webHooks'
import { authenticate } from './services/restService'
import './App.css'
import Screen from './components/Screen'
import ColorSelector from './components/ColorSelector'

function App() {
  const [count, setCount] = useState(0)
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [auth, setAuth] = useState(null)
  const [building, setBuilding] = useState('morgridge-hall')

  const { isConnected, message, send } = useWebSocket('ws://localhost:8080/ws')

  return (
    <Card>
      <div className="controls">
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

      <Screen selectedColor={selectedColor} />
      
      <ColorSelector 
        selectedColor={selectedColor}
        onColorSelect={setSelectedColor}
      />
    </Card>
  )
}

export default App