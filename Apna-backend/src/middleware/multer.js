import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Uploads directory created:', uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, uploadDir);
    },
    filename: function (req, file, callback) {
        // Add timestamp to prevent filename conflicts
        const uniqueName = Date.now() + '-' + file.originalname;
        callback(null, uniqueName);
    },
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, callback) => {
        if (file.fieldname === 'audio') {
            // Accept audio files
            if (file.mimetype.startsWith('audio/')) {
                callback(null, true);
            } else {
                callback(new Error('Only audio files are allowed for audio field'));
            }
        } else if (file.fieldname === 'image') {
            // Accept image files
            if (file.mimetype.startsWith('image/')) {
                callback(null, true);
            } else {
                callback(new Error('Only image files are allowed for image field'));
            }
        } else {
            callback(null, true);
        }
    }
});

export default upload;