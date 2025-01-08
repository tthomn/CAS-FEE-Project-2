import React from 'react';
import { Link } from 'react-router-dom';
import Footer from "../layouts/Footer";

const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-[#fff8e1]">
        <main className="flex-1 flex flex-col">
                <div className="flex flex-col md:flex-row items-center justify-end max-w-7xl mx-auto px-10 h-[calc(90vh+2rem)] pt-8">

                <div className="flex flex-col items-start max-w-lg space-y-4 md:w-1/2 md:h-auto ml-auto transform -translate-y-8 md:translate-x-20">
                    <h1 className="text-7xl font-serif font-bold text-gray-800 leading-tight">
                        Honey Hive Treasures
                    </h1>
                    <p className="text-xl text-gray-700 leading-relaxed">
                        Discover the finest natural creations – pure golden honey and delightful bee-made products, all handcrafted with care.
                    </p>
                    <Link to="/shop">
                        <button className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-10 rounded-lg shadow-lg uppercase tracking-wide transition-all text-lg">
                            Shop Now
                        </button>
                    </Link>
                </div>

                <div className="flex justify-end items-center md:w-1/2 transform -translate-y-8 md:translate-x-16">
                    <img
                        src="/images/main-banner.png"
                        alt="Honey Jar"
                        className="w-[850px] h-[950px] object-contain"
                    />
                </div>
            </div>

                <section className="flex-grow py-10">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-yellow-700">Why Choose Us?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                        <div className="flex flex-col items-center">
                            <img src="/images/icon_purity.png" alt="Purity Icon" className="h-20 mb-4" />
                            <h3 className="text-xl font-bold">100% Pure</h3>
                            <p className="text-gray-600">Crafted with care, free from additives and preservatives.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <img src="/images/icon_quality.png" alt="Quality Icon" className="h-20 mb-4" />
                            <h3 className="text-xl font-bold">Premium Quality</h3>
                            <p className="text-gray-600">Sourced from the best local beekeepers.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <img src="/images/icon_sustainability.png" alt="Sustainability Icon" className="h-20 mb-4" />
                            <h3 className="text-xl font-bold">Sustainably Produced</h3>
                            <p className="text-gray-600">Eco-friendly practices for a healthier planet.</p>
                        </div>
                    </div>
                </div>
            </section>
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;
