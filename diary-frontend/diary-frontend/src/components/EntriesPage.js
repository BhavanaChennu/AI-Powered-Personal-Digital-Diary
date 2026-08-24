import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAllEntries, deleteEntry, searchEntries, getFavorites } from "../api/diaryApi";
import BackToHome from "./BackToHome";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent || div.innerText || "";
}

function EntriesPage() {
  const [searchParams] = useSearchParams();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [activeFilter, setActiveFilter] = useState(searchParams.get("filter") === "favorites" ? "favorites" : "all");
  const [sortBy, setSortBy] = useState("createdDesc");

  const loadEntries = (fetcher = getAllEntries) => {
    setLoading(true);
    fetcher()
      .then((res) => { setEntries(res.data); setError(null); })
      .catch((err) => {
        console.error("Diary load failed:", err.response ? err.response.status : "", err.response ? err.response.data : err.message);
        setEntries([]);
        if (err.response && err.response.status === 401) {
          setError("Your session expired. Please log in again.");
        } else if (err.response && err.response.data && err.response.data.message) {
          setError(`Server error: ${err.response.data.message}`);
        } else if (err.request && !err.response) {
          setError(`Could not reach the backend at ${API_BASE_URL}. Is it running?`);
        } else {
          setError("Could not load diary entries. (see browser console for details)");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (searchParams.get("filter") === "favorites") {
      loadEntries(getFavorites);
    } else {
      loadEntries();
    }
    if (searchParams.get("focus") === "search") {
      setTimeout(() => document.getElementById("search-entries")?.focus(), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm("Move this entry to Recently Deleted?")) return;
    deleteEntry(id).then(() => loadEntries()).catch(() => setError("Could not delete that entry."));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!keyword.trim()) { loadEntries(); setActiveFilter("all"); return; }
    setActiveFilter("search");
    loadEntries(() => searchEntries(keyword.trim()));
  };

  const applyFilter = (filter) => {
    setActiveFilter(filter);
    setKeyword("");
    if (filter === "all") loadEntries();
    if (filter === "favorites") loadEntries(getFavorites);
  };

  const sortedEntries = useMemo(() => {
    const copy = [...entries];
    copy.sort((a, b) => {
      const field = sortBy.startsWith("created") ? "createdAt" : "updatedAt";
      const diff = new Date(a[field]) - new Date(b[field]);
      return sortBy.endsWith("Desc") ? -diff : diff;
    });
    return copy;
  }, [entries, sortBy]);

  if (loading) return <p>Loading entries...</p>;

  return (
    <div>
      <BackToHome />
      <div className="list-header">
        <h1>Your Entries</h1>
        <Link to="/new" className="btn-primary">+ New Entry</Link>
      </div>

      <form onSubmit={handleSearch} className="search-bar">
        <input id="search-entries" type="text" placeholder="Search entries..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <button type="submit">Search</button>
      </form>

      <div className="filter-chips">
        <button className={activeFilter === "all" ? "chip active" : "chip"} onClick={() => applyFilter("all")}>All</button>
        <button className={activeFilter === "favorites" ? "chip active" : "chip"} onClick={() => applyFilter("favorites")}>★ Favorites</button>
        <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="createdDesc">Created: Newest first</option>
          <option value="createdAsc">Created: Oldest first</option>
          <option value="updatedDesc">Modified: Newest first</option>
          <option value="updatedAsc">Modified: Oldest first</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}
      {!error && entries.length === 0 && <p>No entries found.</p>}

      <ul className="entry-list">
        {sortedEntries.map((entry, i) => {
          const isLocked = entry.sensitive && sessionStorage.getItem("pinVerified") !== "true";
          const preview = isLocked ? "🔒 Locked entry" : stripHtml(entry.content);
          return (
            <li key={entry.id} className={`entry-card bg-${entry.backgroundTheme || "none"} fade-in`} style={{ animationDelay: `${i * 0.05}s` }}>
              <Link to={`/entry/${entry.id}`}>
                <h3>{entry.favorite ? "★ " : ""}{entry.sensitive ? "🔒 " : ""}{entry.title}</h3>
                <p className="handwritten">{isLocked ? preview : preview.slice(0, 90) + (preview.length > 90 ? "..." : "")}</p>
                <div className="entry-meta">
                  {entry.mood && <span className="badge">{entry.mood}</span>}
                  {entry.tags && entry.tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                    <span key={t} className="badge tag">#{t}</span>
                  ))}
                  <small>{new Date(entry.createdAt).toLocaleString()}</small>
                </div>
              </Link>
              <div className="entry-actions">
                <Link to={`/edit/${entry.id}`}>Edit</Link>
                <button onClick={() => handleDelete(entry.id)}>Delete</button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default EntriesPage;
