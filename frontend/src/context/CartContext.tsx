import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from '../types/cartItem';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/firebase/firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, setDoc, updateDoc, DocumentData} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Timestamp } from "firebase/firestore";
import {getDocDataBy1Condition, addDocToCollection, getDocRefsBy1Condition,getDocRefsBy2Condition, deleteDocByRef, updateDocByRef} from "../services/firebase/firestoreService";
import {useAuth} from "./AuthContext";


interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    totalItems: number;
    cartCleaner: () => Promise<void>; 
    totalPrice: number;
    updateQuantity: (cartItemId: string, newQuantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {


    const { isAuthenticated, authUser} = useAuth(); 
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    let totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        useEffect(() => {
            const auth = getAuth();
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                fetchCartItems();
                if (!user) syncLocalToFirestore(getGuestId());        
            });
            return unsubscribe;
        }, [isAuthenticated]);        

        const fetchCartItems = async () => {
            try {
                console.log("fetchCartItems Called");
                let firestoreItems: CartItem[] = [];
                const guestId = getGuestId();
        
                if (authUser?.id) {                  
                   firestoreItems = await getDocDataBy1Condition("cart", "userId", "==", authUser?.id) ;            
        
                } else {    
                    console.log("Fetching cart for guest user:", guestId);  
                    firestoreItems = await getDocDataBy1Condition("cart", "guestId", "==", guestId) ;          
                 
                    if (firestoreItems.length === 0) {
                        const localCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
                        firestoreItems = [...localCart];
                    }
                }
                setCartItems(firestoreItems);
                console.log("firestoreItems.length " + firestoreItems.length);
                if (!authUser?.id) {
                    localStorage.setItem("guestCart", JSON.stringify(firestoreItems));
                }
        
            } catch (error) {
                console.error("Error fetching cart items:", error);
            }
        }
        
      const cartCleaner = async () => 
      {
        console.log("cartCleaner Called");
        try
        {
         let firestoreItems: CartItem[] = [];

        const guestId = localStorage.getItem("guestId");
        const localCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        let userId  = getAuth().currentUser?.uid;  
        firestoreItems = await getDocDataBy1Condition("cart", "userId", "==", userId) ;          

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
                    
                    const fieldsToUpdate: Partial<DocumentData> = {
                        quantity: quantityLocalItem,
                        addedAt: Timestamp.now()
                    };
                    await updateDocByRef(docRefComplete[0], fieldsToUpdate);                             
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
              
            //FIXME: Could ve been done in a better way 
            firestoreItems = await getDocDataBy1Condition("cart", "userId", "==", userId) ;
            setCartItems(firestoreItems);

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
     *TODO: Implementation of Firebase Clean-Up
     *TODO: Check if setDoc is better than addDoc
     * Comes in handy when: Cart DB is cleaned up: and All unsuded items added by Guest Users are removed from the Firestore DB
     * (Items are only removed from Firestore but not from LocalStorage) => If user returns to the site, the items are added back to the Firestore DB
     * If this is not done: Will lead to follup-up problems...    
     */
    const syncLocalToFirestore = async (guestId: string) => {
        console.log("syncLocalToFirestore Called");
        
       const localCart: CartItem[] = JSON.parse(localStorage.getItem("guestCart") || "[]");
        try {

            let firestoreItems: CartItem[] = [];
             firestoreItems = await getDocDataBy1Condition("cart", "guestId", "==", guestId);       
   
            // Filter out local cart items that are already in Firestore
            const newItems = localCart.filter(
                (localItem: CartItem) => !firestoreItems.some((firestoreItem) => firestoreItem.cartItemId === localItem.cartItemId)
            );   
            for (const item of newItems)  {            
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


        //Used in ProductDetail.tsx
        const addToCart = async (item: CartItem) => {                      
        const newItem = { ...item, cartItemId: uuidv4(), addedAt: Timestamp.now() };   
         try 
        {
            let payload;
            if (authUser?.id) //Authenticated USER                
            {       
              const q = query(collection(db, "cart"), where("userId", "==", authUser?.id),where("productId", "==", item.productId) );
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
                payload = { ...newItem, userId: authUser?.id };
                await addDoc(collection(db, "cart"), payload);
              }       
                  
            } 
            else //Guest User 
            {
                const guestId = getGuestId();
                const existingCart = JSON.parse(localStorage.getItem("guestCart") || "[]");            
                const existingItem = existingCart.find((cartItem: CartItem) => cartItem.productId === item.productId );


                if (existingItem) {
                    existingItem.quantity += item.quantity ?? 1;    
     
                    const docRefComplete = await getDocRefsBy2Condition("cart", "guestId", "==", guestId, "productId", "==", item.productId);  
                    if (docRefComplete.length !== 0) {

                        const fieldsToUpdate: Partial<DocumentData> = {
                            quantity: existingItem.quantity,
                            addedAt: Timestamp.now()
                        };
                        await updateDocByRef(docRefComplete[0], fieldsToUpdate);    
                
                    
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
        const docRefComplete = await getDocRefsBy1Condition("cart", "cartItemId", "==", cartItemId);      
        try {
           await deleteDocByRef(docRefComplete[0]);
            setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));

            const localCart = JSON.parse(localStorage.getItem("guestCart") || "[]");            
            localStorage.setItem("guestCart", JSON.stringify(localCart.filter((item: CartItem) => item.cartItemId !== cartItemId)));
        } catch (error) {
            console.error("Error removing item from cart:", error);
        }
        return;
    };


    const clearCart = async () => {
        console.log("clearCart function Called");
        try {
            if (authUser?.id) {
            
                    const docRefComplete = await getDocRefsBy1Condition("cart", "userId", "==", authUser?.id);  
                    
                    const deleteDocByRefPromises = docRefComplete.map((docRef) => deleteDocByRef(docRef));
                    await Promise.all(deleteDocByRefPromises);  


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

    const updateQuantity = async (cartItemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            await removeFromCart(cartItemId);
        } else {
            try {
                const docRefComplete = await getDocRefsBy1Condition("cart", "cartItemId", "==", cartItemId);
                if (docRefComplete.length > 0) {
                    await updateDocByRef(docRefComplete[0], {
                        quantity: newQuantity,
                        addedAt: Timestamp.now(),
                    });
                }
                setCartItems((prevItems) =>
                    prevItems.map((item) =>
                        item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
                    )
                );

                // Sync to localStorage for guest users
                const localCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
                const updatedLocalCart = localCart.map((item: CartItem) =>
                    item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
                );
                localStorage.setItem("guestCart", JSON.stringify(updatedLocalCart));
            } catch (error) {
                console.error("Error updating quantity:", error);
            }
        }
    };


    return (
        <CartContext.Provider value={{  cartItems, addToCart, removeFromCart, clearCart, totalItems, cartCleaner, totalPrice, updateQuantity }}>
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