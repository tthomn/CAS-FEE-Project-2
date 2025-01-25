import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../layouts/Footer';

const Recipe: React.FC = () => {
  const recipes = [
    {
      id: 1,
      category: 'Cake',
      title: 'Honey cake',
      image: require('../../assets/images/honig_kuchen.png'),
    },
    {
      id: 2,
      category: 'Sauce',
      title: 'Honey sesame sauce',
      image: require('../../assets/images/honey_sesame_sauce.jpg'),
    },
    {
      id: 3,
      category: 'Cake',
      title: 'Honey cake',
      image: require('../../assets/images/honey_cake.jpg'),
    },
    {
      id: 4,
      category: 'Dessert',
      title: 'Honey mousse',
      image: require('../../assets/images/honig_mousse.png'),
    },
    {
      id: 5,
      category: 'Drink',
      title: 'Honey tea',
      image: require('../../assets/images/honey_tea.png'),
    },
    {
      id: 6,
      category: 'Snack',
      title: 'Honey cookie',
      image: require('../../assets/images/honig_kekse.png'),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#f8e5a1]">
      {}
      <div className="relative">
        <img
          src="/images/recipes_banner.png"
          alt="Recipe Banner"
          className="h-64 w-full object-cover"
          loading="eager"
        />
        <h1 className="absolute inset-0 flex items-center justify-center bg-black/50 text-5xl font-bold text-white">
          Recipes
        </h1>
      </div>

      {}
      <main className="flex-grow">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <Link to={`/recipe/${recipe.id}`} key={recipe.id}>
              <div className="rounded-lg bg-white shadow-lg transition-shadow hover:shadow-xl">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="h-40 w-full rounded-t-lg object-cover"
                />
                <div className="p-4">
                  <p className="text-sm font-semibold uppercase text-orange-600">
                    {recipe.category}
                  </p>
                  <h2 className="text-lg font-bold text-gray-800">
                    {recipe.title}
                  </h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Recipe;
