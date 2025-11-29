const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Get tenantId from request (set by tenant middleware)
        const tenantId = req.tenantId || 'default';
        const uploadDir = path.join(__dirname, '../../uploads/tenants', tenantId, 'patients');

        // Create directory if it doesn't exist
        fs.mkdirSync(uploadDir, { recursive: true });

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with UUID
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// File filter - only allow JPG and PNG
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG and PNG images are allowed.'), false);
    }
};

// Configure multer with limits
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

module.exports = upload;
