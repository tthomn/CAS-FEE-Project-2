import React, { useState, useEffect } from "react";
import { where,  } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import {getCollectionData, updateDocByRef,createDocRef, getData,  setDocByRef, createCollectionRef } from "../../services/firebase/firestoreService";


interface RatingProps {
    productId: string;
    initialRating: number;
    initialRatingCount: number;
}

const Rating: React.FC<RatingProps> = ({ productId, initialRating, initialRatingCount }) => {
    const { user } = useAuth();
    const [averageRating, setAverageRating] = useState<number>(
        initialRatingCount > 0 ? initialRating / initialRatingCount : 0
    );
    const [ratingCount, setRatingCount] = useState<number>(initialRatingCount);
    const [userRating, setUserRating] = useState<number | null>(null);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [selectedRating, setSelectedRating] = useState<number>(0);
    const [alreadyRatedMessageVisible, setAlreadyRatedMessageVisible] = useState(false);

    useEffect(() => {
        if (!user) return;

        const fetchUserRating = async () => {
            try {
    
                const constraints =   [where("userId", "==", user.uid), where("productId", "==", productId)];
                const ratingsSnapshot = await getCollectionData("ratings", constraints);

                if (ratingsSnapshot.length > 0) {
              
                   const userRatingData = ratingsSnapshot[0];                  
                    setUserRating((userRatingData as { rating: number }).rating);

                }
            } catch (error) {
                console.error("Error fetching user rating:", error);
            }
        };

        fetchUserRating();
    }, [user, productId]);

    const handleOpenPopup = () => {
        if (userRating !== null) {
            setAlreadyRatedMessageVisible(true);
            return;
        }
        setShowPopup(true);
    };

    const handleRateProduct = async () => {
        if (!user || selectedRating === 0) return;

        try {

            const productRef = await createDocRef("products", productId);
            const productDoc = await getData(productRef);
                  
               if (productDoc.exists()) {
                   const productData = productDoc.data();
                   const currentTotal = productData.ratings?.totalRating || 0;
                   const currentCount = productData.ratings?.ratingCount || 0;
   
                   const newRatingCount = currentCount + 1;
                   const newAverageRating = (currentTotal + selectedRating) / newRatingCount;
   
                   await  updateDocByRef(productRef, {
                       "ratings.totalRating": currentTotal + selectedRating,
                       "ratings.ratingCount": newRatingCount,
                   });
                          

               const ratingRef = await createCollectionRef("ratings");
               await setDocByRef(ratingRef, {
                     userId: user.uid,
                     productId,
                     rating: selectedRating,
               });


                setAverageRating(newAverageRating);
                setRatingCount(newRatingCount);
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
                            <i className="fas fa-star text-yellow-500 text-xl absolute inset-0"></i>
                        )}
                        {index === filledStars && partialStarWidth > 0 && (
                            <i
                                className="fas fa-star text-yellow-500 text-xl absolute inset-0"
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
              {averageRating.toFixed(1)} ({ratingCount} {ratingCount === 1 ? "review" : "reviews"})
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
