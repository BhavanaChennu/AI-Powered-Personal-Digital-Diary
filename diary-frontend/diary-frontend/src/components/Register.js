import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/diaryApi";

function Register({ onAuth }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    register(username, password)
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.username);
        onAuth();
        navigate("/");
      })
      .catch((err) => {
        if (err.response && err.response.status === 409) {
          setError("That username is already taken.");
        } else if (err.response && err.response.data) {
          setError(typeof err.response.data === "string" ? err.response.data : "Registration failed.");
        } else {
          setError("Registration failed. Is the backend running?");
        }
      });
  };

  return (
    <div className="auth-page">
      <h2>Create your diary account</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}

export default Register;
