import React from 'react';
import { useCart } from '../../context/CartContext';

const CartPage: React.FC = () => {
    const { cartItems, removeFromCart, totalItems } = useCart();
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="px-4 py-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Your Shopping Cart</h1>
            {totalItems === 0 ? (
                <p className="text-center text-lg text-gray-600">Your cart is currently empty.</p>
            ) : (
                <>
                    <ul className="list-none space-y-4">
                        {cartItems.map((item) => (
                            <li
                                key={item.id}
                                className="flex items-center p-4 border-b border-gray-200"
                            >
                                <img
                                    src={item.imageUrl}
                                    alt={item.productName}
                                    className="w-16 h-16 object-cover rounded mr-4"
                                />
                                <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-gray-800">{item.productName}</h4>
                                    <p className="text-sm text-gray-600">CHF {item.price.toFixed(2)}</p>
                                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                </div>
                                <button
                                    className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="text-right mt-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Total: CHF {totalPrice.toFixed(2)}</h3>
                        <button className="px-6 py-2 text-white bg-green-500 rounded hover:bg-green-600 transition-colors">
                            Proceed to Checkout
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;
