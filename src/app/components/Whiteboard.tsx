"use client";

import { useRef, useEffect } from "react";
import { Socket } from "socket.io-client";

interface WhiteboardProps {
  socket: Socket | null;
  brush: { color: string; size: number };
}

export default function Whiteboard({ socket, brush }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (!socket || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    const handleMouseDown = (e: MouseEvent) => {
      isDrawing.current = true;
      draw(e);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDrawing.current) {
        draw(e);
      }
    };

    const handleMouseUp = () => {
      isDrawing.current = false;
      context.beginPath();
    };

    const draw = (e: MouseEvent) => {
      if (!isDrawing.current || !context) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      context.strokeStyle = brush.color;
      context.lineWidth = brush.size;
      context.lineCap = "round";
      context.lineTo(x, y);
      context.stroke();
      context.beginPath();
      context.moveTo(x, y);

      socket.emit("draw", { x, y, brush });
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    socket.on("draw", ({ x, y, brush: remoteBrush }) => {
      if (!context) return;
      context.strokeStyle = remoteBrush.color;
      context.lineWidth = remoteBrush.size;
      context.lineCap = "round";
      context.lineTo(x, y);
      context.stroke();
      context.beginPath();
      context.moveTo(x, y);
    });

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      socket.off("draw");
    };
  }, [socket, brush]);

  return (
    <canvas ref={canvasRef} className="w-full h-full border border-gray-300" />
  );
}
