import React from 'react';
import { Link } from 'react-router-dom';
import './RecipeList.css';

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
        <div className="recipe-list">
            <div className="recipe-banner">
                <img src="/images/banner.jpg" alt="Rezepte Banner" className="banner-image" />
                <h2 className="banner-text">REZEPTE</h2>
            </div>

            <div className="recipe-grid">
                {recipes.map(recipe => (
                    <Link to={`/rezept/${recipe.id}`} key={recipe.id} className="recipe-card-link">
                        <div className="recipe-card">
                            <img src={recipe.image} alt={recipe.name} className="recipe-image" />
                            <p className="recipe-category">{recipe.category}</p>
                            <h3 className="recipe-title">{recipe.name}</h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RecipeList;
