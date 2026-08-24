import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/diaryApi";

function Login({ onAuth }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    login(username, password)
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.username);
        onAuth();
        navigate("/");
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          setError("Invalid username or password.");
        } else {
          setError("Login failed. Is the backend running?");
        }
      });
  };

  return (
    <div className="auth-page">
      <h2>Welcome back</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Log in</button>
      </form>
      <p>No account yet? <Link to="/register">Register</Link></p>
    </div>
  );
}

export default Login;
