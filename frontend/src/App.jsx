import { useState } from 'react'
import { Button, Card } from 'react-bootstrap'
import { useWebSocket } from './hooks/webHooks'
import { authenticate } from './services/restService'
import './App.css'
import { HashRouter, Route, Routes } from 'react-router'
import Screen from './components/Screen'

function App() {
  const [count, setCount] = useState(0);

  const { isConnected, message, send } = useWebSocket("ws://localhost:8080/ws");

  // code for sending update

  return (
    <Card>
      <div className="controls">
        <Button onClick={async () => {
          const token = await authenticate();
          console.log("Got token:", token);
          const auth = token.auth;
          const initialState = token.state;
        }}>
          Authenticate
        </Button>

        <Button onClick={() => {
          const x = document.getElementById("xCoord")?.value;
          const y = document.getElementById("yCoord")?.value;
          const color = document.getElementById("color")?.value;
          const grid_data = send({ type: "paint" , auth: auth, building, x, y, color });
        }}>
          Send Update
        </Button>
      </div>

      <Screen/>
    </Card>
  );
}

export default App
