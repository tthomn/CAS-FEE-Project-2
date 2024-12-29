// CAS-FEE-Project-2/frontend/src/types/order.ts
import { CartItem } from "./cartItem";


export interface Order {
    id: string;
    userId?: string;
    cartItems: CartItem[];
    totalAmount: number;
    status: "pending" | "completed" | "canceled";
    createdAt: string;
}