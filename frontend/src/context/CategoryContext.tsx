import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import { getCollectionData } from "../services/firebase/firestoreService";
import { Category } from "../types/category";

interface CategoriesContextType {
  categories: Category[];
  fetchCategories: () => Promise<void>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const CategoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);


     
   const fetchCategories = useCallback(async () => {
    const fetchedCategories = await getCollectionData<Category>("categories");
    setCategories(fetchedCategories);
  }, []);

  const value = useMemo(() => ({
    categories,
    fetchCategories,
    setCategories,
  }), [categories, fetchCategories, setCategories]);

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
};
