import React, { useState } from "react";
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
import CheckoutPage from "./components/pages/CheckoutPage";
import NotFoundPage from "./components/pages/NotFoundPage";
import SearchResultsPage from "./components/pages/SearchResultsPage";
import { CartProvider } from "./context/CartContext";
import LoginPage from "./components/pages/LoginPage";
import RegisterPage from "./components/pages/RegisterPage";
import AdminPanel from "./components/pages/AdminPanel";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import { ProductProvider } from "./context/ProductContext";  
import {CategoriesProvider} from "./context/CategoryContext";
import {ToastContainer} from "react-toastify";


const App: React.FC = () => {
  return (

    <AuthProvider>
       <CartProvider>
    <CategoriesProvider> 

      <ProductProvider> 
        <Router>
          <div className="relative min-h-screen">
            <ToastContainer />
            <Header />
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <HomePage />
                  </>
                }
              />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/shop/:productId" element={<ProductDetail />} />
              <Route path="/recipe" element={<Recipe />} />
              <Route path="/recipe/:id" element={<RecipeDetail />} />
              <Route path="/account" element={<Account />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminProvider>
                      <AdminPanel />
                    </AdminProvider>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </Router>
        </ProductProvider> 
      </CategoriesProvider> 
      </CartProvider>
    </AuthProvider>  
  );
};

export default App;
