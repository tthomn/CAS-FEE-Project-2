import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import CountryDropdown from "../shared/CountryDropdown";
import { useCart } from "../../context/CartContext";

const Account: React.FC = () => {
    const { user, login, register, resetPassword, logout, loading } = useAuth();
    const [formData, setFormData] = useState<{
        email: string;
        password: string;
        confirmPassword: string;
        title: string;
        name: string;
        surname: string;
        dob: string;
        street: string;
        houseNumber: string;
        plz: string;
        city: string;
        country: string | { value: string; label: string };
    }>({
        email: "",
        password: "",
        confirmPassword: "",
        title: "",
        name: "",
        surname: "",
        dob: "",
        street: "",
        houseNumber: "",
        plz: "",
        city: "",
        country: "",
    });

    const [isRegistering, setIsRegistering] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [authLoading, setAuthLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { cartCleaner } = useCart();

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        setMessage("");
        setAuthLoading(true);

        try {
            if (isRegistering) {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error("Passwords do not match.");
                }
                const countryName =
                    typeof formData.country === "string"
                        ? formData.country
                        : formData.country?.label || "";

                await register(formData.email, formData.password, {
                    title: formData.title,
                    name: formData.name,
                    surname: formData.surname,
                    dob: formData.dob,
                    street: formData.street,
                    houseNumber: formData.houseNumber,
                    plz: formData.plz,
                    city: formData.city,
                    country: countryName,
                });

                setMessage("Registration successful! Please verify your email.");
            } else {
                await login(formData.email, formData.password);
                await cartCleaner();
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
            await resetPassword(formData.email);
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
        <div className="relative mb-6">
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
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                        />
                        <button
                            onClick={handlePasswordReset}
                            className={`w-full p-2 mb-4 rounded bg-blue-500 text-white hover:bg-blue-600 ${
                                authLoading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={authLoading || !formData.email.trim()}
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
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                        />
                        <div className="relative mb-4">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-yellow-500 pr-10"
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center justify-center cursor-pointer text-gray-500"
                            >
                                {showPassword ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.34 1.36-1.02 2.623-1.92 3.682m-2.11 2.372A9.963 9.963 0 0112 19c-4.477 0-8.268-2.943-9.542-7-.34-1.36-1.02-2.623-1.92-3.682"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3.98 8.29A10.024 10.024 0 0112 5c4.478 0 8.269 2.943 9.543 7-.34 1.361-1.02 2.624-1.92 3.682m-2.11 2.373A9.963 9.963 0 0112 19c-4.478 0-8.269-2.943-9.543-7a10.054 10.054 0 012.02-3.71m1.42-1.42l13.75 13.75"
                                        />
                                    </svg>
                                )}
                            </span>
                        </div>
                        {isRegistering && (
                            <>
                                <div className="relative mb-4">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm Password"
                                        value={formData.confirmPassword}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                                        }
                                        className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-yellow-500 pr-10"
                                    />
                                    <span
                                        onClick={() =>
                                            setShowConfirmPassword(!showConfirmPassword)
                                        }
                                        className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
                                    >
                {showConfirmPassword ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.34 1.36-1.02 2.623-1.92 3.682m-2.11 2.372A9.963 9.963 0 0112 19c-4.477 0-8.268-2.943-9.542-7-.34-1.36-1.02-2.623-1.92-3.682"
                        />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.29A10.024 10.024 0 0112 5c4.478 0 8.269 2.943 9.543 7-.34 1.361-1.02 2.624-1.92 3.682m-2.11 2.373A9.963 9.963 0 0112 19c-4.478 0-8.269-2.943-9.543-7a10.054 10.054 0 012.02-3.71m1.42-1.42l13.75 13.75"
                        />
                    </svg>

                )}
            </span>
                                </div>
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                                    />
                                </div>
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        name="surname"
                                        placeholder="Surname"
                                        value={formData.surname}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                                    />
                                </div>
                            </>
                        )}
                        {isRegistering && (
                            <>
                                <div className="mb-4 text-left">
                                    <label className="block mb-2 font-bold">Anrede</label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="title"
                                                value="Herr"
                                                checked={formData.title === "Herr"}
                                                onChange={handleInputChange}
                                                className="mr-2"
                                            />
                                            Herr
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="title"
                                                value="Frau"
                                                checked={formData.title === "Frau"}
                                                onChange={handleInputChange}
                                                className="mr-2"
                                            />
                                            Frau
                                        </label>
                                    </div>
                                </div>
                                {/* Street */}
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        name="street"
                                        placeholder="Street"
                                        value={formData.street}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                                    />
                                </div>
                                {/* House Number */}
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        name="houseNumber"
                                        placeholder="House Number"
                                        value={formData.houseNumber}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                                    />
                                </div>
                                {/* Postal Code */}
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        name="plz"
                                        placeholder="Postal Code (PLZ)"
                                        value={formData.plz}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                                    />
                                </div>
                                {/* City */}
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="City"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                                    />
                                </div>
                                <div className="mb-4">
                                    <CountryDropdown
                                        value={
                                            typeof formData.country === "object" && formData.country !== null
                                                ? formData.country
                                                : { value: "", label: "Select Country" }
                                        }
                                        onChange={(selectedOption) =>
                                            setFormData((prevData) => ({
                                                ...prevData,
                                                country: selectedOption ?? { value: "", label: "Select Country" },
                                            }))
                                        }
                                    />
                                </div>
                            </>
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
                            <div className="mt-4">
                                <button
                                    onClick={() => setIsForgotPassword(true)}
                                    className="text-blue-600 hover:underline text-sm bg-transparent border-none cursor-pointer"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}
                        <div className="mt-4">
                            <button
                                onClick={() => {
                                    setIsRegistering(!isRegistering);
                                    setFormData({
                                        email: "",
                                        password: "",
                                        confirmPassword: "",
                                        title: "",
                                        name: "",
                                        surname: "",
                                        dob: "",
                                        street: "",
                                        houseNumber: "",
                                        plz: "",
                                        city: "",
                                        country: "",
                                    });
                                }}
                                className="text-blue-600 hover:underline text-sm bg-transparent border-none cursor-pointer"
                            >
                                {isRegistering ? "← Back to Login" : "Switch to Register"}
                            </button>
                        </div>
                        {message && <p className="text-red-500 mt-4">{message}</p>}
                    </>
                )}
            </div>
        </div>
    );
};

export default Account;