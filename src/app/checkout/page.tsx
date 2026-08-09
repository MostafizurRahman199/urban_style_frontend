'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { clearCart } from '@/redux/slices/cartSlice';
import { useCreateOrderMutation } from '@/redux/services/api';
import { ShoppingBag, CreditCard, CheckCircle, AlertCircle, Phone, MapPin, User, FileText, Truck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items, totalAmount } = useSelector((state: RootState) => state.cart);
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/all-products');
    }
  };

  // Form States
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');

  // Calculate delivery charge automatically from cart items
  const autoDeliveryCharge = items.reduce((sum, item) => sum + Number(item.deliveryCharge || 0), 0);

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
      size: item.size || undefined,
    }));

    const orderPayload = {
      customerName,
      contactNumber,
      address,
      message: message || undefined,
      deliveryCharge: autoDeliveryCharge,
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
            <div className="flex justify-between border-b border-card-border/50 pb-3">
              <span className="text-xs uppercase text-muted-text tracking-wider font-bold">Delivery Charge</span>
              <span className="text-sm font-mono font-semibold text-white">৳{Number(placedOrder.deliveryCharge || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-sm uppercase text-white font-bold">Total Amount</span>
              <span className="text-base font-mono font-bold text-accent">৳{Number(placedOrder.totalAmount).toFixed(2)}</span>
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

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Dynamic Back Button */}
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-text hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

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
                  placeholder="Write your name."
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
                  placeholder="Write your phone number"
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
                  placeholder="Write your details address."
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
                  placeholder="Write your message."
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
            <div className="flex items-center justify-between pb-3 border-b border-card-border">
              <h2 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-accent" /> Review Order
              </h2>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event('open-cart'))}
                className="text-xs font-bold uppercase tracking-wider text-accent hover:text-accent-hover transition-colors flex items-center gap-1"
              >
                Edit
              </button>
            </div>

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
                <div className="max-h-none lg:max-h-72 overflow-visible lg:overflow-y-auto space-y-3 lg:pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.color}-${item.size || ''}`} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-card-border/40 pb-4">
                      <div className="flex items-start gap-3.5 flex-1">
                        <div className="h-16 w-16 rounded-lg border border-card-border overflow-hidden bg-black flex-shrink-0 flex items-center justify-center shadow-inner mt-0.5">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <ShoppingBag className="h-7 w-7 text-muted-text" />
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="text-sm sm:text-base font-extrabold text-white tracking-wide leading-snug line-clamp-2">{item.name}</h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-accent/20 border border-accent/40 text-accent font-extrabold text-[11px] uppercase tracking-wider">
                              Color: {item.color}
                            </span>
                            {item.size && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 font-extrabold text-[11px] uppercase tracking-wider">
                                Size: {item.size}
                              </span>
                            )}
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-input-bg border border-input-border text-white font-mono font-black text-[11px]">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto pt-1 sm:pt-0">
                        <span className="text-xs text-muted-text font-mono font-semibold sm:hidden">Subtotal:</span>
                        <span className="text-base sm:text-lg font-mono font-black text-accent">
                          ৳{(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {(() => {
                  const grandTotal = totalAmount + autoDeliveryCharge;
                  return (
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-xs text-muted-text uppercase tracking-wider">
                        <span>Items Subtotal</span>
                        <span className="font-mono text-white">৳{Number(totalAmount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-text uppercase tracking-wider">
                        <span>Delivery Charge</span>
                        <span className="font-mono text-white">৳{autoDeliveryCharge.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-white font-bold uppercase tracking-wider pt-2 border-t border-card-border/50">
                        <span>Total Amount</span>
                        <span className="text-accent font-mono text-base">৳{grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
