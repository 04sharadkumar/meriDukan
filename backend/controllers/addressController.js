import Address from '../models/addressModel.js'

export const addAddress = async (req, res) => {
  try {
    const { name, mobile, address, city, pincode } = req.body;

    if (!name || !mobile || !address || !city || !pincode) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newAddress = new Address({
      user: req.user._id, // protect middleware se aayega
      name,
      mobile,
      address,
      city,
      pincode,
    });
    

    await newAddress.save();

    res.status(201).json({
      success: true,
      message: "Address saved successfully",
      address: newAddress,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// Get user address
export const getAddress = async (req, res) => {
  try {
    const userId = req.user.id; // from verifyToken middleware
    const user = await Address.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Assuming user.address is an object like { name, mobile, address, city, pincode }
    res.status(200).json(user.address || {});
  } catch (err) {
    console.error("Address fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
