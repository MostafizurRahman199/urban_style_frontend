'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  direction?: 'left' | 'right';
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, direction = 'left', children }: DrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when drawer is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const positionClass = direction === 'left' ? 'left-0' : 'right-0';

  return createPortal(
    <div className="fixed inset-0 z-[100] flex overflow-hidden font-sans">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 animate-fade-in cursor-pointer"
        onClick={onClose}
      />

      {/* Drawer content panel */}
      <div
        className={`relative z-10 w-[82vw] max-w-[320px] bg-black border-r border-card-border h-full flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${positionClass}`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
