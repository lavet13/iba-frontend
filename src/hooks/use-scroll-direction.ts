import { useState, useEffect, useCallback } from 'react';

export const useScrollDirection = (threshold = 100, delay = 5) => {
  const [scrollDirection, setScrollDirection] = useState('up');
  const [lastScrollY, setLastScrollY] = useState(0);

  const updateScrollDirection = useCallback(() => {
    const scrollY = window.scrollY;
    if (Math.abs(scrollY - lastScrollY) < threshold) {
      return;
    }
    const direction = scrollY > lastScrollY ? 'down' : 'up';
    if (direction !== scrollDirection) {
      setScrollDirection(direction);
    }
    setLastScrollY(scrollY > 0 ? scrollY : 0);
  }, [scrollDirection, lastScrollY, threshold]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateScrollDirection, delay);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [updateScrollDirection, delay]);

  return scrollDirection;
};
