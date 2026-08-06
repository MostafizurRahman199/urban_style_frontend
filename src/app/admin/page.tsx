'use client';

import React, { useState } from 'react';
import {
  useGetSummaryQuery,
  useGetOrdersByStatusQuery,
  useGetRevenueOverTimeQuery,
  useGetTopProductsQuery,
  useGetLowStockQuery,
} from '@/redux/services/api';
import { DollarSign, ShoppingCart, Package, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';
import dynamic from 'next/dynamic';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const AreaChart = dynamic(
  () => import('recharts').then((mod) => mod.AreaChart),
  { ssr: false }
);
const Area = dynamic(
  () => import('recharts').then((mod) => mod.Area),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
);

export default function AdminDashboardPage() {
  const [revenueRange, setRevenueRange] = useState<'day' | 'week' | 'month'>('day');

  // Queries
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useGetSummaryQuery(undefined);
  const { data: ordersByStatus, isLoading: statusLoading, refetch: refetchStatus } = useGetOrdersByStatusQuery(undefined);
  const { data: revenueData, isLoading: revenueLoading, refetch: refetchRevenue } = useGetRevenueOverTimeQuery({ range: revenueRange });
  const { data: topProducts, isLoading: productsLoading, refetch: refetchTop } = useGetTopProductsQuery(undefined);
  const { data: lowStock, isLoading: stockLoading, refetch: refetchStock } = useGetLowStockQuery({ threshold: 10 });

  const handleRefreshAll = () => {
    refetchSummary();
    refetchStatus();
    refetchRevenue();
    refetchTop();
    refetchStock();
  };

  const kpis = [
    {
      name: 'Total Revenue',
      value: summary ? `$${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00',
      icon: DollarSign,
      color: 'text-accent',
      borderColor: 'border-accent/20',
      bgColor: 'bg-accent/5',
    },
    {
      name: 'Total Orders',
      value: summary ? summary.totalOrders : '0',
      icon: ShoppingCart,
      color: 'text-blue-500',
      borderColor: 'border-blue-500/20',
      bgColor: 'bg-blue-500/5',
    },
    {
      name: 'Total Products',
      value: summary ? summary.totalProducts : '0',
      icon: Package,
      color: 'text-purple-500',
      borderColor: 'border-purple-500/20',
      bgColor: 'bg-purple-500/5',
    },
    {
      name: 'Pending Orders',
      value: summary ? summary.pendingOrdersCount : '0',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      borderColor: 'border-yellow-650/20',
      bgColor: 'bg-yellow-600/5',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider">
            Dashboard <span className="text-accent">Overview</span>
          </h1>
          <p className="text-xs text-muted-text uppercase tracking-widest mt-1">
            Real-time analytics and management controls
          </p>
        </div>
        <button
          onClick={handleRefreshAll}
          className="flex items-center gap-2 border border-card-border hover:border-accent/40 bg-card-bg px-4 py-2 rounded text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.name}
              className={`bg-card-bg border ${kpi.borderColor} ${kpi.bgColor} p-6 rounded-lg space-y-4 transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-text font-bold">{kpi.name}</span>
                <Icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              {summaryLoading ? (
                <div className="h-8 bg-card-border/60 animate-pulse rounded w-1/2" />
              ) : (
                <div className="text-2xl sm:text-3xl font-black tracking-tight font-mono">{kpi.value}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart Section */}
        <div className="lg:col-span-2 bg-card-bg border border-card-border rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-card-border/50">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Revenue Timeline</h2>
            </div>
            {/* Timeline Filter */}
            <div className="flex border border-card-border rounded bg-black/40 p-0.5">
              {(['day', 'week', 'month'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRevenueRange(r)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded transition-colors ${
                    revenueRange === r
                      ? 'bg-accent text-black font-extrabold'
                      : 'text-muted-text hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {revenueLoading ? (
            <div className="h-72 bg-card-border/30 animate-pulse rounded flex items-center justify-center text-xs text-muted-text uppercase tracking-widest">
              Generating Chart Data...
            </div>
          ) : !revenueData || revenueData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-xs text-muted-text uppercase tracking-widest bg-black/20 rounded">
              No Revenue Data Recorded
            </div>
          ) : (
            <div className="h-72 w-full font-mono text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#CEA124" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#CEA124" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#888888" tickLine={false} />
                  <YAxis stroke="#888888" tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '4px' }}
                    labelClassName="text-muted-text"
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#CEA124"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Order Fulfillment Breakdown */}
        <div className="bg-card-bg border border-card-border rounded-lg p-6 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider pb-4 border-b border-card-border/50">
            Fulfillment Breakdown
          </h2>

          {statusLoading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-card-border/50 rounded" />
              ))}
            </div>
          ) : !ordersByStatus || ordersByStatus.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-text uppercase tracking-widest">
              No orders recorded
            </div>
          ) : (
            <div className="space-y-3">
              {ordersByStatus.map((statusObj: { status: string; count: number }) => (
                <div
                  key={statusObj.status}
                  className="flex items-center justify-between p-3 rounded bg-black/40 border border-card-border/50"
                >
                  <span className="text-xs font-bold tracking-wider text-muted-text uppercase">
                    {statusObj.status}
                  </span>
                  <span className="bg-accent/10 border border-accent/20 text-accent font-mono text-xs font-bold px-2.5 py-0.5 rounded">
                    {statusObj.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Sellers & Low Stock Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top selling products */}
        <div className="bg-card-bg border border-card-border rounded-lg p-6 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider pb-4 border-b border-card-border/50">
            Top 10 Best Sellers
          </h2>

          {productsLoading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-card-border/50 rounded" />
              ))}
            </div>
          ) : !topProducts || topProducts.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-text uppercase tracking-widest">
              No Sales Data Recorded
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p: any, idx: number) => (
                <div
                  key={p.productId || idx}
                  className="flex items-center justify-between gap-3 p-3 rounded bg-black/30 border border-card-border/40 hover:border-accent/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-muted-text w-5">#{idx + 1}</span>
                    <div className="h-10 w-10 rounded border border-card-border bg-black overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-5 w-5 text-muted-text/30" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{p.name}</h4>
                      <p className="text-[10px] text-muted-text uppercase font-semibold">Price: ${p.price}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-accent font-mono text-xs font-bold block">{p.quantitySold} Sold</span>
                    <span className="text-[9px] text-muted-text uppercase font-semibold">
                      ${(p.quantitySold * p.price).toLocaleString()} Rev
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Warning Box */}
        <div className="bg-card-bg border border-card-border rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-card-border/50">
            <h2 className="text-sm font-bold uppercase tracking-wider text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5" /> Stock Warning Limits
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-text">Threshold: 10</span>
          </div>

          {stockLoading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-card-border/50 rounded" />
              ))}
            </div>
          ) : !lowStock || lowStock.length === 0 ? (
            <div className="text-center py-10 text-xs text-green-500 font-bold uppercase tracking-widest border border-green-500/10 bg-green-500/5 rounded">
              All product stock stable
            </div>
          ) : (
            <div className="space-y-3">
              {lowStock.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded bg-red-650/5 border border-red-500/20 hover:border-red-500/40 transition-colors"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    <span className="text-[10px] text-accent font-bold uppercase tracking-wider">
                      {item.categoryName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="bg-red-600/20 text-red-500 border border-red-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded font-mono">
                      {item.quantity} Remaining
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
