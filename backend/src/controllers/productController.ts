// src/controllers/productController.ts
import { Request, Response } from 'express';
import admin from '../config/firebase';

const db = admin.firestore();

interface Product {
    id?: string;
    name: string;
    price: number;
    description: string;
}


export const addProduct = async (req: Request, res: Response) => {
    try {
        const product: Product = req.body;
        const docRef = await db.collection('products').add(product);
        res.status(201).json({ message: 'Product added', id: docRef.id });
    } catch (error: any) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getProducts = async (req: Request, res: Response) => {
    try {
        const products: Product[] = [];
        const snapshot = await db.collection('products').get();

        snapshot.forEach(doc => {
            const data = doc.data();
            products.push({
                id: doc.id,
                name: data.name || "Unknown Name",
                price: data.price || 0,
                description: data.description || "No Description",
                ...data
            } as Product);
        });

        res.status(200).json(products);
    } catch (error: any) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
