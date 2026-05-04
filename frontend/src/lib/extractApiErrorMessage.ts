import type { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

export function extractApiErrorMessage(error: unknown): string | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error
  ) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return (
      axiosError.response?.data?.message ??
      axiosError.response?.data?.error ??
      axiosError.message ??
      null
    );
  }
  if (error instanceof Error) return error.message;
  return null;
}
