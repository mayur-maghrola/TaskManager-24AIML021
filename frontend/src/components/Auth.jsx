import React, { useState } from "react";
import { AlertTriangle, UserPlus, LogIn } from "lucide-react";
import "./Auth.css";

const AUTH_API = "http://localhost:3000/api/auth";

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${AUTH_API}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to send reset link.");
      }

      setError("");
      alert(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side quick check
    if (!isLogin && username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? `${AUTH_API}/login` : `${AUTH_API}/register`;
      const payload = isLogin
        ? { email: email.trim(), password }
        : { username: username.trim(), email: email.trim(), password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      onAuthSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2 className="auth-title">
          {isForgotPassword
            ? "Forgot Password?"
            : isLogin
              ? "Welcome Back"
              : "Create Account"}
        </h2>
        <p className="auth-subtitle">
          {isForgotPassword
            ? "Enter your email to receive a password reset link"
            : isLogin
              ? "Log in to manage your tasks"
              : "Sign up for a free Task Manager account"}
        </p>
      </div>

      {!isForgotPassword && (

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${isLogin ? "active" : ""}`}
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
          >
            <LogIn size={16} style={{ display: "inline", marginRight: "6px" }} />
            Login
          </button>
          <button
            type="button"
            className={`auth-tab ${!isLogin ? "active" : ""}`}
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
          >
            <UserPlus size={16} style={{ display: "inline", marginRight: "6px" }} />
            Register
          </button>
        </div>

      )}

      {error && (
        <div className="error-msg">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <form className="auth-form" onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit}>
        {!isLogin && !isForgotPassword && (
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="e.g. Alex"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required={!isLogin}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {!isForgotPassword && (
          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        )}

        <button type="submit" className="btn-auth-submit" disabled={loading}>
          {loading
            ? "Processing..."
            : isForgotPassword
              ? "Send Reset Link"
              : isLogin
                ? "Log In"
                : "Register"}
        </button>

        {isLogin && (
          <button
            type="button"
            className="forgot-password-link"
            onClick={() => {
              setIsForgotPassword(true);
              setError("");
            }}
          >
            Forgot Password?
          </button>
        )}

      </form>

      {isForgotPassword ? (
        <p className="auth-toggle-msg">
          Remember your password?{" "}
          <span
            className="auth-toggle-link"
            onClick={() => {
              setIsForgotPassword(false);
              setIsLogin(true);
              setError("");
            }}
          >
            Back to Login
          </span>
        </p>
      ) : (
        <p className="auth-toggle-msg">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span
            className="auth-toggle-link"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            {isLogin ? "Sign Up" : "Log In"}
          </span>
        </p>
      )}
    </div>
  );
}
