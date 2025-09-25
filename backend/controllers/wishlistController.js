// controllers/wishlistController.js

import Wishlist from '../models/wishlistModel.js';

/**
 * Add item to wishlist
 * POST /api/wishlist
 */
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $addToSet: { items: { productId } } }, // avoid duplicates
      { upsert: true, new: true }
    ).populate('items.productId');

    const addedItem = wishlist.items.find(
      item => item.productId._id.toString() === productId
    );

    res.status(200).json({ success: true, item: addedItem });
  } catch (error) {
    console.error('Error in addToWishlist:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Get all wishlist items
 * GET /api/wishlist
 */
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('items.productId');
    res.status(200).json({ success: true, wishlist: wishlist?.items || [] });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Delete single wishlist item
 * DELETE /api/wishlist/:id
 */
export const deleteWishlistItem = async (req, res) => {
  try {
    const wishlistItemId = req.params.id;
    const userId = req.user._id;

    if (!wishlistItemId) {
      return res.status(400).json({ success: false, message: 'Wishlist item ID required' });
    }

    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { _id: wishlistItemId } } }, // use subdocument _id
      { new: true }
    ).populate('items.productId');

    res.status(200).json({ success: true, wishlist: updatedWishlist });
  } catch (error) {
    console.error('Error deleting wishlist item:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Clear entire wishlist
 * DELETE /api/wishlist
 */
export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } },
      { new: true }
    );

    res.status(200).json({ success: true, message: 'Wishlist cleared', wishlist: updatedWishlist });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Toggle wishlist item (add if not exists, remove if exists)
 * POST /api/wishlist/toggle
 */
export const toggleWishlistItem = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    if (!productId) return res.status(400).json({ success: false, message: "Product ID required" });

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      const newWishlist = await Wishlist.create({ user: userId, items: [{ productId }] });
      const populated = await newWishlist.populate('items.productId');
      return res.status(200).json({ success: true, added: true, item: populated.items[0] });
    }

    const existingItem = wishlist.items.find(item => item.productId.toString() === productId);

    if (existingItem) {
      wishlist.items = wishlist.items.filter(item => item.productId.toString() !== productId);
      await wishlist.save();
      return res.status(200).json({ success: true, added: false, wishlist });
    } else {
      wishlist.items.push({ productId });
      await wishlist.save();
      const populated = await wishlist.populate('items.productId');
      const addedItem = populated.items.find(item => item.productId._id.toString() === productId);
      return res.status(200).json({ success: true, added: true, item: addedItem });
    }
  } catch (error) {
    console.error('Error toggling wishlist item:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Remove multiple wishlist items (bulk delete)
 * POST /api/wishlist/remove-multiple
 */
export const removeMultipleWishlistItems = async (req, res) => {
  try {
    const { itemIds } = req.body; // array of wishlist item _ids
    const userId = req.user._id;

    if (!itemIds || !itemIds.length) {
      return res.status(400).json({ success: false, message: "Item IDs required" });
    }

    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { _id: { $in: itemIds } } } },
      { new: true }
    ).populate('items.productId');

    res.status(200).json({ success: true, wishlist: updatedWishlist });
  } catch (error) {
    console.error('Error removing multiple wishlist items:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Check if product is in wishlist
 * GET /api/wishlist/check/:productId
 */
export const isProductInWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ user: userId });
    const exists = wishlist?.items.some(item => item.productId.toString() === productId) || false;

    res.status(200).json({ success: true, inWishlist: exists });
  } catch (error) {
    console.error('Error checking product in wishlist:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
