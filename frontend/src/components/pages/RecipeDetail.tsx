import React from 'react';
import { useParams, Link } from 'react-router-dom';

const RecipeDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    const recipeData: { [key: string]: { title: string; description: string; image: string } } = {
        '1': { title: 'Honig Kuchen', description: 'Ein saftiger, aromatischer Kuchen mit der natürlichen Süsse von Honig. Perfekt für gemütliche Nachmittage oder besondere Anlässe, begeistert dieser Klassiker mit seiner weichen Textur und einem Hauch von Wohlfühlgeschmack in jedem Bissen. 🍯🍰',  image: require('../../assets/images/honig_kuchen.png') },
        '2': { title: 'Honig Sesam Sauce', description: ' Eine köstliche Kombination aus der natürlichen Süsse von Honig und dem nussigen Aroma von Sesam. Perfekt als Dressing für Salate, Dip für Gemüse oder Glasur für Fleisch und Fisch. Diese vielseitige Sauce bringt einen Hauch von Raffinesse in jede Mahlzeit! 🍯🌱',image: require('../../assets/images/honey_sesame_sauce.jpg') },
        '3': { title: 'Honig Torte', description: ' Eine meisterhafte Kreation aus zarten Schichten, verfeinert mit der natürlichen Süße von Honig. Diese Torte verbindet saftige Teigschichten mit einer leichten, cremigen Füllung und einem Hauch von Luxus in jedem Bissen. Perfekt für besondere Anlässe oder um sich selbst zu verwöhnen! 🍯🎂', image:  require('../../assets/images/honey_cake.jpg') },
        '4': { title: 'Honig Mousse', description: ' Eine luftig-cremige Verführung mit der feinen Süsse von Honig. Dieses zarte Dessert zergeht auf der Zunge und verwöhnt den Gaumen mit einem Hauch von Eleganz und natürlichem Geschmack. Perfekt für besondere Momente oder als Highlight eines Menüs! 🍯🍮', image: require('../../assets/images/honig_mousse.png') },
        '5': { title: 'Honig Tee', description: 'Eine wohltuende Kombination aus aromatischem Tee und der natürlichen Süsse von Honig. Ideal für entspannte Momente, verwöhnt dieser Tee die Sinne und sorgt für eine warme, beruhigende Auszeit. Perfekt für kalte Tage oder einfach zum Geniessen! 🍯☕',  image:  require('../../assets/images/honey_tea.png')},
        '6': { title: 'Honig Kekse', description: 'Köstliche, goldbraune Kekse mit der natürlichen Süsse von Honig. Perfekt für den Genuss zu einer Tasse Tee oder Kaffee, mit einem zarten Aroma, das jeden Bissen zu einem besonderen Moment macht. 🍯🍪', image: require('../../assets/images/honig_kekse.png')},
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