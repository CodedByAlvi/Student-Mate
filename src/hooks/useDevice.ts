import { useState, useEffect } from 'react';

export type DeviceType = 'small-phone' | 'phone' | 'large-phone' | 'tablet' | 'desktop';

export function useDevice() {
  const [device, setDevice] = useState<DeviceType>('phone');
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setWidth(w);
      if (w < 360) {
        setDevice('small-phone');
      } else if (w < 480) {
        setDevice('phone');
      } else if (w < 768) {
        setDevice('large-phone');
      } else if (w < 1024) {
        setDevice('tablet');
      } else {
        setDevice('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    device,
    width,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    isSmallPhone: width < 360,
    isLargePhone: width >= 480 && width < 768,
  };
}
