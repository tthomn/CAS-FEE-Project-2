import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useCart } from '../../context/CartContext';
import './ProductDetail.css';

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
            const productDoc = await getDoc(doc(db, "products", productId));
            if (productDoc.exists()) {
                setProduct({ id: productDoc.id, ...productDoc.data() } as Product);
            }
        };

        fetchProduct();
    }, [productId]);

    const handleAddToCart = () => {
        console.log("Add to Cart button clicked");
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
        return <p>Loading product details...</p>;
    }

    return (
        <div className="product-detail">
            <h1 className="product-title">{product.name}</h1>
            <img src={`/${product.imageUrl}`} alt={product.name} className="product-image" />
            <p className="product-description">{product.description}</p>
            <p className="product-price">CHF {Number(product.price).toFixed(2)}</p>
            <div className="product-quantity">
                <label htmlFor="quantity">Quantity:</label>
                <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                />
            </div>
            <button className="add-to-cart-button" onClick={handleAddToCart}>
                Add to Cart
            </button>
        </div>
    );
};

export default ProductDetail;
