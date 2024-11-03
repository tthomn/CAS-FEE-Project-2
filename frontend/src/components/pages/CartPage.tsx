import React from 'react';
import { useCart } from '../../context/CartContext';
import './CartPage.css';

const CartPage: React.FC = () => {
    const { cartItems, removeFromCart, totalItems } = useCart();
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="cart-page">
            <h1>Your Shopping Cart</h1>
            {totalItems === 0 ? (
                <p className="empty-cart-message">Your cart is currently empty.</p>
            ) : (
                <>
                    <ul className="cart-items">
                        {cartItems.map((item) => (
                            <li key={item.id} className="cart-item">
                                <img src={item.imageUrl} alt={item.productName} className="cart-item-image" />
                                <div className="cart-item-details">
                                    <h4 className="cart-item-name">{item.productName}</h4>
                                    <p className="cart-item-price">CHF {item.price.toFixed(2)}</p>
                                    <p className="cart-item-quantity">Quantity: {item.quantity}</p>
                                    <button
                                        className="remove-button"
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="cart-summary">
                        <h3>Total: CHF {totalPrice.toFixed(2)}</h3>
                        <button className="checkout-button">Proceed to Checkout</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;
