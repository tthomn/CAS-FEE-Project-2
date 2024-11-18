import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useCart } from '../../context/CartContext';

interface Product {
    id: string;
    name: string;
    price: number | string;
    imageUrl: string;
    description: string;
}

const ProductDetail: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) return;
            const productDoc = await getDoc(doc(db, 'products', productId));
            if (productDoc.exists()) {
                setProduct({ id: productDoc.id, ...productDoc.data() } as Product);
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
        });

        alert(`${product.name} added to cart!`);
    };

    if (!product) {
        return <p className="text-center text-gray-600">Loading product details...</p>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
            <img
                src={`/${product.imageUrl}`}
                alt={product.name}
                className="w-40 h-auto rounded-lg mx-auto mb-6"
            />
            <p className="text-lg text-gray-700 mb-4">{product.description}</p>
            <p className="text-xl font-bold text-gray-900 mb-6">CHF {Number(product.price).toFixed(2)}</p>
            <div className="flex justify-center items-center gap-4 mb-6">
                <label htmlFor="quantity" className="text-lg">
                    Quantity:
                </label>
                <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-lg"
                />
            </div>
            <button
                onClick={handleAddToCart}
                className="bg-red-500 text-white px-6 py-2 text-lg font-bold rounded hover:bg-red-600 transition-colors"
            >
                Add to Cart
            </button>
        </div>
    );
};

export default ProductDetail;
