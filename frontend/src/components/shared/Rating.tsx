import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
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
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [selectedRating, setSelectedRating] = useState<number>(0);
    const [alreadyRatedMessageVisible, setAlreadyRatedMessageVisible] = useState(false);

    useEffect(() => {
        const fetchUserRating = async () => {
            if (!user) return;

            try {
                const ratingsQuery = query(
                    collection(db, "ratings"),
                    where("userId", "==", user.uid),
                    where("productId", "==", productId)
                );
                const ratingsSnapshot = await getDocs(ratingsQuery);

                if (!ratingsSnapshot.empty) {
                    const userRatingData = ratingsSnapshot.docs[0].data();
                    setUserRating(userRatingData.rating);
                }
            } catch (error) {
                console.error("Error fetching user rating:", error);
            }
        };

        fetchUserRating();
    }, [user, productId]);

    const handleOpenPopup = () => {
        if (userRating !== null) {
            setAlreadyRatedMessageVisible((prev) => !prev);
            return;
        }
        setShowPopup(true);
    };

    const handleRateProduct = async () => {
        if (!user || selectedRating === 0) return;

        try {
            const productRef = doc(db, "products", productId);
            const productDoc = await getDoc(productRef);

            if (productDoc.exists()) {
                const productData = productDoc.data();
                const currentTotal = productData.ratings?.totalRating || 0;
                const currentCount = productData.ratings?.ratingCount || 0;

                await updateDoc(productRef, {
                    "ratings.totalRating": currentTotal + selectedRating,
                    "ratings.ratingCount": currentCount + 1,
                });

                const ratingRef = doc(collection(db, "ratings"));
                await setDoc(ratingRef, {
                    userId: user.uid,
                    productId,
                    rating: selectedRating,
                });

                setAverageRating((currentTotal + selectedRating) / (currentCount + 1));
                setUserRating(selectedRating);
                setShowPopup(false);
            }
        } catch (error) {
            console.error("Error updating rating:", error);
        }
    };

    const renderStars = () => {
        const filledStars = Math.floor(averageRating);
        const partialStarWidth = (averageRating - filledStars) * 100;
        const totalStars = 5;

        return (
            <div className="flex items-center">
                {[...Array(totalStars)].map((_, index) => (
                    <div key={index} className="relative">
                        <i className="fas fa-star text-gray-400 text-xl"></i>
                        {index < filledStars && (
                            <i
                                className="fas fa-star absolute inset-0 text-yellow-500 text-xl"
                                style={{ clipPath: "inset(0 0 0 0)" }}
                            ></i>
                        )}
                        {index === filledStars && partialStarWidth > 0 && (
                            <i
                                className="fas fa-star absolute inset-0 text-yellow-500 text-xl"
                                style={{
                                    clipPath: `inset(0 ${100 - partialStarWidth}% 0 0)`,
                                }}
                            ></i>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center gap-2">
            {renderStars()}
            <span className="ml-2 text-sm text-gray-600">
                {averageRating.toFixed(1)} ({ratingCount} ratings)
            </span>

            {user ? (
                <>
                    <button
                        onClick={handleOpenPopup}
                        className="text-sm text-blue-500 hover:underline mt-2"
                    >
                        Rate this product
                    </button>
                    {alreadyRatedMessageVisible && (
                        <p className="text-sm text-gray-500 mt-1">
                            <i className="fas fa-info-circle text-gray-400"></i> You already rated this product.
                        </p>
                    )}
                </>
            ) : (
                <p className="text-sm text-gray-500 mt-2">
                    <i className="fas fa-info-circle text-gray-400"></i> Please log in to rate this product.
                </p>
            )}

            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
                        <h3 className="text-lg font-bold mb-4">Rate this product</h3>
                        <div className="flex justify-center mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    className={`text-2xl ${
                                        star <= selectedRating ? "text-yellow-500" : "text-gray-400"
                                    }`}
                                    onClick={() => setSelectedRating(star)}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleRateProduct}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Rate
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Rating;
