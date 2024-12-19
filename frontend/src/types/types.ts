export interface Category {
    id: string;
    name: string;
}

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


export interface CartItem {
    id: string;
    productName: string;
    price: number;
    quantity: number;
    imageUrl: string;
    productId: string;
    cartItemId: string;
}

export interface Order {
    id: string;
    userId?: string;
    cartItems: CartItem[];
    totalAmount: number;
    status: "pending" | "completed" | "canceled";
    createdAt: string;
}


