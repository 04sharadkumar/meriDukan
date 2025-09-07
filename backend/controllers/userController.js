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

    // ✅ Create new user with hashed password (handled in model pre-save)
    const newUser = new User({ username: username, email, password });
    await newUser.save();

    // ✅ Generate token and send cookie
    generateToken(newUser, res);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

  
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user, res);

    console.log(token);
    

    res.cookie("token",token,{
      httpOnly: false,    // to make it secure chage into true
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    })

    res.status(200).json({
      success:true,
      message: "Login successfully",
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token,     
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};


export const userLogout = (req, res) => {

  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
  
  res.status(200).json({ message: 'Logout successful' });
};


// backend/controllers/authController.js

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

    // ✅ Save avatar if uploaded
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







