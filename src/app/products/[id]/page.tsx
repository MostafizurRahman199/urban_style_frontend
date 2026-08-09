'use client';

import React, { useState, use } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useGetProductQuery } from '@/redux/services/api';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/slices/cartSlice';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft, Shield, RotateCcw, Truck, Check, ShoppingBag, PlayCircle, X } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

function getYouTubeEmbedUrl(url: string): string {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
  }
  return url;
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const dispatch = useDispatch();
  const router = useRouter();
  const { data: product, isLoading, error } = useGetProductQuery(id);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/all-products');
    }
  };

  // Local States
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  // Initialize selected color & size once product details are loaded
  React.useEffect(() => {
    if (product && product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    }
    if (product && product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  // Update active image index to the first image matching the selected color, if one exists
  React.useEffect(() => {
    if (selectedColor && product && product.images) {
      const idx = product.images.findIndex(
        (img: any) => img.color && img.color.toLowerCase() === selectedColor.toLowerCase()
      );
      if (idx !== -1) {
        setActiveImageIdx(idx);
      }
    }
  }, [selectedColor, product]);

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
        price: product.discountPrice ? product.discountPrice : product.price,
        quantity,
        color: selectedColor || 'Standard',
        size: selectedSize || undefined,
        imageUrl: imgUrl,
        stock: product.quantity,
        deliveryCharge: Number(product.deliveryCharge || 0),
      })
    );

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleOrderNow = () => {
    if (isOutOfStock) return;
    const imgUrl = product.images?.[0]?.url;

    dispatch(
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.discountPrice ? product.discountPrice : product.price,
        quantity,
        color: selectedColor || 'Standard',
        size: selectedSize || undefined,
        imageUrl: imgUrl,
        stock: product.quantity,
        deliveryCharge: Number(product.deliveryCharge || 0),
      })
    );

    router.push('/checkout');
  };

  const images = product.images || [];
  const mainImage = images[activeImageIdx]?.url;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Link */}
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-text hover:text-white transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

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
                {images.map((img: any, idx: number) => (
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
              <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-wide text-white leading-tight break-words [overflow-wrap:anywhere]">
                {product.name}
              </h1>
              <div className="flex flex-col pt-2">
                {product.discountPrice && Number(product.discountPrice) > 0 && Number(product.discountPrice) < Number(product.price) ? (
                  <div className="flex items-center gap-3">
                    <span className="text-accent font-mono font-bold text-2xl sm:text-3xl leading-none">
                      ৳{Number(product.discountPrice).toFixed(2)}
                    </span>
                    <span className="text-muted-text font-mono text-base line-through decoration-red-500 leading-none">
                      ৳{Number(product.price).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-accent font-mono font-bold text-2xl sm:text-3xl leading-none">
                    ৳{Number(product.price).toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2">
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

              {/* Watch Video Button */}
              {product.videoUrl && (
                <div className="pt-2">
                  <button
                    onClick={() => setIsVideoModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-xs rounded transition-colors"
                  >
                    <PlayCircle className="h-4 w-4" /> Watch Video
                  </button>
                </div>
              )}
            </div>

            {/* Colors choice (Only if product has colors) */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs uppercase tracking-widest text-muted-text font-bold">
                  Select Color: <span className="text-white uppercase font-bold ml-1">{selectedColor}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color: string) => (
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

            {/* Sizes choice (Only if product has sizes) */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs uppercase tracking-widest text-muted-text font-bold">
                  Select Size: <span className="text-white uppercase font-bold ml-1">{selectedSize}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz: string) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2 border rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                        selectedSize === sz
                          ? 'border-accent bg-accent text-black'
                          : 'border-card-border bg-card-bg text-white hover:border-white/50'
                      }`}
                    >
                      {sz}
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

                <div className="pt-2 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleOrderNow}
                    className="w-full sm:w-auto px-10 py-4 rounded font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-3 transition-colors bg-white text-black hover:bg-white/90"
                  >
                    <ShoppingBag className="h-5 w-5" /> Order Now
                  </button>

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

        {/* Full-Width Product Description Section at Bottom */}
        <div className="mt-12 bg-card-bg rounded-lg p-4 sm:p-8 space-y-4 w-full max-w-full overflow-hidden break-words">
          <h3 className="text-sm font-black uppercase tracking-widest text-accent pb-3 border-b border-card-border break-words">
            Product Specifications & Details
          </h3>
          <div
            className="text-muted-text text-sm sm:text-base leading-relaxed space-y-3 w-full max-w-full break-words [overflow-wrap:anywhere] [word-break:break-word] [&_ul]:list-disc [&_ul]:pl-5 sm:[&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-5 sm:[&_ol]:pl-6 [&_li]:my-1 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-4 [&_h2]:break-words [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-2 [&_h3]:break-words [&_p]:mb-2 [&_p]:break-words [&_a]:text-accent [&_a]:underline [&_a]:break-all [&_img]:max-w-full [&_img]:h-auto [&_table]:max-w-full [&_table]:block [&_table]:overflow-x-auto [&_*]:max-w-full [&_*]:break-words"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      </main>

      <Footer />

      {/* Video Modal */}
      {isVideoModalOpen && product?.videoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsVideoModalOpen(false)} />
          <div className="relative bg-card-bg border border-card-border rounded-lg shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center p-4 border-b border-card-border">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">Product Video</h3>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-muted-text hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative w-full aspect-video bg-black">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={getYouTubeEmbedUrl(product.videoUrl)}
                title="Product Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
