import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

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
    const userId = "testUser";

    const fetchCartItems = useCallback(async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "cart"));
            const items = querySnapshot.docs
                .filter(doc => doc.data().userId === userId) // Filter by userId
                .map(doc => ({ id: doc.id, ...doc.data() } as CartItem));
            setCartItems(items);
        } catch (error) {
            console.error("Error fetching cart items:", error);
        }
    }, [userId]);

    useEffect(() => {
        fetchCartItems();
    }, [fetchCartItems]);

    const addToCart = async (item: CartItem) => {
        const newItem = {
            ...item,
            cartItemId: uuidv4(),
            userId,
        };

        try {
            await addDoc(collection(db, "cart"), newItem);
            fetchCartItems();
        } catch (error) {
            console.error("Error adding item to cart:", error);
        }
    };

    const removeFromCart = async (id: string) => {
        try {
            await deleteDoc(doc(db, "cart", id));
            fetchCartItems();
        } catch (error) {
            console.error("Error removing item from cart:", error);
        }
    };

    const clearCart = async () => {
        try {
            // Clear items for this user
            const querySnapshot = await getDocs(collection(db, "cart"));
            const batchDelete = querySnapshot.docs
                .filter(doc => doc.data().userId === userId)
                .map(doc => deleteDoc(doc.ref));

            await Promise.all(batchDelete);
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
