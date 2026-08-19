import { useCallback, useEffect, useRef, useState } from "react";
import { WsPaintMessageSchema, WsServerMessageSchema, type WsUpdateMessage } from "@badger/shared";

function buildSocketUrl(): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws`;
}

/**
 * Connects to the board WebSocket and applies validated server updates.
 * Automatically reconnects on close and cleans up on unmount.
 */
export function useBoardSocket(onUpdate: (message: WsUpdateMessage) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const onUpdateRef = useRef(onUpdate);

  onUpdateRef.current = onUpdate;

  useEffect(() => {
    let socket: WebSocket | null = null;
    let disposed = false;
    let retryTimeout: number | undefined;

    const connect = () => {
      if (disposed) return;

      socket = new WebSocket(buildSocketUrl());
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onclose = () => {
        setIsConnected(false);
        if (!disposed) {
          retryTimeout = window.setTimeout(connect, 2000);
        }
      };

      socket.onerror = () => {
        socket?.close();
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        let raw: unknown;
        try {
          raw = JSON.parse(event.data);
        } catch {
          return;
        }
        const parsed = WsServerMessageSchema.safeParse(raw);
        if (parsed.success && parsed.data.type === "update") {
          onUpdateRef.current(parsed.data);
        }
      };
    };

    connect();

    return () => {
      disposed = true;
      if (retryTimeout !== undefined) {
        window.clearTimeout(retryTimeout);
      }
      socket?.close();
      socketRef.current = null;
    };
  }, []);

  const sendPaint = useCallback((sessionId: string, x: number, y: number, color: string) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    const payload = WsPaintMessageSchema.parse({ type: "paint", sessionId, x, y, color });
    socket.send(JSON.stringify(payload));
  }, []);

  return { isConnected, sendPaint };
}
