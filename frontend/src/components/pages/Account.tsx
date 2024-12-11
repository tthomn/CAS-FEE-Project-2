import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Account: React.FC = () => {
    const { user, login, register, resetPassword, logout, loading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
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

    return (
        <div className="relative">
            <div className="relative">
                <img
                    src="/images/banner_account.png"
                    alt="Account Banner"
                    className="w-full h-64 object-cover"
                />
                <h1 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-4xl font-bold">
                    My Account
                </h1>
            </div>

            <div className="max-w-md mx-auto p-6 text-center">
                {isForgotPassword ? (
                    <>
                        <h2 className="text-xl font-bold mb-4">Restore Password</h2>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                        />
                        <button
                            onClick={handlePasswordReset}
                            className={`w-full p-2 mb-4 rounded bg-blue-500 text-white hover:bg-blue-600 ${
                                authLoading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={authLoading || !email.trim()}
                        >
                            {authLoading ? "Sending..." : "Restore My Password"}
                        </button>
                        <button
                            onClick={() => {
                                setIsForgotPassword(false);
                                setMessage("");
                            }}
                            className="w-full p-2 mb-4 rounded bg-gray-500 text-white hover:bg-gray-600"
                        >
                            Back to Login
                        </button>
                        {message && <p className="text-green-500 mt-4">{message}</p>}
                    </>
                ) : user ? (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
                        <p className="text-gray-700">
                            <strong>Email:</strong> {user.email}
                        </p>
                        <button
                            onClick={handleLogout}
                            className="mt-4 w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
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
                        {!isForgotPassword && (
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                            />
                        )}
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
                                onClick={() => setIsForgotPassword(true)}
                                className="w-full p-2 mb-4 bg-gray-500 text-white rounded hover:bg-gray-600"
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
                    </>
                )}
            </div>
        </div>
    );
};

export default Account;
