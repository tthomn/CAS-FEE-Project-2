import { Router } from 'express';
import { addProduct, getProducts } from '../controllers/productController';

const router = Router();

router.post('/products', addProduct);
router.get('/products', getProducts);

export default router;




