// src/components/pages/RecipeDetail.tsx

import React from 'react';
import { useParams } from 'react-router-dom';
import './RecipeDetail.css';

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
        return <div>Recipe not found</div>;
    }

    return (
        <>
        <div className="recipe-detail">
            <div className="recipe-banner">
                <img src="/images/banner.jpg" alt="Rezepte Banner" className="banner-image" />
            </div>
            <div className="recipe-content">
                <img src={recipe.image} alt={recipe.title} className="recipe-detail-image" />
                <div className="recipe-description">
                    <h3>{recipe.title}</h3>
                    <p>{recipe.description}</p>
                </div>
            </div>
        </div>
        </>
    );
};

export default RecipeDetail;
