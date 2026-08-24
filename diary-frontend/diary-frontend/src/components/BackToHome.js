import React from "react";
import { Link } from "react-router-dom";

function BackToHome() {
  return (
    <Link to="/" className="back-home-btn">&larr; Back to Home</Link>
  );
}

export default BackToHome;
