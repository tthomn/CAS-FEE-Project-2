import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  createDocRef,
  getData,
} from '../../services/firebase/firestoreService';

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const { totalPrice } = useCart();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const { isAuthenticated, authUser } = useAuth();

  const handleProceedToCheckout = async () => {
    try {
      const stockValidationAndUpdatePromises = cartItems.map(async (item) => {
        const productDocRef = await createDocRef('products', item.productId);
        const productDoc = await getData(productDocRef);

        if (productDoc.exists()) {
          const productData = productDoc.data();
          const updatedStock = productData.stock - item.quantity;

          if (updatedStock < 0) {
            throw new Error(
              `${item.productName} has insufficient stock. Available: ${productData.stock}, Requested: ${item.quantity}`,
            );
          }
        } else {
          throw new Error(`Product ${item.productName} does not exist.`);
        }
      });

      await Promise.all(stockValidationAndUpdatePromises);

      if (!isAuthenticated) {
        setShowPopup(true);
        return;
      }
      navigate('/checkout', { state: { email: authUser?.userId } });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'colored',
        });
      } else {
        toast.error('Stock validation or update failed. Please try again.', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'colored',
        });
      }
    }
  };
  const closePopup = () => {
    setShowPopup(false);
  };

  if (!cartItems.length) {
    return (
      <p className="text-center text-lg text-gray-600">
        Your cart is currently empty.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
        Your Shopping Cart
      </h1>
      <ul className="list-none space-y-4">
        {cartItems.map((item) => (
          <li
            key={item.cartItemId}
            className="flex items-center border-b border-gray-200 p-4"
          >
            <img
              src={item.imageUrl}
              alt={item.productName}
              className="mr-4 h-16 w-16 rounded object-cover"
            />
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-800">
                {item.productName}
              </h4>
              <p className="text-sm text-gray-600">
                CHF {item.price.toFixed(2)}
              </p>
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-800">
                  Quantity:
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <button
                    className="rounded bg-gray-200 px-2 py-1 hover:bg-gray-300"
                    onClick={() =>
                      updateQuantity(item.cartItemId, item.quantity - 1)
                    }
                  >
                    -
                  </button>
                  <p className="text-sm">{item.quantity}</p>
                  <button
                    className="rounded bg-gray-200 px-2 py-1 hover:bg-gray-300"
                    onClick={() =>
                      updateQuantity(item.cartItemId, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <button
              className="rounded bg-red-500 px-3 py-1 text-sm text-white transition-colors hover:bg-red-600"
              onClick={() => removeFromCart(item.cartItemId)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-6 text-right">
        <h3 className="mb-4 text-xl font-semibold text-gray-800">
          Total: CHF {totalPrice.toFixed(2)}
        </h3>
        <button
          className="rounded bg-green-500 px-6 py-2 text-white transition-colors hover:bg-green-600"
          onClick={handleProceedToCheckout}
        >
          Proceed to Checkout
        </button>
      </div>

      {/* Popup for not logged-in users */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded-lg bg-white p-6 text-center shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Please Log In</h2>
            <p className="mb-4 text-sm text-gray-600">
              You need to log in to proceed with the checkout.
            </p>
            <button
              className="mr-2 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
              onClick={() => navigate('/login?fromCart=true')}
            >
              Go to Login
            </button>
            <button
              className="rounded bg-gray-300 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-400"
              onClick={closePopup}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
