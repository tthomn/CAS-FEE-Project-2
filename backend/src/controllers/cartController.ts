import { Request, Response } from 'express';
import admin from '../config/firebase';

const db = admin.firestore();

export const addToCart = async (req: Request, res: Response) => {
    try {
        const { productName, price, quantity } = req.body;

        console.log('Received request to add product:', { productName, price, quantity });

        await db.collection('cart').add({
            productName,
            price,
            quantity,
        });

        console.log('Product added successfully');
        res.status(201).json({ message: 'Product added to cart' });
    } catch (error: any) {
        console.error("Error adding product to cart: ", error);
        res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
