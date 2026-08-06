'use client';

import React, { useState, use } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useGetProductQuery } from '@/redux/services/api';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/slices/cartSlice';
import { ShoppingCart, ArrowLeft, Shield, RotateCcw, Truck, Check } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const dispatch = useDispatch();
  const { data: product, isLoading, error } = useGetProductQuery(id);

  // Local States
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  // Initialize selected color once product details are loaded
  React.useEffect(() => {
    if (product && product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 w-full flex-grow flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="h-12 w-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-text text-xs uppercase tracking-widest">Loading Premium Item details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 w-full flex-grow flex flex-col items-center justify-center text-center space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-wide">Product Not Found</h2>
          <p className="text-muted-text">The product you are looking for does not exist or has been removed.</p>
          <Link href="/" className="px-6 py-2 bg-accent text-black font-semibold uppercase tracking-wider text-sm rounded">
            Back to Shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isOutOfStock = product.quantity <= 0;
  const isLowStock = !isOutOfStock && product.quantity <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const imgUrl = product.images?.[0]?.url;

    dispatch(
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        color: selectedColor || 'Standard',
        imageUrl: imgUrl,
        stock: product.quantity,
      })
    );

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const images = product.images || [];
  const mainImage = images[activeImageIdx]?.url;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-text hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Collection
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images Section */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-card-bg border border-card-border rounded-lg overflow-hidden flex items-center justify-center relative">
              {mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ShoppingCart className="h-20 w-20 text-muted-text/30" />
              )}

              {/* Stock Badge overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center">
                  <span className="bg-red-600 text-white font-extrabold uppercase tracking-widest px-4 py-2 rounded text-xs">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`h-16 w-16 flex-shrink-0 rounded border overflow-hidden bg-card-bg transition-colors ${
                      idx === activeImageIdx
                        ? 'border-accent'
                        : 'border-card-border hover:border-white/55'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={`${product.name} - Thumbnail ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Details Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              {product.category?.name && (
                <span className="text-xs text-accent font-bold uppercase tracking-widest">
                  {product.category.name}
                </span>
              )}
              <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-wide text-white leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 pt-2">
                <span className="text-accent font-mono font-bold text-2xl sm:text-3xl">
                  ${Number(product.price).toFixed(2)}
                </span>
                {isOutOfStock ? (
                  <span className="text-red-500 text-xs font-semibold uppercase tracking-wider">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="text-yellow-600 text-xs font-semibold uppercase tracking-wider">
                    Only {product.quantity} items left in stock
                  </span>
                ) : (
                  <span className="text-green-500 text-xs font-semibold uppercase tracking-wider">
                    In Stock ({product.quantity} available)
                  </span>
                )}
              </div>
            </div>

            <div className="border-t border-card-border/60 pt-4">
              <h3 className="text-xs uppercase tracking-widest text-muted-text font-bold mb-2">Description</h3>
              <p className="text-muted-text text-sm leading-relaxed max-w-lg">
                {product.description}
              </p>
            </div>

            {/* Colors choice (Only if product has colors) */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs uppercase tracking-widest text-muted-text font-bold">
                  Select Color: <span className="text-white uppercase font-bold ml-1">{selectedColor}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                        selectedColor === color
                          ? 'border-accent bg-accent text-black'
                          : 'border-card-border bg-card-bg text-white hover:border-white/50'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Cart button */}
            {!isOutOfStock && (
              <div className="space-y-4 pt-4 border-t border-card-border/60">
                <div className="flex items-center space-x-4">
                  <span className="text-xs uppercase tracking-widest text-muted-text font-bold">Quantity:</span>
                  <div className="flex items-center border border-card-border rounded bg-card-bg">
                    <button
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="px-3 py-1.5 text-muted-text hover:text-white transition-colors"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-sm font-mono">{quantity}</span>
                    <button
                      onClick={() => setQuantity((prev) => Math.min(product.quantity, prev + 1))}
                      className="px-3 py-1.5 text-muted-text hover:text-white transition-colors"
                      disabled={quantity >= product.quantity}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdded}
                    className={`w-full sm:w-auto px-10 py-4 rounded font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-3 transition-colors ${
                      isAdded
                        ? 'bg-green-600 text-white'
                        : 'bg-accent text-black hover:bg-accent-hover'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="h-5 w-5" /> Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5" /> Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Store Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-card-border/60">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">Fast Shipping</h4>
                  <p className="text-muted-text text-[11px] leading-snug">Nationwide standard delivery.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">Easy Returns</h4>
                  <p className="text-muted-text text-[11px] leading-snug">7-day replacement policy.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">Secure Checkout</h4>
                  <p className="text-muted-text text-[11px] leading-snug">100% verified order processing.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
