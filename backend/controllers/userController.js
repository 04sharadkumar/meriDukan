import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import generateToken from "../utils/generateToken.js";

// ✅ Register Controller
export const userRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    // ✅ Token generate karo (but cookie mat bhejo)
    const authToken = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
      authToken, // 👈 Frontend khud cookie me store karega
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// ✅ Login Controller
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // ✅ Token generate
    const authToken = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      authToken, // 👈 bas token bhejna hai
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// ✅ Logout (frontend cookie clear karega, backend sirf success bheje)
export const userLogout = (req, res) => {
  res.status(200).json({ message: 'Logout successful' });
};

// ✅ Profile Controllers
export const getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req, res) => {
  const { username, phone, address, newsletter } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.username = username || user.username;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.newsletter = newsletter === 'true';

    if (req.file && req.file.path) {
      user.avatar = req.file.path;
    }

    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
