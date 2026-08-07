'use client';

import React, { useState } from 'react';
import { useGetOrdersQuery } from '@/redux/services/api';
import { Eye, ShoppingCart, User, Clock, CheckCircle2, XCircle, Ban, Truck, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function OrdersAdminPage() {
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: ordersData, isLoading, error } = useGetOrdersQuery({
    page,
    limit,
    ...(orderStatus && { orderStatus }),
    ...(paymentStatus && { paymentStatus }),
  });

  const getOrderStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-600/10 border-yellow-600/30 text-accent';
      case 'CONFIRMED':
        return 'bg-blue-600/10 border-blue-500/30 text-blue-400';
      case 'PROCESSING':
        return 'bg-purple-650/10 border-purple-500/30 text-purple-400';
      case 'SHIPPED':
        return 'bg-indigo-650/10 border-indigo-500/30 text-indigo-400';
      case 'DELIVERED':
        return 'bg-green-600/10 border-green-500/30 text-green-500';
      case 'CANCELLED':
        return 'bg-red-500/10 border-red-500/30 text-red-500';
      default:
        return 'bg-card-border border-card-border text-muted-text';
    }
  };

  const getPaymentStatusStyle = (status: string) => {
    switch (status) {
      case 'UNPAID':
        return 'bg-red-500/10 border-red-550/30 text-red-500';
      case 'PAID':
        return 'bg-green-600/10 border-green-500/30 text-green-500';
      case 'FAILED':
        return 'bg-red-600/10 border-red-600/30 text-red-650';
      case 'REFUNDED':
        return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
      default:
        return 'bg-card-border border-card-border text-muted-text';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider">
          Orders <span className="text-accent">Manager</span>
        </h1>
        <p className="text-xs text-muted-text uppercase tracking-widest mt-1">
          Review orders, confirm payments, and track package shipments
        </p>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-card-bg border border-card-border p-4 rounded-lg">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold tracking-widest text-muted-text">
            Fulfillment Status
          </label>
          <select
            value={orderStatus}
            onChange={(e) => {
              setOrderStatus(e.target.value);
              setPage(1);
            }}
            className="w-full bg-input-bg border border-input-border focus:border-accent text-muted-text px-4 py-2 rounded text-xs outline-none transition-colors"
          >
            <option value="">All Fulfillment Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold tracking-widest text-muted-text">
            Payment Status
          </label>
          <select
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setPage(1);
            }}
            className="w-full bg-input-bg border border-input-border focus:border-accent text-muted-text px-4 py-2 rounded text-xs outline-none transition-colors"
          >
            <option value="">All Payment Statuses</option>
            <option value="UNPAID">UNPAID</option>
            <option value="PAID">PAID</option>
            <option value="FAILED">FAILED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-card-bg border border-card-border rounded-lg p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b border-card-border pb-3">
          <ShoppingCart className="h-4.5 w-4.5 text-accent" /> Client Checkout Logs
        </h2>

        {isLoading ? (
          <div className="space-y-4 py-10">
            <div className="h-10 bg-card-border animate-pulse rounded" />
            <div className="h-10 bg-card-border animate-pulse rounded" />
          </div>
        ) : error ? (
          <div className="text-center py-6 text-muted-text text-sm">Failed to fetch order records.</div>
        ) : !ordersData?.data || ordersData.data.length === 0 ? (
          <div className="text-center py-16 text-muted-text text-sm flex flex-col items-center justify-center gap-4">
            <ShoppingCart className="h-10 w-10 text-muted-text/30" />
            <span>No orders found matching filters.</span>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-card-border text-muted-text uppercase tracking-widest font-bold">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3 text-center">Fulfillment</th>
                    <th className="pb-3 text-center">Payment</th>
                    <th className="pb-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border/40 font-sans">
                  {ordersData.data.map((order: any) => (
                    <tr key={order.id} className="hover:bg-black/20 transition-colors">
                      {/* ID */}
                      <td className="py-4 font-mono font-semibold text-white max-w-[120px] truncate pr-4">
                        {order.id}
                      </td>

                      {/* Name */}
                      <td className="py-4 font-bold text-white max-w-[150px] truncate pr-4">
                        {order.customerName}
                      </td>

                      {/* Contact */}
                      <td className="py-4 text-muted-text">
                        {order.contactNumber}
                      </td>

                      {/* Date */}
                      <td className="py-4 text-muted-text">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>

                      {/* Total */}
                      <td className="py-4 font-mono font-bold text-accent">
                        ৳{Number(order.totalAmount).toFixed(2)}
                      </td>

                      {/* Order Status */}
                      <td className="py-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${getOrderStatusStyle(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${getPaymentStatusStyle(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-card-border hover:border-accent/40 rounded text-[10px] font-bold uppercase tracking-wider text-white transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {ordersData.meta && ordersData.meta.totalPages > 1 && (
              <div className="flex justify-between items-center border-t border-card-border/60 pt-4">
                <span className="text-[10px] text-muted-text uppercase font-bold">
                  Page {ordersData.meta.page} of {ordersData.meta.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 bg-card-bg border border-card-border hover:border-white text-[10px] font-bold uppercase rounded disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    disabled={page === ordersData.meta.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 bg-card-bg border border-card-border hover:border-white text-[10px] font-bold uppercase rounded disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
