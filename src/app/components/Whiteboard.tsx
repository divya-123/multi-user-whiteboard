"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Socket } from "socket.io-client";

interface WhiteboardProps {
  socket: Socket;
  brush: { color: string; size: number };
}

export default function Whiteboard({ socket, brush }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const redrawCanvas = useCallback((context: CanvasRenderingContext2D) => {
    // Implement redrawing logic here if needed
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      redrawCanvas(context);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handleMouseDown = (e: MouseEvent) => {
      setIsDrawing(true);
      draw(e);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDrawing) {
        draw(e);
      }
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
      context.beginPath();
    };

    const draw = (e: MouseEvent) => {
      if (!isDrawing || !context) return;

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

    socket.on(
      "initDrawings",
      (
        drawings: Array<{
          x: number;
          y: number;
          brush: { color: string; size: number };
        }>
      ) => {
        drawings.forEach(({ x, y, brush }) => {
          context.strokeStyle = brush.color;
          context.lineWidth = brush.size;
          context.lineCap = "round";
          context.lineTo(x, y);
          context.stroke();
          context.beginPath();
          context.moveTo(x, y);
        });
      }
    );

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      socket.off("draw");
      socket.off("initDrawings");
    };
  }, [socket, brush, isDrawing, redrawCanvas]);

  return (
    <canvas ref={canvasRef} className="w-full h-full border border-gray-300" />
  );
}
