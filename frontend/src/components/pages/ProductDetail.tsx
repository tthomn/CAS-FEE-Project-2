import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import {
  getData,
  createDocRef,
} from '../../services/firebase/firestoreService';
import Rating from '../shared/Rating';

interface Product {
  id: string;
  name: string;
  price: number | string;
  imageUrl: string;
  description: string;
  stock: number;
  ratings?: {
    totalRating: number;
    ratingCount: number;
  };
}

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [popupVisible, setPopupVisible] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        const productDocRef = await createDocRef('products', productId);
        const productDoc = await getData(productDocRef);

        if (productDoc.exists()) {
          const productData = productDoc.data();
          setProduct({
            id: productDoc.id,
            ...productData,
            stock: productData.stock || 0,
          } as Product);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    if (product.stock < quantity) {
      toast.error(
        `${product.name} has insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
        {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'colored',
        },
      );
      return;
    }

    addToCart({
      id: product.id,
      productName: product.name,
      price: Number(product.price),
      quantity,
      imageUrl: product.imageUrl,
      productId: product.id,
      cartItemId: `cartItem-${productId}`,
    });

    setPopupVisible(true);

    setTimeout(() => setPopupVisible(false), 1500);
  };

  if (!product) {
    return (
      <p className="text-center text-gray-600">Loading product details...</p>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Popup */}
      {popupVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-72 scale-95 transform rounded-lg bg-white p-6 shadow-lg transition-transform duration-300 ease-out">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                Item Added to Cart
              </p>
              <p className="mt-1 text-sm text-gray-600">
                You can view it in your cart.
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate('/shop')}
        className="group fixed left-4 top-24 z-50 bg-transparent text-3xl text-gray-700 hover:text-blue-600 md:left-8 md:top-32"
        aria-label="Back to Shopping"
      >
        &larr;
        <span className="absolute left-2 top-10 rounded-lg bg-gray-800 px-3 py-1 text-sm text-white opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100">
          Back to Shopping
        </span>
      </button>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Product Image */}
        <div className="flex justify-center">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-auto w-full max-w-sm rounded-lg object-cover shadow-lg"
          />
        </div>

        {/* Product Info */}
        <div className="text-left">
          {/* Product Name */}
          <h1 className="mb-2 text-3xl font-bold">{product.name}</h1>

          {/* Price */}
          <p className="mb-6 text-2xl font-bold text-red-600">
            CHF {Number(product.price).toFixed(2)}
          </p>

          {/* Ratings Section */}
          {product.ratings && (
            <div className="mb-4 flex items-center">
              <Rating
                productId={product.id}
                initialRating={product.ratings?.totalRating || 0}
                initialRatingCount={product.ratings?.ratingCount || 0}
              />
            </div>
          )}

          {/* Description */}
          <p className="mb-8 text-lg text-gray-700">{product.description}</p>

          {/* Stock Check */}
          {product.stock > 0 ? (
            <>
              {/* Quantity Selector */}
              <div className="mb-6 flex items-center gap-4">
                <label htmlFor="quantity" className="text-lg font-semibold">
                  Quantity:
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Number(e.target.value)))
                  }
                  min="1"
                  className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-lg"
                />
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="rounded bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-md transition duration-200 hover:bg-blue-700"
              >
                Add to Cart
              </button>
            </>
          ) : (
            <p className="text-lg font-semibold text-red-500">Out of Stock</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
