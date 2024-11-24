import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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
        let guestId = localStorage.getItem('guestId');
        if (!guestId) {
            guestId = uuidv4();
            localStorage.setItem('guestId', guestId);
        }
        return guestId;
    };

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUserId(user ? user.uid : null);
        });
        return unsubscribe;
    }, []);

    const fetchCartItems = useCallback(async () => {
        try {
            if (userId) {
                const q = query(collection(db, 'cart'), where('userId', '==', userId));
                const querySnapshot = await getDocs(q);
                const items = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                } as CartItem));
                setCartItems(items);
            } else {
                const guestId = getGuestId();
                const q = query(collection(db, 'cart'), where('guestId', '==', guestId));
                const querySnapshot = await getDocs(q);
                const items = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                } as CartItem));
                setCartItems(items);
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error fetching cart items:', error.message);
            } else {
                console.error('Unexpected error fetching cart items:', error);
            }
        }
    }, [userId]);

    useEffect(() => {
        fetchCartItems();
    }, [fetchCartItems]);

    const addToCart = async (item: CartItem) => {
        const newItem = { ...item, cartItemId: uuidv4() };

        try {
            if (userId) {
                await addDoc(collection(db, 'cart'), { ...newItem, userId });
            } else {
                const guestId = getGuestId();
                await addDoc(collection(db, 'cart'), { ...newItem, guestId });
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error adding item to cart:', error.message);
            } else {
                console.error('Unexpected error adding item to cart:', error);
            }
        }
    };

    const removeFromCart = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'cart', id));
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error removing item from cart:', error.message);
            } else {
                console.error('Unexpected error removing item from cart:', error);
            }
        }
    };

    const clearCart = async () => {
        try {
            if (userId) {
                const deletePromises = cartItems.map((item) =>
                    deleteDoc(doc(db, 'cart', item.id))
                );
                await Promise.all(deletePromises);
            } else {
                localStorage.removeItem('guestCart');
                const guestId = getGuestId();
                const q = query(collection(db, 'cart'), where('guestId', '==', guestId));
                const querySnapshot = await getDocs(q);
                const deletePromises = querySnapshot.docs.map((doc) =>
                    deleteDoc(doc.ref)
                );
                await Promise.all(deletePromises);
            }
            setCartItems([]);
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error clearing cart:', error.message);
            } else {
                console.error('Unexpected error clearing cart:', error);
            }
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
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};