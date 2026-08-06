'use client';

import React, { useState, useEffect } from 'react';
import { useGetBannersQuery } from '@/redux/services/api';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';

export default function BannerCarousel() {
  const { data: banners, isLoading, error } = useGetBannersQuery(undefined);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  if (isLoading) {
    return (
      <div className="h-[400px] sm:h-[500px] md:h-[600px] w-full bg-card-bg animate-pulse flex items-center justify-center border-b border-card-border">
        <div className="text-muted-text text-sm uppercase tracking-widest">Loading Premium Collection...</div>
      </div>
    );
  }

  if (error || !banners || banners.length === 0) {
    // Return a default premium fallback banner
    return (
      <div className="relative h-[400px] sm:h-[500px] md:h-[600px] w-full bg-black border-b border-card-border flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-black to-black opacity-60" />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-left space-y-6">
          <span className="text-accent font-bold uppercase tracking-widest text-sm">New Season Arrival</span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase max-w-2xl leading-none">
            URBAN STREETWEAR <br />
            <span className="text-accent">COLLECTION</span>
          </h1>
          <p className="text-muted-text text-sm sm:text-base max-w-md leading-relaxed">
            Elevate your style with our latest drop of premium jackets, designer hoodies, and accessories.
          </p>
          <div className="pt-2">
            <a
              href="#products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-black font-bold uppercase tracking-wider text-sm hover:bg-accent-hover transition-colors rounded"
            >
              <ShoppingBag className="h-4 w-4" />
              Shop The Collection
            </a>
          </div>
        </div>
      </div>
    );
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative h-[400px] sm:h-[500px] md:h-[600px] w-full bg-black overflow-hidden border-b border-card-border">
      {/* Slides */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-out scale-105"
            style={{
              backgroundImage: `url(${banner.imageUrl})`,
              transform: index === currentSlide ? 'scale(1)' : 'scale(1.05)',
            }}
          />

          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent z-15" />

          {/* Banner Text Content */}
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-left space-y-4 sm:space-y-6">
              {banner.title && (
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase max-w-2xl leading-none">
                  {banner.title}
                </h1>
              )}
              {banner.description && (
                <p className="text-muted-text text-sm sm:text-base md:text-lg max-w-md leading-relaxed">
                  {banner.description}
                </p>
              )}
              <div className="pt-2">
                <a
                  href="#products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-black font-bold uppercase tracking-wider text-sm hover:bg-accent-hover transition-colors rounded"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Shop Now
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows (Only if more than 1 banner) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full border border-white/20 bg-black/40 text-white hover:bg-accent hover:text-black transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full border border-white/20 bg-black/40 text-white hover:bg-accent hover:text-black transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Pagination Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-6 bg-accent' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
