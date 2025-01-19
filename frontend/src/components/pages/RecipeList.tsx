import React from 'react';
import { Link } from 'react-router-dom';

interface Recipe {
    id: string;
    name: string;
    category: string;
    image: string;
}

const recipes: Recipe[] = [
    { id: '1', name: 'Honig Kuchen', category: 'Kuchen', image: '/images/honey_cake.jpg' },
    { id: '2', name: 'Honig Sesam Sauce', category: 'Sauce', image: '/images/honey_sesame_sauce.jpg' },
];

const RecipeList: React.FC = () => {
    return (
        <div className="bg-yellow-200 p-5 text-center">
            <div className="relative w-full mb-6">
                <img
                    src="/images/banner.jpg"
                    alt="Rezepte Banner"
                    className="w-full h-60 object-cover"
                    loading="eager"
                />
                <h2 className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white uppercase">
                   Recipes
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {recipes.map(recipe => (
                    <Link
                        to={`/rezept/${recipe.id}`}
                        key={recipe.id}
                        className="text-inherit no-underline"
                    >
                        <div className="bg-white rounded-lg shadow-md p-4 text-center transition-transform transform hover:-translate-y-1 hover:shadow-lg">
                            <img
                                src={recipe.image}
                                alt={recipe.name}
                                className="w-full h-40 object-cover rounded mb-3"
                            />
                            <p className="text-red-500 text-xs font-bold uppercase">
                                {recipe.category}
                            </p>
                            <h3 className="text-gray-800 text-lg font-semibold mt-1">
                                {recipe.name}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RecipeList;
