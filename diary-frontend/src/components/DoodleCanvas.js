import React, { useRef, useState } from "react";

const COLORS = ["#2a2117", "#c15b7a", "#8f7fd8", "#4f8f6b", "#3b6fa0", "#e0a95c"];

function DoodleCanvas({ onInsert, onClose }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [color, setColor] = useState(COLORS[0]);
  const [width, setWidth] = useState(3);
  // Track the bounding box of actual ink so we can crop the export instead of
  // shipping a big mostly-blank image for a small doodle.
  const bounds = useRef(null);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  };

  const expandBounds = (x, y) => {
    const pad = width + 4;
    if (!bounds.current) {
      bounds.current = { minX: x - pad, minY: y - pad, maxX: x + pad, maxY: y + pad };
    } else {
      bounds.current.minX = Math.min(bounds.current.minX, x - pad);
      bounds.current.minY = Math.min(bounds.current.minY, y - pad);
      bounds.current.maxX = Math.max(bounds.current.maxX, x + pad);
      bounds.current.maxY = Math.max(bounds.current.maxY, y + pad);
    }
  };

  const start = (e) => {
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    expandBounds(x, y);
  };

  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.stroke();
    expandBounds(x, y);
  };

  const stop = () => { drawing.current = false; };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    bounds.current = null;
  };

  const insert = () => {
    const canvas = canvasRef.current;
    if (!bounds.current) return; // nothing drawn

    const minX = Math.max(0, Math.floor(bounds.current.minX));
    const minY = Math.max(0, Math.floor(bounds.current.minY));
    const maxX = Math.min(canvas.width, Math.ceil(bounds.current.maxX));
    const maxY = Math.min(canvas.height, Math.ceil(bounds.current.maxY));
    const w = Math.max(1, maxX - minX);
    const h = Math.max(1, maxY - minY);

    // Crop to just the drawn region instead of exporting the whole fixed canvas.
    const cropped = document.createElement("canvas");
    cropped.width = w;
    cropped.height = h;
    cropped.getContext("2d").drawImage(canvas, minX, minY, w, h, 0, 0, w, h);

    onInsert(cropped.toDataURL("image/png"));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>Doodle</h3>
        <canvas
          ref={canvasRef}
          width={480}
          height={320}
          className="doodle-canvas"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={stop}
          onMouseLeave={stop}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={stop}
        />
        <div className="doodle-controls">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className="rte-swatch"
              style={{ background: c, outline: c === color ? "2px solid #333" : "none" }}
              onClick={() => setColor(c)}
            />
          ))}
          <input type="range" min="1" max="10" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
          <button type="button" onClick={clear}>Clear</button>
        </div>
        <div className="form-actions">
          <button type="button" onClick={insert} disabled={!bounds.current}>Insert into entry</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default DoodleCanvas;
