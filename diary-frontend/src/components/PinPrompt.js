import React, { useState } from "react";
import { verifyPin } from "../api/diaryApi";

function PinPrompt({ onSuccess, onCancel }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setChecking(true);
    setError(null);
    verifyPin(pin)
      .then((res) => {
        if (res.data.valid) {
          sessionStorage.setItem("pinVerified", "true");
          onSuccess();
        } else {
          setError("Incorrect PIN.");
        }
      })
      .catch(() => setError("Could not verify PIN. Try again."))
      .finally(() => setChecking(false));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>🔒 Enter PIN</h3>
        <p className="section-label">This entry is locked. Enter your PIN to view it.</p>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            autoFocus
          />
          <div className="form-actions">
            <button type="submit" disabled={checking || pin.length < 4}>Unlock</button>
            <button type="button" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PinPrompt;
