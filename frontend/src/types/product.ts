//path: CAS-FEE-Project-2/frontend/src/types/product.ts
export interface Product {
    id: string;
    name: string;
    price: number;
    weight: number;
    imageUrl: string;
    categoryId: string;
    stock: number;
    ratings?: {
        totalRating: number;
        ratingCount: number;
    };
}

