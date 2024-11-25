import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Account: React.FC = () => {
    const { user, login, register, resetPassword, logout, loading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [message, setMessage] = useState("");
    const [authLoading, setAuthLoading] = useState(false);

    const handleSubmit = async () => {
        setMessage("");
        setAuthLoading(true);

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
            setAuthLoading(false);
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

    const handleLogout = async () => {
        setMessage("");
        try {
            await logout();
            setMessage("Logged out successfully!");
        } catch (error: any) {
            setMessage("Failed to log out.");
        }
    };

    if (loading) {
        return <p className="text-center text-gray-500">Loading...</p>;
    }

    if (user) {
        return (
            <div className="max-w-md mx-auto p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">My Account</h1>
                <p className="text-gray-700">
                    <strong>Email:</strong> {user.email}
                </p>
                <p className="text-gray-700">
                    <strong>Registration Date:</strong> {user.metadata.creationTime}
                </p>
                <h2 className="text-xl font-bold mt-6 mb-2">Purchase History</h2>
                <ul className="list-disc list-inside text-left mx-auto max-w-xs">
                    <li>Order #123 - $50.00 - Delivered</li>
                    <li>Order #124 - $30.00 - In Progress</li>
                </ul>
                {message && <p className="text-green-500 mt-4">{message}</p>}
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">
                {isRegistering ? "Register" : "Login"}
            </h1>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
            />
            {isRegistering && (
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                />
            )}
            <button
                onClick={handleSubmit}
                className={`w-full p-2 mb-4 rounded ${
                    isRegistering ? "bg-blue-500" : "bg-green-500"
                } text-white hover:bg-opacity-90`}
                disabled={authLoading}
            >
                {authLoading
                    ? isRegistering
                        ? "Registering..."
                        : "Logging in..."
                    : isRegistering
                        ? "Register"
                        : "Login"}
            </button>
            {!isRegistering && (
                <button
                    onClick={handlePasswordReset}
                    className="w-full p-2 mb-4 bg-gray-500 text-white rounded hover:bg-gray-600"
                    disabled={!email || authLoading}
                >
                    Forgot Password?
                </button>
            )}
            <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="w-full p-2 mb-4 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
                {isRegistering ? "Switch to Login" : "Switch to Register"}
            </button>
            {message && <p className="text-red-500 mt-4">{message}</p>}
        </div>
    );
};

export default Account;