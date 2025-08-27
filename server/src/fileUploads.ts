import express from 'express';
import path from 'path';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (_req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });


export function serveUploadedFiles(app: express.Application) {
  const uploadsPath = path.join(__dirname, 'uploads');
  app.use('/files', express.static(uploadsPath));
}


export function handleSingleFileUpload(fieldName: string) {
  return upload.single(fieldName);
}


export function handleMultipleFileUpload(fieldName: string, maxCount = 5) {
  return upload.array(fieldName, maxCount);
}