import { Router } from 'express';
import { addProduct, getProducts } from '../controllers/productController';
import {addToCart} from "../controllers/cartController";

const router = Router();

router.post('/products', addProduct);
router.get('/products', getProducts);
router.post('/cart', addToCart);

export default router;




