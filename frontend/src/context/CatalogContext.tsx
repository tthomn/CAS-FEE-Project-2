
import React, {createContext, useContext, useState, useCallback, ReactNode,} from "react";
  import { where } from "firebase/firestore";
  import { getCollectionData } from "../services/firebase/firestoreService";
  import { Product } from "../types/product";
  import { Category } from "../types/category";
  

  interface CatalogContextType {    
    categories: Category[];
    products: Product[]; 
    categoriesLoading: boolean;
    productsLoading: boolean;
    categoriesError: string | null;
    productsError: string | null;  
    fetchCategories: () =>  Promise<void>;
    fetchProducts: (categoryId: string | null) => Promise<void>;
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>; 
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>; 


  }
  
  const CatalogContext = createContext<CatalogContextType | undefined>(undefined);
  
  export const CatalogProvider: React.FC<{ children: ReactNode }> = ({ children,}) => {
 


    //_________________________________________Categories______________________________________________//
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);


    const fetchCategories = useCallback(async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
  
      try {
        const fetchedCategories = await getCollectionData<Category>("categories");
        setCategories(fetchedCategories);
      } catch (error: any) {
        console.error("Error fetching categories:", error);
        setCategoriesError("Failed to load categories. Please try again.");
      } finally {
        setCategoriesLoading(false);
      }
    }, []); //TODO: ON what should my function depend? 
  
    //_________________________________________Product______________________________________________//
  
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
    }, []); //TODO: ON what should my function depend? 

    /* OLD
    const fetchProducts = useCallback(async (categoryId: string | null) => {
      setProductsLoading(true);
      setProductsError(null);
  
      try {
        console.log("Fetching products for category:", categoryId);
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
    }, []); //TODO: ON what should my function depend? */

   
  
  
    return (
      <CatalogContext.Provider value={{categories, products,categoriesLoading, productsLoading,    
        categoriesError,
        productsError,    
        fetchCategories,
        fetchProducts,
        setProducts,
        setCategories,}}>
        {children}
      </CatalogContext.Provider>
    );
  };
  
  export const useCatalog = () => {
    const context = useContext(CatalogContext);
    if (!context) {
      throw new Error("useCatalog must be used within a CatalogProvider");
    }
    return context;
  };
