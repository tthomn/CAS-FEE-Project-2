// CAS-FEE-Project-2/frontend/src/types/cartItem.ts

export interface CartItem {
    id: string;
    productName: string;
    price: number;
    quantity: number;
    imageUrl: string;
    productId: string;
    cartItemId: string;
    addedAt?: Date;    
}