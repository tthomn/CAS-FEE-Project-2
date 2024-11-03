import { Request, Response } from 'express';
import admin from '../config/firebase';

const db = admin.firestore();

export const addToCart = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { productId, productName, price, quantity, imageUrl } = req.body;

        console.log("Received request to add to cart:", { userId, productId, productName, price, quantity, imageUrl });

        const cartItemRef = db.collection('carts').doc(userId).collection('items').doc();

        await cartItemRef.set({
            productId,
            productName,
            price,
            quantity,
            imageUrl,
        });

        console.log(`Product ${productName} added to cart for user ${userId}`);
        res.status(201).json({ message: 'Product added to cart' });
    } catch (error: any) {
        console.error("Error adding product to cart:", error);
        res.status(500).json({ message: 'Error adding product to cart', error: error.message });
    }
};

export const getCartItems = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        console.log("Fetching cart items for user:", userId);

        const cartSnapshot = await db.collection('carts').doc(userId).collection('items').get();
        const cartItems = cartSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        console.log("Fetched cart items:", cartItems);
        res.status(200).json(cartItems);
    } catch (error: any) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({ message: 'Error fetching cart items', error: error.message });
    }
};

export const deleteCartItem = async (req: Request, res: Response) => {
    const { userId, productId } = req.params;

    try {
        console.log(`Deleting item ${productId} from user ${userId}'s cart`);

        const cartItemRef = db.collection('carts').doc(userId).collection('items').doc(productId);
        await cartItemRef.delete();

        console.log(`Item ${productId} deleted from cart for user ${userId}`);
        res.status(200).json({ message: 'Item deleted from cart' });
    } catch (error: any) {
        console.error("Error deleting item from cart:", error);
        res.status(500).json({ message: 'Error deleting item from cart', error: error.message });
    }
};
