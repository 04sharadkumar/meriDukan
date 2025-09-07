import Wishlist from '../models/wishlistModel.js';


export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      {
        $addToSet: { items: { productId } }, // avoid duplicates
      },
      { upsert: true, new: true }
    ).populate('items.productId');

    res.status(200).json({ success: true, wishlist });
  } catch (error) {
    console.error('Error in addToWishlist:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('items.productId');
    res.status(200).json({ success: true, wishlist: wishlist?.items || [] });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
export const deleteWishlistItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Remove the item with matching productId from the user's wishlist items array
    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { productId } } },
      { new: true }
    ).populate('items.productId');

    res.status(200).json({
      success: true,
      message: 'Item removed from wishlist',
      wishlist: updatedWishlist,
    });
  } catch (error) {
    console.error('Error removing wishlist item:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
