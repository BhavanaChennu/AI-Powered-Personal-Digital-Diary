import React, { useEffect, useRef, useState } from "react";
import { FONTS, FONT_SIZES } from "../constants";
import { polishText, extendText, shortenText, smartLayoutText } from "../api/diaryApi";
import DoodleCanvas from "./DoodleCanvas";

const QUICK_COLORS = ["#2a2117", "#c15b7a", "#8f7fd8", "#4f8f6b", "#3b6fa0", "#b8892b"];

function RichTextEditor({ value, onChange, font, backgroundTheme = "none", placeholder }) {
  const ref = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const didInit = useRef(false);
  const [showDoodle, setShowDoodle] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [deleteBtnPos, setDeleteBtnPos] = useState(null);

  // AI tool state: which tool is running, and what it returned
  const [aiBusy, setAiBusy] = useState(null); // "polish" | "extend" | "shorten" | "layout" | null
  const [aiError, setAiError] = useState(null);
  const [polishOptions, setPolishOptions] = useState(null); // array of 3 strings
  const [aiSingleResult, setAiSingleResult] = useState(null); // { label, text } for extend/shorten/layout

  useEffect(() => {
    if (ref.current && !didInit.current) {
      ref.current.innerHTML = value || "";
      didInit.current = true;
    }
  }, [value]);

  const exec = (command, arg = null) => {
    document.execCommand(command, false, arg);
    ref.current.focus();
    onChange(ref.current.innerHTML);
  };

  // execCommand("fontSize") only supports the legacy 1-7 scale, not real point sizes.
  // Trick: apply the nearest legacy size, then rewrite the resulting <font size="N">
  // tags into <span style="font-size:XXpt"> with the exact size the user picked.
  const applyFontSize = (pt) => {
    document.execCommand("fontSize", false, "7");
    ref.current.querySelectorAll('font[size="7"]').forEach((el) => {
      const span = document.createElement("span");
      span.style.fontSize = `${pt}pt`;
      span.innerHTML = el.innerHTML;
      el.replaceWith(span);
    });
    onChange(ref.current.innerHTML);
  };

  const insertHtmlAtCursor = (html) => {
    ref.current.focus();
    document.execCommand("insertHTML", false, html);
    onChange(ref.current.innerHTML);
  };

  // Images/videos are embedded directly into the entry HTML as base64 data URLs.
  // This means no upload server and no disk storage, so media survives on hosting
  // platforms with ephemeral filesystems. Images are downscaled first to keep the
  // stored HTML from bloating the database.
  const downscaleImage = (file, maxWidth = 900) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => { img.src = reader.result; };
      reader.onerror = () => reject(new Error("Could not read that file."));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => reject(new Error("That file isn't a readable image."));
      reader.readAsDataURL(file);
    });

  const readAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Could not read that file."));
      reader.readAsDataURL(file);
    });

  const handleFileChosen = async (e, kind) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setUploadError(null);

    // Videos stay raw, so cap them hard - base64 inflates size by ~33%.
    const MAX_VIDEO_BYTES = 3 * 1024 * 1024;
    if (kind === "video" && file.size > MAX_VIDEO_BYTES) {
      setUploadError("Videos must be under 3MB to embed in an entry.");
      return;
    }

    setUploading(true);
    try {
      const dataUrl = kind === "image" ? await downscaleImage(file) : await readAsDataUrl(file);
      const html = kind === "image"
        ? `<img src="${dataUrl}" class="rte-object rte-image" style="width:320px;max-width:100%;border-radius:8px;margin:8px 0;" />`
        : `<video src="${dataUrl}" controls class="rte-object" style="max-width:100%;border-radius:8px;margin:8px 0;"></video>`;
      insertHtmlAtCursor(html);
    } catch (err) {
      console.error("Embed failed:", err.message);
      setUploadError(err.message || "Could not add that file.");
    } finally {
      setUploading(false);
    }
  };

  const insertTable = () => {
    const html = `
      <table class="rte-object" style="border-collapse:collapse;width:100%;margin:10px 0;">
        ${[0, 1, 2].map(() => `
          <tr>
            ${[0, 1, 2].map(() => `<td style="border:1px solid var(--surface-line, #ccc);padding:8px;min-width:60px;">&nbsp;</td>`).join("")}
          </tr>`).join("")}
      </table>`;
    insertHtmlAtCursor(html);
  };

  const insertDoodle = (dataUrl) => {
    insertHtmlAtCursor(`<img src="${dataUrl}" class="rte-object" style="max-width:100%;border-radius:8px;margin:8px 0;" />`);
    setShowDoodle(false);
  };

  const handleEditorClick = (e) => {
    const target = e.target.closest(".rte-object");
    if (!target || !ref.current.contains(target)) { setDeleteBtnPos(null); return; }
    const editorRect = ref.current.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    setDeleteBtnPos({
      top: targetRect.top - editorRect.top + ref.current.scrollTop - 10,
      left: targetRect.right - editorRect.left - 10,
      target,
    });
  };

  const removeSelectedObject = () => {
    if (deleteBtnPos && deleteBtnPos.target) {
      deleteBtnPos.target.remove();
      onChange(ref.current.innerHTML);
    }
    setDeleteBtnPos(null);
  };

  const resizeSelectedImage = (factor) => {
    if (!deleteBtnPos || !deleteBtnPos.target || deleteBtnPos.target.tagName !== "IMG") return;
    const img = deleteBtnPos.target;
    const currentWidth = img.getBoundingClientRect().width;
    const newWidth = Math.max(60, Math.min(900, currentWidth * factor));
    img.style.width = `${newWidth}px`;
    onChange(ref.current.innerHTML);
    handleEditorClick({ target: img });
  };

  // ---- AI writing tools ----
  const runAi = (tool) => {
    const html = ref.current.innerHTML;
    const plainText = ref.current.textContent || "";
    if (!plainText.trim()) {
      setAiError("Write something first, then try an AI tool.");
      return;
    }
    setAiError(null);
    setAiBusy(tool);
    const promise =
      tool === "polish" ? polishText(html) :
      tool === "extend" ? extendText(html) :
      tool === "shorten" ? shortenText(html) :
      smartLayoutText(html);

    promise
      .then((res) => {
        if (tool === "polish") {
          setPolishOptions(res.data.results);
        } else {
          const labels = { extend: "Extended version", shorten: "Shortened version", layout: "Restructured version" };
          setAiSingleResult({ label: labels[tool], text: res.data.result, isHtml: tool === "layout" });
        }
      })
      .catch((err) => {
        console.error(`AI ${tool} failed:`, err.response ? err.response.data : err.message);
        const msg = err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : `Could not run "${tool}" right now.`;
        setAiError(msg);
      })
      .finally(() => setAiBusy(null));
  };

  const acceptPlainText = (text) => {
    ref.current.innerHTML = `<p>${text.replace(/\n/g, "<br>")}</p>`;
    onChange(ref.current.innerHTML);
    setPolishOptions(null);
    setAiSingleResult(null);
  };

  const acceptHtml = (html) => {
    ref.current.innerHTML = html;
    onChange(ref.current.innerHTML);
    setAiSingleResult(null);
  };

  return (
    <div className="rte">
      <div className="rte-toolbar">
        <button type="button" onClick={() => exec("bold")} title="Bold"><b>B</b></button>
        <button type="button" onClick={() => exec("italic")} title="Italic"><i>I</i></button>
        <button type="button" onClick={() => exec("underline")} title="Underline"><u>U</u></button>
        <button type="button" onClick={() => exec("strikeThrough")} title="Strikethrough"><s>S</s></button>
        <span className="rte-divider" />
        <select onChange={(e) => exec("fontName", e.target.value)} defaultValue="" title="Font family">
          <option value="" disabled>Font</option>
          {FONTS.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
        </select>
        <select onChange={(e) => applyFontSize(e.target.value)} defaultValue="" title="Font size">
          <option value="" disabled>Font Size</option>
          {FONT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="rte-divider" />
        {QUICK_COLORS.map((c) => (
          <button key={c} type="button" className="rte-swatch" style={{ background: c }} onClick={() => exec("foreColor", c)} title={c} />
        ))}
        <input type="color" className="rte-color-picker" onChange={(e) => exec("foreColor", e.target.value)} title="More colors" defaultValue="#2a2117" />
        <span className="rte-divider" />
        <button type="button" onClick={() => exec("justifyLeft")} title="Align left">Align ⟸</button>
        <button type="button" onClick={() => exec("justifyCenter")} title="Align center">Align ⟺</button>
        <button type="button" onClick={() => exec("justifyRight")} title="Align right">Align ⟹</button>
        <span className="rte-divider" />
        <button type="button" onClick={() => imageInputRef.current.click()} title="Insert image">🖼️</button>
        <button type="button" onClick={() => videoInputRef.current.click()} title="Insert video">🎬</button>
        <button type="button" onClick={insertTable} title="Insert table">▦</button>
        <button type="button" onClick={() => setShowDoodle(true)} title="Doodle">✏️</button>
        {uploading && <span className="rte-status">Uploading...</span>}
      </div>

      <div className="rte-toolbar rte-ai-toolbar">
        <span className="rte-ai-label">✨ AI:</span>
        <button type="button" onClick={() => runAi("polish")} disabled={aiBusy}>{aiBusy === "polish" ? "..." : "Polish (3 options)"}</button>
        <button type="button" onClick={() => runAi("extend")} disabled={aiBusy}>{aiBusy === "extend" ? "..." : "Extend"}</button>
        <button type="button" onClick={() => runAi("shorten")} disabled={aiBusy}>{aiBusy === "shorten" ? "..." : "Shorten"}</button>
        <button type="button" onClick={() => runAi("layout")} disabled={aiBusy}>{aiBusy === "layout" ? "..." : "Smart Layout"}</button>
      </div>

      <input ref={imageInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFileChosen(e, "image")} />
      <input ref={videoInputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={(e) => handleFileChosen(e, "video")} />

      {uploadError && (
        <p className="error">{uploadError} <button type="button" className="link-button" onClick={() => setUploadError(null)}>dismiss</button></p>
      )}

      <div className="rte-editor-wrap">
        <div
          ref={ref}
          className={`rte-editor handwritten bg-${backgroundTheme}`}
          style={{ fontFamily: font }}
          contentEditable
          data-placeholder={placeholder}
          onInput={() => { onChange(ref.current.innerHTML); setDeleteBtnPos(null); }}
          onBlur={() => onChange(ref.current.innerHTML)}
          onClick={handleEditorClick}
        />
        {deleteBtnPos && (
          <div className="rte-object-controls" style={{ top: deleteBtnPos.top, left: deleteBtnPos.left - (deleteBtnPos.target.tagName === "IMG" ? 60 : 0) }}>
            {deleteBtnPos.target.tagName === "IMG" && (
              <>
                <button type="button" className="rte-resize-btn" onClick={() => resizeSelectedImage(0.8)} title="Smaller">−</button>
                <button type="button" className="rte-resize-btn" onClick={() => resizeSelectedImage(1.25)} title="Larger">+</button>
              </>
            )}
            <button type="button" className="rte-delete-btn" onClick={removeSelectedObject} title="Remove">×</button>
          </div>
        )}
      </div>

      {showDoodle && <DoodleCanvas onInsert={insertDoodle} onClose={() => setShowDoodle(false)} />}

      {aiError && (
        <div className="modal-overlay" onClick={() => setAiError(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>✨ AI</h3>
            <p className="error">{aiError}</p>
            <div className="form-actions"><button type="button" onClick={() => setAiError(null)}>Close</button></div>
          </div>
        </div>
      )}

      {polishOptions && (
        <div className="modal-overlay" onClick={() => setPolishOptions(null)}>
          <div className="modal-box modal-box-wide" onClick={(e) => e.stopPropagation()}>
            <h3>✨ Choose a version</h3>
            <p className="section-label">Pick whichever fits best - this replaces your current text.</p>
            {polishOptions.map((opt, i) => (
              <div key={i} className="ai-option">
                <div className="ai-result">{opt}</div>
                <button type="button" onClick={() => acceptPlainText(opt)}>Use this version</button>
              </div>
            ))}
            <div className="form-actions" style={{ marginTop: "12px" }}>
              <button type="button" onClick={() => setPolishOptions(null)}>Discard all</button>
            </div>
          </div>
        </div>
      )}

      {aiSingleResult && (
        <div className="modal-overlay" onClick={() => setAiSingleResult(null)}>
          <div className="modal-box modal-box-wide" onClick={(e) => e.stopPropagation()}>
            <h3>✨ {aiSingleResult.label}</h3>
            <p className="section-label">Review before applying - this replaces your current text.</p>
            {aiSingleResult.isHtml ? (
              <div className="ai-result" dangerouslySetInnerHTML={{ __html: aiSingleResult.text }} />
            ) : (
              <div className="ai-result">{aiSingleResult.text}</div>
            )}
            <div className="form-actions" style={{ marginTop: "16px" }}>
              <button type="button" onClick={() => aiSingleResult.isHtml ? acceptHtml(aiSingleResult.text) : acceptPlainText(aiSingleResult.text)}>Use this version</button>
              <button type="button" onClick={() => setAiSingleResult(null)}>Discard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RichTextEditor;
