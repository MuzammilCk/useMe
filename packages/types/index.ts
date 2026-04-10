export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string | Record<string, string>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: any;
  };
}
