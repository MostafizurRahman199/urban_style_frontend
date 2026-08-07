'use client';

import React from 'react';
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col bg-black border-l border-card-border shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-6 border-b border-card-border">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-6 w-6 text-accent" />
                <h2 className="text-lg font-bold tracking-wide uppercase">Your Cart</h2>
              </div>
              <button
                onClick={onClose}
                className="text-muted-text hover:text-white transition-colors p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 py-6 overflow-y-auto px-4 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <ShoppingBag className="h-16 w-16 text-muted-text/30" />
                  <p className="text-muted-text font-medium">Your cart is empty</p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-accent text-black font-semibold uppercase tracking-wider text-sm rounded hover:bg-accent-hover transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div
                    key={`${item.productId}-${item.color}-${item.size || ''}`}
                    className="flex py-4 border-b border-card-border/50 animate-fade-in"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded border border-card-border bg-card-bg flex items-center justify-center">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ShoppingBag className="h-8 w-8 text-muted-text" />
                      )}
                    </div>

                    <div className="ml-4 flex-1 flex flex-col">
                      <div>
                        <div className="flex justify-between text-sm font-semibold">
                          <h3 className="text-white hover:text-accent transition-colors">
                            <Link href={`/products/${item.productId}`} onClick={onClose}>
                              {item.name}
                            </Link>
                          </h3>
                           <p className="ml-4 text-accent font-mono">৳{(Number(item.price) * item.quantity).toFixed(2)}</p>
                        </div>
                        <div className="mt-1 flex items-center gap-2 flex-wrap text-xs text-muted-text">
                          <span>
                            Color: <span className="text-white uppercase font-medium">{item.color}</span>
                          </span>
                          {item.size && (
                            <>
                              <span>•</span>
                              <span>
                                Size: <span className="text-white uppercase font-medium">{item.size}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 flex items-end justify-between text-sm">
                        <div className="flex items-center border border-card-border rounded bg-card-bg">
                          <button
                            onClick={() => handleQtyChange(item, item.quantity - 1)}
                            className="p-1 text-muted-text hover:text-white transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 py-1 text-xs font-mono">{item.quantity}</span>
                          <button
                            onClick={() => handleQtyChange(item, item.quantity + 1)}
                            className="p-1 text-muted-text hover:text-white transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="flex">
                          <button
                            type="button"
                            onClick={() => handleRemove(item.productId, item.color, item.size)}
                            className="font-medium text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="border-t border-card-border px-4 py-6 bg-card-bg">
                <div className="flex justify-between text-base font-medium text-white mb-4">
                  <p>Subtotal</p>
                  <p className="text-accent font-mono text-lg">৳{Number(totalAmount).toFixed(2)}</p>
                </div>
                <p className="mt-0.5 text-xs text-muted-text mb-6">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded bg-accent text-black font-semibold uppercase tracking-wider hover:bg-accent-hover transition-colors text-center"
                  >
                    Checkout
                  </Link>
                  <button
                    onClick={onClose}
                    className="w-full flex items-center justify-center px-6 py-2 border border-card-border rounded bg-transparent text-white font-medium hover:bg-card-border transition-colors text-center"
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
