import { useState, useEffect, useCallback, useMemo } from 'react';

// Custom hook for server-side pagination
export interface PaginationConfig {
  initialPage?: number;
  initialPageSize?: number;
  initialSearchTerm?: string;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  totalItems: number;
  totalPages: number;
}

export interface PaginationActions {
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearchTerm: (term: string) => void;
  setTotalItems: (total: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  reset: () => void;
}

export interface UsePaginationReturn {
  state: PaginationState;
  actions: PaginationActions;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  getPageInfo: () => string;
  getOffset: () => number;
  getSkip: () => number;
}

export const usePagination = (config: PaginationConfig = {}): UsePaginationReturn => {
  const {
    initialPage = 1,
    initialPageSize = 20,
    initialSearchTerm = '',
  } = config;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [totalItems, setTotalItems] = useState(0);

  // Calculate total pages
  const totalPages = useMemo(() => 
    Math.ceil(totalItems / pageSize) || 1, 
    [totalItems, pageSize]
  );

  // Reset to first page when search term or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  // Ensure current page is within bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const actions: PaginationActions = {
    setPage: useCallback((page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
    }, [totalPages]),

    setPageSize: useCallback((size: number) => {
      setPageSize(Math.max(1, size));
    }, []),

    setSearchTerm: useCallback((term: string) => {
      setSearchTerm(term);
    }, []),

    setTotalItems: useCallback((total: number) => {
      setTotalItems(Math.max(0, total));
    }, []),

    nextPage: useCallback(() => {
      setCurrentPage(prev => Math.min(prev + 1, totalPages));
    }, [totalPages]),

    previousPage: useCallback(() => {
      setCurrentPage(prev => Math.max(prev - 1, 1));
    }, []),

    firstPage: useCallback(() => {
      setCurrentPage(1);
    }, []),

    lastPage: useCallback(() => {
      setCurrentPage(totalPages);
    }, [totalPages]),

    reset: useCallback(() => {
      setCurrentPage(initialPage);
      setPageSize(initialPageSize);
      setSearchTerm(initialSearchTerm);
      setTotalItems(0);
    }, [initialPage, initialPageSize, initialSearchTerm]),
  };

  const state: PaginationState = {
    currentPage,
    pageSize,
    searchTerm,
    totalItems,
    totalPages,
  };

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const getPageInfo = useCallback(() => {
    const start = Math.min((currentPage - 1) * pageSize + 1, totalItems);
    const end = Math.min(currentPage * pageSize, totalItems);
    return `${start}-${end} of ${totalItems}`;
  }, [currentPage, pageSize, totalItems]);

  const getOffset = useCallback(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);

  const getSkip = useCallback(() => {
    return getOffset();
  }, [getOffset]);

  return {
    state,
    actions,
    hasNextPage,
    hasPreviousPage,
    getPageInfo,
    getOffset,
    getSkip,
  };
};