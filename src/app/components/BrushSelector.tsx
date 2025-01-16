"use client";

import { useState } from "react";

interface BrushSelectorProps {
  brush: { color: string; size: number };
  onBrushChange: (brush: { color: string; size: number }) => void;
}

export default function BrushSelector({
  brush,
  onBrushChange,
}: BrushSelectorProps) {
  const [color, setColor] = useState(brush.color);
  const [size, setSize] = useState(brush.size);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    onBrushChange({ ...brush, color: newColor });
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setSize(newSize);
    onBrushChange({ ...brush, size: newSize });
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-100">
      <input
        type="color"
        value={color}
        onChange={handleColorChange}
        className="w-10 h-10 border-none"
      />
      <div className="flex-1 flex items-center space-x-2">
        <input
          type="range"
          value={size}
          onChange={handleSizeChange}
          min={1}
          max={20}
          step={1}
          className="w-full"
        />
        <span className="text-sm font-medium">{size}px</span>
      </div>
    </div>
  );
}
