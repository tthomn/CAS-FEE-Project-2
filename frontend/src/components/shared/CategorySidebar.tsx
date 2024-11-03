import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './CategorySidebar.css';

interface Category {
    id: string;
    name: string;
}

interface CategorySidebarProps {
    onSelectCategory: (categoryId: string | null) => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({ onSelectCategory }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            const querySnapshot = await getDocs(collection(db, "categories"));
            const categoriesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as Category));
            setCategories(categoriesData);
        };

        fetchCategories();
    }, []);

    const handleCategoryClick = (categoryId: string | null) => {
        setActiveCategory(categoryId);
        onSelectCategory(categoryId);
    };

    return (
        <div className="category-sidebar">
            <h3>Kategorien</h3>
            <ul>
                <li>
                    <Link
                        to="/shop"
                        className={activeCategory === null ? "active" : ""}
                        onClick={() => handleCategoryClick(null)}
                    >
                        Alle
                    </Link>
                </li>
                {categories.map(category => (
                    <li key={category.id}>
                        <Link
                            to={`/shop?category=${category.id}`}
                            className={activeCategory === category.id ? "active" : ""}
                            onClick={() => handleCategoryClick(category.id)}
                        >
                            {category.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CategorySidebar;
