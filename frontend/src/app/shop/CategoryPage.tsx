import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCategoryById } from "../../services/CategoryService";

const CategoryPage: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const [category, setCategory] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                setLoading(true);
                const fetchedCategory = await getCategoryById(categoryId!);
                setCategory(fetchedCategory);
            } catch (err) {
                setError("Category not found.");
                console.error("Error fetching category:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategory();
    }, [categoryId]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            {}
            <div
                className="relative w-full h-[400px] md:h-[500px] bg-cover bg-center"
                style={{
                    backgroundImage: `url('/images/banner_bee.png')`,
                }}
            >
                {}
                <div className="absolute inset-0 bg-black/40"></div>

                {}
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
                    <h1 className="text-white text-4xl md:text-5xl font-bold uppercase tracking-wider">
                        {category.name}
                    </h1>
                    <p className="text-white text-lg md:text-xl mt-4 max-w-xl">
                        {category.description}
                    </p>
                </div>
            </div>

            {}
            <div className="container mx-auto mt-8">
                <p>Products for {category.name} will be displayed here.</p>
            </div>
        </div>
    );
};

export default CategoryPage;
