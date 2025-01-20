import React from "react";
import Footer from "../layouts/Footer";

const ContactPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-[#fff8e1]">
            <div className="relative">
                <img
                    src="/images/contact_us.png"
                    alt="Contact Us Banner"
                    className="w-full h-40 sm:h-64 object-cover"
                    loading="eager"
                />
                <h1 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl sm:text-4xl font-bold">
                    Contact Us
                </h1>
            </div>

            <div className="flex-grow flex flex-col items-center py-10 px-6 sm:px-20">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Get in Touch</h2>
                <p className="text-gray-700 mb-8 text-center max-w-lg leading-relaxed whitespace-normal">
                    We’d love to hear from you! Whether you have questions about our bee products, need assistance with an order, or simply want to share your thoughts about honey, we’re here for you.
                </p>



                <div className="flex flex-col sm:flex-row justify-center gap-8 text-gray-800 text-base">
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
