import React, { useState } from "react";
import { Lock, AlertTriangle, CheckCircle } from "lucide-react";
import "./Auth.css";

const AUTH_API = "http://localhost:3000/api/auth";

export default function ResetPassword({ token, onBackToLogin }) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${AUTH_API}/reset-password/${token}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to reset password."
                );
            }

            setSuccess(
                "Password reset successfully! You can now log in."
            );

            setPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card">
            <div className="auth-header">
                <h2 className="auth-title">Reset Password</h2>

                <p className="auth-subtitle">
                    Enter your new password below
                </p>
            </div>

            {error && (
                <div className="error-msg">
                    <AlertTriangle size={16} />
                    {error}
                </div>
            )}

            {success && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px",
                        marginBottom: "16px",
                        color: "#166534",
                        background: "#dcfce7",
                        border: "1px solid #86efac",
                        borderRadius: "8px",
                    }}
                >
                    <CheckCircle size={16} />
                    {success}
                </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="new-password">New Password</label>

                    <input
                        id="new-password"
                        type="password"
                        className="form-input"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="confirm-password">
                        Confirm Password
                    </label>

                    <input
                        id="confirm-password"
                        type="password"
                        className="form-input"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) =>
                            setConfirmPassword(e.target.value)
                        }
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="btn-auth-submit"
                    disabled={loading || !!success}
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </form>

            {success && (
                <p className="auth-toggle-msg">
                    <span
                        className="auth-toggle-link"
                        onClick={onBackToLogin}
                    >
                        Back to Login
                    </span>
                </p>
            )}
        </div>
    );
}