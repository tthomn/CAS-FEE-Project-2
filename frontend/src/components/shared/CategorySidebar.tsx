import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

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
        <div className="p-4">
            <h3 className="mb-4 text-lg font-bold">Kategorien</h3>
            <ul className="list-none p-0">
                <li className="mb-2">
                    <Link
                        to="/shop"
                        className={`font-bold text-lg cursor-pointer ${
                            activeCategory === null ? 'text-red-700' : 'text-red-500'
                        }`}
                        onClick={() => handleCategoryClick(null)}
                    >
                        Alle
                    </Link>
                </li>
                {categories.map(category => (
                    <li key={category.id} className="mb-2">
                        <Link
                            to={`/shop?category=${category.id}`}
                            className={`font-bold text-lg cursor-pointer ${
                                activeCategory === category.id ? 'text-red-700' : 'text-red-500'
                            }`}
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
