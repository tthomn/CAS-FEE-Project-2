import { where } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getCollectionData,
  updateDocByRef,
  createDocRef,
  getData,
  setDocByRef,
  createCollectionRef,
} from '../../services/firebase/firestoreService';

interface RatingProps {
  productId: string;
  initialRating: number;
  initialRatingCount: number;
}

const Rating: React.FC<RatingProps> = ({
  productId,
  initialRating,
  initialRatingCount,
}) => {
  const { user } = useAuth();
  const [averageRating, setAverageRating] = useState<number>(
    initialRatingCount > 0 ? initialRating / initialRatingCount : 0,
  );
  const [ratingCount, setRatingCount] = useState<number>(initialRatingCount);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [alreadyRatedMessageVisible, setAlreadyRatedMessageVisible] =
    useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchUserRating = async () => {
      try {
        const constraints = [
          where('userId', '==', user.uid),
          where('productId', '==', productId),
        ];
        const ratingsSnapshot = await getCollectionData('ratings', constraints);

        if (ratingsSnapshot.length > 0) {
          const userRatingData = ratingsSnapshot[0];
          setUserRating((userRatingData as { rating: number }).rating);
        }
      } catch (error) {
        console.error('Error fetching user rating:', error);
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
      const productRef = await createDocRef('products', productId);
      const productDoc = await getData(productRef);

      if (productDoc.exists()) {
        const productData = productDoc.data();
        const currentTotal = productData.ratings?.totalRating || 0;
        const currentCount = productData.ratings?.ratingCount || 0;

        const newRatingCount = currentCount + 1;
        const newAverageRating =
          (currentTotal + selectedRating) / newRatingCount;

        await updateDocByRef(productRef, {
          'ratings.totalRating': currentTotal + selectedRating,
          'ratings.ratingCount': newRatingCount,
        });

        const ratingRef = await createCollectionRef('ratings');
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
      console.error('Error updating rating:', error);
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
            <i className="fas fa-star text-xl text-gray-400"></i>
            {index < filledStars && (
              <i className="fas fa-star absolute inset-0 text-xl text-yellow-500"></i>
            )}
            {index === filledStars && partialStarWidth > 0 && (
              <i
                className="fas fa-star absolute inset-0 text-xl text-yellow-500"
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
        {averageRating.toFixed(1)} ({ratingCount}{' '}
        {ratingCount === 1 ? 'review' : 'reviews'})
      </span>

      {user ? (
        <>
          <button
            onClick={handleOpenPopup}
            className="mt-2 text-sm text-blue-500 hover:underline"
          >
            Rate this product
          </button>
          {alreadyRatedMessageVisible && (
            <p className="mt-1 text-sm text-gray-500">
              <i className="fas fa-info-circle text-gray-400"></i> You already
              rated this product.
            </p>
          )}
        </>
      ) : (
        <p className="mt-2 text-sm text-gray-500">
          <i className="fas fa-info-circle text-gray-400"></i> Please log in to
          rate this product.
        </p>
      )}

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-80 rounded-lg bg-white p-6 text-center shadow-lg">
            <h3 className="mb-4 text-lg font-bold">Rate this product</h3>
            <div className="mb-4 flex justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`text-2xl ${
                    star <= selectedRating ? 'text-yellow-500' : 'text-gray-400'
                  }`}
                  onClick={() => setSelectedRating(star)}
                >
                  ★
                </button>
              ))}
            </div>
            <button
              onClick={handleRateProduct}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
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
