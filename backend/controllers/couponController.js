import Coupon from "../models/couponModel.js";

export const createCoupon = async (req, res) => {
  try {
    const { code, discountPercent, expiresAt, usageLimit } = req.body;

    console.log(req.body);
    

    const existing = await Coupon.findOne({ code });
    if (existing) return res.status(400).json({ message: "Coupon already exists" });

    const coupon = await Coupon.create({
      code,
      discountPercent,
      expiresAt,
      usageLimit,
    });

    res.status(201).json({ message: "Coupon created", coupon });
  } catch (err) {
    res.status(500).json({ message: "Failed to create coupon", error: err.message });
  }
};


export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    if (coupon.expiresAt < new Date()) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    if (coupon.usedBy.includes(req.user._id)) {
      return res.status(400).json({ message: "You have already used this coupon" });
    }

    if (coupon.usedBy.length >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit exceeded" });
    }

    // ✅ Add user to usedBy list and save
    coupon.usedBy.push(req.user._id);
    await coupon.save();

    res.status(200).json({
      valid: true,
      discountPercent: coupon.discountPercent,
      message: "Coupon applied successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Coupon validation failed", error: err.message });
  }
};
