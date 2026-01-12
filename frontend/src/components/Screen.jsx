import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router';
import './Screen.css'
import WebSocket from "isomorphic-ws";

const WS_URL = import.meta.env.VITE_REACT_APP_WS_URL || `ws://localhost:8081`;

function Screen({ selectedColor }) {
  const [pixels, setPixels] = useState(Array(100 * 100).fill('rgb(255, 255, 255)'))
  const [clicked, setClicked] = useState(false);
  const [mouseMoved, setMouseMoved] = useState(false);
  const [location, setLocation]= useState(null); 
  const [ripple, setRipple] = useState(null); // { index, id }

  const pixelSize = 10;

  const [userId, setUserId] = useState(0);
  const userIdRef = useRef(null); 
  const nav = useNavigate(); 
  
  //  let userId;
  // 1. State for the grid data (mapping "x,y" keys to color strings)
  // State for connection status
  const [isConnected, setIsConnected] = useState(false);
  
  // 2. Ref to hold the WebSocket instance
  // We use useRef so the connection persists between renders but doesn't cause re-renders itself
  const ws = useRef(null);

  // 4. Handle incoming updates from the server
    const handleUpdateMessage = (data) => {
        console.log("update received"); 
        const { x, y, color } = data;

        // Functional state update to ensure we have the latest previous state
        setPixels(prevPixels => {
            const copy = [...prevPixels];
            copy[x*100+y] = color;
            return copy;
        });
    };

    // 5. Send paint command to server
    const sendPaint = (x, y, colorValue) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          const uid = userIdRef.current; 
          const payload = {
          userId: uid,
          x: x,
          y: y,
          color: colorValue
        };
        console.log("Sending paint:", payload);
        ws.current.send(JSON.stringify(payload));
        
        // Optimistic update: Update local state immediately for better UX
        // (Optional: You could wait for the server echo instead)
        // handleUpdateMessage({ x, y, value: colorValue }); 
        } else {
        console.error("Connection not open");
        }
    };

  // 3. Effect to Initialize WebSocket Connection
  useEffect(() => {
    // Send auth request to backend server, store userId
    const callApi = async () => {
      let res;
      let crd;
      
      function getLocation() {
         return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
      }
      
      crd = await getLocation(); 

      console.log(`data: ${JSON.stringify(crd)}`);

      // get valid id 
      try {
        res = await fetch(
          `/api/init/auth/`,
          {
            method: "POST",
            headers: {
              'Content-Type': 'application/json' // Tell the server we are sending JSON
            },
            body: JSON.stringify(crd)
          }
        );
      } catch(e) {
        console.log(e);
      }

      console.log(res.status); 

      if (res.status != 201){
        console.log("oustide of possible boundary"); 
        nav("/outside");
      }

      let json = await res.json(); 

      setUserId(json.id);
      userIdRef.current = json.id;
      console.log(json.id); 

      // get curret board 
      try{
        res = await fetch(
          `/api/init/${json.id}/`
        )

      } catch(e) {
        console.log(e);
      }

      const json2 = await res.json(); 

      const initState = json2.drawing; 
      setLocation(json2.location); 
      
      console.log(`initState: ${initState}`);
      
     const temp = [];

      if (initState && initState.length > 0){
        for (let i = 0; i < 100; i++) {
          for (let j = 0; j < 100; j++) {
            temp.push(initState[i][j]);
          }
        }
      }
      //const temp = json2.board.flat(); 

      setPixels(temp);
    }

    callApi();
  }, []); 

  useEffect(() => {
    // Check if we got a response with userId. If we did, initiate the connection, else return error screen.

    // Connect to the server
    ws.current = new WebSocket(`wss://${window.location.host}/ws`);
    // Connection Opened
    ws.current.onopen = () => {
      console.log("Connected to Server");
      setIsConnected(true);
    };

    // Connection Closed
    ws.current.onclose = () => {
      console.log("Disconnected from Server");
      setIsConnected(false);
    };

    ws.current.onmessage = (event) => {
      try {
        console.log("websocket message received")
        const data = JSON.parse(event.data);
        handleUpdateMessage(data);
        
      } catch (e) {
        console.error("Failed to parse incoming message", e);
      }
    };

    // Cleanup: Close connection when component unmounts
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);
    
  // Message Received
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

      sendPaint(Math.floor(i/100), i%100, selectedColor || 'black');
      
      setRipple({ index: i, id: crypto.randomUUID() });
    }
  };

  return (
    <div className="screen-container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      width: '100%',
      minHeight: '100vh',
      paddingTop: '40px'
    }}>
      
      {/* The Board Name Section */}
      <div style={{
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '2rem', 
          color: '#333',
          fontFamily: 'monospace' // Fits the pixel art vibe
        }}>
          Connected to <span style={{ color: '#007bff' }}>{location}</span>
        </h1>
        <p style={{ color: isConnected ? 'green' : 'red', margin: '5px 0' }}>
          {isConnected ? '● Connected' : '○ Disconnected'}
        </p>
      </div>

      {/* Your Existing Grid */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(100, ${pixelSize}px)`,
          gridTemplateRows: `repeat(100, ${pixelSize}px)`,
          border: '5px solid rgb(210, 210, 200)',
          width: (100 * pixelSize),
          height: (100 * pixelSize),
          background: 'white',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
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
              position: 'relative' // Critical for ripple positioning
            }}
            onMouseUp={(e) => handleMouseUp(e, i)}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
          >
            {ripple && ripple.index === i && (
              <div
                key={ripple.id}
                className="ripple"
                onAnimationEnd={() => setRipple(null)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Screen;