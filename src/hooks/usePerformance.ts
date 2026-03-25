import { useState, useEffect } from 'react';

export interface DeviceCapabilities {
  ram: number; // in GB
  cores: number;
  isLowEnd: boolean;
  isUltraPerformanceMode: boolean;
  screenResolution: {
    width: number;
    height: number;
  };
}

export const usePerformance = () => {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    ram: 4,
    cores: 4,
    isLowEnd: false,
    isUltraPerformanceMode: false,
    screenResolution: {
      width: typeof window !== 'undefined' ? window.innerWidth : 1920,
      height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    },
  });

  useEffect(() => {
    const detectCapabilities = () => {
      // RAM Detection (navigator.deviceMemory is in GB)
      // @ts-ignore
      const ram = navigator.deviceMemory || 4;
      
      // CPU Cores Detection
      const cores = navigator.hardwareConcurrency || 4;
      
      // Screen Resolution
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Logic for Low-End Device (2GB or 3GB RAM)
      const isLowEnd = ram <= 3;
      
      // Ultra Performance Mode activation criteria
      const isUltraPerformanceMode = isLowEnd || (cores <= 2);

      setCapabilities({
        ram,
        cores,
        isLowEnd,
        isUltraPerformanceMode,
        screenResolution: { width, height },
      });

      if (isUltraPerformanceMode) {
        console.log('🚀 ULTRA PERFORMANCE MODE ACTIVATED');
        document.documentElement.classList.add('ultra-performance-mode');
      }
    };

    detectCapabilities();
    
    window.addEventListener('resize', detectCapabilities);
    return () => window.removeEventListener('resize', detectCapabilities);
  }, []);

  return capabilities;
};
