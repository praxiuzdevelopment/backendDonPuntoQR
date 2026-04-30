const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      console.error('[catchAsync Error]:', error);
      return res.status(500).json({ success: false, message: 'Error interno del servidor' });
    });
  };
};

export default catchAsync;
