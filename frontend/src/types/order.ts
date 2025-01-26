import { CartItem } from './cartItem';

export interface Order {
  id: string;
  userId?: string;
  cartItems: CartItem[];
  totalPrice: number;
  status: 'pending' | 'completed' | 'canceled';
  createdAt: string;
}
