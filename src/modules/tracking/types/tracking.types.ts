export interface PaginationParams {
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}
