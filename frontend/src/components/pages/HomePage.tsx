import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../layouts/Footer';

const HomePage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#fff8e1]">
      <main className="flex flex-1 flex-col">
        <div className="mx-auto flex max-w-7xl flex-col-reverse items-center justify-between gap-6 px-6 pt-6 sm:gap-10 sm:px-10 sm:pt-8 md:flex-row">
          <div className="ml-auto flex max-w-lg -translate-y-8 transform flex-col items-start space-y-4 md:h-auto md:w-1/2 md:translate-x-20">
            <h1 className="font-serif text-4xl font-bold leading-snug text-gray-800 sm:text-5xl md:text-6xl lg:text-7xl">
              Honey Hive Treasures
            </h1>
            <p className="text-lg leading-relaxed text-gray-700 sm:text-xl md:text-2xl">
              Discover the finest natural creations – pure golden honey and
              delightful bee-made products, all handcrafted with care.
            </p>
            <Link to="/shop">
              <button className="rounded-lg bg-red-500 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition-all hover:bg-red-600 sm:px-8 sm:py-3 sm:text-lg">
                Shop Now
              </button>
            </Link>
          </div>

          <div className="flex -translate-y-8 transform items-center justify-end md:w-1/2 md:translate-x-16">
            <img
              src="/images/main-banner.png"
              alt="Honey Jar"
              className="h-auto w-full max-w-[600px] object-contain sm:max-w-[450px] md:max-w-[550px] lg:max-w-[650px] xl:max-w-[750px]"
              loading="eager"
            />
          </div>
        </div>

        <section className="flex-grow pt-36 sm:pt-44">
          <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-yellow-700">
              Why Choose Us?
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center">
                <img
                  src="/images/icon_purity.png"
                  alt="Purity Icon"
                  className="mb-4 h-20"
                />
                <h3 className="text-xl font-bold">100% Pure</h3>
                <p className="text-gray-600">
                  Crafted with care, free from additives and preservatives.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <img
                  src="/images/icon_quality.png"
                  alt="Quality Icon"
                  className="mb-4 h-20"
                />
                <h3 className="text-xl font-bold">Premium Quality</h3>
                <p className="text-gray-600">
                  Sourced from the best local beekeepers.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <img
                  src="/images/icon_sustainability.png"
                  alt="Sustainability Icon"
                  className="mb-4 h-20"
                />
                <h3 className="text-xl font-bold">Sustainably Produced</h3>
                <p className="text-gray-600">
                  Eco-friendly practices for a healthier planet.
                </p>
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
