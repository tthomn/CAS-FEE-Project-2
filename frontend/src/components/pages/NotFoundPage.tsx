import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 text-center">
      <h1 className="mb-4 text-4xl font-bold text-gray-800">
        404 - Page Not Found
      </h1>
      <p className="mb-6 text-lg text-gray-600">
        Die Seite, die Sie suchen, existiert nicht.
      </p>
      <Link
        to="/"
        className="rounded-md bg-blue-500 px-6 py-2 text-white shadow-md hover:bg-blue-600"
      >
        Zurück zur Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
