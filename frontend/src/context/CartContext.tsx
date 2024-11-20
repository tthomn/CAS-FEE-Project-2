import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
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

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUserId(user ? user.uid : null);
        });
        return unsubscribe;
    }, []);

    const fetchCartItems = useCallback(async () => {
        if (userId) {
            const querySnapshot = await getDocs(collection(db, 'cart'));
            const items = querySnapshot.docs
                .filter((doc) => doc.data().userId === userId)
                .map((doc) => ({ id: doc.id, ...doc.data() } as CartItem));
            setCartItems(items);
        } else {
            const localCart = localStorage.getItem('guestCart');
            setCartItems(localCart ? JSON.parse(localCart) : []);
        }
    }, [userId]);

    useEffect(() => {
        fetchCartItems();
    }, [fetchCartItems]);

    const addToCart = (item: CartItem) => {
        const newItem = { ...item, cartItemId: uuidv4() };

        if (userId) {
            addDoc(collection(db, 'cart'), { ...newItem, userId });
        } else {
            const updatedCart = [...cartItems, newItem];
            localStorage.setItem('guestCart', JSON.stringify(updatedCart));
            setCartItems(updatedCart);
        }
    };

    const removeFromCart = (id: string) => {
        if (userId) {
            deleteDoc(doc(db, 'cart', id));
        } else {
            const updatedCart = cartItems.filter((item) => item.cartItemId !== id);
            localStorage.setItem('guestCart', JSON.stringify(updatedCart));
            setCartItems(updatedCart);
        }
    };

    const clearCart = async () => {
        if (userId) {
            try {
                const deletePromises = cartItems
                    .filter((item) => item.cartItemId)
                    .map((item) =>
                        deleteDoc(doc(db, 'cart', item.cartItemId!))
                    );
                await Promise.all(deletePromises);
                setCartItems([]);
            } catch (error) {
                console.error('Error clearing Firestore cart:', error);
            }
        } else {
            localStorage.removeItem('guestCart');
            setCartItems([]);
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