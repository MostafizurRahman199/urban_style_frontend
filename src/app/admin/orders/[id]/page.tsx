'use client';

import React, { use, useState } from 'react';
import {
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderPaymentMutation,
} from '@/redux/services/api';
import { ArrowLeft, User, Phone, MapPin, MessageSquare, CreditCard, ShoppingBag, Calendar, AlertCircle } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Back to list */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-text hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Orders List
      </Link>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-card-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider flex items-center gap-3">
            Order Detail <span className="text-accent text-xs font-mono font-normal">({order.id})</span>
          </h1>
          <p className="text-xs text-muted-text uppercase tracking-widest mt-1">
            Registered: {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Alert Banner */}
      {notification && (
        <div
          className={`border text-sm rounded p-4 flex items-center gap-2 animate-fade-in ${
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-card-bg border border-card-border p-6 rounded-lg">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Customer Receipt metadata */}
        <div className="lg:col-span-5 bg-card-bg border border-card-border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-card-border pb-3">
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
        <div className="lg:col-span-7 bg-card-bg border border-card-border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-card-border pb-3">
            Purchased Products
          </h2>

          <div className="divide-y divide-card-border/50">
            {order.items?.map((item: any) => {
              const subtotal = Number(item.price) * item.quantity;
              return (
                <div key={item.id} className="flex justify-between items-center py-4 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 border border-card-border bg-black rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-muted-text/30" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white max-w-xs truncate">{item.product?.name || 'Item'}</h4>
                      <span className="text-[10px] text-muted-text uppercase font-semibold">
                        Price: ${Number(item.price).toFixed(2)} | Color: <span className="text-accent font-bold">{item.color}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-mono text-xs block font-bold">Qty: {item.quantity}</span>
                    <span className="text-accent font-mono text-xs font-bold">${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}

            <div className="pt-4 flex justify-between items-center">
              <span className="text-sm uppercase font-bold text-white">Grand Total</span>
              <span className="text-base font-mono font-bold text-accent">${Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
