import { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '@/context/AuthContext';
import { Star, StarHalf, StarOutline } from '@mui/icons-material';
import { CircularProgress, Rating } from '@mui/material';

function Review() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get('id');

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    average: 0,
    total: 0,
    distribution: [0, 0, 0, 0, 0]
  });

  // Calculate review statistics
  const calculateStats = (reviews) => {
    if (!reviews.length) return {
      average: 0,
      total: 0,
      distribution: [0, 0, 0, 0, 0]
    };

    const total = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / total;

    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      distribution[review.rating - 1]++;
    });

    return {
      average,
      total,
      distribution
    };
  };

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/review/${productId}`);
        setReviews(res.data);
        setReviewStats(calculateStats(res.data));
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchReviews();
  }, [productId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return navigate('/login');
    if (rating === 0) return alert('Please select a rating');

    setSubmitting(true);

    const formData = new FormData();
    formData.append('rating', rating);
    formData.append('text', text);
    if (image) {
      formData.append('image', image);
    }

    try {
      await axios.post(`http://localhost:5000/api/review/${productId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      setRating(0);
      setText('');
      setImage(null);
      setImagePreview(null);

      // Refresh reviews
      const res = await axios.get(`http://localhost:5000/api/review/${productId}`);
      setReviews(res.data);
      setReviewStats(calculateStats(res.data));
    } catch (err) {
      console.error('Review submit error:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalf key={i} className="text-yellow-400" />);
      } else {
        stars.push(<StarOutline key={i} className="text-yellow-400" />);
      }
    }

    return stars;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 my-8">
      <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>

      {loading ? (
        <div className="flex justify-center py-8">
          <CircularProgress />
        </div>
      ) : (
        <>
          {/* Review Summary */}
          <div className="flex flex-col md:flex-row gap-8 mb-10 p-6 bg-gray-50 rounded-lg">
            <div className="text-center md:text-left">
              <h4 className="text-4xl font-bold mb-2">{reviewStats.average.toFixed(1)}</h4>
              <div className="flex justify-center md:justify-start mb-2">
                {renderStars(reviewStats.average)}
              </div>
              <p className="text-gray-600">{reviewStats.total} reviews</p>
            </div>

            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-8 text-gray-700">{star} star</span>
                  <div className="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full"
                      style={{
                        width: `${reviewStats.total > 0 ? (reviewStats.distribution[star - 1] / reviewStats.total) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="w-10 text-gray-600 text-sm">
                    {reviewStats.distribution[star - 1]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Form */}
          {user ? (
            <form onSubmit={handleSubmit} className="mb-8 space-y-4 p-6 border border-gray-200 rounded-lg">
              <h4 className="text-lg font-semibold">Write a Review</h4>
              
              <div>
                <label className="block font-medium mb-2">Your Rating:</label>
                <Rating
                  name="rating"
                  value={rating}
                  precision={0.5}
                  onChange={(e, newValue) => setRating(newValue)}
                  onChangeActive={(e, newHover) => setHover(newHover)}
                  size="large"
                  emptyIcon={
                    <StarOutline style={{ opacity: 0.55 }} fontSize="inherit" />
                  }
                />
                {rating !== null && (
                  <span className="ml-2 text-gray-600">
                    {hover ? hover : rating}
                  </span>
                )}
              </div>

              <div>
                <label className="block font-medium mb-2">Review:</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  rows={5}
                  placeholder="Share your experience with this product..."
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Upload Image (optional):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="review-image"
                />
                <label htmlFor="review-image" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-pink-400 transition-colors">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-40 mx-auto mb-2 rounded"
                      />
                    ) : (
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                    <span className="mt-2 block text-sm text-gray-600">
                      {imagePreview ? 'Change image' : 'Click to upload an image'}
                    </span>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <CircularProgress size={20} color="inherit" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center p-6 border border-gray-200 rounded-lg mb-8">
              <p className="text-gray-700 mb-4">
                Please login to share your review and help others make better choices.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
              >
                Login to Review
              </button>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-8">
            <h4 className="text-xl font-semibold mb-6">
              Customer Reviews ({reviewStats.total})
            </h4>

            {reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reviews yet. Be the first to review!
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review._id}
                  className="border-b border-gray-200 pb-6 last:border-0"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-lg">
                        {review.userId?.name || 'Anonymous'}
                      </h4>
                      <div className="flex items-center gap-1">
                        <Rating
                          value={review.rating}
                          precision={0.5}
                          readOnly
                          size="small"
                        />
                        <span className="text-gray-500 text-sm ml-1">
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4 whitespace-pre-line">
                    {review.text}
                  </p>
                  {review.image && (
                    <div className="w-full max-w-xs overflow-hidden rounded-lg mb-4">
                      <img
                        src={review.image}
                        alt="Review"
                        className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(review.image, '_blank')}
                      />
                    </div>
                  )}
                  {review.userId?._id === user?._id && (
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      Edit Review
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Review;