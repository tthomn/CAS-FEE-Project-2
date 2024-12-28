import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import Modal from "../shared/Modal";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const CheckoutPage: React.FC = () => {
    const { cartItems, clearCart } = useCart();
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = 5.20;

    const [email, setEmail] = useState("");
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [billingAddress, setBillingAddress] = useState("");
    const [userName, setUserName] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [formError, setFormError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");

    useEffect(() => {
        const fetchUserDetails = async (userId: string) => {
            try {
                const userDoc = doc(db, "users", userId);
                const userSnapshot = await getDoc(userDoc);

                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    setEmail(userData.email || "");
                    setDeliveryAddress(
                        `${userData.street || ""} ${userData.houseNumber || ""}, ${userData.plz || ""} ${userData.city || ""}`
                    );
                    setBillingAddress(
                        `${userData.street || ""} ${userData.houseNumber || ""}, ${userData.plz || ""} ${userData.city || ""}`
                    );
                    setUserName(`${userData.title || ""} ${userData.name || ""} ${userData.surname || ""}`.trim());
                    setName(userData.name || "");
                    setSurname(userData.surname || "");
                } else {
                    console.error("User document does not exist.");
                }
            } catch (error) {
                console.error("Error fetching user details:", error);
            }
        };

        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && user.uid) {
                fetchUserDetails(user.uid);
            }
        });

        return unsubscribe;
    }, []);

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDeliveryAddress(e.target.value);
        setErrors((prev) => ({ ...prev, deliveryAddress: "" }));
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setErrors((prev) => ({ ...prev, email: "" }));
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handleSurnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSurname(e.target.value);
    };

    const toggleEditAddress = () => {
        setIsEditingAddress(!isEditingAddress);
    };

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!email.trim() || !validateEmail(email)) {
            newErrors.email = "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
        }
        if (!deliveryAddress.trim()) {
            newErrors.deliveryAddress = "Die Lieferadresse darf nicht leer sein.";
        }
        if (!name.trim()) {
            newErrors.name = "Vorname darf nicht leer sein.";
        }
        if (!surname.trim()) {
            newErrors.surname = "Nachname darf nicht leer sein.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePlaceOrder = async () => {
        if (validateForm()) {
            setIsLoading(true);
            try {
                const order = {
                    deliveryAddress,
                    billingAddress,
                    email,
                    cartItems,
                    totalPrice: totalPrice + shippingFee,
                    createdAt: new Date().toISOString(),
                    status: "pending",
                };

                await addDoc(collection(db, "orders"), order);

                clearCart();
                setIsModalOpen(true);
            } catch (error) {
                console.error("Error placing order:", error);
                setFormError("Fehler beim Abschließen der Bestellung. Bitte versuchen Sie es erneut.");
            } finally {
                setIsLoading(false);
            }
        } else {
            setFormError("Bitte überprüfen Sie die Eingaben.");
        }
    };

    return (
        <div className="px-4 py-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Versand und Rechnung</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h2 className="text-lg font-bold mb-4">Persönliche Daten</h2>
                    <label className="block mb-4">
                        Vorname:
                        <input
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            className="w-full border p-2 mt-2"
                            placeholder="Vorname eingeben"
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                    </label>
                    <label className="block mb-4">
                        Nachname:
                        <input
                            type="text"
                            value={surname}
                            onChange={handleSurnameChange}
                            className="w-full border p-2 mt-2"
                            placeholder="Nachname eingeben"
                        />
                        {errors.surname && <p className="text-red-500 text-sm">{errors.surname}</p>}
                    </label>
                    <h2 className="text-lg font-bold mb-4">E-Mail-Adresse</h2>
                    <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        className="w-full border p-2 mb-2"
                        placeholder="E-Mail-Adresse eingeben"
                        disabled={isLoading}
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>
                <div>
                    <h2 className="text-lg font-bold mb-4">Zusammenfassung</h2>
                    <ul className="mb-4">
                        {cartItems.map((item) => (
                            <li key={item.id} className="flex justify-between mb-4">
                                <span>
                                    {item.productName} <span className="text-black">({item.quantity} Stück)</span>
                                </span>
                                <span>CHF {item.price.toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between">
                            <span>Zwischensumme</span>
                            <span>CHF {totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Versand</span>
                            <span>CHF {shippingFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>CHF {(totalPrice + shippingFee).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-between mt-6">
                <Link
                    to="/cart"
                    className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                >
                    Zurück zum Warenkorb
                </Link>
                <button
                    className={`px-6 py-2 bg-red-500 text-white rounded ${
                        isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"
                    }`}
                    onClick={handlePlaceOrder}
                    disabled={isLoading}
                >
                    {isLoading ? "Processing..." : "Bestellung abschliessen"}
                </button>
            </div>

            {formError && <p className="mt-2 text-red-500 text-sm">{formError}</p>}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                message="Ihre Bestellung wurde erfolgreich abgeschlossen! Eine Rechnung wurde per E-Mail gesendet."
            />
        </div>
    );
};

export default CheckoutPage;