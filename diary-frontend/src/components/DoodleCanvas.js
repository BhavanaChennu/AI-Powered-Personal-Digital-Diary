```jsx
import React, { useRef, useState } from "react";

const COLORS = [
  "#2a2117",
  "#c15b7a",
  "#8f7fd8",
  "#4f8f6b",
  "#3b6fa0",
  "#e0a95c",
];

function DoodleCanvas({ onInsert, onClose }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const bounds = useRef(null);
  const lastPoint = useRef(null);

  const [color, setColor] = useState(COLORS[0]);
  const [width, setWidth] = useState(3);
  const [hasDrawing, setHasDrawing] = useState(false);

  // Get pointer coordinates relative to the canvas.
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  // Track the area containing the drawing.
  const expandBounds = (x, y) => {
    const padding = width + 4;

    if (!bounds.current) {
      bounds.current = {
        minX: x - padding,
        minY: y - padding,
        maxX: x + padding,
        maxY: y + padding,
      };
    } else {
      bounds.current.minX = Math.min(bounds.current.minX, x - padding);
      bounds.current.minY = Math.min(bounds.current.minY, y - padding);
      bounds.current.maxX = Math.max(bounds.current.maxX, x + padding);
      bounds.current.maxY = Math.max(bounds.current.maxY, y + padding);
    }
  };

  // Begin drawing.
  const start = (e) => {
    if (e.button !== undefined && e.button !== 0) return;

    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    drawing.current = true;

    const ctx = canvas.getContext("2d");
    const point = getPos(e);

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);

    // Draw a dot even when the user only clicks once.
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, width / 2, 0, Math.PI * 2);
    ctx.fill();

    lastPoint.current = point;
    expandBounds(point.x, point.y);
    setHasDrawing(true);
  };

  // Continue drawing.
  const move = (e) => {
    if (!drawing.current) return;

    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const point = getPos(e);

    ctx.beginPath();

    if (lastPoint.current) {
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    } else {
      ctx.moveTo(point.x, point.y);
    }

    ctx.lineTo(point.x, point.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    lastPoint.current = point;

    expandBounds(point.x, point.y);
    setHasDrawing(true);
  };

  // Stop drawing.
  const stop = () => {
    drawing.current = false;
    lastPoint.current = null;
  };

  // Clear the canvas.
  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bounds.current = null;
    lastPoint.current = null;
    drawing.current = false;

    setHasDrawing(false);
  };

  // Export the drawing and send it to the parent component.
  const insert = () => {
    const canvas = canvasRef.current;

    if (!canvas || !bounds.current || !hasDrawing) {
      alert("Please draw something before inserting it.");
      return;
    }

    try {
      const minX = Math.max(
        0,
        Math.floor(bounds.current.minX)
      );

      const minY = Math.max(
        0,
        Math.floor(bounds.current.minY)
      );

      const maxX = Math.min(
        canvas.width,
        Math.ceil(bounds.current.maxX)
      );

      const maxY = Math.min(
        canvas.height,
        Math.ceil(bounds.current.maxY)
      );

      const cropWidth = Math.max(1, maxX - minX);
      const cropHeight = Math.max(1, maxY - minY);

      const croppedCanvas = document.createElement("canvas");
      croppedCanvas.width = cropWidth;
      croppedCanvas.height = cropHeight;

      const croppedContext = croppedCanvas.getContext("2d");

      if (!croppedContext) {
        throw new Error("Could not prepare the doodle image.");
      }

      croppedContext.drawImage(
        canvas,
        minX,
        minY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      const imageData = croppedCanvas.toDataURL("image/png");

      if (!imageData || imageData === "data:,") {
        throw new Error("Could not export the doodle image.");
      }

      if (typeof onInsert !== "function") {
        throw new Error(
          "The parent component has not provided the insert function."
        );
      }

      onInsert(imageData);
    } catch (error) {
      console.error("Failed to insert doodle:", error);
      alert(
        error.message ||
          "Could not insert the doodle. Please try again."
      );
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Doodle</h3>

        <canvas
          ref={canvasRef}
          width={480}
          height={320}
          className="doodle-canvas"
          style={{ touchAction: "none" }}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={stop}
          onPointerCancel={stop}
          onPointerLeave={stop}
        />

        <div className="doodle-controls">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Choose color ${c}`}
              title={`Choose color ${c}`}
              className="rte-swatch"
              style={{
                background: c,
                outline:
                  c === color ? "2px solid #333" : "none",
              }}
              onClick={() => setColor(c)}
            />
          ))}

          <input
            type="range"
            min="1"
            max="10"
            value={width}
            aria-label="Brush size"
            onChange={(e) => setWidth(Number(e.target.value))}
          />

          <button type="button" onClick={clear}>
            Clear
          </button>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={insert}
            disabled={!hasDrawing}
          >
            Insert into entry
          </button>

          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default DoodleCanvas;
```