import React from 'react';
import { Link } from 'react-router-dom';

const Recipe: React.FC = () => {
    const recipes = [
        { id: 1, category: 'Kuchen', title: 'Honig Kuchen', image: '/images/honey_cake.jpg' },
        { id: 2, category: 'Sauce', title: 'Honig Sesam Sauce', image: '/images/honey_sesame_sauce.jpg' },
        { id: 3, category: 'Kuchen', title: 'Honig Kuchen', image: '/images/honey_cake.jpg' },
        { id: 4, category: 'Sauce', title: 'Honig Sesam Sauce', image: '/images/honey_sesame_sauce.jpg' },
        { id: 5, category: 'Kuchen', title: 'Honig Kuchen', image: '/images/honey_cake.jpg' },
        { id: 6, category: 'Sauce', title: 'Honig Sesam Sauce', image: '/images/honey_sesame_sauce.jpg' },
    ];

    return (
        <div className="bg-[#f8e5a1] py-6 px-4">
            {}
            <div className="relative mb-6 max-w-4xl mx-auto">
                <img
                    src="/images/banner.jpg"
                    alt="Rezepte Banner"
                    className="w-full max-h-[200px] object-cover rounded-lg"
                />
                <h2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl text-white font-bold shadow-lg">
                    REZEPTE
                </h2>
            </div>

            {}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {recipes.map((recipe) => (
                    <Link
                        to={`/recipe/${recipe.id}`}
                        key={recipe.id}
                        className="text-inherit no-underline"
                    >
                        <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow transform hover:-translate-y-1 p-3 text-center">
                            <img
                                src={recipe.image}
                                alt={recipe.title}
                                className="w-full h-[120px] object-cover rounded-md mb-3"
                            />
                            <p className="text-red-600 text-xs font-bold uppercase mb-1">
                                {recipe.category}
                            </p>
                            <h3 className="text-base text-gray-800 font-semibold">{recipe.title}</h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Recipe;
