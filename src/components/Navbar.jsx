// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      navigate("/");
    }
  };

  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 16px",
      borderBottom: "1px solid #e5e7eb",
      background: "#fff"
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link to="/" style={{ textDecoration: "none", color: "#111", fontWeight: 700 }}>
          SplitEasy
        </Link>
        <Link to="/dashboard" style={{ textDecoration: "none", color: "#333", fontSize: 14 }}>
          Dashboard
        </Link>
      </div>

      <div>
        {token ? (
          <button onClick={logout} style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #ddd",
            background: "#fff",
            cursor: "pointer"
          }}>
            Logout
          </button>
        ) : (
          <Link to="/" style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #ddd",
            background: "#fff",
            textDecoration: "none",
            color: "#111",
            fontSize: 14
          }}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}