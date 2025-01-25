import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProduct } from '../../context/ProductContext';

interface ProductGridProps {
  categoryId: string | null;
}

const ProductGrid: React.FC<ProductGridProps> = ({ categoryId }) => {
  const { fetchProducts, products, productsLoading, productsError } =
    useProduct();

  useEffect(() => {
    fetchProducts(categoryId);
  }, [categoryId, fetchProducts]);

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="spinner-border inline-block h-8 w-8 animate-spin rounded-full border-4"></div>
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
          className="rounded bg-blue-500 px-4 py-2 text-white"
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
    <div className="grid grid-cols-1 gap-4 p-2 sm:grid-cols-2 sm:gap-6 sm:p-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
      {products.map((product) => (
        <Link
          to={`/shop/${product.id}`}
          key={product.id}
          className="text-inherit no-underline"
        >
          <div className="flex flex-col items-center rounded-lg border border-gray-300 p-6 text-center shadow transition-shadow hover:shadow-lg">
            <picture>
              <source
                srcSet={`${product.imageUrl}?alt=media&format=webp`}
                type="image/webp"
              />
              <img
                src={`${product.imageUrl}?alt=media&width=300&height=300`}
                alt={product.name}
                className="mb-4 h-auto max-h-[150px] w-full object-cover"
                loading="lazy"
                decoding="async"
                //loading="eager"
              />
            </picture>
            <h4 className="mb-2 text-lg font-semibold">{product.name}</h4>
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
