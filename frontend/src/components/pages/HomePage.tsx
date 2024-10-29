import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
    return (
        <div className="homepage">
            <h1 className="homepage-title">Honey Hive Treasures</h1>
            <p className="homepage-description">
                Willkommen bei HoneyHive Treasures, wo die feinsten Kreationen der Natur
                auf Ihren Tisch kommen! Entdecken Sie die Welt des reinen, goldenen Honigs
                und anderer köstlicher, von Bienen hergestellter Produkte, die alle mit
                Sorgfalt und einem hohen Qualitätsanspruch hergestellt werden.
            </p>
            <div className="homepage-image-container">
                <img src="/images/jar_honey.jpg" alt="Honey Jar" className="homepage-image" />
                <img src="/images/bee.jpg" alt="Bee on the left" className="bee-image bee-left" />
                <img src="/images/bee.jpg" alt="Bee on the right" className="bee-image bee-right" />
            </div>

            <Link to="/shop">
                <button className="shop-now-button">SHOP NOW</button>
            </Link>
        </div>
    );
};

export default HomePage;
