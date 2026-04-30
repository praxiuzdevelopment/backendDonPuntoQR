import multer from 'multer';

// Usamos almacenamiento en memoria para luego pasarlo a Cloudinary o procesarlo (ej. CSV)
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB límite
  },
  fileFilter: (req, file, cb) => {
    // Aceptamos imágenes y archivos CSV/Excel para el bulk upload
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no soportado.'));
    }
  },
});
