import Banner from "../models/BannerModel.js";

// ✅ Get all banners
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });

    // Send only required fields
    const formattedBanners = banners.map((b) => ({
      _id: b._id,
      imageUrl: b.imageUrl,
      title: b.title,
      subtitle: b.subtitle,
    }));

    res.json({ success: true, banners: formattedBanners });
  } catch (err) {
    console.error("Get Banners Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ✅ Create banner
export const createBanner = async (req, res) => {
  try {
    const { title, subtitle } = req.body;

    if (!req.file || !req.file.path) {
      return res.status(400).json({ success: false, message: "Image required" });
    }

    const newBanner = new Banner({
      imageUrl: req.file.path, // 👈 Cloudinary gives full hosted URL here
      title,
      subtitle,
    });

    await newBanner.save();

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      banner: newBanner,
    });
  } catch (err) {
    console.error("Create Banner Error:", err);
    res.status(500).json({ success: false, message: "Failed to create banner" });
  }
};

// ✅ Update banner
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle } = req.body;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    // Update fields
    banner.title = title || banner.title;
    banner.subtitle = subtitle || banner.subtitle;

    // If new image uploaded, replace it
    if (req.file && req.file.path) {
      banner.imageUrl = req.file.path;
    }

    await banner.save();

    res.json({
      success: true,
      message: "Banner updated successfully",
      banner,
    });
  } catch (err) {
    console.error("Update Banner Error:", err);
    res.status(500).json({ success: false, message: "Failed to update banner" });
  }
};

// ✅ Delete banner
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Banner.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }


    res.json({ success: true, message: "Banner deleted successfully" });
  } catch (err) {
    console.error("Delete Banner Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete banner" });
  }
};
