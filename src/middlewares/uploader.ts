import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = path.join(process.cwd(), "uploads");
// Ensure the upload directory exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, {recursive: true});
}

// Set up storage engine
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()} - ${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);  
  }
});

export const removeImage = (filePath: string) => {
    const fileName = path.basename(filePath);
    const fullPath = path.join(process.cwd(), "uploads", fileName);

    fs.unlink(fullPath, (err) => {
        if (err && err.code !== 'ENOENT') {
            console.error(`Failed to delete image: ${fullPath}`, err);
        }
    });
};

function imageFileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    // if image start with /
    if (/^image\//.test(file.mimetype)) {
        cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'))
    }
}

export const upload = multer({
  storage, 
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
})

export default upload;