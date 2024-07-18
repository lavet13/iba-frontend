import { useState, useEffect, useRef, RefObject } from 'react';

const useIntersectionObserver = (options?: IntersectionObserverInit): [RefObject<HTMLDivElement>, boolean] => {
  const [isStuck, setIsStuck] = useState(true);
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsStuck(entry.isIntersecting);
    }, options);

    if(targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [targetRef]);

  return [targetRef, isStuck];
};

export default useIntersectionObserver;
