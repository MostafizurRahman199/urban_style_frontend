'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BannerCarousel from '@/components/BannerCarousel';
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
} from '@/redux/services/api';
import { Search, ShoppingBag, Eye, Star, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const limit = 8;

  // Debounce search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // In a real app we'd debounce, for now we let users hit enter or click search,
    // or update debouncedSearch after a delay:
  };

  const triggerSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchTerm);
    setPage(1);
  };

  // Queries
  const { data: categories } = useGetCategoriesQuery(undefined);

  // Fetch paginated, filterable products
  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery({
    page,
    limit,
    ...(selectedCategory && { categoryId: selectedCategory }),
    ...(debouncedSearch && { search: debouncedSearch }),
    isActive: 'true',
  });

  // Fetch popular products separately for highlight
  const { data: popularProductsData } = useGetProductsQuery({
    page: 1,
    limit: 4,
    isPopular: 'true',
    isActive: 'true',
  });

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (productsData?.meta && newPage > productsData.meta.totalPages)) return;
    setPage(newPage);
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero Banner Carousel */}
      <BannerCarousel />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Popular Section */}
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {popularProductsData.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Collection Shop Section */}
        <section id="products" className="space-y-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-card-border pb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider">
                Our <span className="text-accent">Catalog</span>
              </h2>
              <p className="text-muted-text text-xs mt-1 uppercase tracking-widest">
                Browse through premium streetwear essentials
              </p>
            </div>

            {/* Search Input */}
            <form onSubmit={triggerSearch} className="relative max-w-md w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 pl-10 rounded text-sm outline-none transition-colors placeholder:text-muted-text"
              />
              <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-text" />
              <button type="submit" className="hidden">Search</button>
            </form>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => handleCategorySelect('')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors whitespace-nowrap ${
                selectedCategory === ''
                  ? 'bg-accent text-black'
                  : 'bg-card-bg text-white hover:bg-card-border'
              }`}
            >
              All Collection
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-accent text-black'
                    : 'bg-card-bg text-white hover:bg-card-border'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Products Loading/List Grid */}
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(limit)].map((_, idx) => (
                <div key={idx} className="space-y-4 animate-pulse">
                  <div className="aspect-[4/5] bg-card-bg border border-card-border rounded" />
                  <div className="h-4 bg-card-bg rounded w-2/3" />
                  <div className="h-4 bg-card-bg rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : !productsData?.data || productsData.data.length === 0 ? (
            <div className="text-center py-20 bg-card-bg border border-card-border rounded flex flex-col items-center justify-center space-y-4">
              <SlidersHorizontal className="h-12 w-12 text-muted-text/30" />
              <p className="text-muted-text font-medium">No products found matching your filters</p>
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSearchTerm('');
                  setDebouncedSearch('');
                }}
                className="px-4 py-2 bg-accent text-black font-semibold text-xs uppercase tracking-wider rounded hover:bg-accent-hover transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {productsData.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination controls */}
              {productsData.meta && productsData.meta.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-card-border pt-6 mt-8">
                  <span className="text-xs text-muted-text uppercase tracking-widest">
                    Page {productsData.meta.page} of {productsData.meta.totalPages} ({productsData.meta.total} items)
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="p-2 border border-card-border rounded bg-card-bg hover:bg-card-border disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {[...Array(productsData.meta.totalPages)].map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded text-xs font-mono border transition-colors ${
                            pageNum === page
                              ? 'bg-accent border-accent text-black font-bold'
                              : 'bg-card-bg border-card-border text-white hover:bg-card-border'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === productsData.meta.totalPages}
                      className="p-2 border border-card-border rounded bg-card-bg hover:bg-card-border disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

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
    <div className="group relative flex flex-col bg-card-bg border border-card-border hover:border-accent/40 rounded transition-all duration-300 overflow-hidden h-full">
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

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-300 z-20">
          <Link
            href={`/products/${product.id}`}
            className="p-3 bg-white text-black rounded-full hover:bg-accent hover:text-black transition-colors"
            title="View Details"
          >
            <Eye className="h-5 w-5" />
          </Link>
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
            <Link href={`/products/${product.id}`}>{product.name}</Link>
          </h3>
          <p className="text-xs text-muted-text line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-card-border/50">
          <span className="text-accent font-mono font-bold text-sm sm:text-base">
            ${product.price.toFixed(2)}
          </span>
          <Link
            href={`/products/${product.id}`}
            className="text-[10px] font-bold uppercase tracking-wider text-white hover:text-accent transition-colors border border-card-border hover:border-accent/40 px-2.5 py-1 rounded"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
