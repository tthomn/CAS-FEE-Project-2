import React, { useState, useEffect } from "react";

interface CheckoutFormProps {
    onCheckout: (email: string, address: string) => void;
    loggedInEmail?: string | null;
}


const CheckoutForm: React.FC<CheckoutFormProps> = ({ onCheckout, loggedInEmail }) => {
    const [email, setEmail] = useState(loggedInEmail || "");
    const [address, setAddress] = useState("");
    const [errors, setErrors] = useState<{ email?: string; address?: string }>({});

    useEffect(() => {
        if (loggedInEmail) {
            setEmail(loggedInEmail);
        }
    }, [loggedInEmail]);

    const validateForm = () => {
        const newErrors: { email?: string; address?: string } = {};
        if (!email.trim()) newErrors.email = "Email address is required.";
        if (!address.trim()) newErrors.address = "Shipping address is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onCheckout(email, address);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="checkout-form">
            <h2 className="text-xl font-bold mb-4">Checkout</h2>

            {!loggedInEmail && (
                <label className="block mb-4">
                    Email Address:
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full border p-2 mt-2"
                        required
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </label>
            )}

            <label className="block mb-4">
                Shipping Address:
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your address"
                    className="w-full border p-2 mt-2"
                    required
                />
                {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
            </label>

            <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Place Order
            </button>
        </form>
    );
};

export default CheckoutForm;
