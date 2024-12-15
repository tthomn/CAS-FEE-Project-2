import React, { useState } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useAuth } from "../../context/AuthContext";

interface RatingProps {
    productId: string;
    initialRating: number;
    ratingCount: number;
}

const Rating: React.FC<RatingProps> = ({ productId, initialRating, ratingCount }) => {
    const { user } = useAuth();
    const [averageRating, setAverageRating] = useState<number>(
        ratingCount > 0 ? initialRating / ratingCount : 0
    );
    const [userRating, setUserRating] = useState<number | null>(null);

    const handleRating = async (rating: number) => {
        if (!user) {
            alert("Please log in to rate this product.");
            return;
        }
        if (userRating !== null) return;

        try {
            const productRef = doc(db, "products", productId);
            const productDoc = await getDoc(productRef);

            if (productDoc.exists()) {
                const productData = productDoc.data();
                const currentTotal = productData.ratings?.totalRating || 0;
                const currentCount = productData.ratings?.ratingCount || 0;

                await updateDoc(productRef, {
                    "ratings.totalRating": currentTotal + rating,
                    "ratings.ratingCount": currentCount + 1,
                });

                setAverageRating((currentTotal + rating) / (currentCount + 1));
                setUserRating(rating);
            }
        } catch (error) {
            console.error("Error updating rating:", error);
        }
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <i
                        key={star}
                        className={`fas fa-star ${
                            star <= averageRating ? "text-yellow-500" : "text-gray-400"
                        } text-xl`}
                    ></i>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                    {averageRating.toFixed(1)} ({ratingCount} ratings)
                </span>
            </div>

            {user ? (
                <div className="flex mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className={`text-xl ${
                                star <= (userRating || averageRating) ? "text-yellow-500" : "text-gray-400"
                            }`}
                            onClick={() => handleRating(star)}
                            disabled={!!userRating}
                        >
                            ★
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 mt-2">
                    <i className="fas fa-info-circle text-gray-400"></i> Please log in to rate this product.
                </p>
            )}
        </div>
    );
};

export default Rating;
