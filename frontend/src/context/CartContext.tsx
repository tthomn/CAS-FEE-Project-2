import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { CartItem } from '../types/types';
import { v4 as uuidv4 } from 'uuid';

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
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

    const fetchCartItems = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/cart/${userId}`);
            console.log("Fetched cart items in CartContext:", response.data);
            setCartItems(response.data);
        } catch (error) {
            console.error("Error fetching cart items:", error);
        }
    }, [API_BASE_URL, userId]);

    useEffect(() => {
        fetchCartItems();
    }, [fetchCartItems]);

    const addToCart = async (item: CartItem) => {
        const newItem = {
            ...item,
            cartItemId: uuidv4(),
        };

        try {
            await axios.post(`${API_BASE_URL}/api/cart/${userId}`, newItem);
            fetchCartItems();
        } catch (error) {
            console.error("Error adding item to cart:", error);
        }
    };

    const removeFromCart = async (id: string) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/cart/${userId}/${id}`);
            fetchCartItems();
        } catch (error) {
            console.error("Error removing item from cart:", error);
        }
    };

    const clearCart = async () => {
        try {
            await axios.delete(`${API_BASE_URL}/api/cart/${userId}`);
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
