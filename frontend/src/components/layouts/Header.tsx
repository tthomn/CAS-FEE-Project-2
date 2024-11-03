import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Header.css';

const Header: React.FC = () => {
    const { cartItems } = useCart();
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <header className="navbar">
            <div className="navbar-logo">
                <div className="navbar-logo">
                    <span role="img" aria-label="bee">🐝</span>
                </div>
            </div>
            <nav className="navbar-links">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/shop" className="nav-link">Shop</Link>
                <Link to="/recipe" className="nav-link">Rezept</Link>
                <Link to="/account" className="nav-link">Account</Link>
            </nav>
            <div className="navbar-actions">
                <Link to="/cart" className="cart-icon">
                    <span role="img" aria-label="shopping cart">🛒</span>
                    {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
                </Link>
                <button className="login-button">Anmelden</button>
            </div>
        </header>
    );
};

export default Header;
