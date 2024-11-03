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
        <div className="product-grid">
            {products.map(product => (
                <Link to={`/shop/${product.id}`} key={product.id} className="product-card-link">
                    <div className="product-card">
                        <img src={product.imageUrl} alt={product.name} />
                        <h4>{product.name}</h4>
                        <p>{product.weight} g</p>
                        <p>CHF {Number(product.price).toFixed(2)}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default ProductGrid;
