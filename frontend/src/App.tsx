import React from 'react';
import './index.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/pages/HomePage';
import ShopPage from './components/pages/ShopPage';
import ProductDetail from './components/pages/ProductDetail';
import Recipe from './components/pages/Recipe';
import RecipeDetail from './components/pages/RecipeDetail';
import Account from './components/pages/Account';
import Header from './components/layouts/Header';
import CartPage from './components/pages/CartPage';
import { CartProvider } from './context/CartContext';

const App: React.FC = () => {
    return (
        <CartProvider>
            <Router>
                <Header />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/shop/:productId" element={<ProductDetail />} />
                    <Route path="/recipe" element={<Recipe />} />
                    <Route path="/recipe/:id" element={<RecipeDetail />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/cart" element={<CartPage />} /> {}
                </Routes>
            </Router>
        </CartProvider>
    );
};

export default App;
