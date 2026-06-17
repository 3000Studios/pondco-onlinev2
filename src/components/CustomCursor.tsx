import React, { useState, useEffect } from 'react';

export const CustomCursor: React.FC<{ highContrast: boolean }> = ({ highContrast }) => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If high contrast accessibility is active, default back to OS standard styles for clarity
    if (highContrast) {
      document.body.classList.remove('custom-cursor-active');
      return;
    }

    document.body.classList.add('custom-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') || 
        target.closest('a') ||
        target.style.cursor === 'pointer' ||
        target.classList.contains('cursor-pointer')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [highContrast, isVisible]);

  if (highContrast || !isVisible) {
    return null;
  }

  return (
    <div
      className="hidden md:block pointer-events-none fixed z-[9999] transition-transform duration-75 ease-out select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-2px, -2px) ${isHovered ? 'scale(1.2)' : 'scale(1)'}`,
      }}
    >
      {/* 3D Pearl Gloss/Metallic Chrome Arrow SVG */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(2px 3px 2px rgba(0,0,0,0.45))',
        }}
      >
        <defs>
          <linearGradient id="metal-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#e5e7eb" />
            <stop offset="70%" stopColor="#6b7280" />
            <stop offset="100%" stopColor="#1f2937" />
          </linearGradient>
          <linearGradient id="border-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#9ca3af" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>
        </defs>
        
        {/* Shadow Overlay beneath */}
        <path
          d="M3 3V20.25L8.52 14.83L14.07 23.5L16.89 21.73L11.41 13.12L18.81 13.12L3 3Z"
          fill="url(#metal-grad)"
          stroke="url(#border-grad)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        
        {/* Highlight sheen for glossy 3D look */}
        <path
          d="M4.2 4.5L13.8 11.2L8.5 11.5L4.2 15.8"
          stroke="#ffffff"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
    </div>
  );
};
