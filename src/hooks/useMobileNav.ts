import { useState, useCallback } from 'react';

export interface UseMobileNavReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Hook for managing mobile navigation toggle state
 * @returns Object with isOpen state and control functions
 */
export function useMobileNav(): UseMobileNavReturn {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
