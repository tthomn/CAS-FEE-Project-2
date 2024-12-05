import React from "react";
import { useCart } from "../../context/CartContext";

const CheckoutPage: React.FC = () => {
    const { cartItems } = useCart();
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = 5.20; // Example shipping fee

    return (
        <div className="px-4 py-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Versand und Bezahlung</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side */}
                <div>
                    <h2 className="text-lg font-bold mb-4">Lieferadresse</h2>
                    <p>Weltpoststrasse 5, 3015 Bern</p>
                    <button className="text-blue-500 underline mt-2">Edit</button>

                    <h2 className="text-lg font-bold mt-6 mb-4">Zahlungsmethode</h2>
                    <input type="text" placeholder="Kartennummer" className="w-full border p-2 mb-4" />
                    <input type="text" placeholder="Name auf der Karte" className="w-full border p-2 mb-4" />
                    <input type="text" placeholder="MM/YY" className="w-full border p-2 mb-4" />

                    <h2 className="text-lg font-bold mt-6 mb-4">Rechnungsadresse</h2>
                    <div className="space-y-2">
                        <label>
                            <input type="radio" name="billing" defaultChecked /> Gleiche Adresse wie die Lieferadresse
                        </label>
                        <label>
                            <input type="radio" name="billing" /> Verwenden Sie eine andere Rechnungsadresse
                        </label>
                    </div>
                </div>

                {/* Right Side */}
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
            <button className="mt-6 px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                Bestellung abschliessen
            </button>
        </div>
    );
};

export default CheckoutPage;
