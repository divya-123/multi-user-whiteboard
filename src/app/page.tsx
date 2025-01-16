"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Whiteboard from "./components/Whiteboard";
import BrushSelector from "./components/BrushSelector";
import UserList from "./components/UserList";
import {
  initializeSocket,
  getSocket,
  createSession,
  joinSession,
} from "./services/socket";
import { Socket } from "socket.io-client";

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [brush, setBrush] = useState({ color: "#000000", size: 5 });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const newSocket = initializeSocket();
    setSocket(newSocket);

    newSocket.on(
      "updateUsers",
      (updatedUsers: Array<{ id: string; name: string }>) => {
        setUsers(updatedUsers);
      }
    );

    const sessionIdFromUrl = searchParams.get("session");
    if (sessionIdFromUrl) {
      setSessionId(sessionIdFromUrl);
      joinSession(sessionIdFromUrl);
    }

    return () => {
      newSocket.disconnect();
    };
  }, [searchParams]);

  const handleBrushChange = useCallback(
    (newBrush: { color: string; size: number }) => {
      setBrush(newBrush);
      const currentSocket = getSocket();
      if (currentSocket) {
        currentSocket.emit("updateBrush", newBrush);
      }
    },
    []
  );

  const handleCreateSession = useCallback(async () => {
    try {
      const newSessionId = await createSession();
      setSessionId(newSessionId);
      router.push(`/?session=${newSessionId}`);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen">
      <h1 className="text-2xl font-bold p-4 bg-primary text-primary-foreground">
        Multi-User Whiteboard
      </h1>
      {!sessionId ? (
        <div className="flex-1 flex items-center justify-center">
          <button
            onClick={handleCreateSession}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Start New Session
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row">
          <UserList users={users} />
          <div className="flex-1 flex flex-col">
            <BrushSelector brush={brush} onBrushChange={handleBrushChange} />
            {socket && <Whiteboard socket={socket} brush={brush} />}
          </div>
        </div>
      )}
      {sessionId && (
        <div className="p-4 bg-gray-100">
          <p>Share this link to invite others:</p>
          <input
            type="text"
            readOnly
            value={`${
              typeof window !== "undefined" ? window.location.origin : ""
            }/?session=${sessionId}`}
            className="w-full p-2 border rounded"
            onClick={(e) => e.currentTarget.select()}
          />
        </div>
      )}
    </div>
  );
}
