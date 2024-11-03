import React, { useState } from 'react';
import CategorySidebar from '../../components/shared/CategorySidebar';
import ProductGrid from './ProductGrid';
import './ShopPage.css';

const ShopPage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    return (
        <div className="shop-page">
            <CategorySidebar onSelectCategory={setSelectedCategory} />
            <ProductGrid categoryId={selectedCategory} />
        </div>
    );
};

export default ShopPage;
