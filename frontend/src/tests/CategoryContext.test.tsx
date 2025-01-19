import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import { CategoriesProvider, useCategories } from '../context/CategoryContext';
import { getCollectionData } from '../services/firebase/firestoreService';
import { Category } from '../types/category';

jest.mock('../services/firebase/firestoreService');

const mockCategories: Category[] = [
    { id: '1', name: 'Category 1' },
    { id: '2', name: 'Category 2' },
];

describe('CategoryContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getCollectionData as jest.Mock).mockResolvedValue(mockCategories);
    });

    it('fetches and sets categories', async () => {
        const TestComponent: React.FC = () => {
            const { categories, fetchCategories } = useCategories();

            return (
                <div>
                    <button onClick={fetchCategories}>Fetch Categories</button>
                    {categories.map((category) => (
                        <div key={category.id}>{category.name}</div>
                    ))}
                </div>
            );
        };

        render(
            <CategoriesProvider>
                <TestComponent />
            </CategoriesProvider>
        );

        screen.getByText('Fetch Categories').click();

        await waitFor(() => {
            expect(screen.getByText('Category 1')).toBeInTheDocument();
            expect(screen.getByText('Category 2')).toBeInTheDocument();
        });
    });

    it('handles fetch error', async () => {
        (getCollectionData as jest.Mock).mockRejectedValue(new Error('Failed to fetch categories'));

        const TestComponent: React.FC = () => {
            const { categories, fetchCategories } = useCategories();

            React.useEffect(() => {
                fetchCategories();
            }, [fetchCategories]);

            return (
                <div>
                    {categories.length === 0 ? <p>No categories available</p> : null}
                </div>
            );
        };

        render(
            <CategoriesProvider>
                <TestComponent />
            </CategoriesProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('No categories available')).toBeInTheDocument();
        });
    });

    it('throws error when useCategories is used outside of CategoriesProvider', () => {
        const TestComponent: React.FC = () => {
            useCategories();
            return <div />;
        };

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => render(<TestComponent />)).toThrow(
            'useCategories must be used within a CategoriesProvider'
        );

        consoleErrorSpy.mockRestore();
    });
});
