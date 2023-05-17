export interface Pagination {
  total: number
  pageSize: number
  pageCount: number
  currentPage: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
