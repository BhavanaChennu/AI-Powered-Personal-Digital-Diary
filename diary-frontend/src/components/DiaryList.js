import React, { useState } from "react";
import { Link } from "react-router-dom";
import SummaryModal from "./SummaryModal";

// Home is a clean launcher only - the actual entries list/search/filter lives on /entries.
function DiaryList() {
  const [showSummary, setShowSummary] = useState(false);

  const hour = new Date().getHours();
  const timeGreeting = hour < 5 ? "Good night" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Good night";
  const username = localStorage.getItem("username") || "there";

  return (
    <div>
      <div className="greeting-block fade-in">
        <h1 className="greeting-title">{timeGreeting}, {username}!</h1>
        <p className="greeting-sub">What's on your mind?</p>
      </div>

      <div className="quick-actions quick-actions-wide">
        <Link to="/new" className="quick-action-card">
          <span className="quick-action-icon">📝</span><span>New Entry</span>
        </Link>
        <Link to="/todos" className="quick-action-card">
          <span className="quick-action-icon">✅</span><span>To-Do List</span>
        </Link>
        <Link to="/entries?focus=search" className="quick-action-card">
          <span className="quick-action-icon">🔍</span><span>Search Entries</span>
        </Link>
        <button type="button" className="quick-action-card quick-action-btn" onClick={() => setShowSummary(true)}>
          <span className="quick-action-icon">✨</span><span>AI Summary</span>
        </button>
        <Link to="/entries" className="quick-action-card">
          <span className="quick-action-icon">📖</span><span>Your Entries</span>
        </Link>
        <Link to="/entries?filter=favorites" className="quick-action-card">
          <span className="quick-action-icon">★</span><span>Favorites</span>
        </Link>
        <Link to="/calendar" className="quick-action-card">
          <span className="quick-action-icon">📅</span><span>Calendar</span>
        </Link>
        <Link to="/trash" className="quick-action-card">
          <span className="quick-action-icon">🗑️</span><span>Recently Deleted</span>
        </Link>
      </div>

      {showSummary && <SummaryModal onClose={() => setShowSummary(false)} />}
    </div>
  );
}

export default DiaryList;
