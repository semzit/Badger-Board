import { useState, useEffect, useRef } from 'react'
import './Screen.css'

function Screen({ selectedColor }) {
  const [pixels, setPixels] = useState(Array(100 * 100).fill('rgb(255, 255, 255)'))
  const [clicked, setClicked] = useState(false);
  const [mouseMoved, setMouseMoved] = useState(false);
  const [ripple, setRipple] = useState(null); // { index, id }
  const pixelSize = 10;

  const [userId, setUserId] = useState(0);

  // 1. State for the grid data (mapping "x,y" keys to color strings)

  // State for connection status
  const [isConnected, setIsConnected] = useState(false);
  
  // 2. Ref to hold the WebSocket instance
  // We use useRef so the connection persists between renders but doesn't cause re-renders itself
  const ws = useRef(null);

  // 4. Handle incoming updates from the server
    const handleUpdateMessage = (data) => {
        const { x, y, value } = data;

        // Functional state update to ensure we have the latest previous state
        setPixels(prevPixels => {
            const copy = [...prevPixels];
            copy[x*100+y] = value;
            return copy;
        });
    };

    // 5. Send paint command to server
    const sendPaint = (x, y, colorValue) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        const payload = {
            type: 'PAINT',
            userId: userId,
            x: x,
            y: y,
            value: colorValue
        };
        
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

      try {
        res = {userId:0 , initState: Array(10000).fill('rgb(255, 255, 255)')}; // Dummy data, we will have an awaited API call
      } catch(e) {
        console.log(e);
      }

      const {userId, initState} = res;

      const temp = [];

      for (let i = 0; i < 100; i++) {
        for (let j = 0; j < 100; j++) {
          temp.append(initState[i][j]);
        }
      }

      setPixels(temp);
      setUserId(userId);
    }

    callApi();

    // Connect to the server

    ws.current = new WebSocket('ws://localhost:8080');

    // Connection Opened
    ws.current.onopen = () => {
      console.log("Connected to Paint Server");
      setIsConnected(true);
    };

    // Connection Closed
    ws.current.onclose = () => {
      console.log("Disconnected from Paint Server");
      setIsConnected(false);
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'UPDATE') {
          handleUpdateMessage(data);
        }
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

      sendPaint(i/100, i%100, selectedColor || 'black');
      
      setRipple({ index: i, id: crypto.randomUUID() });
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