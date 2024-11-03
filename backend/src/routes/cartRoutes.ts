import { Router } from 'express';
import { addToCart, getCartItems, deleteCartItem } from '../controllers/cartController';

const router = Router();

router.post('/cart/:userId', addToCart);
router.get('/cart/:userId', getCartItems);
router.delete('/cart/:userId/:productId', deleteCartItem);


export default router;
