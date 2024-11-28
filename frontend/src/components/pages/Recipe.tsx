import React from "react";
import { Link } from "react-router-dom";

const Recipe: React.FC = () => {
    const recipes = [
        { id: 1, category: "Kuchen", title: "Honig Kuchen", image: "/images/honey_cake.jpg" },
        { id: 2, category: "Sauce", title: "Honig Sesam Sauce", image: "/images/honey_sesame_sauce.jpg" },
        { id: 3, category: "Kuchen", title: "Honig Torte", image: "/images/honey_torte.jpg" },
        { id: 4, category: "Dessert", title: "Honig Mousse", image: "/images/honey_mousse.jpg" },
        { id: 5, category: "Getränk", title: "Honig Tee", image: "/images/honey_tea.jpg" },
        { id: 6, category: "Snack", title: "Honig Kekse", image: "/images/honey_cookies.jpg" },
    ];

    return (
        <div className="bg-[#f8e5a1]">
            {}
            <div className="relative">
                <img
                    src="/images/recipes_banner.png"
                    alt="Recipe Banner"
                    className="w-full h-64 object-cover"
                />
                <h1 className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-white bg-black/50">
                    Rezepte
                </h1>
            </div>

            {}
            <div className="max-w-6xl mx-auto py-12 px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                    <Link to={`/recipe/${recipe.id}`} key={recipe.id}>
                        <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                            <img
                                src={recipe.image}
                                alt={recipe.title}
                                className="w-full h-40 object-cover rounded-t-lg"
                            />
                            <div className="p-4">
                                <p className="text-orange-600 text-sm uppercase font-semibold">{recipe.category}</p>
                                <h2 className="text-gray-800 text-lg font-bold">{recipe.title}</h2>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Recipe;