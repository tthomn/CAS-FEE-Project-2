export interface Product {
  id: string;
  description?: string;
  keywords?: string[];
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
