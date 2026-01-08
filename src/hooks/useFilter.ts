import { useState, useMemo, useCallback } from 'react';

export interface FilterState<T extends string = string> {
  search: string;
  category: string;
  ecosystem: T | '';
}

export interface UseFilterOptions<T, E extends string = string> {
  items: T[];
  searchFields: (keyof T)[];
  categoryField: keyof T;
  ecosystemField: keyof T;
  ecosystemType?: E;
}

export interface UseFilterReturn<T, E extends string = string> {
  // State
  search: string;
  category: string;
  ecosystem: E | '';

  // Computed
  filteredItems: T[];
  categories: string[];
  resultCount: number;

  // Actions
  setSearch: (value: string) => void;
  setCategory: (value: string) => void;
  setEcosystem: (value: E | '') => void;
  toggleEcosystem: (value: E) => void;
  clearFilters: () => void;
}

/**
 * Hook for filtering a list of items by search, category, and ecosystem
 * @param options - Configuration for the filter
 * @returns Filter state and actions
 */
export function useFilter<T extends Record<string, unknown>, E extends string = string>(
  options: UseFilterOptions<T, E>
): UseFilterReturn<T, E> {
  const { items, searchFields, categoryField, ecosystemField } = options;

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [ecosystem, setEcosystem] = useState<E | ''>('');

  // Extract unique categories from items
  const categories = useMemo(() => {
    const cats = new Set(items.map((item) => String(item[categoryField])));
    return Array.from(cats).sort();
  }, [items, categoryField]);

  // Filter items based on current filter state
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search filter - check all specified fields
      const matchesSearch =
        search === '' ||
        searchFields.some((field) => {
          const value = item[field];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(search.toLowerCase());
          }
          return false;
        });

      // Category filter
      const matchesCategory =
        category === '' || String(item[categoryField]) === category;

      // Ecosystem filter
      const matchesEcosystem =
        ecosystem === '' ||
        (Array.isArray(item[ecosystemField]) &&
          (item[ecosystemField] as E[]).includes(ecosystem));

      return matchesSearch && matchesCategory && matchesEcosystem;
    });
  }, [items, search, category, ecosystem, searchFields, categoryField, ecosystemField]);

  // Toggle ecosystem - if already selected, deselect; otherwise select
  const toggleEcosystem = useCallback((value: E) => {
    setEcosystem((prev) => (prev === value ? '' : value));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearch('');
    setCategory('');
    setEcosystem('');
  }, []);

  return {
    // State
    search,
    category,
    ecosystem,

    // Computed
    filteredItems,
    categories,
    resultCount: filteredItems.length,

    // Actions
    setSearch,
    setCategory,
    setEcosystem,
    toggleEcosystem,
    clearFilters,
  };
}
