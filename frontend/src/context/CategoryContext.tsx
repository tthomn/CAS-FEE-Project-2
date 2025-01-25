import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { getCollectionData } from '../services/firebase/firestoreService';
import { Category } from '../types/category';

interface CategoriesContextType {
  categories: Category[];
  fetchCategories: () => Promise<void>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  categoriesLoading: boolean;
  categoriesError: string | null;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(
  undefined,
);

export const CategoriesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);

  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const fetchedCategories = await getCollectionData<Category>('categories');
      setCategories(fetchedCategories);
      setCategoriesLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoriesError('Error');
      setCategories([]); // Optionally, reset categories to an empty array.
    }
  }, []);

  const value = useMemo(
    () => ({
      categories,
      fetchCategories,
      setCategories,
      categoriesLoading,
      categoriesError,
    }),
    [
      categories,
      fetchCategories,
      setCategories,
      categoriesError,
      categoriesLoading,
    ],
  );

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};
