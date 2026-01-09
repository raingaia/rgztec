export class AppError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(code: string, message: string, status = 400, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const Errors = {
  NotFound: (msg = "Not found") => new AppError("NOT_FOUND", msg, 404),
  BadRequest: (msg = "Bad request", details?: unknown) => new AppError("BAD_REQUEST", msg, 400, details),
  Conflict: (msg = "Conflict", details?: unknown) => new AppError("CONFLICT", msg, 409, details),
  Unauthorized: (msg = "Unauthorized") => new AppError("UNAUTHORIZED", msg, 401),
};
