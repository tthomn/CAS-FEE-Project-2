import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const Header: React.FC = () => {
    const { totalItems } = useCart();
    const { user, logout } = useAuth();
    const [isHovered, setIsHovered] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = () => {
        console.log("Search query:", searchQuery);
    };

    return (
        <header className="flex justify-between items-center py-2 px-5 shadow-md bg-[#fff8e1]">
            <div className="text-2xl font-bold"></div>
            <nav className="flex gap-12 items-center">
                {[
                    { to: "/", label: "Home" },
                    { to: "/shop", label: "Shop" },
                    { to: "/recipe", label: "Rezepte" },
                    { to: "/account", label: "Account" },
                ].map(({ to, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `relative text-lg font-medium ${
                                isActive ? "text-orange-600 font-bold" : "text-gray-800"
                            } hover:text-orange-600 hover:after:w-full after:content-[''] after:absolute after:left-0 after:bottom-[0px] after:h-[1px] after:bg-orange-600 after:w-0 after:transition-all after:duration-300`
                        }
                    >
                        {label}
                    </NavLink>
                ))}
                {}
                <div
                    className="relative flex items-center"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <NavLink to="/cart" className="relative text-2xl text-gray-800 hover:text-orange-600">
                        <i className="fas fa-shopping-basket"></i> {}
                        <span
                            className={`absolute top-0 right-0 bg-red-600 text-white rounded-full px-1 text-xs font-bold transform translate-x-2 -translate-y-2`}
                        >
                            {totalItems > 0 ? totalItems : 0}
                        </span>
                    </NavLink>
                    {isHovered && totalItems === 0 && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 shadow-md rounded py-1 px-3 text-xs text-gray-800 z-50 whitespace-nowrap">
                            No products in the cart
                        </div>
                    )}
                </div>
            </nav>
            <div className="flex items-center gap-4">
                {}
                <NavLink
                    to="/contact"
                    className="px-4 py-2 bg-[#E47D31] text-white rounded hover:bg-orange-700 transition-colors text-sm"
                >
                    Contact Us
                </NavLink>
                {}
                <div className="relative">
                    <button
                        onClick={() => setIsSearchOpen((prev) => !prev)}
                        className="text-gray-800 hover:text-orange-600"
                    >
                        <i className="fas fa-search"></i> {}
                    </button>
                    {isSearchOpen && (
                        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 shadow-md rounded p-4 z-50 w-64">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-gray-800">Search</h4>
                                <button
                                    onClick={() => setIsSearchOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✖
                                </button>
                            </div>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-orange-600"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                onClick={handleSearch}
                                className="mt-2 w-full bg-orange-600 text-white py-1 rounded hover:bg-orange-700 text-sm"
                            >
                                Search
                            </button>
                        </div>
                    )}
                </div>
                {}
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
