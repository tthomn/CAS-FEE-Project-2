import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";

interface SearchResult {
    id: string;
    name?: string;
    description?: string;
    [key: string]: any;
}

const SearchResultsPage: React.FC = () => {
    const location = useLocation();
    const queryParam = new URLSearchParams(location.search).get("query") || "";
    const [results, setResults] = useState<{ products: SearchResult[]; recipes: SearchResult[] }>({
        products: [],
        recipes: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchResults = async () => {
            if (!queryParam) {
                return;
            }

            setLoading(true);
            setError("");

            try {
                const normalizedQuery = queryParam.trim().toLowerCase();

                const productsQuery = query(
                    collection(db, "products"),
                    where("keywords", "array-contains", normalizedQuery)
                );

                const recipesQuery = query(
                    collection(db, "recipes"),
                    where("keywords", "array-contains", normalizedQuery)
                );

                const [productsSnapshot, recipesSnapshot] = await Promise.all([
                    getDocs(productsQuery),
                    getDocs(recipesQuery),
                ]);

                const products = productsSnapshot.docs.map((doc) => {
                    return { id: doc.id, ...doc.data() };
                });

                const recipes = recipesSnapshot.docs.map((doc) => {
                    return { id: doc.id, ...doc.data() };
                });

                setResults({ products, recipes });
            } catch (err) {
                console.error("Error fetching search results:", err);
                setError("An error occurred while fetching search results. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [queryParam]);

    const renderResults = (title: string, items: SearchResult[], linkPrefix: string) => (
        <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">{title}</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-4 border p-4 rounded shadow-md">
                        {item.imageUrl && (
                            <img
                                src={item.imageUrl}
                                alt={item.name || "Product Image"}
                                className="w-16 h-16 object-cover rounded"
                            />
                        )}
                        <div>
                            <Link
                                to={`/${linkPrefix}/${item.id}`}
                                className="text-lg font-semibold text-blue-500 hover:underline"
                            >
                                {item.name || "No Name"}
                            </Link>
                            <p className="text-gray-600 text-sm">{item.description || "No Description"}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );


    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Search Results</h1>

            {loading && <p>Loading...</p>}

            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && (
                <>
                    {results.products.length > 0 && renderResults("Products", results.products, "shop")}
                    {results.recipes.length > 0 && renderResults("Recipes", results.recipes, "recipe")}

                    {results.products.length === 0 && results.recipes.length === 0 && (
                        <p>
                            No results found for "{queryParam}".
                            <br />
                            You can explore our <Link to="/shop" className="text-blue-500 hover:underline">Shop</Link> or browse <Link to="/recipe" className="text-blue-500 hover:underline">Recipes</Link>.
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

export default SearchResultsPage;
