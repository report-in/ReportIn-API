import multer from 'multer';

const uplouder = (allowedMimeTypes: string[], maxSizeMB: number = 5) => {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        const allowedTypesList = allowedMimeTypes.join(', ');
        cb(new Error(`Only the following file types are allowed: ${allowedTypesList}. Received: ${file.mimetype}`));
      }
    },
  });
}

export const imageUplouder = uplouder(['image/jpeg', 'image/png'], 5);
export const documentUplouder = uplouder(['application/pdf'], 20);
export const campusUploader = uplouder(
  ['image/jpeg', 'image/png', 'application/pdf'], 
  20
);