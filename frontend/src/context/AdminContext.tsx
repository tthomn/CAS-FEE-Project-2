import React, { useState, useEffect, createContext, ReactNode } from "react";
import { Product } from "../types/product";
import { getStorage, ref, uploadBytesResumable, getDownloadURL,} from "firebase/storage";
import {getFirestore, collection,addDoc, updateDoc,deleteDoc,doc, getDocs,} from "firebase/firestore";


//Part of the Model
interface AdminContextType
{

}

const AdminContext = createContext<AdminContextType | undefined>(undefined);


export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) =>     {



/*
    const fetchProducts = async () => {
                try {
                    const querySnapshot = await getDocs(collection(db, "products"));
                    setProducts(
                        querySnapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        })) as Product[]
                    );
                } catch (error) {
                    console.error("Error fetching products:", error);
                }
            };
            fetchProducts();*/



return (
    <AdminContext.Provider value={{ }}>
        {children}
    </AdminContext.Provider>
);    

}

