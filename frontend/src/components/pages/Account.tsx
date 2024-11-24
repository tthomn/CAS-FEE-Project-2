import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Account: React.FC = () => {
    const { login, register, resetPassword } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setMessage("");
        setLoading(true);

        try {
            if (isRegistering) {
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match.");
                }
                await register(email, password);
                setMessage("Registration successful! Please verify your email.");
            } else {
                await login(email, password);
                setMessage("Login successful!");
            }
        } catch (error: any) {
            setMessage(error.message || "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        setMessage("");
        try {
            await resetPassword(email);
            setMessage("Password reset email sent. Please check your inbox.");
        } catch (error: any) {
            setMessage(error.message || "An unknown error occurred.");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "auto", padding: "1rem", textAlign: "center" }}>
            <h1>{isRegistering ? "Register" : "Login"}</h1>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ display: "block", width: "100%", margin: "0.5rem 0", padding: "0.5rem" }}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ display: "block", width: "100%", margin: "0.5rem 0", padding: "0.5rem" }}
            />
            {isRegistering && (
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ display: "block", width: "100%", margin: "0.5rem 0", padding: "0.5rem" }}
                />
            )}
            <button
                onClick={handleSubmit}
                style={{
                    display: "block",
                    width: "100%",
                    margin: "0.5rem 0",
                    padding: "0.5rem",
                    backgroundColor: isRegistering ? "blue" : "green",
                    color: "white",
                    borderRadius: "5px",
                }}
                disabled={loading}
            >
                {loading ? (isRegistering ? "Registering..." : "Logging in...") : isRegistering ? "Register" : "Login"}
            </button>
            {!isRegistering && (
                <button
                    onClick={handlePasswordReset}
                    style={{
                        display: "block",
                        width: "100%",
                        margin: "0.5rem 0",
                        padding: "0.5rem",
                        backgroundColor: "gray",
                        color: "white",
                        borderRadius: "5px",
                    }}
                    disabled={!email || loading}
                >
                    Forgot Password?
                </button>
            )}
            <button
                onClick={() => setIsRegistering(!isRegistering)}
                style={{
                    display: "block",
                    width: "100%",
                    margin: "0.5rem 0",
                    padding: "0.5rem",
                    backgroundColor: "purple",
                    color: "white",
                    borderRadius: "5px",
                }}
            >
                {isRegistering ? "Switch to Login" : "Switch to Register"}
            </button>
            {message && <p style={{ color: "red", marginTop: "1rem" }}>{message}</p>}
        </div>
    );
};

export default Account;
