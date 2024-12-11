import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import Modal from "../shared/Modal";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import emailjs from "@emailjs/browser";

const CheckoutPage: React.FC = () => {
    const { cartItems, clearCart } = useCart();
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = 5.20;

    const [email, setEmail] = useState("");
    const [deliveryAddress, setDeliveryAddress] = useState("Weltpoststrasse 5, 3015 Bern");
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [billingAddress, setBillingAddress] = useState("Gleiche Adresse wie die Lieferadresse");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [formError, setFormError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDeliveryAddress(e.target.value);
        setErrors((prev) => ({ ...prev, deliveryAddress: "" }));
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setErrors((prev) => ({ ...prev, email: "" }));
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
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const sendInvoiceEmail = async (order: any, orderId: string) => {
        const emailParams = {
            to_name: email,
            to_email: email,
            order_id: orderId,
            delivery_address: order.deliveryAddress,
            billing_address: order.billingAddress,
            total_price: order.totalPrice.toFixed(2),
            items: order.cartItems
                .map(
                    (item: any) =>
                        `${item.productName} (x${item.quantity}): CHF ${(item.price * item.quantity).toFixed(2)}`
                )
                .join("\n"),
        };

        try {
            await emailjs.send(
                "service_ua1imoh",
                "template_qdffusf",
                emailParams,
                "LhmWwd3pEmYkAMNKW"
            );
            console.log("Invoice email sent successfully!");
        } catch (error: any) {
            console.error("Error sending invoice email:", error?.text || error);
            throw new Error("Failed to send email. Please check the logs for details.");
        }
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

                const docRef = await addDoc(collection(db, "orders"), order);

                await sendInvoiceEmail(order, docRef.id);

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

                    <h2 className="text-lg font-bold mb-4">Lieferadresse</h2>
                    {isEditingAddress ? (
                        <div>
                            <input
                                type="text"
                                value={deliveryAddress}
                                onChange={handleAddressChange}
                                className="w-full border p-2 mb-2"
                                placeholder="Lieferadresse eingeben"
                                disabled={isLoading}
                            />
                            {errors.deliveryAddress && (
                                <p className="text-red-500 text-sm">{errors.deliveryAddress}</p>
                            )}
                            <button
                                className="text-blue-500 underline mt-2"
                                onClick={toggleEditAddress}
                                disabled={isLoading}
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
                                disabled={isLoading}
                            >
                                Edit
                            </button>
                        </div>
                    )}
                </div>
                <div>
                    <h2 className="text-lg font-bold mb-4">Zusammenfassung</h2>
                    <ul className="mb-4">
                        {cartItems.map((item) => (
                            <li key={item.id} className="flex justify-between mb-4">
                                <span>{item.productName}</span>
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
            <div>
                <button
                    className={`mt-6 px-6 py-2 bg-red-500 text-white rounded ${
                        isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"
                    }`}
                    onClick={handlePlaceOrder}
                    disabled={isLoading}
                >
                    {isLoading ? "Processing..." : "Bestellung abschliessen"}
                </button>
                {formError && <p className="mt-2 text-red-500 text-sm">{formError}</p>}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                message="Ihre Bestellung wurde erfolgreich abgeschlossen! Eine Rechnung wurde per E-Mail gesendet."
            />
        </div>
    );
};

export default CheckoutPage;
