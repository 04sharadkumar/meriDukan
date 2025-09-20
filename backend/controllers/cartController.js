import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";


export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({
      user: req.user._id,
      items: [],
    });
  }

  const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0]?.url || ""
    });
  }

  await cart.save();
  res.status(200).json({ message: "Cart updated", cart });
};


export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "name price discountPrice images"); 
      // sirf required fields populate kar rahe

    if (!cart) return res.status(200).json({ items: [] });

    // format karke discountPrice frontend bhejna
    const formattedItems = cart.items.map((item) => ({
      _id: item._id,
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      discountPrice: item.product.discountPrice || null, // 👈 yaha add kiya
      quantity: item.quantity,
      image: item.image || item.product.images?.[0]?.url, // fallback image
    }));

    res.status(200).json({ items: formattedItems });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const removeFromCart = async (req, res) => {
  const { itemId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.items = cart.items.filter(i => i._id.toString() !== itemId);
  await cart.save();

  res.json({ message: "Item removed", cart });
};

export const updateCartItem = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const item = cart.items.id(itemId);
  if (!item) return res.status(404).json({ message: "Item not found in cart" });

  item.quantity = quantity;
  await cart.save();

  res.json({ message: "Quantity updated", cart });
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId);
    

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = []; // Empty the cart
    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (err) {
    console.error("Clear Cart Error:", err);
    res.status(500).json({ message: "Failed to clear cart" });
  }
};





