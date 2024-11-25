import React from "react";
import { NavLink } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const Header: React.FC = () => {
    const { totalItems } = useCart();
    const { user, logout } = useAuth();

    return (
        <header
            className="flex justify-between items-center py-2 px-5 shadow-md"
            style={{ backgroundColor: "#fff8e1" }}
        >
            {/* Logo */}
            <div className="text-2xl font-bold">
            </div>
            <nav className="flex gap-16">
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `text-lg font-medium hover:text-gray-600 ${
                            isActive ? "text-black font-bold" : "text-gray-800"
                        }`
                    }
                >
                    Home
                </NavLink>
                <NavLink
                    to="/shop"
                    className={({ isActive }) =>
                        `text-lg font-medium hover:text-gray-600 ${
                            isActive ? "text-black font-bold" : "text-gray-800"
                        }`
                    }
                >
                    Shop
                </NavLink>
                <NavLink
                    to="/recipe"
                    className={({ isActive }) =>
                        `text-lg font-medium hover:text-gray-600 ${
                            isActive ? "text-black font-bold" : "text-gray-800"
                        }`
                    }
                >
                    Rezept
                </NavLink>
                <NavLink
                    to="/account"
                    className={({ isActive }) =>
                        `text-lg font-medium hover:text-gray-600 ${
                            isActive ? "text-black font-bold" : "text-gray-800"
                        }`
                    }
                >
                    Account
                </NavLink>
            </nav>

            <div className="flex items-center gap-4">
                <NavLink
                    to="/cart"
                    className="relative text-2xl text-gray-800 hover:text-gray-600"
                >
                    <span role="img" aria-label="shopping cart">
                        🛒
                    </span>
                    {totalItems > 0 && (
                        <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1 text-xs font-bold transform translate-x-2 -translate-y-2">
                            {totalItems}
                        </span>
                    )}
                </NavLink>
                {user && (
                    <button
                        onClick={logout}
                        className="bg-red-500 text-white px-3 py-1 text-base rounded hover:bg-red-700"
                    >
                        Abmelden
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
