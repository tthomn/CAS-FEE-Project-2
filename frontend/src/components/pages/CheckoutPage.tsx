import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import Modal from "../shared/Modal";
import {addDocToCollection} from "../../services/firebase/firestoreService";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";


const CheckoutPage: React.FC = () => {
    const { cartItems, clearCart } = useCart();
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = 5.20;

    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [billingAddress, setBillingAddress] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const { authUser } = useAuth(); // Auth context for user email and ID
    const [email, setEmail] = useState(""); // To display the email

    const [isEditing, setIsEditing] = useState(false);
    const [backupData, setBackupData] = useState({ name: "", surname: "", deliveryAddress: "" });
    const navigate = useNavigate();

    // Load saved data on mount
    useEffect(() => {      
        const savedDetails = localStorage.getItem("userDetails");
        if (savedDetails) {
            const { name, surname, deliveryAddress } = JSON.parse(savedDetails);
            setName(name || "");
            setSurname(surname || "");
            setDeliveryAddress(deliveryAddress || "");
        } else if (authUser?.id) {
          
            fetchUserDetails(authUser.id);
        }
    }, [authUser]);

    const fetchUserDetails = async (userId: string) => {
        try {            
            setEmail(authUser?.userName || "Keine E-Mail verfügbar");
            const fullAddress = `${authUser?.street || ""} ${authUser?.houseNumber || ""}, ${authUser?.zip || ""} ${authUser?.city || ""}`;
            setDeliveryAddress(fullAddress);
            setBillingAddress(fullAddress);
            setName(authUser?.name || "");
            setSurname(authUser?.surname || "");
            localStorage.setItem("userDetails", JSON.stringify({ name: authUser?.name, surname: authUser?.surname, deliveryAddress: fullAddress }));
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
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
        console.log("Email parameters being sent to EmailJS:", JSON.stringify(emailParams, null, 2));
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
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const order = {
                deliveryAddress,
                billingAddress: billingAddress || deliveryAddress,
                email: authUser?.userName,
                name,
                surname,
                cartItems,
                totalPrice: totalPrice + shippingFee,
                createdAt: new Date().toISOString(),
                status: "pending",
                userId: authUser?.id || "guest",
            };

            
            const docRef = await addDocToCollection("orders", order);
            await sendInvoiceEmail(order, docRef);

            await clearCart();
            localStorage.removeItem("userDetails");

            setIsModalOpen(true);
        } catch (error) {
            console.error("Error placing order:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveDetails = () => {
        localStorage.setItem("userDetails", JSON.stringify({ name, surname, deliveryAddress }));
        alert("Daten wurden erfolgreich gespeichert!");
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setName(backupData.name);
        setSurname(backupData.surname);
        setDeliveryAddress(backupData.deliveryAddress);
        setIsEditing(false);
    };

    return (
        <div className="px-4 py-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Shipping and invoice</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h2 className="text-lg font-bold mb-4">Personal Data</h2>
                    <div className="block mb-4">
                        <strong>First name:</strong>
                        {!isEditing ? (
                            <p>{name || "Not specified"}</p>
                        ) : (
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border p-2 mt-2 rounded"
                                placeholder="Vorname eingeben"
                            />
                        )}
                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                    </div>
                    <div className="block mb-4">
                        <strong>Last name:</strong>
                        {!isEditing ? (
                            <p>{surname || "Not specified"}</p>
                        ) : (
                            <input
                                type="text"
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                                className="w-full border p-2 mt-2 rounded"
                                placeholder="Nachname eingeben"
                            />
                        )}
                        {errors.surname && <p className="text-red-500 text-sm">{errors.surname}</p>}
                    </div>
                    {/*<div className="block mb-4">*/}
                    {/*    <strong>E-Mail-Adresse:</strong>*/}
                    {/*    <p>{email || "Keine E-Mail verfügbar"}</p>*/}
                    {/*</div>*/}
                    <div className="block mb-4">
                        <strong>Delivery address:</strong>
                        {!isEditing ? (
                            <p>{deliveryAddress || "Keine Angabe"}</p>
                        ) : (
                            <input
                                type="text"
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                className="w-full border p-2 mt-2 rounded"
                                placeholder="Lieferadresse eingeben"
                            />
                        )}
                        {errors.deliveryAddress && <p className="text-red-500 text-sm">{errors.deliveryAddress}</p>}
                    </div>
                    <div className="flex gap-4 mt-4">
                        {!isEditing ? (
                            <button
                                onClick={() => {
                                    setBackupData({ name, surname, deliveryAddress });
                                    setIsEditing(true);
                                }}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                            Edit data
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleSaveDetails}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    Speichern
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Abbrechen
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <div>
                    <h2 className="text-lg font-bold mb-4">Summary</h2>
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
                            <span>Cost without shipping</span>
                            <span>CHF {totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipment</span>
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
                Back to the shopping cart
                </Link>
                <button
                    className={`px-6 py-2 bg-red-500 text-white rounded ${
                        isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"
                    }`}
                    onClick={handlePlaceOrder}
                    disabled={isLoading}
                >
                    {isLoading ? "Processing..." : "Complete order"}
                </button>
            </div>

            {isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        navigate("/shop");
                    }}
                    message="Ihre Bestellung wurde erfolgreich abgeschlossen! Eine Rechnung wurde per E-Mail gesendet."
                />
            )}
        </div>
    );
};

export default CheckoutPage;
