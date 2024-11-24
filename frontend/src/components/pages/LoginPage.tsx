import React, { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [user, setUser] = useState<{ email: string } | null>(null);

    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser({ email: user.email || "Anonymous" });
            } else {
                setUser(null);
            }
        });
        return unsubscribe;
    }, [auth]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {
            await signInWithEmailAndPassword(auth, email, password);
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            if (error.code === "auth/user-not-found") {
                setErrorMessage("No account found with this email.");
            } else if (error.code === "auth/wrong-password") {
                setErrorMessage("Incorrect password.");
            } else {
                setErrorMessage("An error occurred. Please try again.");
            }
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-6 bg-white shadow-md rounded-lg">
                {!user ? (
                    <>
                        <h1 className="text-2xl font-bold mb-4">Login</h1>
                        <form onSubmit={handleLogin}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                required
                                className="mb-4 p-2 border rounded w-full"
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                                className="mb-4 p-2 border rounded w-full"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full p-2 rounded ${
                                    loading ? "bg-gray-400" : "bg-green-500 text-white"
                                }`}
                            >
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </form>
                        {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
                    </>
                ) : (
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Welcome, {user.email}</h1>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
