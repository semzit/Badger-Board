import { useEffect, useRef, useState, useCallback } from "react";

export function useWebSocket(url) {
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState(null);

  // Connect WebSocket
  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WS connected");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessage(data);
      } catch (e) {
        console.error("Could not parse message", event.data);
      }
    };

    ws.onclose = () => {
      console.log("WS closed");
      setIsConnected(false);
  
      setTimeout(() => {
        wsRef.current = new WebSocket(url);
      }, 1000);
    };

    return () => ws.close();
  }, [url]);

  // Stable send() method
  const send = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn("WS is not open");
    }
  }, []);

  return { isConnected, message, send };
}
