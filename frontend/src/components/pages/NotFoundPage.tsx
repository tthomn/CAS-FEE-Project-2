import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
            <p className="text-lg text-gray-600 mb-6">
                Die Seite, die Sie suchen, existiert nicht.
            </p>
            <Link
                to="/"
                className="px-6 py-2 text-white bg-blue-500 rounded-md shadow-md hover:bg-blue-600"
            >
                Zurück zur Home
            </Link>
        </div>
    );
};

export default NotFoundPage;
