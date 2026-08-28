import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = "uploads/certificates";
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadPath),
    filename: (_req, file, callback) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        callback(null, uniqueName);
    }
});

const fileFilter = (_req, file, callback) => {
    if (file.mimetype === "application/pdf") callback(null, true);
    else callback(new Error("Only PDF certificate files are allowed"), false);
};

export default multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});
