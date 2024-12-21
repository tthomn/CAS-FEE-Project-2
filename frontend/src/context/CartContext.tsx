import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, setDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {toast} from "react-toastify";
import { Timestamp } from "firebase/firestore";


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

  
    /**
     * Synchronizes the local cart stored in localStorage with the Firestore database.
     * 
     * @param guestId - The unique identifier for the guest user.
     * 
     * This function performs the following steps:
     * 1. Retrieves the local cart items from localStorage.
     * 2. Fetches the existing cart items from Firestore for the given guestId.
     * 3. Filters out local cart items that are already present in Firestore.
     * 4. Adds only the new items to Firestore.
     * 5. Logs a message if new items were added to Firestore.
     * 
     * @throws Will log an error message if there is an issue syncing the local cart.
     */
    const syncLocalToFirestore = async (guestId: string) => {
        const localCart: CartItem[] = JSON.parse(localStorage.getItem("guestCart") || "[]");
        try {
            // Fetch existing cart items from Firestore
            const q = query(collection(db, "cart"), where("guestId", "==", guestId));
            const querySnapshot = await getDocs(q);
            const firestoreItems = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<CartItem, "id">),
            }));
    
            // Filter out local cart items that are already in Firestore
            const newItems = localCart.filter(
                (localItem: CartItem) => !firestoreItems.some((firestoreItem) => firestoreItem.cartItemId === localItem.cartItemId)
            );
    
            // Add only new items to Firestore
            for (const item of newItems) {
                const docRef = doc(collection(db, "cart"), item.cartItemId);
                await setDoc(docRef, { ...item, guestId });
            }
    
            if (newItems.length > 0) {
                console.log("Local cart synced to Firestore.");
            }
        } catch (error) {
            console.error("Error syncing local cart:", error);
        }
    };



    /**
     * 
     * Fetches cart items from Firestore based on the user's authentication status.
     * 
     * - If the user is authenticated, fetches the cart items associated with the `userId`.
     * - If the user is not authenticated, fetches the cart items associated with the `guestId`.
     * - If no cart items are found for the guest user in Firestore, retrieves the cart items from local storage.
     * 
     * Updates the cart items state with the fetched items and stores the guest cart items in local storage if the user is not authenticated.
     * 
     * @async
     * @function fetchCartItems
     * @returns {Promise<void>} A promise that resolves when the cart items have been fetched and the state has been updated.
     * @throws Will log an error message if there is an issue fetching the cart items.
     * 
     * @dependency {string | undefined} userId - The ID of the authenticated user, if available.
     */
    
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

            // Update the cart items state with the fetched items (rerendering) => Ensures that the user interface reflects the current state of the cart!
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
        const newItem = { ...item, cartItemId: uuidv4(), addedAt: Timestamp.now() };   
        try 
        {
            let payload;
            if (userId)                 
            {       
              const q = query(collection(db, "cart"), where("userId", "==", userId),where("productId", "==", item.productId) );
              const querySnapshot = await getDocs(q);
              if(!querySnapshot.empty)
              {               
                 const docRef = querySnapshot.docs[0].ref;
                 const existingData = querySnapshot.docs[0].data();
                 await updateDoc(docRef, {
                    quantity: (existingData.quantity ?? 1) + (item.quantity ?? 1),
                    updatedAt: Timestamp.now()
                });        
              }
              else
              {
                payload = { ...newItem, userId };
                await addDoc(collection(db, "cart"), payload);
              }       
                  
            } 
            else 
            {
                const guestId = getGuestId();
                const existingCart = JSON.parse(localStorage.getItem("guestCart") || "[]");            
                const existingItem = existingCart.find((cartItem: CartItem) => cartItem.productId === item.productId );


                if (existingItem) {
                    existingItem.quantity += item.quantity ?? 1;
            
                    // Update Firestore for existing item
                    const q = query(collection(db, "cart"), where("guestId", "==", guestId),where("productId", "==", item.productId));
                    const querySnapshot = await getDocs(q);
            
                    if (!querySnapshot.empty) {
                        const docRef = querySnapshot.docs[0].ref;
                        await updateDoc(docRef, {
                            quantity: existingItem.quantity,
                            addedAt: Timestamp.now()
                        });
                    }
                } else {
                    const newItem = {
                        ...item,
                        guestId,
                        cartItemId: uuidv4(),
                        addedAt: new Date(),            
                    };            
                    await addDoc(collection(db, "cart"), { ...newItem, addedAt: Timestamp.now()});        
                    // Add new item to localStorage
                    existingCart.push(newItem);
                }
            
                localStorage.setItem("guestCart", JSON.stringify(existingCart));  }

            console.log("Item added to Firestore successfully.");
            fetchCartItems();
        } 
        catch (error) 
        {
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

