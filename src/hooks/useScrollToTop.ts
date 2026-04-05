import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to scroll to top on route changes
 * Preserves scroll position on page refresh
 */
export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Save current scroll position before unload (refresh)
    const handleBeforeUnload = () => {
      sessionStorage.setItem('scrollPosition', window.scrollY.toString());
      sessionStorage.setItem('scrollPath', pathname);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Check if this is a page refresh
    const savedScrollPosition = sessionStorage.getItem('scrollPosition');
    const savedScrollPath = sessionStorage.getItem('scrollPath');

    if (savedScrollPosition && savedScrollPath === pathname) {
      // Restore scroll position after a brief delay to ensure content is loaded
      const scrollY = parseInt(savedScrollPosition, 10);
      setTimeout(() => {
        window.scrollTo({ top: scrollY, behavior: 'instant' });
      }, 0);

      // Clear saved position after restoring
      sessionStorage.removeItem('scrollPosition');
      sessionStorage.removeItem('scrollPath');
    } else {
      // Scroll to top on route change (not refresh)
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname]);
};
