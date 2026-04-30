class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.isOperational = true; // Identifies known errors
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
