const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directories if they don't exist
const profilesDir = path.join(__dirname, '../../uploads/profiles');
const productsDir = path.join(__dirname, '../../uploads/products');

if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}

if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

// Configure storage for profile images
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilesDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: user_id_timestamp.extension
    const userId = req.user.userId;
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `user_${userId}_${timestamp}${extension}`;
    cb(null, filename);
  }
});

// Configure storage for product images
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: product_userid_timestamp.extension
    const userId = req.user.userId;
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `product_${userId}_${timestamp}${extension}`;
    cb(null, filename);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

// Configure upload for profiles
const profileUpload = multer({
  storage: profileStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Configure upload for products
const productUpload = multer({
  storage: productStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  }
});

// Middleware for single profile image upload
const uploadProfileImage = profileUpload.single('profileImage');

// Middleware for multiple product images upload (max 5 images)
const uploadProductImages = productUpload.array('productImages', 5);

// Middleware for single product image upload
const uploadSingleProductImage = productUpload.single('productImage');

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
  // Cleanup any uploaded files on error
  if (req.files && req.files.length > 0) {
    const filePaths = req.files.map(file => `/uploads/products/${file.filename}`);
    console.log('Upload error occurred, cleaning up files:', filePaths);
    deleteImages(filePaths);
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: true,
        message: 'File size too large. Maximum size is 5MB'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: true,
        message: 'Unexpected field name. Use "productImages" field'
      });
    }
  }

  if (err.message === 'Only JPEG, PNG, and WebP images are allowed') {
    return res.status(400).json({
      error: true,
      message: err.message
    });
  }

  next(err);
};

// Image deletion utility
const deleteImage = (imagePath) => {
  if (imagePath && fs.existsSync(imagePath)) {
    try {
      fs.unlinkSync(imagePath);
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }
  return false;
};

// Delete multiple images utility
const deleteImages = (imagePaths) => {
  const results = [];
  imagePaths.forEach(imagePath => {
    const fullPath = path.join(__dirname, '../../', imagePath);
    results.push(deleteImage(fullPath));
  });
  return results;
};

module.exports = {
  uploadProfileImage,
  uploadProductImages,
  uploadSingleProductImage,
  handleUploadError,
  deleteImage,
  deleteImages
};