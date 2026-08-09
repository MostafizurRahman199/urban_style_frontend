'use client';

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { updateQuantity, removeFromCart, CartItem } from '@/redux/slices/cartSlice';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const dispatch = useDispatch();
  const { items, totalAmount } = useSelector((state: RootState) => state.cart);

  // Prevent background scroll when cart drawer is open on mobile/desktop
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

  if (!isOpen) return null;

  const handleQtyChange = (item: CartItem, newQty: number) => {
    if (newQty < 1) return;
    dispatch(updateQuantity({ productId: item.productId, color: item.color, size: item.size, quantity: newQty }));
  };

  const handleRemove = (productId: string, color: string, size?: string) => {
    dispatch(removeFromCart({ productId, color, size }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-8">
        <div className="w-screen max-w-[100vw] sm:max-w-md">
          <div className="h-full flex flex-col bg-black border-l border-card-border shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 sm:py-5 border-b border-card-border bg-black/90">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                <h2 className="text-base sm:text-lg font-bold tracking-wide uppercase">Your Cart</h2>
                <span className="text-xs font-mono text-muted-text font-normal lowercase">
                  ({items.length} {items.length === 1 ? 'item' : 'items'})
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-muted-text hover:text-white transition-colors p-1.5 rounded-lg border border-card-border bg-card-bg"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 py-4 overflow-y-auto custom-scrollbar px-3 sm:px-4 space-y-3 sm:space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <ShoppingBag className="h-16 w-16 text-muted-text/30" />
                  <p className="text-muted-text font-medium text-sm">Your cart is currently empty</p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-accent text-black font-semibold uppercase tracking-wider text-xs rounded hover:bg-accent-hover transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div
                    key={`${item.productId}-${item.color}-${item.size || ''}`}
                    className="flex items-start py-3 sm:py-4 border-b border-card-border/50 animate-fade-in gap-3 sm:gap-4"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    {/* Thumbnail Image */}
                    <div className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded border border-card-border bg-card-bg flex items-center justify-center">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-muted-text" />
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      {/* Name & Price */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs sm:text-sm font-semibold text-white hover:text-accent transition-colors line-clamp-2 leading-snug">
                          <Link href={`/products/${item.productId}`} onClick={onClose}>
                            {item.name}
                          </Link>
                        </h3>
                        <p className="text-accent font-mono font-bold text-xs sm:text-sm flex-shrink-0 text-right">
                          ৳{(Number(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Color & Size Badges */}
                      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap text-xs">
                        <span className="px-1.5 py-0.5 rounded bg-accent/20 border border-accent/40 text-accent font-extrabold text-[9px] sm:text-[10px] uppercase">
                          Color: {item.color}
                        </span>
                        {item.size && (
                          <span className="px-1.5 py-0.5 rounded bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 font-extrabold text-[9px] sm:text-[10px] uppercase">
                            Size: {item.size}
                          </span>
                        )}
                      </div>

                      {/* Quantity Selector & Remove Action */}
                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="flex items-center border border-card-border rounded bg-card-bg">
                          <button
                            onClick={() => handleQtyChange(item, item.quantity - 1)}
                            className="p-1 sm:p-1.5 text-muted-text hover:text-white transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2.5 sm:px-3 py-0.5 text-xs font-mono font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => handleQtyChange(item, item.quantity + 1)}
                            className="p-1 sm:p-1.5 text-muted-text hover:text-white transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(item.productId, item.color, item.size)}
                          className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors flex items-center gap-1 text-xs"
                          title="Remove item from cart"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline text-[11px]">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="border-t border-card-border px-4 py-4 sm:py-5 bg-card-bg/95 backdrop-blur-sm">
                <div className="flex justify-between items-center text-sm sm:text-base font-medium text-white mb-2">
                  <span>Subtotal</span>
                  <span className="text-accent font-mono font-bold text-base sm:text-lg">৳{Number(totalAmount).toFixed(2)}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-muted-text mb-4">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="space-y-2">
                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="w-full flex items-center justify-center px-4 py-2.5 sm:py-3 border border-transparent rounded bg-accent text-black font-semibold uppercase tracking-wider text-xs sm:text-sm hover:bg-accent-hover transition-colors text-center shadow-lg"
                  >
                    Checkout
                  </Link>
                  <button
                    onClick={onClose}
                    className="w-full flex items-center justify-center px-4 py-2 border border-card-border rounded bg-transparent text-white text-xs sm:text-sm font-medium hover:bg-card-border transition-colors text-center"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
