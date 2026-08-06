'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { clearCart } from '@/redux/slices/cartSlice';
import { useCreateOrderMutation } from '@/redux/services/api';
import { ShoppingBag, CreditCard, CheckCircle, AlertCircle, Phone, MapPin, User, FileText } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const { items, totalAmount } = useSelector((state: RootState) => state.cart);
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  // Form States
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');

  // Status States
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add items to checkout.');
      return;
    }

    if (!customerName.trim() || !contactNumber.trim() || !address.trim()) {
      setErrorMessage('Please fill in all required fields (Name, Contact Number, Address).');
      return;
    }

    // Build items payload
    const orderItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      color: item.color,
    }));

    const orderPayload = {
      customerName,
      contactNumber,
      address,
      message: message || undefined,
      items: orderItems,
    };

    try {
      const response = await createOrder(orderPayload).unwrap();
      setPlacedOrder(response);
      dispatch(clearCart());
    } catch (err: any) {
      console.error('Order creation error:', err);
      if (err?.status === 429) {
        setErrorMessage('Too many order attempts. You are rate-limited to 5 requests per minute. Please wait.');
      } else if (err?.data?.message) {
        setErrorMessage(err.data.message);
      } else {
        setErrorMessage('An unexpected error occurred. Please check stock quantities and try again.');
      }
    }
  };

  // If order was successfully placed, show Confirmation screen
  if (placedOrder) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white">
        <Navbar />
        <main className="flex-grow max-w-2xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center space-y-6">
          <div className="p-4 bg-accent/10 border border-accent/30 rounded-full">
            <CheckCircle className="h-16 w-16 text-accent" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-wide">Order Received!</h1>
            <p className="text-muted-text text-sm">
              Thank you for shopping with Urban Style. Your order has been placed successfully and is pending confirmation.
            </p>
          </div>

          {/* Order Summary Receipt */}
          <div className="w-full bg-card-bg border border-card-border rounded-lg p-6 text-left space-y-4 font-sans">
            <div className="flex justify-between border-b border-card-border/50 pb-3">
              <span className="text-xs uppercase text-muted-text tracking-wider font-bold">Order ID</span>
              <span className="text-sm font-mono font-semibold text-white">{placedOrder.id}</span>
            </div>
            <div className="flex justify-between border-b border-card-border/50 pb-3">
              <span className="text-xs uppercase text-muted-text tracking-wider font-bold">Customer</span>
              <span className="text-sm font-semibold text-white">{placedOrder.customerName}</span>
            </div>
            <div className="flex justify-between border-b border-card-border/50 pb-3">
              <span className="text-xs uppercase text-muted-text tracking-wider font-bold">Contact Number</span>
              <span className="text-sm font-semibold text-white">{placedOrder.contactNumber}</span>
            </div>
            <div className="flex justify-between border-b border-card-border/50 pb-3">
              <span className="text-xs uppercase text-muted-text tracking-wider font-bold">Shipping Address</span>
              <span className="text-sm text-white text-right max-w-xs">{placedOrder.address}</span>
            </div>
            <div className="flex justify-between border-b border-card-border/50 pb-3">
              <span className="text-xs uppercase text-muted-text tracking-wider font-bold">Status</span>
              <span className="bg-yellow-600/20 text-accent text-[10px] font-extrabold px-2 py-0.5 rounded border border-accent/20">
                {placedOrder.orderStatus}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-sm uppercase text-white font-bold">Total Amount</span>
              <span className="text-base font-mono font-bold text-accent">${Number(placedOrder.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href="/"
              className="flex-1 py-3 px-6 bg-accent text-black font-bold uppercase tracking-wider text-sm hover:bg-accent-hover transition-colors rounded text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider mb-8">
          Checkout <span className="text-accent">Details</span>
        </h1>

        {errorMessage && (
          <div className="bg-red-650/10 border border-red-500/30 text-red-500 rounded p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm font-semibold">{errorMessage}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Checkout Form */}
          <div className="lg:col-span-7 bg-card-bg border border-card-border rounded-lg p-6 space-y-6">
            <h2 className="text-lg font-bold uppercase tracking-wider pb-3 border-b border-card-border">
              Customer Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted-text font-bold flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-accent" /> Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted-text font-bold flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-accent" /> Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +8801712345678"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted-text font-bold flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-accent" /> Shipping Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. 123 Fashion Ave, Dhaka, Bangladesh"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted-text font-bold flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-accent" /> Order Message (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please call before delivery."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors resize-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || items.length === 0}
                  className="w-full py-4 bg-accent text-black font-bold uppercase tracking-wider text-sm hover:bg-accent-hover transition-colors rounded disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" /> Place Cash on Delivery Order
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Cart Review Sidebar */}
          <div className="lg:col-span-5 bg-card-bg border border-card-border rounded-lg p-6 space-y-6">
            <h2 className="text-lg font-bold uppercase tracking-wider pb-3 border-b border-card-border flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-accent" /> Review Order
            </h2>

            {items.length === 0 ? (
              <div className="text-center py-10 space-y-4">
                <p className="text-muted-text text-sm">Your cart is empty.</p>
                <Link
                  href="/"
                  className="inline-block px-4 py-2 bg-accent text-black font-bold uppercase tracking-wider text-xs rounded hover:bg-accent-hover transition-colors"
                >
                  Shop Now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-72 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.color}`} className="flex justify-between items-center gap-3 border-b border-card-border/30 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded border border-card-border overflow-hidden bg-black flex-shrink-0 flex items-center justify-center">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <ShoppingBag className="h-5 w-5 text-muted-text" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-white line-clamp-1">{item.name}</h4>
                          <span className="text-[10px] text-muted-text uppercase">
                            Color: {item.color} | Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-accent">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-muted-text uppercase tracking-wider">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-text uppercase tracking-wider">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between text-sm text-white font-bold uppercase tracking-wider pt-2 border-t border-card-border/50">
                    <span>Subtotal</span>
                    <span className="text-accent font-mono text-base">${Number(totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
