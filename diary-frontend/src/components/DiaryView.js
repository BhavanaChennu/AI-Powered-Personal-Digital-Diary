import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getEntryById } from "../api/diaryApi";
import PinPrompt from "./PinPrompt";
import BackToHome from "./BackToHome";

function DiaryView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [error, setError] = useState(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    getEntryById(id)
      .then((res) => {
        setEntry(res.data);
        if (res.data.sensitive && sessionStorage.getItem("pinVerified") !== "true") {
          setLocked(true);
        }
      })
      .catch((err) => {
        console.error("Load entry failed:", err.response ? err.response.data : err.message);
        setError("Entry not found, or could not be loaded.");
      });
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!entry) return <p>Loading...</p>;

  if (locked) {
    return <PinPrompt onSuccess={() => setLocked(false)} onCancel={() => navigate("/")} />;
  }

  return (
    <div>
      <BackToHome />
      <div className="diary-page editor-page fade-in">
        <h1>{entry.sensitive ? "🔒 " : ""}{entry.title}</h1>
        <small>
          Created {new Date(entry.createdAt).toLocaleString()} · Last updated{" "}
          {new Date(entry.updatedAt).toLocaleString()}
        </small>
        <div className="entry-meta">
          {entry.favorite && <span className="badge">★ favorite</span>}
          {entry.mood && <span className="badge">{entry.mood}</span>}
          {entry.tags && entry.tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
            <span key={t} className="badge tag">#{t}</span>
          ))}
        </div>
        <div
          className={`diary-content handwritten bg-${entry.backgroundTheme || "none"}`}
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
        <Link to={`/edit/${entry.id}`} className="btn-primary">Edit this entry</Link>
      </div>
    </div>
  );
}

export default DiaryView;
