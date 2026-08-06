'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/slices/authSlice';
import { ShoppingCart, User, LogOut, Menu, X, Settings } from 'lucide-react';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const token = useSelector((state: RootState) => state.auth.token);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Total cart items count
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Handle scroll shadow/opacity effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
  };

  // Check if we are in admin section
  const isAdminSection = pathname?.startsWith('/admin');

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-black/90 border-b border-card-border backdrop-blur-md py-4'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1">
            <span className="text-xl sm:text-2xl font-black tracking-widest text-accent font-sans">
              URBAN STYLE
            </span>
          </Link>

          {/* Desktop Nav Items */}
          {!isAdminSection ? (
            <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-wider uppercase">
              <Link
                href="/"
                className={`transition-colors hover:text-accent ${
                  pathname === '/' ? 'text-accent' : 'text-white'
                }`}
              >
                Home
              </Link>
              <Link
                href="/#products"
                className="transition-colors hover:text-accent text-white"
              >
                Collection
              </Link>
              <Link
                href="/checkout"
                className={`transition-colors hover:text-accent ${
                  pathname === '/checkout' ? 'text-accent' : 'text-white'
                }`}
              >
                Checkout
              </Link>
            </nav>
          ) : (
            <div className="hidden md:flex items-center text-xs font-semibold uppercase tracking-wider text-accent border border-accent/20 px-3 py-1 rounded bg-accent/5">
              Admin Portal
            </div>
          )}

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon (Only outside admin) */}
            {!isAdminSection && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-white hover:text-accent transition-colors"
                aria-label="Open Cart"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-black font-mono ring-2 ring-black">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Admin Dashboard / Login */}
            {token ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/admin"
                  className="p-2 text-white hover:text-accent transition-colors flex items-center gap-1.5 text-sm font-medium"
                  title="Admin Dashboard"
                >
                  <Settings className="h-5 w-5" />
                  <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-500 hover:text-red-400 transition-colors flex items-center gap-1 text-sm font-medium"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="p-2 text-white hover:text-accent transition-colors flex items-center gap-1.5 text-sm font-medium"
                title="Admin Login"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">Admin</span>
              </Link>
            )}

            {/* Mobile menu button */}
            {!isAdminSection && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-white hover:text-accent md:hidden transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state. */}
        {mobileMenuOpen && !isAdminSection && (
          <div className="md:hidden border-b border-card-border bg-black/95 backdrop-blur-md animate-fade-in">
            <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3 text-center flex flex-col font-semibold tracking-widest uppercase text-sm">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-3 rounded-md hover:bg-card-bg ${
                  pathname === '/' ? 'text-accent' : 'text-white'
                }`}
              >
                Home
              </Link>
              <Link
                href="/#products"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-3 rounded-md hover:bg-card-bg text-white"
              >
                Collection
              </Link>
              <Link
                href="/checkout"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-3 rounded-md hover:bg-card-bg ${
                  pathname === '/checkout' ? 'text-accent' : 'text-white'
                }`}
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
