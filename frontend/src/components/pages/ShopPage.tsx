import React, { useState } from 'react';
import CategorySidebar from '../../components/shared/CategorySidebar';
import ProductGrid from './ProductGrid';

const ShopPage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    return (
        <div className="shop-page flex gap-6 p-4">
            {}
            <CategorySidebar onSelectCategory={setSelectedCategory} />

            {}
            <ProductGrid categoryId={selectedCategory} />
        </div>
    );
};

export default ShopPage;
