import React, { useEffect, useState } from "react";
import CategorySidebar from "../../components/shared/CategorySidebar";
import ProductGrid from "../../components/pages/ProductGrid";
import { getCategories } from "../../services/CategoryService";

const ShopPage: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState<string>("Shop");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const fetchedCategories = await getCategories();
                setCategories(fetchedCategories);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return <p className="text-center">Loading categories...</p>;
    }

    return (
        <div>
            <div
                className="relative w-full h-[300px] bg-cover bg-center"
                style={{
                    backgroundImage: `url('/images/banner_bee.png')`,
                }}
            >
                {}
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
                    <h1 className="text-white text-3xl md:text-4xl font-bold uppercase tracking-wider">
                        {selectedCategoryName}
                    </h1>
                </div>
            </div>

            {}
            <div className="shop-page flex gap-6 p-4">
                {}
                <CategorySidebar
                    categories={categories}
                    activeCategory={selectedCategoryId}
                    onSelectCategory={(categoryId, categoryName) => {
                        setSelectedCategoryId(categoryId);
                        setSelectedCategoryName(categoryName || "Shop");
                    }}
                />

                {}
                <ProductGrid categoryId={selectedCategoryId} />
            </div>
        </div>
    );
};

export default ShopPage;
