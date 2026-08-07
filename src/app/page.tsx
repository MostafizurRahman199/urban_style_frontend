'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BannerCarousel from '@/components/BannerCarousel';
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
} from '@/redux/services/api';
import { ShoppingBag, Eye, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Reusable slider container with arrow indicators and circular rotation (loop scroll)
interface SliderContainerProps {
  children: React.ReactNode;
  itemCount: number;
}

function SliderContainer({ children, itemCount }: SliderContainerProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    slidesToScroll: 1, // scroll exactly one card at a time
    containScroll: 'trimSnaps'
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative group/slider">
      {/* Scrollable Container (Embla Viewport) */}
      <div
        ref={emblaRef}
        className="overflow-hidden py-4 -my-4"
      >
        {/* Embla Container */}
        <div className="flex -ml-6">
          {React.Children.map(children, (child) => (
            <div className="pl-6 flex-[0_0_auto]">
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Slide Navigation Buttons */}
      <button
        onClick={scrollPrev}
        className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/80 border border-card-border hover:border-accent text-white hover:text-accent opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 shadow-lg"
        title="Previous"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/80 border border-card-border hover:border-accent text-white hover:text-accent opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 shadow-lg"
        title="Next"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function HomePage() {
  // Queries
  const { data: categories } = useGetCategoriesQuery(undefined);

  // Fetch popular products separately for highlight slider
  const { data: popularProductsData } = useGetProductsQuery({
    page: 1,
    limit: 10,
    isPopular: 'true',
    isActive: 'true',
  });

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero Banner Carousel */}
      <BannerCarousel />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Shop by Category Section (Slider) */}
        {categories && categories.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider">
                Shop By <span className="text-accent">Category</span>
              </h2>
              <div className="h-px bg-card-border flex-grow ml-6 hidden sm:block" />
            </div>

            <SliderContainer itemCount={categories.length}>
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/all-products?category=${cat.id}`}
                  className="min-w-[150px] sm:min-w-[200px] w-[200px] flex-shrink-0 snap-start group relative flex flex-col items-center justify-center p-6 border border-card-border hover:border-accent/50 bg-card-bg/60 hover:bg-card-bg/95 rounded-lg transition-all duration-300 overflow-hidden shadow-sm hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:-translate-y-1"
                >
                  {/* Glowing background animation */}
                  <div className="absolute inset-0 bg-radial-gradient from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Circular Icon Container */}
                  <div className="relative w-16 h-16 rounded-full flex items-center justify-center bg-black/40 border border-card-border group-hover:border-accent/40 group-hover:bg-black/60 transition-all duration-300 overflow-hidden mb-4 z-10">
                    {cat.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cat.iconUrl}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <span className="text-xl font-black uppercase tracking-wider text-muted-text group-hover:text-accent transition-colors">
                        {cat.name[0]}
                      </span>
                    )}
                  </div>

                  {/* Category Title */}
                  <span className="relative z-10 font-bold uppercase tracking-widest text-xs text-muted-text group-hover:text-white transition-colors text-center truncate w-full">
                    {cat.name}
                  </span>

                  {/* Tiny arrow hint */}
                  <span className="text-[9px] font-black uppercase tracking-widest text-accent opacity-0 group-hover:opacity-100 mt-2 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                    Explore &rarr;
                  </span>
                </Link>
              ))}
            </SliderContainer>
          </section>
        )}

        {/* Popular Section (Slider) */}
        {popularProductsData?.data && popularProductsData.data.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-accent fill-accent" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider">
                  Popular <span className="text-accent">Items</span>
                </h2>
              </div>
              <div className="h-px bg-card-border flex-grow ml-6 hidden sm:block" />
            </div>

            <SliderContainer itemCount={popularProductsData.data.length}>
              {popularProductsData.data.map((product: any) => (
                <div key={product.id} className="min-w-[250px] sm:min-w-[280px] w-[280px] flex-shrink-0 snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </SliderContainer>
          </section>
        )}

        {/* Category-wise Sections */}
        {categories?.map((category: any) => (
          <CategoryProductSection key={category.id} category={category} />
        ))}
      </main>

      <Footer />
    </div>
  );
}

// Category Wise Product Slider Component
interface CategoryProductSectionProps {
  category: {
    id: string;
    name: string;
  };
}

function CategoryProductSection({ category }: CategoryProductSectionProps) {
  const { data: productsData, isLoading } = useGetProductsQuery({
    limit: 10,
    categoryId: category.id,
    isActive: 'true',
  });

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider">
            {category.name} <span className="text-accent">Collection</span>
          </h2>
          <div className="h-px bg-card-border flex-grow ml-6" />
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="min-w-[250px] sm:min-w-[280px] w-[280px] space-y-4 animate-pulse flex-shrink-0">
              <div className="aspect-[4/5] bg-card-bg border border-card-border rounded" />
              <div className="h-4 bg-card-bg rounded w-2/3" />
              <div className="h-4 bg-card-bg rounded w-1/3" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!productsData?.data || productsData.data.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider">
          {category.name} <span className="text-accent">Collection</span>
        </h2>
        <div className="h-px bg-card-border flex-grow ml-6 hidden sm:block" />
        <Link
          href={`/all-products?category=${category.id}`}
          className="text-xs uppercase font-extrabold tracking-widest text-accent hover:text-white transition-colors ml-4 whitespace-nowrap"
        >
          View All &rarr;
        </Link>
      </div>

      <SliderContainer itemCount={productsData.data.length}>
        {productsData.data.map((product: any) => (
          <div key={product.id} className="min-w-[250px] sm:min-w-[280px] w-[280px] flex-shrink-0 snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </SliderContainer>
    </section>
  );
}

// Reusable Product Card Component
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    colors: string[];
    isPopular: boolean;
    isActive: boolean;
    category?: {
      name: string;
    };
    images?: Array<{
      url: string;
    }>;
  };
}

function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images?.[0]?.url;
  const isOutOfStock = product.quantity <= 0;
  const isLowStock = !isOutOfStock && product.quantity <= 5;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col bg-card-bg border border-card-border hover:border-accent/40 rounded transition-all duration-300 overflow-hidden h-full hover:-translate-y-1"
    >
      {/* Product Image Wrapper */}
      <div className="relative aspect-[4/5] overflow-hidden bg-black flex items-center justify-center border-b border-card-border">
        {mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ShoppingBag className="h-12 w-12 text-muted-text/30" />
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          {product.isPopular && (
            <span className="bg-accent text-black text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded">
              Popular
            </span>
          )}
          {isOutOfStock ? (
            <span className="bg-red-600 text-white text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="bg-yellow-600 text-black text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded">
              Low Stock
            </span>
          ) : null}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-grow flex flex-col justify-between space-y-2">
        <div>
          {product.category?.name && (
            <span className="text-[10px] text-accent font-bold uppercase tracking-wider">
              {product.category.name}
            </span>
          )}
          <h3 className="text-sm font-semibold tracking-wide text-white group-hover:text-accent transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-muted-text line-clamp-1 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-card-border/50">
          <span className="text-accent font-mono font-bold text-sm sm:text-base">
            ৳{Number(product.price).toFixed(2)}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white group-hover:text-accent transition-colors border border-card-border group-hover:border-accent/40 px-2.5 py-1 rounded">
            Explore
          </span>
        </div>
      </div>
    </Link>
  );
}
