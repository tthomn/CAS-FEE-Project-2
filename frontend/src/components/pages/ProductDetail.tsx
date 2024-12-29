import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../services/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useCart } from "../../context/CartContext";
import Rating from "../shared/Rating";

interface Product {
    id: string;
    name: string;
    price: number | string;
    imageUrl: string;
    description: string;
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
                const productDoc = await getDoc(doc(db, "products", productId));
                if (productDoc.exists()) {
                    setProduct({ id: productDoc.id, ...productDoc.data() } as Product);
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            }
        };

        fetchProduct();
    }, [productId]);

    const handleAddToCart = () => {
        if (!product) return;

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
        return <p className="text-center text-gray-600">Loading product details...</p>;
    }

    const averageRating = product.ratings
        ? product.ratings.totalRating / product.ratings.ratingCount
        : 0;

    return (
        <div className="max-w-5xl mx-auto p-6">
            {/* Popup */}
            {popupVisible && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg transform transition-transform scale-95 duration-300 ease-out w-72">
                        <div className="flex flex-col items-center">
                            <div className="bg-green-500 text-white w-12 h-12 flex items-center justify-center rounded-full mb-4">
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
                            <p className="text-lg font-semibold text-gray-800">Item Added to Cart</p>
                            <p className="text-sm text-gray-600 mt-1">You can view it in your cart.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Back to Shopping Button */}
            <button
                onClick={() => navigate("/shop")}
                className="absolute top-16 left-8 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded shadow"
            >
                &larr; Back to Shopping
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                {/* Product Image */}
                <div className="flex justify-center">
                    <img
                        src={`/${product.imageUrl}`}
                        alt={product.name}
                        className="w-full max-w-sm h-auto object-cover rounded-lg shadow-lg"
                    />
                </div>

                {/* Product Info */}
                <div className="text-left">
                    {/* Product Name */}
                    <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

                    {/* Price */}
                    <p className="text-2xl font-bold text-red-600 mb-6">
                        CHF {Number(product.price).toFixed(2)}
                    </p>

                    {/* Ratings Section */}
                    {product.ratings && (
                        <div className="mb-4 flex items-center">
                            <Rating
                                productId={product.id}
                                initialRating={averageRating}
                                ratingCount={product.ratings.ratingCount}
                            />
                            <p className="ml-4 text-sm text-gray-500">
                                {product.ratings.ratingCount} reviews
                            </p>
                        </div>
                    )}

                    {/* Description */}
                    <p className="text-lg text-gray-700 mb-8">{product.description}</p>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-4 mb-6">
                        <label htmlFor="quantity" className="text-lg font-semibold">
                            Quantity:
                        </label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                            min="1"
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-lg"
                        />
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        className="bg-blue-600 text-white px-8 py-3 text-lg font-semibold rounded hover:bg-blue-700 transition duration-200 shadow-md"
                    >
                        In den Warenkorb
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
