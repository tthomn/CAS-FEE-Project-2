import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCatalog } from "../../context/CatalogContext";

interface ProductGridProps {
  categoryId: string | null;
}

const ProductGrid: React.FC<ProductGridProps> = ({ categoryId }) => {
  const {fetchProducts, products,productsLoading,productsError,} = useCatalog();

  // Fetch products whenever categoryId changes
  useEffect(() => {
    fetchProducts(categoryId);
  }, [categoryId, fetchProducts]);

  if (productsLoading) {
    return (
      <div className="flex justify-center items-center">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"></div>
        <span className="ml-2">Loading products...</span>
      </div>
    );
  }

  if (productsError) {
    return (
      <div>
        <p className="text-red-500">{productsError}</p>
        <button
          onClick={() => fetchProducts(categoryId)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return <p>No products available for the selected category.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {products.map((product) => (
        <Link
          to={`/shop/${product.id}`}
          key={product.id}
          className="no-underline text-inherit"
        >
          <div className="border border-gray-300 rounded-lg shadow hover:shadow-lg transition-shadow p-4 flex flex-col items-center text-center">
            <picture>
      
              <source
                srcSet={`${product.imageUrl}?alt=media&format=webp`}
                type="image/webp"
              />
              <img
                src={`${product.imageUrl}?alt=media&width=300&height=300`}
                alt={product.name}
                className="w-full h-auto max-h-[150px] object-cover mb-4"
                loading="eager"
              />
            </picture>
            <h4 className="text-lg font-semibold mb-2">{product.name}</h4>
            <p className="text-sm text-gray-600">{product.weight} g</p>
            <p className="text-base font-medium text-gray-800">
              CHF {product.price.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">Stock: {product.stock}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductGrid;
