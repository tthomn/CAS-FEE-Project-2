import React, { useState,  createContext, ReactNode, useContext } from "react";
import { Product } from "../types/product";
import {getFirestore,doc,} from "firebase/firestore"; 
import {uploadImageToStorage,  deleteFileFromStorage, addDocToCollection, getCollectionData, deleteDocByRef, getDocRefsBy1Condition, updateDocByRef } from "../services/firebase/firestoreService";


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
  const [isImageUploaded, setIsImageUploaded] = useState(false);

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
     
      const handleImageUpload = async (file: File) => {
        setUploadingImage(true);
        setErrorMessage("");
        try {
          const downloadURL = await uploadImageToStorage(file, "products");
          setNewProduct({ ...newProduct, imageUrl: downloadURL });
          setIsImageUploaded(true);  // Mark image as uploaded
        } catch (error) {
          console.error("Error uploading image:", error);
          setErrorMessage("Image upload failed. Please try again.");
          setIsImageUploaded(false);  // Reset in case of failure
        } finally {
          setUploadingImage(false);
        }
      };
  
   
   
        const addProduct = async () => {
          setErrorMessage("");

      
            if (!isImageUploaded) {
              setErrorMessage("Please wait until the image is uploaded.");
              return;
            }

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
            
            await addDocToCollection("products", newProduct);
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

            const products = await getCollectionData<Product>("products");
            setProducts(products); 
            setIsImageUploaded(false);  
          } catch (error) {
            console.error("Error adding product:", error);
            setErrorMessage("Failed to add product. Please try again.");
          }
        };
    
        const deleteProduct = async (id: string, imageUrl: string) => {
            try {           
                await deleteFileFromStorage(imageUrl);
                const productRef = doc(db, "products", id); 
                await deleteDocByRef(productRef);     
                setProducts(products.filter((product) => product.id !== id));       
                          
            } catch (error) {
                console.error("Error deleting product:", error);
            }
        };

            
        const updateProduct = async (id: string, updatedData: Partial<Product>) => {
            try {                   
               const docRefComplete = await getDocRefsBy1Condition("products", "id", "==", id);  
                await updateDocByRef(docRefComplete[0], updatedData);

                const updatedProducts = products.map((product) =>
                    product.id === id ? { ...product, ...updatedData } : product
                );
                setProducts(updatedProducts);
            } catch (error) {
                console.error("Error updating product:", error);
            }
        };



    const addCategory = async (categoryName: string): Promise<string> => {
        try {
            const categoryDocRef = await addDocToCollection("categories", {name: categoryName, description: categoryName});
            setNewCategoryName("");
            setErrorMessage("");
            return categoryDocRef;
 
        } catch (error) {
            console.error("Error adding category:", error);
           setErrorMessage("Failed to add category. Please try again.");
            return ""; 
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