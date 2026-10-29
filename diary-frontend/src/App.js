import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import DiaryList from "./components/DiaryList";
import DiaryForm from "./components/DiaryForm";
import DiaryView from "./components/DiaryView";
import Login from "./components/Login";
import Register from "./components/Register";
import Logo from "./components/Logo";
import TodoPage from "./components/TodoPage";
import TrashPage from "./components/TrashPage";
import ProfilePage from "./components/ProfilePage";
import CalendarPage from "./components/CalendarPage";
import EntriesPage from "./components/EntriesPage";

function isLoggedIn() {
  return Boolean(localStorage.getItem("token"));
}

function ProtectedRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

// Top nav intentionally minimal: Home, Profile, theme toggle. Everything else lives on the Home dashboard.
function TopBar({ theme, setTheme }) {
  return (
    <div className="topbar">
      <Link to="/" className="brand">
        <Logo /> <span className="wordmark">My Digital Diary</span>
      </Link>
      {isLoggedIn() && (
        <div className="topbar-controls">
          <Link to="/" className="nav-link">🏠 Home</Link>
          <Link to="/profile" className="nav-link">👤 Profile</Link>
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} title="Toggle theme">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  const [, forceRerender] = useState(0);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const onAuth = () => forceRerender((n) => n + 1);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <TopBar theme={theme} setTheme={setTheme} />
        <div className="container">
          <Routes>
            <Route path="/login" element={<Login onAuth={onAuth} />} />
            <Route path="/register" element={<Register onAuth={onAuth} />} />
            <Route path="/" element={<ProtectedRoute><DiaryList /></ProtectedRoute>} />
            <Route path="/new" element={<ProtectedRoute><DiaryForm /></ProtectedRoute>} />
            <Route path="/edit/:id" element={<ProtectedRoute><DiaryForm /></ProtectedRoute>} />
            <Route path="/entry/:id" element={<ProtectedRoute><DiaryView /></ProtectedRoute>} />
            <Route path="/todos" element={<ProtectedRoute><TodoPage /></ProtectedRoute>} />
            <Route path="/trash" element={<ProtectedRoute><TrashPage /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/entries" element={<ProtectedRoute><EntriesPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage onAuth={onAuth} /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
