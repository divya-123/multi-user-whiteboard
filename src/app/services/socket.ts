import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initializeSocket = (): Socket => {
  if (!socket) {
    const serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";
    socket = io(serverUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  }

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const createSession = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const currentSocket = getSocket();
    if (!currentSocket) {
      reject(new Error("Socket not initialized"));
      return;
    }

    currentSocket.emit("createSession");
    currentSocket.once("sessionCreated", (sessionId: string) => {
      resolve(sessionId);
    });
  });
};

export const joinSession = (sessionId: string): void => {
  const currentSocket = getSocket();
  if (!currentSocket) {
    throw new Error("Socket not initialized");
  }

  currentSocket.emit("joinSession", sessionId);
};
