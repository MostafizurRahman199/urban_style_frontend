'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
} from '@/redux/services/api';
import { Search, ShoppingBag, Eye, SlidersHorizontal, ChevronLeft, ChevronRight, X, RotateCcw } from 'lucide-react';
import Link from 'next/link';

function AllProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Selected category from search params
  const categoryParam = searchParams.get('category') || '';

  // Local Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [minPriceInput, setMinPriceInput] = useState<string>('');
  const [maxPriceInput, setMaxPriceInput] = useState<string>('');
  const [appliedMinPrice, setAppliedMinPrice] = useState<string>('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const limit = 9;

  // Sync category param with filter state
  useEffect(() => {
    setSelectedCategory(categoryParam);
    setPage(1);
  }, [categoryParam]);

  // Queries
  const { data: categories } = useGetCategoriesQuery(undefined);
  const { data: productsData, isLoading: productsLoading, isFetching: productsFetching } = useGetProductsQuery({
    page,
    limit,
    ...(selectedCategory && { categoryId: selectedCategory }),
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(appliedMinPrice && !isNaN(parseFloat(appliedMinPrice)) && { minPrice: parseFloat(appliedMinPrice) }),
    ...(appliedMaxPrice && !isNaN(parseFloat(appliedMaxPrice)) && { maxPrice: parseFloat(appliedMaxPrice) }),
    isActive: 'true',
  });

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
    // Update URL query parameters
    const params = new URLSearchParams();
    if (categoryId) {
      params.set('category', categoryId);
    }
    router.push(`/all-products?${params.toString()}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const triggerSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchTerm);
    setPage(1);
  };

  const handleApplyPriceFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAppliedMinPrice(minPriceInput);
    setAppliedMaxPrice(maxPriceInput);
    setPage(1);
  };

  const handleClearAllFilters = () => {
    handleCategorySelect('');
    setSearchTerm('');
    setDebouncedSearch('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (productsData?.meta && newPage > productsData.meta.totalPages)) return;
    setPage(newPage);
  };

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Title & Breadcrumbs */}
      <div className="border-b border-card-border pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider">
            All <span className="text-accent">Products</span>
          </h1>
          <p className="text-muted-text text-xs mt-1 uppercase tracking-widest">
            Premium Streetwear Essentials & Accessories
          </p>
        </div>

        {/* Search */}
        <form onSubmit={triggerSearch} className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2 rounded text-sm outline-none transition-colors placeholder:text-muted-text"
          />
          <Search className="absolute right-3 top-2.5 h-4.5 w-4.5 text-muted-text" />
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side Filters - Desktop */}
        <aside className="hidden lg:block lg:col-span-3 bg-card-bg border border-card-border p-6 rounded-lg space-y-6 sticky top-24 max-h-[calc(100vh-7rem)] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-card-border/50 flex-shrink-0">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-accent flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </h3>
            {(selectedCategory || debouncedSearch || appliedMinPrice || appliedMaxPrice || minPriceInput || maxPriceInput) && (
              <button
                onClick={handleClearAllFilters}
                className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-white rounded-full transition-all duration-200 flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" /> Clear All
              </button>
            )}
          </div>

          {/* Categories List */}
          <div className="space-y-3 flex-1 flex flex-col min-h-0">
            <span className="text-[10px] uppercase tracking-widest text-muted-text font-bold block flex-shrink-0">
              Categories
            </span>
            <div className="flex flex-col gap-1.5 overflow-y-auto scrollbar-thin pr-1 flex-1">
              <button
                onClick={() => handleCategorySelect('')}
                className={`w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors ${
                  selectedCategory === ''
                    ? 'bg-accent text-black'
                    : 'bg-transparent text-white hover:bg-card-border'
                }`}
              >
                All Collection
              </button>
              {categories?.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-between ${
                    selectedCategory === cat.id
                      ? 'bg-accent text-black'
                      : 'bg-transparent text-white hover:bg-card-border'
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.iconUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cat.iconUrl} alt="" className="h-4 w-4 object-cover rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pt-4 border-t border-card-border/50 flex-shrink-0">
            <span className="text-[10px] uppercase tracking-widest text-muted-text font-bold block">
              Price Range (৳)
            </span>
            <form onSubmit={handleApplyPriceFilter} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Min ৳"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-3 py-1.5 rounded text-xs outline-none transition-colors placeholder:text-muted-text"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Max ৳"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-3 py-1.5 rounded text-xs outline-none transition-colors placeholder:text-muted-text"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-accent text-black font-bold uppercase tracking-wider text-[11px] rounded hover:bg-accent-hover transition-colors"
              >
                Apply Price
              </button>
            </form>
          </div>
        </aside>

        {/* Mobile Filters Toggle & Drawer */}
        <div className="lg:hidden flex items-center justify-between bg-card-bg border border-card-border p-4 rounded-lg mb-4">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 text-xs uppercase font-extrabold tracking-widest text-accent"
          >
            <SlidersHorizontal className="h-4 w-4" /> Show Filters
          </button>
          {(selectedCategory || appliedMinPrice || appliedMaxPrice) && (
            <span className="text-[10px] bg-accent/25 text-accent px-2 py-0.5 rounded font-bold uppercase">
              Filtered
            </span>
          )}
        </div>

        {/* Mobile Filter Drawer Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs lg:hidden flex justify-end">
            <div className="w-80 h-full bg-black border-l border-card-border p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-card-border">
                  <h3 className="text-xs uppercase font-extrabold tracking-widest text-accent flex items-center gap-1.5">
                    <SlidersHorizontal className="h-4 w-4" /> Filters
                  </h3>
                  <button onClick={() => setShowMobileFilters(false)} className="text-white hover:text-accent">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] uppercase tracking-widest text-muted-text font-bold block">
                    Categories
                  </span>
                  <div className="flex flex-col gap-1.5 max-h-[50vh] overflow-y-auto scrollbar-thin pr-1">
                    <button
                      onClick={() => {
                        handleCategorySelect('');
                        setShowMobileFilters(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded transition-colors ${
                        selectedCategory === ''
                          ? 'bg-accent text-black'
                          : 'bg-card-bg text-white hover:bg-card-border'
                      }`}
                    >
                      All Collection
                    </button>
                    {categories?.map((cat: any) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          handleCategorySelect(cat.id);
                          setShowMobileFilters(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-between ${
                          selectedCategory === cat.id
                            ? 'bg-accent text-black'
                            : 'bg-card-bg text-white hover:bg-card-border'
                        }`}
                      >
                        <span>{cat.name}</span>
                        {cat.iconUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cat.iconUrl} alt="" className="h-5 w-5 object-cover rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Price Range Filter */}
                <div className="space-y-3 pt-4 border-t border-card-border">
                  <span className="text-[10px] uppercase tracking-widest text-muted-text font-bold block">
                    Price Range (৳)
                  </span>
                  <form
                    onSubmit={(e) => {
                      handleApplyPriceFilter(e);
                      setShowMobileFilters(false);
                    }}
                    className="space-y-2"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="Min ৳"
                        value={minPriceInput}
                        onChange={(e) => setMinPriceInput(e.target.value)}
                        className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-3 py-2 rounded text-xs outline-none transition-colors placeholder:text-muted-text"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Max ৳"
                        value={maxPriceInput}
                        onChange={(e) => setMaxPriceInput(e.target.value)}
                        className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-3 py-2 rounded text-xs outline-none transition-colors placeholder:text-muted-text"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-accent text-black font-bold uppercase tracking-wider text-xs rounded hover:bg-accent-hover transition-colors"
                    >
                      Apply Price Filter
                    </button>
                  </form>
                </div>
              </div>

              {(selectedCategory || debouncedSearch || appliedMinPrice || appliedMaxPrice || minPriceInput || maxPriceInput) && (
                <button
                  onClick={() => {
                    handleClearAllFilters();
                    setShowMobileFilters(false);
                  }}
                  className="w-full py-3 bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 mt-4 shadow-sm active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset All Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right Side Products Grid */}
        <div className="lg:col-span-9 space-y-8">
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
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
              <ShoppingBag className="h-12 w-12 text-muted-text/30" />
              <p className="text-muted-text font-medium">No products found matching your filters</p>
              <button
                onClick={() => {
                  handleCategorySelect('');
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
              <div className={`grid grid-cols-2 sm:grid-cols-3 gap-6 transition-all duration-300 ${productsFetching ? 'opacity-50 scale-[0.99] pointer-events-none' : 'opacity-100 scale-100'}`}>
                {productsData.data.map((product: any, idx: number) => (
                  <div
                    key={product.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'both' }}
                  >
                    <ProductCard product={product} />
                  </div>
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
        </div>
      </div>
    </div>
  );
}

// Reusable Product Card
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
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
          <p className="text-xs text-muted-text line-clamp-2 mt-1 leading-relaxed">
            {product.description?.replace(/<[^>]*>?/gm, '')}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-card-border/50">
          <div className="flex flex-col">
            {product.discountPrice && Number(product.discountPrice) > 0 && Number(product.discountPrice) < Number(product.price) ? (
              <>
                <span className="text-accent font-mono font-bold text-sm sm:text-base leading-none">
                  ৳{Number(product.discountPrice).toFixed(2)}
                </span>
                <span className="text-muted-text font-mono text-[10px] line-through decoration-red-500 leading-none mt-0.5">
                  ৳{Number(product.price).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-accent font-mono font-bold text-sm sm:text-base">
                ৳{Number(product.price).toFixed(2)}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-white group-hover:text-accent transition-colors border border-card-border group-hover:border-accent/40 px-2.5 py-1 rounded">
            Explore
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function AllProductsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />
      <Suspense fallback={
        <div className="flex-grow max-w-7xl w-full mx-auto px-4 py-12 flex items-center justify-center">
          <p className="text-muted-text uppercase tracking-widest text-sm animate-pulse">Loading Catalog...</p>
        </div>
      }>
        <AllProductsContent />
      </Suspense>
      <Footer />
    </div>
  );
}
