import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        address: "",
        zip: "",
        city: "",
        email: "",
        password: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const auth = getAuth();
    const db = getFirestore();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                name: formData.name,
                surname: formData.surname,
                address: formData.address,
                zip: formData.zip,
                city: formData.city,
                email: formData.email,
            });

            setSuccessMessage("Registration successful! Please verify your email.");
        } catch (error: any) {
            setErrorMessage("An error occurred during registration. Please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-2xl p-8 bg-white shadow-md rounded-md">
                <h1 className="text-3xl font-bold text-center mb-6">Create Your Account</h1>
                <form onSubmit={handleRegister} className="space-y-6">
                    {/* Personal Information Section */}
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Personal Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 p-2 border border-gray-300 rounded w-full"
                                />
                            </div>
                            <div>
                                <label htmlFor="surname" className="block text-sm font-medium text-gray-700">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    id="surname"
                                    name="surname"
                                    value={formData.surname}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 p-2 border border-gray-300 rounded w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Address</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                    Street Address
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 p-2 border border-gray-300 rounded w-full"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
                                        ZIP Code
                                    </label>
                                    <input
                                        type="text"
                                        id="zip"
                                        name="zip"
                                        value={formData.zip}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 p-2 border border-gray-300 rounded w-full"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 p-2 border border-gray-300 rounded w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">Login Credentials</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 p-2 border border-gray-300 rounded w-full"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 p-2 border border-gray-300 rounded w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Section */}
                    <div className="text-center">
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
                        >
                            Register
                        </button>
                        {successMessage && <p className="text-green-600 mt-4">{successMessage}</p>}
                        {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
