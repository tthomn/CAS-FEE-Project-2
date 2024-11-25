import React from "react";

interface BannerProps {
    category: string;
    description: string;
    imageUrl: string;
}

const Banner: React.FC<BannerProps> = ({ category, description, imageUrl }) => {
    return (
        <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
            <img
                src={imageUrl}
                alt={`${category} Banner`}
                className="absolute w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
                <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wide">
                    {category}
                </h1>
                <p className="text-white text-lg md:text-xl mt-4 max-w-2xl">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default Banner;
