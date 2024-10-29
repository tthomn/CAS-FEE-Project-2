// src/components/pages/Recipe.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import './Recipe.css';

const Recipe: React.FC = () => {
    const recipes = [
        { id: 1, category: 'Kuchen', title: 'Honig Kuchen', image: '/images/honey_cake.jpg' },
        { id: 2, category: 'Sauce', title: 'Honig Sesam Sauce', image: '/images/honey_sesame_sauce.jpg' },
        { id: 3, category: 'Kuchen', title: 'Honig Kuchen', image: '/images/honey_cake.jpg' },
        { id: 4, category: 'Sauce', title: 'Honig Sesam Sauce', image: '/images/honey_sesame_sauce.jpg' },
        { id: 5, category: 'Kuchen', title: 'Honig Kuchen', image: '/images/honey_cake.jpg' },
        { id: 6, category: 'Sauce', title: 'Honig Sesam Sauce', image: '/images/honey_sesame_sauce.jpg' }
    ];

    return (
        <div className="recipe-page">
            <div className="recipe-banner">
                <img src="/images/banner.jpg" alt="Rezepte Banner" className="banner-image" />
                <h2 className="banner-text">REZEPTE</h2>
            </div>

            <div className="recipe-grid">
                {recipes.map(recipe => (
                    <Link to={`/recipe/${recipe.id}`} key={recipe.id} className="recipe-card-link">
                        <div className="recipe-card">
                            <img src={recipe.image} alt={recipe.title} className="recipe-image" />
                            <p className="recipe-category">{recipe.category}</p>
                            <h3 className="recipe-title">{recipe.title}</h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Recipe;
