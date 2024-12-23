import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import CountryDropdown from "../shared/CountryDropdown";
//import { cartCleaner } from "../../context/CartContext";
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

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };


    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { cartCleaner } = useCart();


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
                
                await login(email, password);
                
                //This function is called which will be used to update the cart items in the backend

                //Create promise of cartCleaner function and wait for it to finish
                await cartCleaner();

             //  await cartCleaner(); 
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
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                        />
                        {isRegistering && (
                            <>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                                />
                                <hr className="my-4" />
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
                                <input
                                    type="text"
                                    name="street"
                                    placeholder="Street"
                                    value={formData.street}
                                    onChange={handleInputChange}
                                    className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                                />
                                <input
                                    type="text"
                                    name="houseNumber"
                                    placeholder="House Number"
                                    value={formData.houseNumber}
                                    onChange={handleInputChange}
                                    className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                                />
                                <input
                                    type="text"
                                    name="plz"
                                    placeholder="PLZ"
                                    value={formData.plz}
                                    onChange={handleInputChange}
                                    className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                                />
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                                />
                                <div className="flex items-center gap-4 w-full">
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
