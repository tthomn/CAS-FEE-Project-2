import express from 'express';
import cors from 'cors';
import productRoutes from './src/routes/productRoutes';

const app = express();

app.use(cors());

app.use(express.json());

app.use('/api', productRoutes);

const port = process.env.PORT || 5003;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
