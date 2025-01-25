import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { db } from '../../services/firebase/firebaseConfig';

interface SearchResult {
  id: string;
  name?: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search).get('query') || '';
  const [results, setResults] = useState<{ products: SearchResult[] }>({
    products: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      if (!queryParam) {
        setResults({ products: [] });
        setLoading(false);
        setError('');
        return;
      }

      setLoading(true);
      setError('');

      try {
        // Normalize query to lowercase
        const normalizedQuery = queryParam.trim().toLowerCase();
        console.log('Normalized query:', normalizedQuery);

        // Firestore query for exact matches
        const productsQuery = query(
          collection(db, 'products'),
          where('keywords', 'array-contains', normalizedQuery), // Exact match
        );

        // Fetch results
        const productsSnapshot = await getDocs(productsQuery);

        // Map Firestore results
        const products = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log('Fetched products:', products);

        setResults({ products });
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError(
          'An error occurred while fetching search results. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [queryParam]);

  const renderResults = (
    title: string,
    items: SearchResult[],
    linkPrefix: string,
  ) => (
    <div className="mb-6">
      <h2 className="mb-2 text-xl font-bold">{title}</h2>
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-4 rounded border p-4 shadow-md"
          >
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name || 'Product Image'}
                className="h-16 w-16 rounded object-cover"
              />
            )}
            <div>
              <Link
                to={`/${linkPrefix}/${item.id}`}
                className="text-lg font-semibold text-blue-500 hover:underline"
              >
                {item.name || 'No Name'}
              </Link>
              <p className="text-sm text-gray-600">
                {item.description || 'No Description'}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Search Results</h1>

      {loading && <p>Loading...</p>}

      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          {results.products.length > 0 &&
            renderResults('Products', results.products, 'shop')}

          {results.products.length === 0 && (
            <p>
              No results found for "{queryParam}".
              <br />
              You can explore our{' '}
              <Link to="/shop" className="text-blue-500 hover:underline">
                Shop
              </Link>{' '}
              or browse{' '}
              <Link to="/recipe" className="text-blue-500 hover:underline">
                Recipes
              </Link>
              .
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResultsPage;
