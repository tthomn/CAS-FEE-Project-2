import React from "react";
import { NavLink } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const Header: React.FC = () => {
    const { totalItems } = useCart();
    const { user, logout } = useAuth();

    return (
        <header className="flex justify-between items-center py-2 px-5 shadow-md" style={{ backgroundColor: "#fff8e1" }}>
            <div className="text-2xl font-bold">Honey Shop</div>
            <nav className="flex gap-16">
                {[
                    { to: "/", label: "Home" },
                    { to: "/shop", label: "Shop" },
                    { to: "/recipe", label: "Rezept" },
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
            </nav>
            <div className="flex items-center gap-4">
                <NavLink to="/cart" className="relative text-2xl text-gray-800 hover:text-gray-600">
                    🛒
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
