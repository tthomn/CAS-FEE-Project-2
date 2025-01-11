import React, { useState, useEffect, createContext, ReactNode, useContext } from "react";
import { Product } from "../types/product";
import { getStorage, ref, uploadBytesResumable, getDownloadURL,} from "firebase/storage";


//Part of the Model
interface AdminContextType
{

}

const AdminContext = createContext<AdminContextType | undefined>(undefined);


export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) =>     {



/*

    const handleImageUpload = async (file: File) => {
        setUploadingImage(true); //TODO: What is this for?
        setErrorMessage(""); //TODO: What is this for?
        try {
            const storage1 = getStorage();

            const storageRef = ref(storage1, `products/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            const downloadURL = await new Promise<string>((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    null,
                    (error) => reject(error),
                    async () => {
                        const url = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(url);
                    }
                );
            });
            console.log("WHAAHT IS HAPPENEING");

            setNewProduct({ ...newProduct, imageUrl: downloadURL });
        } catch (error) {
            console.error("Error uploading image:", error);
            setErrorMessage("Image upload failed. Please try again.");
        } finally {
            setUploadingImage(false); //TODO: What is this for?
        }
    };
*/

















    return (
        <AdminContext.Provider value={{  }}>
        {children}
    </AdminContext.Provider>    ); 

};


export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};