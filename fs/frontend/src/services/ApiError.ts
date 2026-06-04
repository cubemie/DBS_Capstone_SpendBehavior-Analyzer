import type { ValidationIssue } from "../types/models";

export class ApiError extends Error {
  status: number;
  details?: ValidationIssue[];

  constructor(
    status: number,
    message: string,
    details?: ValidationIssue[],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}
