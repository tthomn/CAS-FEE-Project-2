import React, { useState,  createContext, ReactNode, useContext } from "react";
import { Product } from "../types/product";
import {getFirestore, collection,addDoc, updateDoc,deleteDoc,doc, getDocs,} from "firebase/firestore"; 
import {uploadImageToStorage,  deleteFileFromStorage} from "../services/firebase/firestoreService";


interface AdminContextType
{
    handleImageUpload: (file: File) => void;
    addProduct: () => void;
    uploadingImage: boolean;
    errorMessage: string; 
    setNewProduct: React.Dispatch<React.SetStateAction<Omit<Product, "id">>>;
    newProduct: Omit<Product, "id">;
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    products: Product[];
    deleteProduct: (id: string, imageUrl: string) => void;
    updateProduct: (id: string, updatedData: Partial<Product>) => void;
    addCategory: (categoryName: string) => Promise<string>;
    newCategoryName : string;
    setNewCategoryName : React.Dispatch<React.SetStateAction<string>>;
 
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);


export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) =>     {

  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [newCategoryName, setNewCategoryName] = useState<string>("");


  const db = getFirestore();

  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
    name: "",
    price: 0,
    weight: 0,
    imageUrl: "",
    categoryId: "",
    stock: 0,
    description: "",
    keywords: [],
    ratings: { totalRating: 0, ratingCount: 0 },
  });
     
    //TODO: Use firestoreService.ts
    const handleImageUpload = async (file: File) => {
      setUploadingImage(true);
      setErrorMessage("");
      try {
        const downloadURL = await uploadImageToStorage(file, "products");
        setNewProduct({ ...newProduct, imageUrl: downloadURL });
      } catch (error) {
        console.error("Error uploading image:", error);
        setErrorMessage("Image upload failed. Please try again.");
      } finally {
        setUploadingImage(false);
      }
    };
    
        //TODO: Use firestoreService.ts
        const addProduct = async () => {
          setErrorMessage("");

          if ( !newProduct.name ||
            newProduct.price <= 0 ||
            newProduct.stock < 0 ||
            !newProduct.categoryId
          ) {
            setErrorMessage(
              "Please provide valid product details, including a category."
            );
            return;
          }

          try {
            await addDoc(collection(db, "products"), newProduct);
            setNewProduct((prev) => ({
              ...prev,
              name: "",
              price: 0,
              weight: 0,
              imageUrl: "",
              stock: 0,
              description: "",
              keywords: [],
              categoryId: "",
            }));
            const querySnapshot = await getDocs(collection(db, "products"));
            setProducts(
              querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })) as Product[]
            );
          } catch (error) {
            console.error("Error adding product:", error);
            setErrorMessage("Failed to add product. Please try again.");
          }
        };
    
        const deleteProduct = async (id: string, imageUrl: string) => {
            try {            

                await deleteFileFromStorage(imageUrl);
                await deleteDoc(doc(db, "products", id)); //TODO:---
                setProducts(products.filter((product) => product.id !== id));       
                          
            } catch (error) {
                console.error("Error deleting product:", error);
            }
        };

            
        const updateProduct = async (id: string, updatedData: Partial<Product>) => {
            try {
                await updateDoc(doc(db, "products", id), {
                    ...updatedData,
                    price: updatedData.price || 0,
                    stock: updatedData.stock || 0,
                });
                const updatedProducts = products.map((product) =>
                    product.id === id ? { ...product, ...updatedData } : product
                );
                setProducts(updatedProducts);
            } catch (error) {
                console.error("Error updating product:", error);
            }
        };



            //TODO: 
    const addCategory = async (categoryName: string): Promise<string> => {
        try {
            const categoryDocRef = await addDoc(collection(db, "categories"), {
                name: categoryName,
                description: categoryName,
                
            });

            setNewCategoryName("");
            setErrorMessage("");
            return categoryDocRef.id;
        } catch (error) {
            console.error("Error adding category:", error);
           setErrorMessage("Failed to add category. Please try again.");
            return ""; // Return an empty string if there's an error
        }
    };

    
      return (
        <AdminContext.Provider
          value={{
            handleImageUpload,
            uploadingImage,
            errorMessage,
            setNewProduct,
            newProduct,
            addProduct,
            setProducts,
            products,
            deleteProduct,
            updateProduct,
            addCategory,
            newCategoryName,
            setNewCategoryName,
          }}
        >
          {children}
        </AdminContext.Provider>
      ); 

};


export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error("useAdmin must be used within a AdminProvider");
    }
    return context;
};