import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "react-toastify/dist/ReactToastify.css";

const CartPage: React.FC = () => {
    const { cartItems, removeFromCart, updateQuantity } = useCart();
    const { totalPrice } = useCart();    
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);


    //TODO: We need somehow a global State for the Login perhaps this is suppose to change
    const [userEmail, setUserEmail] = useState<string | null>(null);


   //Listens for changes in the Firebase Authentification state (user Logs in or out)
   //This is used to check if the user is logged in or not => to check if a popup should be shown
   // This useeffect is in the right 
   //TODO: We need a global statemanagement for the user. => Type already created: AuthUser.ts 
   useEffect(() => {
        console.log("useEffect on CartPage called");
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && user.email) { //Checks if user && user.email is NOT null
                setUserEmail(user.email);
            } else {
                setUserEmail(null);
            }
        });
        return unsubscribe;
    }, []);




    
    const handleProceedToCheckout = () => {
        console.log("handleProceedToCheckout called");
                const isUserLoggedIn = userEmail;
        if (!isUserLoggedIn) {
            setShowPopup(true);
        } else {
            navigate("/checkout", { state: { email: userEmail } });
        }
    };

    const closePopup = () => {
        console.log("closePopup called");
        setShowPopup(false);
    };

    if (!cartItems.length) {
        return <p className="text-center text-lg text-gray-600">Your cart is currently empty.</p>;
    }

    return (
        <div className="px-4 py-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Your Shopping Cart</h1>
            <ul className="list-none space-y-4">
                {cartItems.map((item) => (
                    <li key={item.cartItemId} className="flex items-center p-4 border-b border-gray-200">
                        <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-16 h-16 object-cover rounded mr-4"
                        />
                        <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-800">{item.productName}</h4>
                            <p className="text-sm text-gray-600">CHF {item.price.toFixed(2)}</p>
                            <div className="mt-2">
                                <span className="text-sm font-medium text-gray-800">Quantity:</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <button
                                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                    >
                                        -
                                    </button>
                                    <p className="text-sm">{item.quantity}</p>
                                    <button
                                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                        </div>
                        <button
                            className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                            onClick={() => removeFromCart(item.cartItemId)}
                        >
                            Remove
                        </button>
                    </li>
                ))}
            </ul>
            <div className="text-right mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Total: CHF {totalPrice.toFixed(2)}</h3>
                <button
                    className="px-6 py-2 text-white bg-green-500 rounded hover:bg-green-600 transition-colors"
                    onClick={handleProceedToCheckout}
                >
                    Proceed to Checkout
                </button>
            </div>

            {/* Popup for not logged-in users */}
            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96 text-center">
                        <h2 className="text-lg font-semibold mb-4">Please Log In</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            You need to log in to proceed with the checkout.
                        </p>
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-2"
                            onClick={() => navigate("/login?fromCart=true")} >
                            Go to Login
                        </button>
                        <button
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
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