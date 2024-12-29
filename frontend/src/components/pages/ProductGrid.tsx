import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../../services/firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Product } from "../../types/product";

interface ProductGridProps {
    categoryId: string | null;
}

const ProductGrid: React.FC<ProductGridProps> = ({ categoryId }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("Fetching products from Firestore...");
            const productsRef = collection(db, "products");
            const productsQuery = categoryId
                ? query(productsRef, where("categoryId", "==", categoryId))
                : productsRef;
            const querySnapshot = await getDocs(productsQuery);

            if (querySnapshot.empty) {
                console.log("No products found.");
            } else {
                console.log("Fetched products:", querySnapshot.docs.map((doc) => doc.data()));
            }

            const productsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Product, "id">),
            }));
            setProducts(productsData);
        } catch (err: any) {
            console.error("Error fetching products:", err.message);
            setError("Failed to load products. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [categoryId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center">
                <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"></div>
                <span className="ml-2">Loading products...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <p className="text-red-500">{error}</p>
                <button
                    onClick={fetchProducts}
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
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-auto max-h-[150px] object-cover mb-4"
                        />
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
