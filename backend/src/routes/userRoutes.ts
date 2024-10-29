import * as express from 'express';
import { Request, Response } from 'express';
import admin from '../config/firebase';
import bcrypt from 'bcryptjs';

const router = express.Router();
const db = admin.firestore();

interface RegisterRequestBody {
    username: string;
    password: string;
}

router.post('/register', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('username', '==', username).get();

        if (!snapshot.empty) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await usersRef.add({
            username,
            password: hashedPassword,
        });

        res.status(201).json({ msg: 'User registered' });
    } catch (error: any) {
        console.error('Error during registration:', error);
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
});

export default router;
