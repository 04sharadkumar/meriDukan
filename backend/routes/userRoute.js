import express from 'express'
import {userRegister,userLogin, userLogout,updateProfile  } from '../controllers/userController.js'
import { getUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../utils/upload.js';
import multer from 'multer';
import { getCloudinaryStorage } from '../utils/cloudinary.js';

const router = express.Router();

router.post('/register',userRegister);

router.post('/login',userLogin)

router.post('/logout',userLogout);

router.get('/profile', protect, getUserProfile);

const profileUpload = multer({ storage: getCloudinaryStorage('user-profiles') });


router.put('/update-profile', protect, profileUpload.single('avatar'), updateProfile);



export default router;