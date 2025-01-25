import React from 'react';
import Footer from '../layouts/Footer';

const ContactPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#fff8e1]">
      <div className="relative">
        <img
          src="/images/contact_us.png"
          alt="Contact Us Banner"
          className="h-40 w-full object-cover sm:h-64"
          loading="eager"
        />
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-2xl font-bold text-white sm:text-4xl">
          Contact Us
        </h1>
      </div>

      <div className="flex flex-grow flex-col items-center px-6 py-10 sm:px-20">
        <h2 className="mb-6 text-2xl font-bold text-gray-800 sm:text-3xl">
          Get in Touch
        </h2>
        <p className="mb-8 max-w-lg whitespace-normal text-center leading-relaxed text-gray-700">
          We’d love to hear from you! Whether you have questions about our bee
          products, need assistance with an order, or simply want to share your
          thoughts about honey, we’re here for you.
        </p>

        <div className="flex flex-col justify-center gap-8 text-base text-gray-800 sm:flex-row">
          <div className="flex items-center gap-4">
            <i className="fas fa-envelope text-2xl text-orange-600"></i>
            <span>tetiana.thomann@gmail.com</span>
          </div>
          <div className="flex items-center gap-4">
            <i className="fas fa-phone text-2xl text-orange-600"></i>
            <span>+41 76 610 33 39</span>
          </div>
          <div className="flex items-center gap-4">
            <i className="fas fa-map-marker-alt text-2xl text-orange-600"></i>
            <span>Rietstrasse 31, 9450 Altstätten, Switzerland </span>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;
