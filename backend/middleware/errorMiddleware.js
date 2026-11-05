export class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export default class ErrorMiddleware {
  static asyncHandler(action) {
    return (req, res, next) => {
      Promise.resolve(action(req, res, next)).catch(next);
    };
  }

  static notFound(req, res, next) {
    next(new AppError("Route not found", 404));
  }

  static handle(error, req, res, next) {
    const status = error.status || 500;
    if (status === 500) console.error(error);

    res.status(status).json({
      message: status === 500 ? "Something went wrong on the server" : error.message,
    });
  }
}
