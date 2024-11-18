import React from 'react';
import { useParams } from 'react-router-dom';

const RecipeDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    const recipeData: { [key: string]: { title: string; description: string; image: string } } = {
        '1': { title: 'Honig Kuchen', description: 'A delicious honey cake with rich flavor.', image: '/images/honey_cake.jpg' },
        '2': { title: 'Honig Sesam Sauce', description: 'Sweet honey sesame sauce, perfect for dipping.', image: '/images/honey_sesame_sauce.jpg' },
        '3': { title: 'Honig Kuchen', description: 'A delicious honey cake with rich flavor.', image: '/images/honey_cake.jpg' },
        '4': { title: 'Honig Sesam Sauce', description: 'Sweet honey sesame sauce, perfect for dipping.', image: '/images/honey_sesame_sauce.jpg' },
        '5': { title: 'Honig Kuchen', description: 'A delicious honey cake with rich flavor.', image: '/images/honey_cake.jpg' },
        '6': { title: 'Honig Sesam Sauce', description: 'Sweet honey sesame sauce, perfect for dipping.', image: '/images/honey_sesame_sauce.jpg' },
    };

    const recipe = recipeData[id!];

    if (!recipe) {
        return <div className="text-center text-red-600 font-bold mt-6">Recipe not found</div>;
    }

    return (
        <div className="min-h-screen bg-[#f8e5a1] pt-6 flex items-start justify-center">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                {}
                <div className="w-full h-[120px] overflow-hidden">
                    <img
                        src="/images/banner.jpg"
                        alt="Rezepte Banner"
                        className="w-full h-full object-cover"
                    />
                </div>

                {}
                <div className="p-6 md:p-10">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {}
                        <img
                            src={recipe.image}
                            alt={recipe.title}
                            className="w-full md:w-[300px] rounded-md object-cover"
                        />

                        {}
                        <div className="flex-1 text-gray-800">
                            <h3 className="text-2xl font-bold mb-4">{recipe.title}</h3>
                            <p className="text-lg leading-relaxed">{recipe.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetail;
