import React, { useEffect, useState } from 'react';
import Footer from '../layouts/Footer';
import ProductGrid from './ProductGrid';
import CategorySidebar from '../shared/CategorySidebar';
import { useCategories } from '../../context/CategoryContext';

const ShopPage: React.FC = () => {
  const { categories, fetchCategories, categoriesLoading, categoriesError } =
    useCategories();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedCategoryName, setSelectedCategoryName] =
    useState<string>('Shop');
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (categoriesLoading) {
    return <p className="text-center">Loading categories...</p>;
  }

  if (categoriesError) {
    return (
      <div className="text-center text-red-500">
        <p>{categoriesError}</p>
        <button
          onClick={fetchCategories}
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fff8e1]">
      <div
        className="relative h-[300px] w-full bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/banner_bee.png')`,
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-bold uppercase tracking-wider text-white md:text-4xl">
            {selectedCategoryName}
          </h1>
        </div>
      </div>
      <main className="flex-grow">
        <div className="shop-page flex gap-6 p-4">
          <CategorySidebar
            categories={categories}
            activeCategory={selectedCategoryId}
            onSelectCategory={(categoryId, categoryName) => {
              setSelectedCategoryId(categoryId);
              setSelectedCategoryName(categoryName || 'Shop');
            }}
          />
          <ProductGrid categoryId={selectedCategoryId} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ShopPage;
