import React, { useState } from 'react';
import axios from 'axios';
import './Shop.css';

const Shop: React.FC = () => {
    const [quantity, setQuantity] = useState(1);

    const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setQuantity(parseInt(e.target.value));
    };

    const handleAddToCart = async () => {
        try {
            // Send a POST request to the backend API
            const response = await axios.post('http://localhost:5003/api/cart', {
                productName: 'AKAZIEN HONIG 500g',
                price: 15.0,
                quantity: quantity,
            });

            // Show success message based on the backend response
            alert(response.data.message);
        } catch (error) {
            console.error("Error adding to cart: ", error);
            alert('Error adding product to cart.');
        }
    };

    return (
        <div className="shop-page">
            <div className="breadcrumb">
                Gesamtsortiment &gt; Honig &gt; AKAZIEN HONIG
            </div>

            <div className="product-details">
                <div className="product-image">
                    <img src="/images/hoyer-akazienhonig.jpg" alt="Acacia Honey" />
                </div>

                <div className="product-info">
                    <h1>AKAZIEN HONIG 500g</h1>
                    <p className="price">CHF 15.00</p>
                    <p>5 am Lager</p>

                    <div className="quantity-select">
                        <label htmlFor="quantity">Menge:</label>
                        <select
                            id="quantity"
                            value={quantity}
                            onChange={handleQuantityChange}
                        >
                            {[...Array(10).keys()].map(n => (
                                <option key={n + 1} value={n + 1}>
                                    {n + 1}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button className="add-to-cart-button" onClick={handleAddToCart}>
                        Zum Warenkorb hinzufügen
                    </button>
                </div>
            </div>

            <div className="product-description">
                <h3>Produkt Beschreibung</h3>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras non neque ex.
                    Aenean vitae purus et felis ornare interdum sed a ante. Suspendisse sodales
                    mi facilisis, malesuada velit sit amet, commodo eros. Quisque ut risus vitae
                    ligula finibus sollicitudin a eget urna. Phasellus molestie, quam a ultricies
                    accumsan, ex metus iaculis elit, nec tristique justo ipsum vitae nunc.
                </p>
            </div>
        </div>
    );
};

export default Shop;
