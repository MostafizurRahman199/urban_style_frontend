'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { useGetMeQuery } from '@/redux/services/api';
import { logout, setAdminUser } from '@/redux/slices/authSlice';
import { LayoutDashboard, FolderKanban, ShoppingBag, Image, ShoppingCart, LogOut, ExternalLink, ChevronRight, Mail } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  // If on login, skip layout and render children directly
  const isLoginPage = pathname === '/admin/login';

  // Fetch admin user profile if token is present
  const { data: adminUser, error, isError } = useGetMeQuery(undefined, {
    skip: !token || isLoginPage,
  });

  // Save admin user details once fetched
  useEffect(() => {
    if (adminUser) {
      dispatch(setAdminUser(adminUser));
    }
  }, [adminUser, dispatch]);

  // Handle Token invalidation or Session Expiry
  useEffect(() => {
    if (isError) {
      dispatch(logout());
      router.push('/admin/login');
    }
  }, [isError, dispatch, router]);

  // Protect Admin Routes
  useEffect(() => {
    if (!token && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [token, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show a dark loading screen while auth is verifying
  if (!token) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-text text-xs uppercase tracking-widest">Checking Authorization...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Categories', path: '/admin/categories', icon: FolderKanban },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Banners', path: '/admin/banners', icon: Image },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Messages', path: '/admin/messages', icon: Mail },
  ];

  const handleLogout = () => {
    dispatch(logout());
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-sidebar-bg border-r border-card-border flex flex-col flex-shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-card-border flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <span className="text-lg font-black tracking-widest text-accent font-sans">
              URBAN STYLE
            </span>
            <span className="text-[10px] text-muted-text uppercase tracking-widest font-bold">
              Admin Dashboard
            </span>
          </Link>
        </div>

        {/* User Status */}
        {adminUser && (
          <div className="px-6 py-4 border-b border-card-border/60 bg-black/40 flex flex-col space-y-1">
            <span className="text-[10px] uppercase text-muted-text tracking-wider font-bold">Logged In As</span>
            <span className="text-sm font-semibold text-white truncate">{adminUser.email}</span>
          </div>
        )}

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center justify-between px-4 py-3 text-sm font-bold uppercase tracking-wider rounded transition-colors ${
                  isActive
                    ? 'bg-accent text-black'
                    : 'text-muted-text hover:text-white hover:bg-card-bg/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-card-border space-y-2 bg-black/40">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:text-accent transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Visit Storefront</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-400 hover:bg-red-500/5 rounded transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Page Content */}
      <main className="flex-grow overflow-y-auto p-6 sm:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
