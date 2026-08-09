'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/slices/authSlice';
import { useGetCategoriesQuery } from '@/redux/services/api';
import {
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Settings,
  ChevronDown,
  ChevronRight,
  Layers,
} from 'lucide-react';
import CartDrawer from './CartDrawer';
import ContactModal from './ContactModal';
import { Drawer } from '@/components/ui/drawer';

export default function Navbar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const token = useSelector((state: RootState) => state.auth.token);
  
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopCategoryOpen, setDesktopCategoryOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch categories dynamically
  const { data: categories } = useGetCategoriesQuery(undefined);

  // Total cart items count
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile drawer & desktop dropdown on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDesktopCategoryOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Click outside listener for desktop dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDesktopCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
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

              {/* Product Category Dropdown (Desktop) */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDesktopCategoryOpen((prev) => !prev)}
                  className={`flex items-center gap-1.5 transition-colors uppercase text-sm font-semibold tracking-wider ${
                    pathname === '/all-products' || desktopCategoryOpen
                      ? 'text-accent'
                      : 'text-white hover:text-accent'
                  }`}
                  aria-expanded={desktopCategoryOpen}
                >
                  <span>Product Category</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      desktopCategoryOpen ? 'rotate-180 text-accent' : 'text-muted-text'
                    }`}
                  />
                </button>

                {desktopCategoryOpen && (
                  <div className="absolute top-full left-0 mt-3 w-64 bg-black/95 border border-card-border backdrop-blur-md rounded-lg shadow-2xl py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-card-border/50 text-[11px] font-bold text-accent tracking-wider uppercase flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5" />
                        Categories
                      </span>
                      <span className="text-[10px] text-muted-text">
                        ({categories?.length || 0})
                      </span>
                    </div>

                    {/* Scrollable category dropdown container */}
                    <div className="max-h-64 overflow-y-auto custom-scrollbar py-1">
                      <Link
                        href="/all-products"
                        onClick={() => setDesktopCategoryOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-xs uppercase font-bold text-white hover:bg-card-bg hover:text-accent transition-colors border-b border-card-border/30"
                      >
                        <span>All Products</span>
                        <ChevronRight className="h-3.5 w-3.5 text-accent" />
                      </Link>

                      {categories && categories.length > 0 ? (
                        categories.map((cat: { id: string; name: string }) => (
                          <Link
                            key={cat.id}
                            href={`/all-products?category=${cat.id}`}
                            onClick={() => setDesktopCategoryOpen(false)}
                            className="flex items-center justify-between px-4 py-2.5 text-xs uppercase font-medium text-gray-300 hover:bg-card-bg hover:text-accent transition-colors group"
                          >
                            <span className="truncate">{cat.name}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-text/50 group-hover:text-accent transition-colors" />
                          </Link>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-xs text-muted-text italic">
                          No categories found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

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
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Side Bar Drawer (Portal rendered for smooth opening regardless of scroll position) */}
      {!isAdminSection && (
        <Drawer
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          direction="left"
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-card-border bg-black/90">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/urban_logo.png"
                alt="Urban Style Logo"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-muted-text hover:text-white transition-colors rounded-lg border border-card-border bg-card-bg"
              aria-label="Close Navigation Drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Body - Main Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 text-sm font-semibold uppercase tracking-wider">
            {/* Primary Navigation Links */}
            <div className="space-y-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-lg transition-colors ${
                  pathname === '/'
                    ? 'bg-accent/15 text-accent border border-accent/30 font-bold'
                    : 'text-white hover:bg-card-bg'
                }`}
              >
                Home
              </Link>

              <Link
                href="/all-products"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-lg transition-colors ${
                  pathname === '/all-products'
                    ? 'bg-accent/15 text-accent border border-accent/30 font-bold'
                    : 'text-white hover:bg-card-bg'
                }`}
              >
                All Products
              </Link>
            </div>

            {/* Product Categories Collapsible Accordion with Scroll */}
            <div className="pt-2 border-t border-card-border/60">
              <button
                onClick={() => setMobileCategoriesOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-accent bg-accent/10 border border-accent/20 font-bold text-xs tracking-widest uppercase hover:bg-accent/20 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Product Category
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    mobileCategoriesOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Scrollable Submenu for Categories */}
              {mobileCategoriesOpen && (
                <div className="mt-2 ml-2 pl-2 border-l border-accent/20 space-y-1 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                  <Link
                    href="/all-products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-xs font-bold text-white hover:text-accent hover:bg-card-bg rounded transition-colors"
                  >
                    <span>All Categories</span>
                    <ChevronRight className="h-3 w-3 text-accent" />
                  </Link>

                  {categories && categories.length > 0 ? (
                    categories.map((cat: { id: string; name: string }) => (
                      <Link
                        key={cat.id}
                        href={`/all-products?category=${cat.id}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2 text-xs text-muted-text hover:text-accent hover:bg-card-bg rounded transition-colors font-medium"
                      >
                        <span className="truncate">{cat.name}</span>
                        <ChevronRight className="h-3 w-3 opacity-50" />
                      </Link>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-muted-text italic">
                      No categories found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Secondary Navigation Links */}
            <div className="pt-2 border-t border-card-border/60 space-y-1">
              <Link
                href="/checkout"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-lg transition-colors ${
                  pathname === '/checkout'
                    ? 'bg-accent/15 text-accent border border-accent/30 font-bold'
                    : 'text-white hover:bg-card-bg'
                }`}
              >
                Checkout
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setContactOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-white hover:bg-card-bg transition-colors text-left uppercase font-semibold tracking-wider text-sm"
              >
                Contact
              </button>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-card-border bg-card-bg/60 text-center">
            <p className="text-[10px] text-muted-text tracking-widest uppercase">
              Urban Style &copy; {new Date().getFullYear()}
            </p>
          </div>
        </Drawer>
      )}

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Contact Modal */}
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
