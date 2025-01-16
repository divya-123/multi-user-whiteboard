"use client";

import { useState, useEffect, SetStateAction } from "react";
import Whiteboard from "./components/Whiteboard";
import BrushSelector from "./components/BrushSelector";
import UserList from "./components/UserList";
import { initializeSocket, getSocket } from "./services/socket";
import { Socket } from "socket.io-client";

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState([]);
  const [brush, setBrush] = useState({ color: "#000000", size: 5 });

  useEffect(() => {
    const newSocket = initializeSocket();
    setSocket(newSocket);

    newSocket.on("updateUsers", (updatedUsers) => {
      setUsers(updatedUsers);
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  const handleBrushChange = (
    newBrush: SetStateAction<{ color: string; size: number }>
  ) => {
    setBrush(newBrush);
    const currentSocket = getSocket();
    if (currentSocket) {
      currentSocket.emit("updateBrush", newBrush);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <h1 className="text-2xl font-bold p-4 bg-gray-200 text-gray-800">
        Multi-User Whiteboard
      </h1>
      <div className="flex flex-1 overflow-hidden">
        <UserList users={users} />
        <div className="flex-1 flex flex-col">
          <BrushSelector brush={brush} onBrushChange={handleBrushChange} />
          {socket && <Whiteboard socket={socket} brush={brush} />}
        </div>
      </div>
    </div>
  );
}
