import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Header: React.FC = () => {
    const { cartItems } = useCart();
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <header className="flex justify-between items-center py-2 px-5 bg-yellow-300 shadow-md">
            <div className="text-2xl font-bold">
                <span role="img" aria-label="bee">🐝</span>
            </div>
            <nav className="flex gap-16">
                <Link to="/" className="text-gray-800 text-lg font-medium hover:text-gray-600">Home</Link>
                <Link to="/shop" className="text-gray-800 text-lg font-medium hover:text-gray-600">Shop</Link>
                <Link to="/recipe" className="text-gray-800 text-lg font-medium hover:text-gray-600">Rezept</Link>
                <Link to="/account" className="text-gray-800 text-lg font-medium hover:text-gray-600">Account</Link>
            </nav>
            <div className="flex items-center gap-4">
                <Link to="/cart" className="relative text-2xl text-gray-800 hover:text-gray-600">
                    <span role="img" aria-label="shopping cart">🛒</span>
                    {totalItems > 0 && (
                        <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1 text-xs font-bold transform translate-x-2 -translate-y-2">
                            {totalItems}
                        </span>
                    )}
                </Link>
                <button className="bg-red-500 text-white px-3 py-1 text-base rounded hover:bg-red-700">
                    Anmelden
                </button>
            </div>
        </header>
    );
};

export default Header;
