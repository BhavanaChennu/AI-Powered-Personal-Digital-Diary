import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllEntries } from "../api/diaryApi";
import BackToHome from "./BackToHome";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateKey(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function CalendarPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cursor, setCursor] = useState(new Date());
  const [selectedKey, setSelectedKey] = useState(null);

  useEffect(() => {
    getAllEntries()
      .then((res) => { setEntries(res.data); setError(null); })
      .catch((err) => {
        console.error("Load entries for calendar failed:", err.response ? err.response.data : err.message);
        setError("Could not load your entries for the calendar.");
      })
      .finally(() => setLoading(false));
  }, []);

  const entriesByDate = useMemo(() => {
    const map = {};
    entries.forEach((e) => {
      const d = new Date(e.createdAt);
      const key = dateKey(d);
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [entries]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const selectedEntries = selectedKey ? (entriesByDate[selectedKey] || []) : [];

  if (loading) return <p>Loading calendar...</p>;

  return (
    <div>
      <BackToHome />
      <div className="list-header">
        <h1>Calendar</h1>
      </div>
      {error && <p className="error">{error}</p>}

      <div className="diary-page fade-in">
        <div className="calendar-nav">
          <button type="button" onClick={() => setCursor(new Date(year, month - 1, 1))}>‹ Prev</button>
          <h3>{firstOfMonth.toLocaleString(undefined, { month: "long", year: "numeric" })}</h3>
          <button type="button" onClick={() => setCursor(new Date(year, month + 1, 1))}>Next ›</button>
        </div>

        <div className="calendar-grid calendar-weekdays">
          {WEEKDAYS.map((w) => <div key={w} className="calendar-weekday">{w}</div>)}
        </div>

        <div className="calendar-grid">
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="calendar-cell calendar-cell-empty" />;
            const key = dateKey(d);
            const hasEntries = Boolean(entriesByDate[key]);
            const isToday = dateKey(new Date()) === key;
            return (
              <button
                type="button"
                key={i}
                className={`calendar-cell ${hasEntries ? "has-entries" : ""} ${selectedKey === key ? "selected" : ""} ${isToday ? "is-today" : ""}`}
                onClick={() => setSelectedKey(key)}
              >
                {d.getDate()}
                {hasEntries && <span className="calendar-dot" />}
              </button>
            );
          })}
        </div>

        {selectedKey && (
          <div className="calendar-day-detail">
            <h3>Selected day</h3>
            {selectedEntries.length === 0 && <p className="section-label">No entries on this day.</p>}
            <ul className="calendar-entry-list">
              {selectedEntries.map((e) => (
                <li key={e.id}>
                  <Link to={`/entry/${e.id}`}>{e.favorite ? "★ " : ""}{e.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default CalendarPage;
