import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header: React.FC = () => {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="relative bg-[#fff8e1]">
      <header className="relative z-10 mt-4 flex items-center justify-between bg-[#fff8e1] px-5 py-4">
        <div className="flex items-center gap-4">
          {/* Hamburger Menu for Mobile */}
          <button
            className="text-2xl text-gray-800 hover:text-orange-600 sm:hidden"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <i className="fas fa-bars"></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute left-0 top-full w-full rounded bg-white p-4 shadow-md sm:hidden">
            <nav className="flex flex-col gap-4">
              {[
                { to: '/', label: 'Home' },
                { to: '/shop', label: 'Shop' },
                { to: '/recipe', label: 'Recipes' },
                { to: '/account', label: 'Account' },
              ].map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className="text-lg font-medium text-gray-800 hover:text-orange-600"
                  onClick={() => setIsMenuOpen(false)} // Close menu on tab click
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}

        {/* Center Navigation Tabs for Desktop */}
        <nav className="hidden items-center gap-8 sm:flex">
          {[
            { to: '/', label: 'Home' },
            { to: '/shop', label: 'Shop' },
            { to: '/recipe', label: 'Recipes' },
            { to: '/account', label: 'Account' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative text-lg font-medium ${
                  isActive ? 'font-bold text-orange-600' : 'text-gray-800'
                } after:absolute after:bottom-[0px] after:left-0 after:h-[1px] after:w-0 after:bg-orange-600 after:transition-all after:duration-300 after:content-[''] hover:text-orange-600 hover:after:w-full`
              }
            >
              {label}
            </NavLink>
          ))}

          {/* Cart Icon for Desktop */}
          <div
            className="relative hidden items-center sm:flex"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <NavLink
              to="/cart"
              className="relative text-2xl text-gray-800 hover:text-orange-600"
            >
              <i className="fas fa-shopping-basket"></i>
              <span className="absolute right-0 top-0 -translate-y-2 translate-x-2 transform rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                {totalItems > 0 ? totalItems : 0}
              </span>
            </NavLink>
            {isHovered && totalItems === 0 && (
              <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 transform whitespace-nowrap rounded border border-gray-300 bg-white px-3 py-1 text-xs text-gray-800 shadow-md">
                No products in the cart
              </div>
            )}
          </div>
        </nav>

        {/* Cart Icon for Mobile (Aligned Right) */}
        <NavLink
          to="/cart"
          className="absolute relative right-5 text-2xl text-gray-800 hover:text-orange-600 sm:hidden"
        >
          <i className="fas fa-shopping-basket"></i>
          <span className="absolute right-0 top-0 -translate-y-2 translate-x-2 transform rounded-full bg-red-600 px-1 text-xs font-bold text-white">
            {totalItems > 0 ? totalItems : 0}
          </span>
        </NavLink>

        {/* Right Section for Desktop (Search and Contact) */}
        <div className="hidden items-center gap-4 sm:flex">
          <NavLink
            to="/contact"
            className="rounded bg-[#E47D31] px-4 py-2 text-sm text-white transition-colors hover:bg-orange-700"
          >
            Contact Us
          </NavLink>
          <div className="relative">
            <button
              onClick={() => setIsSearchOpen((prev) => !prev)}
              className="text-gray-800 hover:text-orange-600"
            >
              <i className="fas fa-search"></i>
            </button>
            {isSearchOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded border border-gray-300 bg-white p-4 shadow-md">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-800">Search</h4>
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✖
                  </button>
                </div>
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-orange-600 focus:outline-none"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="mt-2 w-full rounded bg-orange-600 py-1 text-sm text-white hover:bg-orange-700"
                  >
                    Search
                  </button>
                </form>
              </div>
            )}
          </div>
          {user && (
            <button
              onClick={handleLogout}
              className="rounded bg-red-500 px-3 py-1 text-base text-white hover:bg-red-700"
            >
              Log out
            </button>
          )}
        </div>
      </header>
    </div>
  );
};

export default Header;
