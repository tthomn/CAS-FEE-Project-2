import React from "react";
import "./index.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./components/pages/HomePage";
import ShopPage from "./app/shop/ShopPage";
import ProductDetail from "./components/pages/ProductDetail";
import Recipe from "./components/pages/Recipe";
import RecipeDetail from "./components/pages/RecipeDetail";
import Account from "./components/pages/Account";
import Header from "./components/layouts/Header";
import CartPage from "./components/pages/CartPage";
import NotFoundPage from "./components/pages/NotFoundPage";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import FlyingBees from "./components/layouts/FlyingBees";

const App: React.FC = () => {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <div className="relative min-h-screen">
                        <Header />
                        <Routes>
                            {}
                            <Route path="/" element={<><FlyingBees /><HomePage /></>} />
                            <Route path="/shop" element={<ShopPage />} />
                            <Route path="/shop/:productId" element={<ProductDetail />} />
                            <Route path="/recipe" element={<Recipe />} />
                            <Route path="/recipe/:id" element={<RecipeDetail />} />
                            <Route path="/account" element={<Account />} />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </div>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
};

export default App;
