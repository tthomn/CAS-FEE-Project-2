import React from 'react';
import { useParams, Link } from 'react-router-dom';

const RecipeDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    const recipeData: { [key: string]: { title: string; description: string; image: string } } = {
        '1': { title: 'Honey cake', description: 'A juicy, aromatic cake with the natural sweetness of honey. Perfect for cozy afternoons or special occasions, this classic inspires with its soft texture and a touch of well -being taste in every bit. 🍯🍰',  image: require('../../assets/images/honig_kuchen.png') },
        '2': { title: 'Honig Sesam Sauce', description: 'A delicious combination of the natural sweetness of honey and the nutty aroma of Sesame. Perfect as a dressing for salads, dip for vegetables or glaze for meat and fish. This versatile sauce brings a touch of sophistication to every meal! 🍯🌱',image: require('../../assets/images/honey_sesame_sauce.jpg') },
        '3': { title: 'Honig Torte', description: 'A masterful creation of delicate layers refined with the natural sweetness of honey. This cake combines juicy layers of dough with a light, creamy filling and a touch of luxury in every bite. Perfect for special occasions or to spoil yourself! 🍯🎂', image:  require('../../assets/images/honey_cake.jpg') },
        '4': { title: 'Honig Mousse', description: 'An airy, creamy seduction with the fine sweetness of honey. This delicate dessert meltes on the tongue and spoils the palate with a touch of elegance and natural taste. Perfect for special moments or as a highlight of a menu! 🍯🍮', image: require('../../assets/images/honig_mousse.png') },
        '5': { title: 'Honig Tee', description: 'A soothing combination of aromatic tea and the natural sweetness of honey. Ideal for relaxed moments, this tea spoils the senses and ensures a warm, calming break. Perfect for cold days or easy to enjoy! 🍯☕',  image:  require('../../assets/images/honey_tea.png')},
        '6': { title: 'Honig Kekse', description: 'Delicious, golden brown cookies with the natural sweetness of honey. Perfect for enjoying a cup of tea or coffee, with a delicate aroma that makes every bit at a special moment. 🍯🍪', image: require('../../assets/images/honig_kekse.png')},
    };

    const recipe = recipeData[id!];

    if (!recipe) {
        return <div className="text-center text-red-600 font-bold mt-6">Recipe not found</div>;
    }

    return (
        <div className="min-h-screen bg-[#f8e5a1] pt-6 relative">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden mt-12 relative">
                <Link
                    to="/recipe"
                    className="absolute top-3 left-3 text-3xl bg-transparent text-gray-700 hover:text-orange-600 z-50 group"
                    aria-label="Back to Recipes"
                >
                    &larr;
                    <span className="absolute top-10 left-2 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-sm rounded-lg py-1 px-3 shadow-lg transition-opacity duration-300">
                        Back to Recipes
                    </span>
                </Link>

                <div className="w-full h-[120px] overflow-hidden">
                    <img
                        src="/images/banner.jpg"
                        alt="Rezepte Banner"
                        className="w-full h-full object-cover"
                        loading="eager"
                    />
                </div>

                <div className="p-6 md:p-10">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <img
                            src={recipe.image}
                            alt={recipe.title}
                            className="w-full md:w-[300px] rounded-md object-cover"
                        />
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