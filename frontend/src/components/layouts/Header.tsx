import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
    return (
        <header className="navbar">
            <div className="navbar-logo">
                <span>🐝</span>
            </div>
            <nav className="navbar-links">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/shop" className="nav-link">Shop</Link>
                <Link to="/recipe" className="nav-link">Rezept</Link>
                <Link to="/account" className="nav-link">Account</Link>
            </nav>
            <div className="navbar-login">
                <button className="login-button">Anmelden</button>
            </div>
        </header>
    );
};

export default Header;
