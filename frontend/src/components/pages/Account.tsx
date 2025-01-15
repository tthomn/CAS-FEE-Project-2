import React, {useEffect, useState} from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import CountryDropdown from "../shared/CountryDropdown";
import { useCart } from "../../context/CartContext";
import { getDocDataBy1Condition } from "../../services/firebase/firestoreService";
import UserInfo from "../shared/UserInfo";
import OrdersList from "../shared/OrdersList";
import {Order} from "../../types/order";
import Footer from "../layouts/Footer";



const Account: React.FC = () => {
    const {  user, login, register, resetPassword, logout, loading } = useAuth();
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
        zip: string;
        city: string;
        country: string | { value: string; label: string };
        authType: string;
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
        zip: "",
        city: "",
        country: "",
        authType: "user",
    });

    const [isRegistering, setIsRegistering] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [authLoading, setAuthLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { cartCleaner } = useCart();
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [showOrders, setShowOrders] = useState(false);



    const { isAuthenticated, authUser} = useAuth();

    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState<string | null>(null);
    const [showSidebar, setShowSidebar] = useState(false);


    useEffect(() => {
        const fetchOrders = async () => {
            if (!user?.uid) return;
            setOrdersLoading(true);
            try {
                const fetchedOrders = await getDocDataBy1Condition<Order>("orders", "userId", "==", user.uid);
                setOrders(fetchedOrders);
            } catch (error: any) {
                setOrdersError("Failed to fetch orders: " + error.message);
            } finally {
                setOrdersLoading(false);
            }
        };

        fetchOrders();
    }, [user?.uid]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        const isRequired = (value: string, fieldName: string) =>
            value.trim() ? "" : `${fieldName} is required`;

        const emailError = isRequired(formData.email, "Email") ||
            (!formData.email.includes("@") ? "Invalid email address" : "");
        if (emailError) newErrors.email = emailError;

        const passwordError = isRequired(formData.password, "Password");
        if (passwordError) newErrors.password = passwordError;

        if (isRegistering) {
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            }

            ["name", "surname", "street", "houseNumber", "zip", "city"].forEach((field) => {
                const fieldValue = (formData as any)[field];
                const fieldError = isRequired(fieldValue, field.charAt(0).toUpperCase() + field.slice(1));
                if (fieldError) newErrors[field] = fieldError;
            });

            if (!formData.country || formData.country === "") {
                newErrors.country = "Country is required";
            }
        }

        console.log("Validation errors full object:", newErrors);

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        setMessage("");
        setAuthLoading(true);

        const isValid = validateForm();
        console.log("Validation status:", isValid);

        if (!isValid) {
            setAuthLoading(false);
            return;
        }
        try {
            if (isRegistering) {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error("Passwords do not match");
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
                    zip: formData.zip,
                    city: formData.city,
                    country: countryName,
                    authType: formData.authType,
                    addedAt: new Date(),
                });

                setMessage("Registration successful! Please verify your email.");
            } else {

                await login(formData.email, formData.password);
                await cartCleaner();
                setMessage("Login successful!");
            }
        } catch (error: any) {
            setMessage(error.message || "An unknown error occurred");
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
            setMessage(error.message || "An unknown error occurred");
        }
    };

    const handleLogout = async () => {
        setMessage("");
        try {
            await logout();
            localStorage.removeItem("userDetails");
            setMessage("Logged out successfully!");
        } catch (error: any) {
            setMessage("Failed to log out.");
        }
    };

    if (loading) {
        return <p className="text-center text-gray-500">Loading...</p>;
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#fff8e1]">
        {/* Banner Section */}
            <div className="relative">
                <img
                    src="/images/banner_account.png"
                    alt="Account Banner"
                    className="w-full h-40 sm:h-64 object-cover"
                    loading="eager"
                />
                <h1 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl sm:text-4xl font-bold">
                    My Account
                </h1>
            </div>

            <button
                className="sm:hidden p-2 bg-yellow-500 text-white rounded"
                onClick={() => setShowSidebar(!showSidebar)}
            >
                {showSidebar ? "Close Menu" : "Menu"}
            </button>

            <main className="flex-grow">
                <div className="flex flex-col sm:flex-row max-w-full sm:max-w-6xl mx-auto">
                {/* Sidebar */}
                    {user && (
                        <div
                            className={`${
                                showSidebar ? "block" : "hidden"
                            } sm:block w-full sm:w-1/4 p-4 border-r border-gray-300`}
                        >
                            <h2 className="text-center sm:text-left text-xl font-semibold mb-6 text-gray-800">Account</h2>
                            <ul className="space-y-4 text-center sm:text-left">
                                <li
                                    className={`cursor-pointer ${!showOrders ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-500"}`}
                                    onClick={() => setShowOrders(false)}
                                >
                                    Profile
                                </li>
                                <li
                                    className={`cursor-pointer ${showOrders ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-500"}`}
                                    onClick={() => setShowOrders(true)}
                                >
                                    Orders
                                </li>
                                {authUser?.authType === "admin" && (
                                    <li className="cursor-pointer text-gray-600 hover:text-blue-500">
                                        <Link to="/admin" className="block">
                                            Admin Page
                                        </Link>
                                    </li>
                                )}
                                <li
                                    className="text-gray-600 cursor-pointer hover:text-blue-500"
                                    onClick={handleLogout}
                                >
                                    Log Out
                                </li>
                            </ul>
                        </div>
                    )}

                    {/* Login/Account Content */}
                    <div className={`flex-1 ${user ? "p-4 sm:p-6" : ""}`}>
                        <div className={`mx-auto ${user ? "max-w-full p-4 sm:p-6" : "max-w-md p-4"} text-center`}>
                        {isForgotPassword ? (
                            <>
                                <h2 className="text-xl font-bold mb-4">Restore Password</h2>
                                <div className="mb-4">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                                    />
                                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

                                </div>

                                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

                                <button
                                    onClick={handlePasswordReset}
                                    className={`w-full p-2 sm:p-3 mb-4 rounded bg-blue-500 text-white hover:bg-blue-600 ${
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
                                    className="w-full p-2 sm:p-3 mb-4 rounded bg-gray-500 text-white hover:bg-gray-600"
                                >
                                    Back to Login
                                </button>
                                {message && <p className="text-green-500 mt-4">{message}</p>}
                            </>
                        ) : user ? (
                            <div className="w-full px-12 py-4 -mt-8">
                            <>
                                </>

                                {showOrders ? (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-4 mt-0">My Orders</h2>
                                        <OrdersList
                                            orders={orders}
                                            loading={ordersLoading}
                                            error={ordersError}
                                        />
                                        <button
                                            onClick={() => setShowOrders(false)}
                                            className="mt-4 text-blue-500 hover:underline"
                                        >
                                            Back to Profile
                                        </button>

                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-8">My Information</h2>
                                        <div className="rounded-lg shadow-md bg-white w-full sm:w-[90%] lg:w-[85%] mx-auto overflow-x-auto p-4 sm:p-6">
                                            <div className="break-words w-full">
                                                <UserInfo
                                                    authUser={authUser}
                                                    userEmail={authUser?.userName || "No email available"}
                                                    loading={loading}
                                                    onLogout={handleLogout}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowOrders(true)}
                                            className="mt-4 text-blue-500 hover:underline"
                                        >
                                            View My Orders
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <h1 className="text-2xl font-bold mb-4">
                                    {isRegistering ? "Register" : "Login"}
                                </h1>
                                <div className="mb-4 px-4 sm:px-0">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-yellow-500"
                                    />
                                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                                </div>


                                <div className="relative mb-4">
                                    <div className="mb-4">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="Password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-yellow-500 pr-10"
                                        />
                                        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

                                    </div>

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
                                            <div className="mb-4">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    placeholder="Name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                                                />
                                                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                                            </div>

                                        </div>
                                        <div className="mb-4">
                                            <div className="mb-4">
                                                <input
                                                    type="text"
                                                    name="surname"
                                                    placeholder="Surname"
                                                    value={formData.surname}
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                                                />
                                                {errors.surname && <p className="text-red-500 text-sm">{errors.surname}</p>}
                                            </div>

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
                                        <div className="mb-4">
                                            <div className="mb-4">
                                                <input
                                                    type="text"
                                                    name="street"
                                                    placeholder="Street"
                                                    value={formData.street}
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                                                />
                                                {errors.street && <p className="text-red-500 text-sm">{errors.street}</p>}
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <div className="mb-4">
                                                <input
                                                    type="text"
                                                    name="houseNumber"
                                                    placeholder="House Number"
                                                    value={formData.houseNumber}
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                                                />
                                                {errors.houseNumber && <p className="text-red-500 text-sm">{errors.houseNumber}</p>}
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <input
                                                type="text"
                                                name="zip"
                                                placeholder="Postal Code (ZIP)"
                                                value={formData.zip}
                                                onChange={handleInputChange}
                                                className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                                            />
                                            {errors.zip && <p className="text-red-500 text-sm">{errors.zip}</p>}
                                        </div>
                                        <div className="mb-4">
                                            <input
                                                type="text"
                                                name="city"
                                                placeholder="City"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                className="w-full p-2 mb-2 border rounded focus:outline-none focus:ring focus:ring-yellow-500"
                                            />
                                            {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
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
                                    className={`w-full p-2 sm:p-3 mb-4 rounded ${
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
                                            setErrors({});
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
                                                zip: "",
                                                city: "",
                                                country: "",
                                                authType: "user",
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
            </div>
            </main>
            <Footer />
        </div>
    );
};

export default Account;