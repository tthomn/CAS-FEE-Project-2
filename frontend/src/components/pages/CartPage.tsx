import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { CartItem } from "../../types/types";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from "uuid";

const CartPage: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const getGuestId = () => {
        let guestId = localStorage.getItem("guestId");
        if (!guestId) {
            guestId = uuidv4();
            localStorage.setItem("guestId", guestId);
        }
        return guestId;
    };

    useEffect(() => {
        const cartCollection = collection(db, "cart");
        const q = user
            ? query(cartCollection, where("userId", "==", user.uid))
            : query(cartCollection, where("guestId", "==", getGuestId()));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const items: CartItem[] = snapshot.docs.map((doc) => ({
                    id: doc.id, // Firestore document ID
                    ...(doc.data() as Omit<CartItem, "id">),
                }));
                setCartItems(items);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching cart items:", error);
                toast.error("Failed to fetch cart items.");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const handleRemove = async (itemId: string) => {
        try {
            await deleteDoc(doc(db, "cart", itemId));
            toast.success("Item removed successfully!");
        } catch (error) {
            console.error("Error removing item:", error);
            toast.error("Failed to remove item. Please try again.");
        }
    };

    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (loading) {
        return <p className="text-center text-lg text-gray-600">Loading cart items...</p>;
    }

    return (
        <div className="px-4 py-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Your Shopping Cart</h1>
            {cartItems.length === 0 ? (
                <p className="text-center text-lg text-gray-600">Your cart is currently empty.</p>
            ) : (
                <>
                    <ul className="list-none space-y-4">
                        {cartItems.map((item) => (
                            <li key={item.cartItemId || item.id} className="flex items-center p-4 border-b border-gray-200">
                                <img
                                    src={item.imageUrl}
                                    alt={item.productName}
                                    className="w-16 h-16 object-cover rounded mr-4"
                                />
                                <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-gray-800">{item.productName}</h4>
                                    <p className="text-sm text-gray-600">CHF {item.price.toFixed(2)}</p>
                                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                </div>
                                <button
                                    className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                                    onClick={() => handleRemove(item.id)}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="text-right mt-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Total: CHF {totalPrice.toFixed(2)}</h3>
                        <button className="px-6 py-2 text-white bg-green-500 rounded hover:bg-green-600 transition-colors">
                            Proceed to Checkout
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;
