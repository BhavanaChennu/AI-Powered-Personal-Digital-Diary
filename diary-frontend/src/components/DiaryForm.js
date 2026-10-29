import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createEntry, getEntryById, updateEntry, getProfile, setPin } from "../api/diaryApi";
import { BACKGROUND_THEMES, FONTS } from "../constants";
import RichTextEditor from "./RichTextEditor";
import BackToHome from "./BackToHome";

const MOODS = ["happy", "sad", "stressed", "calm", "excited", "grateful", "tired"];

function DiaryForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [tags, setTags] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [backgroundTheme, setBackgroundTheme] = useState("none");
  const [sensitive, setSensitive] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(!isEditMode);

  const [pinIsSet, setPinIsSet] = useState(true); // assume true until we know, to avoid flashing the prompt
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [pinSetupError, setPinSetupError] = useState(null);

  useEffect(() => {
    getProfile().then((res) => setPinIsSet(res.data.pinSet)).catch(() => {});
  }, []);

  useEffect(() => {
    if (isEditMode) {
      getEntryById(id).then((res) => {
        setTitle(res.data.title);
        setContent(res.data.content);
        setMood(res.data.mood || "");
        setTags(res.data.tags || "");
        setFavorite(res.data.favorite || false);
        setBackgroundTheme(res.data.backgroundTheme || "none");
        setSensitive(res.data.sensitive || false);
        setLoaded(true);
      });
    }
  }, [id, isEditMode]);

  const handleSensitiveToggle = (checked) => {
    if (checked && !pinIsSet) {
      setShowPinSetup(true);
      return; // don't check the box until a PIN actually exists
    }
    setSensitive(checked);
  };

  const handleCreatePin = (e) => {
    e.preventDefault();
    setPinSetupError(null);
    if (!/^\d{4,6}$/.test(newPin)) {
      setPinSetupError("PIN must be 4 to 6 digits.");
      return;
    }
    setPin(newPin)
      .then(() => {
        setPinIsSet(true);
        setSensitive(true);
        setShowPinSetup(false);
        setNewPin("");
      })
      .catch(() => setPinSetupError("Could not save PIN. Try again."));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content || content === "<br>") {
      setError("Content cannot be empty.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = { title, content, mood, tags, favorite, backgroundTheme, sensitive };
    const request = isEditMode ? updateEntry(id, payload) : createEntry(payload);

    request
      .then(() => navigate("/"))
      .catch((err) => {
        console.error("Save failed:", err.response ? err.response.data : err.message);
        const msg = err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Could not save entry. Check the title/content and try again.";
        setError(msg);
      })
      .finally(() => setSaving(false));
  };

  return (
    <div>
      <BackToHome />
      <div className="diary-page editor-page fade-in">
        <h2>{isEditMode ? "Edit Entry" : "New Entry"}</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {loaded && (
            <RichTextEditor
              value={content}
              onChange={setContent}
              font={FONTS[0].value}
              backgroundTheme={backgroundTheme}
              placeholder="Write your thoughts..."
            />
          )}

          <div className="form-row">
            <label>
              Mood
              <select value={mood} onChange={(e) => setMood(e.target.value)}>
                <option value="">(none)</option>
                {MOODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>

            <label>
              Tags (comma-separated)
              <input
                type="text"
                placeholder="java, college, exams"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </label>

            <label className="checkbox-label">
              <input type="checkbox" checked={favorite} onChange={(e) => setFavorite(e.target.checked)} />
              Mark as favorite
            </label>

            <label className="checkbox-label">
              <input type="checkbox" checked={sensitive} onChange={(e) => handleSensitiveToggle(e.target.checked)} />
              🔒 Lock behind PIN
            </label>
          </div>

          {showPinSetup && (
            <div className="inline-pin-setup">
              <p className="section-label">You haven't set an app PIN yet. Create one now to lock this entry:</p>
              {pinSetupError && <p className="error">{pinSetupError}</p>}
              <form onSubmit={handleCreatePin} className="form-row">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="New 4-6 digit PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                />
                <button type="submit">Create PIN &amp; lock this entry</button>
                <button type="button" onClick={() => setShowPinSetup(false)}>Cancel</button>
              </form>
            </div>
          )}

          <div>
            <p className="section-label">Diary page background (appears behind your writing)</p>
            <div className="swatch-row">
              {BACKGROUND_THEMES.map((t) => (
                <button
                  type="button"
                  key={t.key}
                  className={`swatch bg-${t.key} ${backgroundTheme === t.key ? "swatch-active" : ""}`}
                  title={t.label}
                  onClick={() => setBackgroundTheme(t.key)}
                />
              ))}
              {backgroundTheme !== "none" && (
                <button type="button" className="remove-bg-btn" onClick={() => setBackgroundTheme("none")}>
                  Remove background
                </button>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => navigate("/")}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DiaryForm;
