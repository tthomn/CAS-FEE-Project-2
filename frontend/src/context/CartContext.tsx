import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {toast} from "react-toastify";

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    const getGuestId = (): string => {
        let guestId = localStorage.getItem("guestId");
        if (!guestId) {
            guestId = uuidv4();
            localStorage.setItem("guestId", guestId);
        }
        return guestId;
    };

    const syncLocalToFirestore = async (guestId: string) => {
        const localCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        try {
            for (const item of localCart) {
                const docRef = doc(collection(db, "cart"), item.cartItemId);
                await setDoc(docRef, { ...item, guestId });
            }
            console.log("Local cart synced to Firestore.");
        } catch (error) {
            console.error("Error syncing local cart:", error);
        }
    };

    const fetchCartItems = useCallback(async () => {
        try {
            let firestoreItems: CartItem[] = [];
            const guestId = getGuestId();

            if (userId) {
                console.log("Fetching cart for authenticated user:", userId);
                const q = query(collection(db, "cart"), where("userId", "==", userId));
                const querySnapshot = await getDocs(q);
                firestoreItems = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<CartItem, "id">),
                }));
            } else {
                console.log("Fetching cart for guest user:", guestId);
                const q = query(collection(db, "cart"), where("guestId", "==", guestId));
                const querySnapshot = await getDocs(q);
                firestoreItems = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<CartItem, "id">),
                }));

                if (firestoreItems.length === 0) {
                    const localCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
                    firestoreItems = [...localCart];
                }
            }

            setCartItems(firestoreItems);

            if (!userId) {
                localStorage.setItem("guestCart", JSON.stringify(firestoreItems));
            }

            console.log("Fetched cart items:", firestoreItems);
        } catch (error) {
            console.error("Error fetching cart items:", error);
        }
    }, [userId]);



    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUserId(user ? user.uid : null);
            if (!user) syncLocalToFirestore(getGuestId());
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        fetchCartItems();
    }, [fetchCartItems]);

    const addToCart = async (item: CartItem) => {
        const newItem = { ...item, cartItemId: uuidv4() };

        try {
            let payload;
            if (userId) {
                payload = { ...newItem, userId };
            } else {
                const guestId = getGuestId();
                payload = { ...newItem, guestId };

                const existingCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
                localStorage.setItem(
                    "guestCart",
                    JSON.stringify([...existingCart, payload])
                );
            }

            await addDoc(collection(db, "cart"), payload);
            console.log("Item added to Firestore successfully.");
            fetchCartItems();
        } catch (error) {
            console.error("Error adding item to cart:", error);
        }
    };

    const removeFromCart = async (itemId: string) => {
        try {
            const docRef = doc(db, "cart", itemId);
            await deleteDoc(docRef);

            setCartItems((prev) => prev.filter((item) => item.id !== itemId));

            if (!userId) {
                const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
                const updatedCart = guestCart.filter((item: CartItem) => item.cartItemId !== itemId);
                localStorage.setItem("guestCart", JSON.stringify(updatedCart));
            }
        } catch (error) {
            toast.error("Failed to remove item. Please try again.");
        }
    };

    const clearCart = async () => {
        try {
            if (userId) {
                const deletePromises = cartItems.map((item) =>
                    deleteDoc(doc(db, "cart", item.id))
                );
                await Promise.all(deletePromises);
            } else {
                const guestId = getGuestId();
                const q = query(collection(db, "cart"), where("guestId", "==", guestId));
                const querySnapshot = await getDocs(q);
                const deletePromises = querySnapshot.docs.map((doc) =>
                    deleteDoc(doc.ref)
                );
                await Promise.all(deletePromises);
                localStorage.removeItem("guestCart");
            }

            setCartItems([]);
        } catch (error) {
            console.error("Error clearing cart:", error);
        }
    };

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, totalItems }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};