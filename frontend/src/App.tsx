import './index.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Header from './components/layouts/Header';
import Account from './components/pages/Account';
import AdminPanel from './components/pages/AdminPanel';
import CartPage from './components/pages/CartPage';
import CheckoutPage from './components/pages/CheckoutPage';
import ContactPage from './components/pages/ContactPage';
import HomePage from './components/pages/HomePage';
import LoginPage from './components/pages/LoginPage';
import NotFoundPage from './components/pages/NotFoundPage';
import ProductDetail from './components/pages/ProductDetail';
import Recipe from './components/pages/Recipe';
import RecipeDetail from './components/pages/RecipeDetail';
import SearchResultsPage from './components/pages/SearchResultsPage';
import ShopPage from './components/pages/ShopPage';
import ProtectedRoute from './components/routes/ProtectedRoute';
import { AdminProvider } from './context/AdminContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CategoriesProvider } from './context/CategoryContext';
import { ProductProvider } from './context/ProductContext';

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
                  <Route path="/contact" element={<ContactPage />} />
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
