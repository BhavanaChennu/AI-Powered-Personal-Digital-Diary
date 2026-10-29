
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

  const getPos = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const expandBounds = (x, y) => {
    const pad = width + 4;

    if (!bounds.current) {
      bounds.current = {
        minX: x - pad,
        minY: y - pad,
        maxX: x + pad,
        maxY: y + pad,
      };
    } else {
      bounds.current.minX = Math.min(bounds.current.minX, x - pad);
      bounds.current.minY = Math.min(bounds.current.minY, y - pad);
      bounds.current.maxX = Math.max(bounds.current.maxX, x + pad);
      bounds.current.maxY = Math.max(bounds.current.maxY, y + pad);
    }
  };

  const start = (event) => {
    if (event.button !== undefined && event.button !== 0) return;

    event.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    drawing.current = true;

    const point = getPos(event);
    const context = canvas.getContext("2d");

    if (!context) return;

    if (canvas.setPointerCapture) {
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch (error) {
        // Continue drawing if pointer capture is unavailable.
      }
    }

    context.fillStyle = color;
    context.beginPath();
    context.arc(point.x, point.y, width / 2, 0, Math.PI * 2);
    context.fill();

    lastPoint.current = point;
    expandBounds(point.x, point.y);
    setHasDrawing(true);
  };

  const move = (event) => {
    if (!drawing.current) return;

    event.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas || !lastPoint.current) return;

    const point = getPos(event);
    const context = canvas.getContext("2d");

    if (!context) return;

    context.beginPath();
    context.moveTo(lastPoint.current.x, lastPoint.current.y);
    context.lineTo(point.x, point.y);
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();

    lastPoint.current = point;
    expandBounds(point.x, point.y);
  };

  const stop = () => {
    drawing.current = false;
    lastPoint.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    bounds.current = null;
    lastPoint.current = null;
    drawing.current = false;
    setHasDrawing(false);
  };

  const insert = () => {
    const canvas = canvasRef.current;
    const box = bounds.current;

    if (!canvas || !box || !hasDrawing) {
      alert("Please draw something before inserting it.");
      return;
    }

    try {
      const minX = Math.max(0, Math.floor(box.minX));
      const minY = Math.max(0, Math.floor(box.minY));
      const maxX = Math.min(canvas.width, Math.ceil(box.maxX));
      const maxY = Math.min(canvas.height, Math.ceil(box.maxY));

      const cropWidth = Math.max(1, maxX - minX);
      const cropHeight = Math.max(1, maxY - minY);

      const croppedCanvas = document.createElement("canvas");
      croppedCanvas.width = cropWidth;
      croppedCanvas.height = cropHeight;

      const context = croppedCanvas.getContext("2d");
      if (!context) {
        alert("Could not prepare the doodle image.");
        return;
      }

      context.drawImage(
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
        alert("Could not export the doodle image.");
        return;
      }

      if (typeof onInsert !== "function") {
        alert("The editor insert function is missing.");
        return;
      }

      onInsert(imageData);
    } catch (error) {
      console.error("Doodle insertion failed:", error);
      alert("Could not insert the doodle. Check the VS Code/browser console.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(event) => event.stopPropagation()}>
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
              className="rte-swatch"
              aria-label={`Choose color ${c}`}
              title={`Choose color ${c}`}
              onClick={() => setColor(c)}
              style={{
                backgroundColor: c,
                outline: color === c ? "2px solid #333" : "none",
              }}
            />
          ))}

          <label>
            Pen width: {width}
            <input
              type="range"
              min="1"
              max="12"
              value={width}
              onChange={(event) => setWidth(Number(event.target.value))}
            />
          </label>
        </div>

        <div className="doodle-actions">
          <button type="button" onClick={clear}>
            Clear
          </button>

          <button type="button" onClick={onClose}>
            Cancel
          </button>

          <button type="button" onClick={insert} disabled={!hasDrawing}>
            Insert into Entry
          </button>
        </div>
      </div>
    </div>
  );
}

export default DoodleCanvas;
