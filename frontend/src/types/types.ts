export interface Category {
    id: string;
    name: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    weight: number;
    imageURL: string;
    categoryId: string;
    stock: number;
}

export interface CartItem {
    id: string;
    productName: string;
    price: number;
    quantity: number;
    imageUrl: string;
    productId: string;
}


