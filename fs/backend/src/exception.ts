export class AppException<T> extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: T,
  ) {
    super(message)
  }
}
