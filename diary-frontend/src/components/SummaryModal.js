import React, { useState } from "react";
import { summarizeEntries } from "../api/diaryApi";

const RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

function SummaryModal({ onClose }) {
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = () => {
    setLoading(true);
    setError(null);
    setSummary(null);
    summarizeEntries(days)
      .then((res) => setSummary(res.data.result))
      .catch((err) => {
        console.error("Summarize failed:", err.response ? err.response.data : err.message);
        const msg = err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Could not generate a summary right now.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>✨ AI Summary</h3>
        <p className="section-label">Pick a range, then generate a summary of your entries from that period.</p>

        <div className="filter-chips">
          {RANGES.map((r) => (
            <button
              key={r.days}
              className={days === r.days ? "chip active" : "chip"}
              onClick={() => setDays(r.days)}
              type="button"
            >
              {r.label}
            </button>
          ))}
        </div>

        {error && <p className="error">{error}</p>}

        {summary && (
          <div className="ai-result">{summary}</div>
        )}

        <div className="form-actions" style={{ marginTop: "16px" }}>
          <button type="button" onClick={handleGenerate} disabled={loading}>
            {loading ? "Thinking..." : summary ? "Regenerate" : "Generate summary"}
          </button>
          <button type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default SummaryModal;
