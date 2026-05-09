import multer from 'multer';
import { NextFunction, Request, Response } from 'express';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req: Request, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(new Error('Unsupported file type. Allowed: jpeg, png, webp, gif, pdf, txt'));
      return;
    }

    cb(null, true);
  },
});

export function singleFileUpload(req: Request, res: Response, next: NextFunction): void {
  upload.single('file')(req, res, (error: any) => {
    if (error) {
      const message = error instanceof Error ? error.message : 'Invalid upload request';
      res.status(400).json({
        success: false,
        message,
      });
      return;
    }

    next();
  });
}
