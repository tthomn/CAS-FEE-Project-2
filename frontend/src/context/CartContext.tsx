import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem } from '../types/cartItem';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/firebase/firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, setDoc, updateDoc, DocumentReference, LoadBundleTask } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Timestamp } from "firebase/firestore";
import {getDocsBy1Condition, addDocToCollection, getDocRefsBy2Condition, deleteDocByRef, updateDocByRef} from "../services/firebase/firestoreService";


interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    totalItems: number;
    cartCleaner: () => Promise<void>; 
    //TODO: Check if its complete? 
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [cartUpdateFlag, setCartUpdateFlag] = useState(false); // Declare flag using useState
    
    // Example function to update the flag //TODO: Something for Hook? 
    const triggerUpdateCart = () => {
        console.log("triggerUpdateCart flag");
        setCartUpdateFlag((prev) => !prev);
    };

      const cartCleaner = async () => 
      {
        try
        {
         let firestoreItems: CartItem[] = [];

        const guestId = localStorage.getItem("guestId");
        const localCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        let userId  = getAuth().currentUser?.uid;                
        firestoreItems = await getDocsBy1Condition("cart", "userId", "==", userId) ;          

        //Check if localCart is empty and if empty exist the function
        if(localCart.length === 0)
        { return; }
        
        for (const item of localCart) 
        {
            delete item.guestId;
            delete item.cartItemId;
            delete item.addedAt;
            const existingItem = firestoreItems.find((firestoreItem) => firestoreItem.productId === item.productId);

            if (!existingItem) 
              {   
               const payload = { ...item, cartItemId: uuidv4(), userId};         
               await addDocToCollection("cart", payload);          
               const docRefComplete = await getDocRefsBy2Condition("cart", "guestId", "==", guestId, "productId", "==", item.productId);  
               await deleteDocByRef(docRefComplete[0]);    
            }
            else 
            {
                //Fetch the item from firestoreItems 
               let firestoreItem =  firestoreItems.find((firestoreItem) => firestoreItem.productId === item.productId); 
               let quantityFirestoreItem = firestoreItem?.quantity;
               let quantityLocalItem = item.quantity;
       
               //If the quantity of the local item is greater than the quantity of the firestore item update the quantity of the firestore item
                if(quantityFirestoreItem !== undefined && quantityLocalItem > quantityFirestoreItem)
                {           
                    const docRefComplete = await getDocRefsBy2Condition("cart", "userId", "==", userId, "productId", "==", existingItem.id);  
                    await updateDocByRef(docRefComplete[0], quantityLocalItem);                             
                    const docRefComplete1 = await getDocRefsBy2Condition("cart", "guestId", "==", guestId, "productId", "==", item.productId);  
                    await deleteDocByRef(docRefComplete1[0]);               
                }  
                else
                {                 
                    const docRefComplete1 = await getDocRefsBy2Condition("cart", "guestId", "==", guestId, "productId", "==", item.productId);  
                    await deleteDocByRef(docRefComplete1[0]);                  
                }                 
            }               
        }
            localStorage.removeItem("guestCart");              
            // Update the UI and clear the local Storage             
            triggerUpdateCart();              
        }
        catch (error) {
            console.error("Error cleaning cart:", error);
        }  
       }         


        const getGuestId = (): string => {
        
        let guestId = localStorage.getItem("guestId");
        if (!guestId) {
            guestId = uuidv4();
            localStorage.setItem("guestId", guestId);
        }
        return guestId;
    };
 
  
    /** 
     */
    const syncLocalToFirestore = async (guestId: string) => {
        const localCart: CartItem[] = JSON.parse(localStorage.getItem("guestCart") || "[]");
        try {
            let firestoreItems: CartItem[] = [];

            // Fetch existing cart items from Firestore
            /*
            const q = query(collection(db, "cart"), where("guestId", "==", guestId));
            const querySnapshot = await getDocs(q);
            const firestoreItems = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<CartItem, "id">),
            }));
            */
             firestoreItems = await getDocsBy1Condition("cart", "guestId", "==", guestId);       
   
            // Filter out local cart items that are already in Firestore
            const newItems = localCart.filter(
                (localItem: CartItem) => !firestoreItems.some((firestoreItem) => firestoreItem.cartItemId === localItem.cartItemId)
            );
    
            // Add only new items to Firestore
            for (const item of newItems) {
                const docRef = doc(collection(db, "cart"), item.cartItemId);
                await setDoc(docRef, { ...item, guestId }); //TODO: setDOC? 
            }
    
            if (newItems.length > 0) {
                console.log("Local cart synced to Firestore.");
            }
        } catch (error) {
            console.error("Error syncing local cart:", error);
        }
    };


   //TODO:: Is this really CONTEXT??? 
    const fetchCartItems = useCallback(async () => {
        try {
            console.log("fetchCartItems Called");
            let firestoreItems: CartItem[] = [];
            const guestId = getGuestId();

            if (userId) {                  
               firestoreItems = await getDocsBy1Condition("cart", "userId", "==", userId) ;            

            } else {

                console.log("Fetching cart for guest user:", guestId);  
                firestoreItems = await getDocsBy1Condition("cart", "guestId", "==", guestId) ;          
             
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
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUserId(user ? user.uid : null);
            setUserId(user ? user.uid : null);
            console.log(user?.uid);    
            fetchCartItems();
            if (!user) syncLocalToFirestore(getGuestId());        
        });
        return unsubscribe;
    }, [cartUpdateFlag]);

 
    useEffect(() => { 
            fetchCartItems();
    }, [fetchCartItems]); //TODO: but userID here instead of fetchCartItems

  
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
                    addedAt: Timestamp.now()
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
                    existingItem.quantity += item.quantity ?? 1; //TODO: Update the part of the calculaction analog to the IF above
            
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
        console.log("removeFromCart function Called");
        let  firestoreDocId = await findFirestoreDocByField(cartItemId); //Tries to fetch the

        try {

            //TODO: 18.12.2024: Prüfen ob Dokument exisitert (Wie in Vorluseung => Weil es sonnst gibt es einen Fehler)

            await deleteDoc(doc(db, "cart", firestoreDocId));
            setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
            const localCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
            //console.log("item.cartItemId: " + cartItemId)
            //console.log("firestoreDocId: " + firestoreDocId)
 

            //FIXME: Here is the error for the NOT AUTHENTICATED USER!!!!!!!!!!!
            //TODO: Check if the id was correct BC what happens if i have X products with the same ID
            localStorage.setItem("guestCart", JSON.stringify(localCart.filter((item: CartItem) => item.cartItemId !== cartItemId)));

        } catch (error) {
            console.error("Error removing item from cart:", error);
        }
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
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, totalItems,  cartCleaner,
        }}>
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