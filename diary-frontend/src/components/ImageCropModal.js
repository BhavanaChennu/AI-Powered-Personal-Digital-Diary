import React, { useEffect, useRef, useState } from "react";

function ImageCropModal({ src, onApply, onClose }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const dragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const [selection, setSelection] = useState(null); // {x, y, w, h} in canvas pixels
  const [canvasSize, setCanvasSize] = useState({ width: 480, height: 320 });

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Scale the image down to fit a reasonable modal size while keeping aspect ratio.
      const maxW = 520, maxH = 420;
      let w = img.width, h = img.height;
      const scale = Math.min(maxW / w, maxH / h, 1);
      w = Math.round(w * scale);
      h = Math.round(h * scale);
      setCanvasSize({ width: w, height: h });
      imgRef.current = img;
      drawCanvas(w, h, null);
    };
    img.src = src;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const drawCanvas = (w, h, sel) => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) return;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(imgRef.current, 0, 0, w, h);
    if (sel) {
      ctx.strokeStyle = "#d88fc0";
      ctx.lineWidth = 2;
      ctx.strokeRect(sel.x, sel.y, sel.w, sel.h);
      ctx.fillStyle = "rgba(216,143,192,0.15)";
      ctx.fillRect(sel.x, sel.y, sel.w, sel.h);
    }
  };

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleDown = (e) => {
    dragging.current = true;
    startPos.current = getPos(e);
  };

  const handleMove = (e) => {
    if (!dragging.current) return;
    const pos = getPos(e);
    const sel = {
      x: Math.min(startPos.current.x, pos.x),
      y: Math.min(startPos.current.y, pos.y),
      w: Math.abs(pos.x - startPos.current.x),
      h: Math.abs(pos.y - startPos.current.y),
    };
    setSelection(sel);
    drawCanvas(canvasSize.width, canvasSize.height, sel);
  };

  const handleUp = () => { dragging.current = false; };

  const applyCrop = () => {
    if (!selection || selection.w < 5 || selection.h < 5) {
      onClose();
      return;
    }
    // Map the on-screen selection back to the original image's natural resolution.
    const scaleX = imgRef.current.width / canvasSize.width;
    const scaleY = imgRef.current.height / canvasSize.height;

    const output = document.createElement("canvas");
    output.width = Math.round(selection.w * scaleX);
    output.height = Math.round(selection.h * scaleY);
    output.getContext("2d").drawImage(
      imgRef.current,
      selection.x * scaleX, selection.y * scaleY, selection.w * scaleX, selection.h * scaleY,
      0, 0, output.width, output.height
    );
    onApply(output.toDataURL("image/png"));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>Crop image</h3>
        <p className="section-label">Drag a rectangle over the part you want to keep.</p>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="doodle-canvas"
          onMouseDown={handleDown}
          onMouseMove={handleMove}
          onMouseUp={handleUp}
          onMouseLeave={handleUp}
        />
        <div className="form-actions" style={{ marginTop: "14px" }}>
          <button type="button" onClick={applyCrop} disabled={!selection}>Apply crop</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default ImageCropModal;
