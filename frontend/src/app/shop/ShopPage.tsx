import React, { useEffect, useState } from "react";
import Footer from "../../components/layouts/Footer";
import CategorySidebar from "../../components/shared/CategorySidebar";
import ProductGrid from "../../components/pages/ProductGrid";
import { useCatalog } from "../../context/CatalogContext"; 

const ShopPage: React.FC = () => {
  const {categories,categoriesLoading, categoriesError, fetchCategories,} = useCatalog();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("Shop");

  // Fetch categories once when the page loads TODO:??
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, ]);

  if (categoriesLoading) {
    return <p className="text-center">Loading categories...</p>;
  }

  if (categoriesError) {
    return (
      <div className="text-center text-red-500">
        <p>{categoriesError}</p>
        <button
          onClick={fetchCategories}
          className="bg-blue-500 text-white px-4 py-2 rounded" >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fff8e1]">
   
      <div
        className="relative w-full h-[300px] bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/banner_bee.png')`,
        }}
                >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
          <h1 className="text-white text-3xl md:text-4xl font-bold uppercase tracking-wider">
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
              setSelectedCategoryName(categoryName || "Shop");
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