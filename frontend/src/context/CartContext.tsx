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

    //Removes an Item from the Cart (UI and FireStore)
    const removeFromCart = async (cartItemId: string) => {
        console.log("#########################################################");
        console.log("removeFromCart function Called");
        let  firestoreDocId = await findFirestoreDocByField(cartItemId); //Tries to fetch the

        try {

            //TODO: 18.12.2024: Prüfen ob Dokument exisitert (Wie in Vorluseung => Weil es sonnst gibt es einen Fehler)

            await deleteDoc(doc(db, "cart", firestoreDocId));
            setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
            const localCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
            console.log("item.cartItemId: " + cartItemId)
            console.log("firestoreDocId: " + firestoreDocId)

            console.log("Print of line #167 localCart:" + localCart);

            //FIXME: Here is the error for the NOT AUTHENTICATED USER!!!!!!!!!!!
            //TODO: Check if the id was correct BC what happens if i have X products with the same ID
            localStorage.setItem("guestCart", JSON.stringify(localCart.filter((item: CartItem) => item.cartItemId !== cartItemId)));

// OLD CODE:  localStorage.setItem("guestCart", JSON.stringify(localCart.filter((item: CartItem) => item.cartItemId !== firestoreDocId))); ==>



        } catch (error) {
            console.error("Error removing item from cart:", error);
        }
        console.log("_____________________________________________");
        return;
    };

    // Function to find the Firestore document ID based on the `id` field
    const findFirestoreDocByField = async (fieldValue: string) => {
        try {
            console.log(`Searching for document with id field: ${fieldValue}`);

            // Query Firestore for documents where the `id` field matches the provided value
            const q = query(collection(db, "cart"), where("cartItemId", "==", fieldValue));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Get the first matching document (assuming `id` is unique)
                const docRef = querySnapshot.docs[0];
                console.log("Document found:", docRef.id);

                return docRef.id; // Firestore document ID
            } else {
                console.log("No document found with the specified id field.");
                return fieldValue;
            }
        } catch (error) {
            console.error("Error finding Firestore document by field:", error);
            return fieldValue;
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

//TEST