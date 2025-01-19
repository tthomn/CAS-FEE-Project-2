
import React, {createContext, useContext, useState,ReactNode, useCallback, useRef} from "react";
  import { where } from "firebase/firestore";
  import { getCollectionData } from "../services/firebase/firestoreService";
  import { Product } from "../types/product"; 

  interface ProductContextType {    
    products: Product[]; 
    productsLoading: boolean;
    productsError: string | null;  
    fetchProducts: (categoryId: string | null) => Promise<void>;
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>; 
  }
  
  const ProductContext = createContext<ProductContextType | undefined>(undefined);
  
  export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children,}) => {
 
 
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState<boolean>(false);
    const [productsError, setProductsError] = useState<string | null>(null); 


    const fetchProducts = useCallback(async (categoryId: string | null) => {
      
      setProductsLoading(true);
      setProductsError(null);  
      try {
               
        const constraints = categoryId ? [where("categoryId", "==", categoryId)] : []; 
        const fetchedProducts = await getCollectionData<Product>(
          "products",
          constraints
        );
      
        setProducts(fetchedProducts);
      
      } catch (error: any) {
        console.error("Error fetching products:", error);
        setProductsError("Failed to load products. Please try again.");
      } finally {
        setProductsLoading(false);
  
      }
    }, []);

  
    return (
      <ProductContext.Provider value={{
        products, 
        productsLoading,     
        productsError,     
        fetchProducts,
        setProducts,
    }}>
        {children}
      </ProductContext.Provider>
    );
  };

  export const useProduct= () => {
    const context = useContext(ProductContext);
    if (!context) {
      throw new Error("useCatalog must be used within a CatalogProvider");
    }
    return context;
  };
