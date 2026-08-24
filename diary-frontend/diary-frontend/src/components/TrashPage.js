import React, { useEffect, useState } from "react";
import { getTrash, restoreEntry, permanentlyDeleteEntry } from "../api/diaryApi";
import BackToHome from "./BackToHome";

function TrashPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    getTrash()
      .then((res) => { setEntries(res.data); setError(null); })
      .catch((err) => {
        console.error("Load trash failed:", err.response ? err.response.data : err.message);
        setError("Could not load the trash.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRestore = (id) => restoreEntry(id).then(load).catch((err) => {
    console.error("Restore failed:", err.response ? err.response.data : err.message);
    setError("Could not restore that entry.");
  });

  const handlePermanentDelete = (id) => {
    if (!window.confirm("Permanently delete this entry? This cannot be undone.")) return;
    permanentlyDeleteEntry(id).then(load).catch((err) => {
      console.error("Permanent delete failed:", err.response ? err.response.data : err.message);
      setError("Could not permanently delete that entry.");
    });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <BackToHome />
      <div className="list-header">
        <h1>Recently Deleted Entries</h1>
      </div>
      <p className="section-label">Deleted entries stay here until you permanently remove them.</p>

      {error && <p className="error">{error}</p>}
      {!error && entries.length === 0 && <p>Trash is empty.</p>}

      <ul className="entry-list">
        {entries.map((entry) => (
          <li key={entry.id} className="entry-card fade-in">
            <h3>{entry.title}</h3>
            <small>Deleted {new Date(entry.deletedAt).toLocaleString()}</small>
            <div className="entry-actions">
              <button onClick={() => handleRestore(entry.id)}>Restore</button>
              <button onClick={() => handlePermanentDelete(entry.id)}>Delete forever</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TrashPage;
