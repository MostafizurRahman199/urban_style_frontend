'use client';

import React, { use, useState, useEffect } from 'react';
import {
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderPaymentMutation,
  useUpdateOrderCidMutation,
  useUpdateOrderDeliveryChargeMutation,
} from '@/redux/services/api';
import { ArrowLeft, User, Phone, MapPin, MessageSquare, CreditCard, ShoppingBag, Calendar, AlertCircle, Download, Hash, Truck } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const { data: order, isLoading, error, refetch } = useGetOrderQuery(id);
  const [updateStatus, { isLoading: statusUpdating }] = useUpdateOrderStatusMutation();
  const [updatePayment, { isLoading: paymentUpdating }] = useUpdateOrderPaymentMutation();
  const [updateCid, { isLoading: cidUpdating }] = useUpdateOrderCidMutation();
  const [updateDeliveryCharge, { isLoading: deliveryUpdating }] = useUpdateOrderDeliveryChargeMutation();

  const [cidInput, setCidInput] = useState('');
  const [isCidInitialized, setIsCidInitialized] = useState(false);

  const [deliveryChargeInput, setDeliveryChargeInput] = useState('');
  const [isDeliveryInitialized, setIsDeliveryInitialized] = useState(false);

  useEffect(() => {
    if (order && !isCidInitialized) {
      if (order.cidNumber) setCidInput(order.cidNumber);
      setIsCidInitialized(true);
    }
    if (order && !isDeliveryInitialized) {
      setDeliveryChargeInput(String(order.deliveryCharge || 0));
      setIsDeliveryInitialized(true);
    }
  }, [order, isCidInitialized, isDeliveryInitialized]);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const triggerNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (!newStatus) return;

    try {
      await updateStatus({ id, status: newStatus }).unwrap();
      triggerNotification('success', `Order fulfillment status changed to ${newStatus}`);
      refetch();
    } catch (err: any) {
      console.error(err);
      triggerNotification('error', err?.data?.message || 'Failed to update fulfillment status.');
    }
  };

  const handlePaymentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPayment = e.target.value;
    if (!newPayment) return;

    try {
      await updatePayment({ id, status: newPayment }).unwrap();
      triggerNotification('success', `Order payment status changed to ${newPayment}`);
      refetch();
    } catch (err: any) {
      console.error(err);
      triggerNotification('error', err?.data?.message || 'Failed to update payment status.');
    }
  };

  const handleCidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cidInput.trim()) {
      triggerNotification('error', 'Please enter a valid CID Number.');
      return;
    }

    try {
      await updateCid({ id, cidNumber: cidInput.trim() }).unwrap();
      triggerNotification('success', 'CID Number saved successfully!');
      refetch();
    } catch (err: any) {
      console.error(err);
      triggerNotification('error', err?.data?.message || 'Failed to save CID Number.');
    }
  };

  const handleDeliveryChargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const charge = parseFloat(deliveryChargeInput);
    if (isNaN(charge) || charge < 0) {
      triggerNotification('error', 'Please enter a valid delivery charge.');
      return;
    }

    try {
      await updateDeliveryCharge({ id, deliveryCharge: charge }).unwrap();
      triggerNotification('success', 'Delivery charge updated successfully!');
      refetch();
    } catch (err: any) {
      console.error(err);
      triggerNotification('error', err?.data?.message || 'Failed to update delivery charge.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-white">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-text text-xs uppercase tracking-widest">Loading Order Logs...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-20 text-white space-y-4">
        <h2 className="text-lg font-bold uppercase tracking-wider text-red-500">Order Not Found</h2>
        <p className="text-muted-text text-sm">Failed to retrieve the order. It may not exist.</p>
        <Link href="/admin/orders" className="inline-block px-5 py-2 bg-accent text-black text-xs font-bold uppercase tracking-wider rounded">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 print:bg-white print:text-black print:p-8 print:m-0">
      {/* Back to list */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-text hover:text-white transition-colors print:hidden"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Orders List
      </Link>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-card-border print:hidden">
        <div>
          {order.cidNumber && (
            <div className="text-xs font-bold uppercase tracking-widest text-accent mb-1 flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5" /> CID Number: {order.cidNumber}
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider flex items-center gap-3">
            Order Detail <span className="text-accent text-xs font-mono font-normal">({order.id})</span>
          </h1>
          <p className="text-xs text-muted-text uppercase tracking-widest mt-1">
            Registered: {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-black font-bold uppercase tracking-wider text-xs rounded hover:bg-accent-hover transition-colors shadow-sm"
        >
          <Download className="h-4 w-4" /> Download Invoice
        </button>
      </div>

      {/* Print-only Invoice Header */}
      <div className="hidden print:block mb-8 border-b border-black pb-4">
        <h1 className="text-2xl font-black uppercase mb-3">URBAN STYLE - Invoice</h1>
        <div className="text-sm space-y-1">
          {order.cidNumber && (
            <p className="text-base font-bold text-black">
              <strong>CID Number:</strong> {order.cidNumber}
            </p>
          )}
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Alert Banner */}
      {notification && (
        <div
          className={`border text-sm rounded p-4 flex items-center gap-2 animate-fade-in print:hidden ${
            notification.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-500'
              : 'bg-red-500/10 border-red-500/30 text-red-500'
          }`}
        >
          <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
          <span className="font-semibold">{notification.text}</span>
        </div>
      )}

      {/* Status update controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-card-bg border border-card-border p-6 rounded-lg print:hidden">
        {/* Fulfillment status dropdown */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-muted-text font-bold flex items-center gap-1.5">
            <ShoppingBag className="h-4 w-4 text-accent" /> Fulfillment Status
          </label>
          <select
            value={order.orderStatus}
            onChange={handleStatusChange}
            disabled={statusUpdating}
            className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-xs outline-none transition-colors disabled:opacity-40"
          >
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* Payment status dropdown */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-muted-text font-bold flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-accent" /> Payment Status
          </label>
          <select
            value={order.paymentStatus}
            onChange={handlePaymentChange}
            disabled={paymentUpdating}
            className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-xs outline-none transition-colors disabled:opacity-40"
          >
            <option value="UNPAID">UNPAID</option>
            <option value="PAID">PAID</option>
            <option value="FAILED">FAILED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>

        {/* CID Number Input & Submit Button */}
        <form onSubmit={handleCidSubmit} className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-muted-text font-bold flex items-center gap-1.5">
            <Hash className="h-4 w-4 text-accent" /> CID Number
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter CID Number"
              value={cidInput}
              onChange={(e) => setCidInput(e.target.value)}
              className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-3 py-2 rounded text-xs outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={cidUpdating}
              className="px-3 py-2 bg-accent text-black font-extrabold uppercase tracking-wider text-[11px] hover:bg-accent-hover transition-colors rounded disabled:opacity-40 whitespace-nowrap"
            >
              {cidUpdating ? 'Saving...' : order.cidNumber ? 'Update CID' : 'Add CID'}
            </button>
          </div>
        </form>

        {/* Delivery Charge Input & Submit Button */}
        <form onSubmit={handleDeliveryChargeSubmit} className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-muted-text font-bold flex items-center gap-1.5">
            <Truck className="h-4 w-4 text-accent" /> Delivery Charge (৳)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              value={deliveryChargeInput}
              onChange={(e) => setDeliveryChargeInput(e.target.value)}
              className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-3 py-2 rounded text-xs outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={deliveryUpdating}
              className="px-3 py-2 bg-accent text-black font-extrabold uppercase tracking-wider text-[11px] hover:bg-accent-hover transition-colors rounded disabled:opacity-40 whitespace-nowrap"
            >
              {deliveryUpdating ? 'Saving...' : 'Update'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print:block">
        {/* Customer Receipt metadata */}
        <div className="lg:col-span-5 bg-card-bg border border-card-border rounded-lg p-6 space-y-4 print:border-none print:p-0 print:mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-card-border pb-3 print:text-black print:border-black">
            Customer details
          </h2>

          <div className="space-y-4 font-sans text-xs">
            <div className="flex gap-3">
              <User className="h-4.5 w-4.5 text-accent flex-shrink-0" />
              <div>
                <span className="text-muted-text uppercase font-bold block mb-0.5">Name</span>
                <span className="text-sm text-white font-semibold">{order.customerName}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Phone className="h-4.5 w-4.5 text-accent flex-shrink-0" />
              <div>
                <span className="text-muted-text uppercase font-bold block mb-0.5">Contact Number</span>
                <span className="text-sm text-white font-semibold">{order.contactNumber}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <MapPin className="h-4.5 w-4.5 text-accent flex-shrink-0" />
              <div>
                <span className="text-muted-text uppercase font-bold block mb-0.5">Shipping Address</span>
                <span className="text-sm text-white leading-relaxed">{order.address}</span>
              </div>
            </div>

            {order.message && (
              <div className="flex gap-3">
                <MessageSquare className="h-4.5 w-4.5 text-accent flex-shrink-0" />
                <div>
                  <span className="text-muted-text uppercase font-bold block mb-0.5">Order Message</span>
                  <span className="text-sm text-white leading-relaxed italic">"{order.message}"</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items list */}
        <div className="lg:col-span-7 bg-card-bg border border-card-border rounded-lg p-6 space-y-4 print:border-none print:p-0">
          <h2 className="text-base font-black uppercase tracking-wider border-b border-card-border pb-3 print:text-black print:border-black flex items-center justify-between">
            <span>Purchased Products</span>
            <span className="text-xs font-semibold text-muted-text print:text-gray-600 font-mono">
              {order.items?.length || 0} {order.items?.length === 1 ? 'Item' : 'Items'}
            </span>
          </h2>

          <div className="divide-y divide-card-border/60">
            {order.items?.map((item: any) => {
              const subtotal = Number(item.price) * item.quantity;
              return (
                <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-5 gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-14 w-14 border border-card-border bg-black rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center print:hidden shadow-inner mt-0.5">
                      <ShoppingBag className="h-7 w-7 text-accent" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base sm:text-lg font-extrabold text-white tracking-wide leading-snug print:text-black">
                        {item.product?.name || 'Item'}
                      </h3>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-semibold text-muted-text print:text-gray-700">
                          Price: <strong className="text-white font-mono print:text-black">৳{Number(item.price).toFixed(2)}</strong>
                        </span>

                        <span className="inline-flex items-center px-3 py-1 rounded bg-accent/20 border border-accent/40 text-accent font-extrabold text-xs uppercase tracking-wider print:border-black print:text-black print:bg-gray-100">
                          Color: {item.color}
                        </span>

                        {item.size && (
                          <span className="inline-flex items-center px-3 py-1 rounded bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 font-extrabold text-xs uppercase tracking-wider print:border-black print:text-black print:bg-gray-100">
                            Size: {item.size}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-muted-text uppercase block print:text-gray-500">
                        Product ID: {item.productId}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col justify-between sm:items-end w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-card-border/30">
                    <span className="inline-block bg-input-bg border border-input-border text-white text-sm sm:text-base font-black font-mono px-3.5 py-1 rounded print:text-black print:border-black print:bg-gray-100">
                      Qty: {item.quantity}
                    </span>
                    <span className="text-lg sm:text-xl font-mono font-black text-accent print:text-black sm:mt-1.5">
                      ৳{subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}

            {(() => {
              const itemsSubtotal = order.items?.reduce(
                (sum: number, item: any) => sum + Number(item.price) * item.quantity,
                0,
              ) || 0;
              const delCharge = Number(order.deliveryCharge || 0);

              return (
                <div className="pt-5 border-t border-card-border/60 space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold text-muted-text print:text-black">
                    <span>Items Subtotal</span>
                    <span className="font-mono font-bold text-white print:text-black">৳{itemsSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold text-muted-text print:text-black">
                    <span>Delivery Charge</span>
                    <span className="font-mono font-bold text-white print:text-black">৳{delCharge.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 flex justify-between items-center border-t border-card-border/60 print:border-t-2 print:border-black">
                    <span className="text-base uppercase font-extrabold text-white print:text-black">Grand Total</span>
                    <span className="text-xl sm:text-2xl font-mono font-black text-accent print:text-black">৳{Number(order.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
