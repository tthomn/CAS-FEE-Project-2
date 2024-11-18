import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#f8e5a1] flex flex-col items-center justify-start">
            <h1 className="text-4xl font-bold mt-12">Honey Hive Treasures</h1>
            <p className="text-lg text-center max-w-2xl mt-6">
                Willkommen bei HoneyHive Treasures, wo die feinsten Kreationen der Natur
                auf Ihren Tisch kommen! Entdecken Sie die Welt des reinen, goldenen Honigs
                und anderer köstlicher, von Bienen hergestellter Produkte, die alle mit
                Sorgfalt und einem hohen Qualitätsanspruch hergestellt werden.
            </p>
            <div className="flex flex-col items-center mt-8">
                <img src="/images/jar_honey.jpg" alt="Honey Jar" className="max-w-xs rounded-lg" />
                <Link to="/shop">
                    <button className="bg-red-500 text-white px-6 py-2 text-lg font-bold rounded hover:bg-red-600 transition-colors mt-6">
                        SHOP NOW
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default HomePage;
