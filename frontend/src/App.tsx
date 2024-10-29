// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/pages/HomePage';
import Shop from './components/pages/Shop';
import Recipe from './components/pages/Recipe';
import RecipeDetail from './components/pages/RecipeDetail';
import Account from './components/pages/Account';
import Header from './components/layouts/Header';

const App: React.FC = () => {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/recipe" element={<Recipe />} />
                <Route path="/recipe/:id" element={<RecipeDetail />} />
                <Route path="/account" element={<Account />} />
            </Routes>
        </Router>
    );
};

export default App;
