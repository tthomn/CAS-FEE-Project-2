import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import Modal from "../shared/Modal";

const CheckoutPage: React.FC = () => {
    const { cartItems, clearCart } = useCart();
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = 5.20;

    const [deliveryAddress, setDeliveryAddress] = useState("Weltpoststrasse 5, 3015 Bern");
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: "",
        cardName: "",
        cardExpiry: "",
    });
    const [billingAddress, setBillingAddress] = useState("Gleiche Adresse wie die Lieferadresse");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [formError, setFormError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDeliveryAddress(e.target.value);
        setErrors((prev) => ({ ...prev, deliveryAddress: "" }));
    };

    const handlePaymentDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPaymentDetails((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const toggleEditAddress = () => {
        setIsEditingAddress(!isEditingAddress);
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!deliveryAddress.trim()) newErrors.deliveryAddress = "Die Lieferadresse darf nicht leer sein.";
        if (!paymentDetails.cardNumber.trim()) newErrors.cardNumber = "Kartennummer ist erforderlich.";
        if (!paymentDetails.cardName.trim()) newErrors.cardName = "Name auf der Karte ist erforderlich.";
        if (!paymentDetails.cardExpiry.trim()) newErrors.cardExpiry = "Gültigkeitsdatum ist erforderlich.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePlaceOrder = () => {
        if (validateForm()) {
            clearCart();
            setFormError("");
            setIsModalOpen(true);
        } else {
            setFormError("Bitte überprüfen Sie die Eingaben.");
        }
    };

    return (
        <div className="px-4 py-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Versand und Bezahlung</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h2 className="text-lg font-bold mb-4">Lieferadresse</h2>
                    {isEditingAddress ? (
                        <div>
                            <input
                                type="text"
                                value={deliveryAddress}
                                onChange={handleAddressChange}
                                className="w-full border p-2 mb-2"
                                placeholder="Lieferadresse eingeben"
                            />
                            {errors.deliveryAddress && (
                                <p className="text-red-500 text-sm">{errors.deliveryAddress}</p>
                            )}
                            <button
                                className="text-blue-500 underline mt-2"
                                onClick={toggleEditAddress}
                            >
                                Save
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p>{deliveryAddress}</p>
                            <button
                                className="text-blue-500 underline mt-2"
                                onClick={toggleEditAddress}
                            >
                                Edit
                            </button>
                        </div>
                    )}

                    <h2 className="text-lg font-bold mt-6 mb-4">Zahlungsmethode</h2>
                    <input
                        type="text"
                        name="cardNumber"
                        placeholder="Kartennummer"
                        className="w-full border p-2 mb-2"
                        value={paymentDetails.cardNumber}
                        onChange={handlePaymentDetailsChange}
                    />
                    {errors.cardNumber && <p className="text-red-500 text-sm">{errors.cardNumber}</p>}
                    <input
                        type="text"
                        name="cardName"
                        placeholder="Name auf der Karte"
                        className="w-full border p-2 mb-2"
                        value={paymentDetails.cardName}
                        onChange={handlePaymentDetailsChange}
                    />
                    {errors.cardName && <p className="text-red-500 text-sm">{errors.cardName}</p>}
                    <input
                        type="text"
                        name="cardExpiry"
                        placeholder="MM/YY"
                        className="w-full border p-2 mb-2"
                        value={paymentDetails.cardExpiry}
                        onChange={handlePaymentDetailsChange}
                    />
                    {errors.cardExpiry && <p className="text-red-500 text-sm">{errors.cardExpiry}</p>}

                    <h2 className="text-lg font-bold mt-6 mb-4">Rechnungsadresse</h2>
                    <div className="space-y-4">
                        <label className="block border border-gray-300 rounded-md p-4 cursor-pointer hover:shadow-md">
                            <input
                                type="radio"
                                name="billing"
                                className="mr-2"
                                checked={billingAddress === "Gleiche Adresse wie die Lieferadresse"}
                                onChange={() => setBillingAddress("Gleiche Adresse wie die Lieferadresse")}
                            />
                            <span>Gleiche Adresse wie die Lieferadresse</span>
                        </label>
                        <label className="block border border-gray-300 rounded-md p-4 cursor-pointer hover:shadow-md">
                            <input
                                type="radio"
                                name="billing"
                                className="mr-2"
                                checked={billingAddress === "Verwenden Sie eine andere Rechnungsadresse"}
                                onChange={() => setBillingAddress("Verwenden Sie eine andere Rechnungsadresse")}
                            />
                            <span>Verwenden Sie eine andere Rechnungsadresse</span>
                        </label>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-bold mb-4">Zusammenfassung</h2>
                    <ul className="mb-4">
                        {cartItems.map((item) => (
                            <li key={item.id} className="flex justify-between mb-2">
                                <span>{item.productName}</span>
                                <span>CHF {item.price.toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
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
            <div>
                <button
                    className="mt-6 px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={handlePlaceOrder}
                >
                    Bestellung abschließen
                </button>
                {formError && (
                    <p className="mt-2 text-red-500 text-sm">{formError}</p>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                message="Ihre Bestellung wurde erfolgreich abgeschlossen! Vielen Dank."
            />
        </div>
    );
};

export default CheckoutPage;
