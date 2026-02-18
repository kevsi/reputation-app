/**
 * 🚨 AppError - Custom Error Class
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
