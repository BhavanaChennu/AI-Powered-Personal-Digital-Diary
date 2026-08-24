import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, setPin, removePin, updateProfile, changePassword } from "../api/diaryApi";
import BackToHome from "./BackToHome";

function ProfilePage({ onAuth }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  const [editingProfile, setEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [profileMsg, setProfileMsg] = useState(null);

  const [editingPin, setEditingPin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinMsg, setPinMsg] = useState(null);

  const load = () => {
    getProfile()
      .then((res) => { setProfile(res.data); setNameInput(res.data.username); setError(null); })
      .catch((err) => {
        console.error("Load profile failed:", err.response ? err.response.data : err.message);
        setError("Could not load your profile.");
      });
  };

  useEffect(() => { load(); }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileMsg(null);

    const nameChanged = nameInput.trim() !== profile.username;
    const wantsPwChange = currentPw || newPw;

    if (nameChanged && nameInput.trim().length < 2) {
      setProfileMsg("Name must be at least 2 characters.");
      return;
    }

    const tasks = [];
    if (nameChanged) tasks.push(updateProfile(nameInput.trim()));
    if (wantsPwChange) tasks.push(changePassword(currentPw, newPw));

    if (tasks.length === 0) { setEditingProfile(false); return; }

    Promise.all(tasks)
      .then((results) => {
        const nameResult = nameChanged ? results[0] : null;
        if (nameResult) {
          localStorage.setItem("token", nameResult.data.token);
          localStorage.setItem("username", nameResult.data.username);
          if (onAuth) onAuth();
        }
        setProfileMsg("Profile updated.");
        setCurrentPw(""); setNewPw("");
        setEditingProfile(false);
        load();
      })
      .catch((err) => {
        const msg = err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Could not update profile.";
        setProfileMsg(msg);
      });
  };

  const handleSetPin = (e) => {
    e.preventDefault();
    setPinMsg(null);
    if (!/^\d{4,6}$/.test(pinInput)) { setPinMsg("PIN must be 4 to 6 digits."); return; }
    setPin(pinInput)
      .then(() => { setPinMsg("PIN saved."); setPinInput(""); setEditingPin(false); load(); })
      .catch(() => setPinMsg("Could not save PIN."));
  };

  const handleRemovePin = () => {
    if (!window.confirm("Remove your PIN? Locked entries will become viewable without one.")) return;
    removePin().then(() => { setPinMsg("PIN removed."); setEditingPin(false); load(); sessionStorage.removeItem("pinVerified"); });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    sessionStorage.removeItem("pinVerified");
    navigate("/login");
  };

  if (error) return <p className="error">{error}</p>;
  if (!profile) return <p>Loading...</p>;

  return (
    <div>
      <BackToHome />
      <div className="list-header"><h1>Profile</h1></div>

      <div className="diary-page profile-page fade-in">
        <div className="profile-section">
          <div className="profile-section-header">
            <h2>Hi, {profile.username}</h2>
            <button type="button" className="btn-outline" onClick={() => setEditingProfile((v) => !v)}>
              {editingProfile ? "Close" : "Edit Profile"}
            </button>
          </div>

          {editingProfile && (
            <form onSubmit={handleSaveProfile} className="profile-edit-form">
              {profileMsg && <p className="section-label" style={{ color: "var(--accent)" }}>{profileMsg}</p>}
              <label>
                Display name
                <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
              </label>
              <p className="section-label" style={{ marginTop: "12px" }}>Change password (leave blank to keep current)</p>
              <label>
                Current password
                <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
              </label>
              <label>
                New password
                <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
              </label>
              <div className="form-actions">
                <button type="submit">Save changes</button>
              </div>
            </form>
          )}
        </div>

        <div className="stats-grid">
          <div className="stat-card"><strong>{profile.totalEntries}</strong><span>Diary entries</span></div>
          <div className="stat-card"><strong>{profile.totalTodos}</strong><span>To-do items</span></div>
          <div className="stat-card"><strong>{profile.trashCount}</strong><span>In trash</span></div>
        </div>

        <div className="profile-section">
          <div className="profile-section-header">
            <h3>🔒 Entry Lock PIN</h3>
            <button type="button" className="btn-outline" onClick={() => setEditingPin((v) => !v)}>
              {editingPin ? "Close" : profile.pinSet ? "Change PIN" : "Set PIN"}
            </button>
          </div>
          <p className="section-label">
            {profile.pinSet ? "A PIN is set. Entries marked 'Lock behind PIN' require it to open." : "No PIN set yet."}
          </p>
          {editingPin && (
            <>
              {pinMsg && <p className="section-label" style={{ color: "var(--accent)" }}>{pinMsg}</p>}
              <form onSubmit={handleSetPin} className="form-row">
                <input
                  type="password" inputMode="numeric" maxLength={6}
                  placeholder="New 4-6 digit PIN" value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                />
                <button type="submit">{profile.pinSet ? "Change PIN" : "Set PIN"}</button>
                {profile.pinSet && <button type="button" onClick={handleRemovePin}>Remove PIN</button>}
              </form>
            </>
          )}
        </div>

        <div className="profile-logout-row">
          <button type="button" className="logout-btn" onClick={handleLogout}>Log out</button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
