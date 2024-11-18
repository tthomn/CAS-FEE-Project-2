import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs, Query } from 'firebase/firestore';

interface Product {
    id: string;
    name: string;
    price: number | string;
    weight: number;
    imageUrl: string;
    categoryId: string;
}

interface ProductGridProps {
    categoryId: string | null;
}

const ProductGrid: React.FC<ProductGridProps> = ({ categoryId }) => {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            let productRef: Query<Product> = collection(db, "products") as Query<Product>;

            if (categoryId) {
                productRef = query(productRef, where("categoryId", "==", categoryId));
            }

            const querySnapshot = await getDocs(productRef);
            const productsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data() as Omit<Product, 'id'>,
            }));
            setProducts(productsData);
        };

        fetchProducts();
    }, [categoryId]);

    return (
        <div className="grid grid-cols-3 gap-6 p-4">
            {products.map(product => (
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
                        <p className="text-base font-medium text-gray-800">CHF {Number(product.price).toFixed(2)}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default ProductGrid;
