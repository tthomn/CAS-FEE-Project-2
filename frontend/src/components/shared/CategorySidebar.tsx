import React from "react";
import { Link } from "react-router-dom";

interface Category {
    id: string;
    name: string;
}

interface CategorySidebarProps {
    categories: Category[];
    onSelectCategory: (categoryId: string | null, categoryName: string | null) => void;
    activeCategory: string | null;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
                                                             categories,
                                                             onSelectCategory,
                                                             activeCategory,
                                                         }) => {
    return (
        <div className="p-4">
            <h3 className="mb-4 text-lg font-bold">Kategorien</h3>
            <ul className="list-none p-0">
                <li className="mb-2">
                    <Link
                        to="/shop"
                        className={`font-bold text-lg cursor-pointer ${
                            activeCategory === null ? "text-red-700" : "text-red-500"
                        }`}
                        onClick={() => onSelectCategory(null, "Shop")}
                    >
                        Alle Kategorien
                    </Link>
                </li>
                {categories.map((category) => (
                    <li key={category.id} className="mb-2">
                        <Link
                            to={`/shop?category=${category.id}`}
                            className={`font-bold text-lg cursor-pointer ${
                                activeCategory === category.id ? "text-red-700" : "text-red-500"
                            }`}
                            onClick={() => onSelectCategory(category.id, category.name)}
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
