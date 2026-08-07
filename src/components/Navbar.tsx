'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/slices/authSlice';
import { ShoppingCart, User, LogOut, Menu, X, Settings } from 'lucide-react';
import CartDrawer from './CartDrawer';
import ContactModal from './ContactModal';

export default function Navbar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const token = useSelector((state: RootState) => state.auth.token);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Total cart items count
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll shadow/opacity effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    const handleOpenCart = () => setCartOpen(true);
    const handleOpenContact = () => setContactOpen(true);
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('open-cart', handleOpenCart);
    window.addEventListener('open-contact', handleOpenContact);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('open-cart', handleOpenCart);
      window.removeEventListener('open-contact', handleOpenContact);
    };
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
            <img 
              src="/urban_logo.png" 
              alt="Urban Style Logo" 
              className="h-8 sm:h-10 w-auto object-contain"
            />
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
                href="/all-products"
                className={`transition-colors hover:text-accent ${
                  pathname === '/all-products' ? 'text-accent' : 'text-white'
                }`}
              >
                All Products
              </Link>
              <Link
                href="/checkout"
                className={`transition-colors hover:text-accent ${
                  pathname === '/checkout' ? 'text-accent' : 'text-white'
                }`}
              >
                Checkout
              </Link>
              <button
                onClick={() => setContactOpen(true)}
                className="transition-colors hover:text-accent text-white text-sm font-semibold tracking-wider uppercase text-left"
              >
                Contact
              </button>
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
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-black font-mono ring-2 ring-black">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Admin Dashboard / Login */}
            {mounted && token && (
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
                href="/all-products"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-3 rounded-md hover:bg-card-bg ${
                  pathname === '/all-products' ? 'text-accent' : 'text-white'
                }`}
              >
                All Products
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
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setContactOpen(true);
                }}
                className="block w-full px-3 py-3 rounded-md hover:bg-card-bg text-white text-center font-semibold tracking-widest uppercase text-sm"
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Contact Modal */}
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
