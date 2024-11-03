import express from 'express';
import cors from 'cors';
import productRoutes from './src/routes/productRoutes';
import cartRoutes from './src/routes/cartRoutes';

const app = express();

app.use(cors());

app.use(express.json());

app.use('/api', productRoutes);
app.use('/api', cartRoutes);

const port = process.env.PORT || 5003;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
