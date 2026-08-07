'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Mail, Phone } from 'lucide-react';

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function Footer() {
  const handleOpenContact = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-contact'));
    }
  };

  return (
    <footer id="contact" className="bg-black border-t border-card-border py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Logo & Brand Description */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/urban_logo.png" 
                alt="Urban Style Logo" 
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-muted-text text-sm leading-relaxed">
              Premium men's fashion accessories at affordable prices. Fast delivery across Bangladesh. Shop with confidence.
            </p>
          </div>

          {/* Column 2: Quick Links (Taken from Navbar) */}
          <div>
            <h4 className="text-accent font-bold uppercase tracking-wider text-xs mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-text font-medium">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/all-products" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-white transition-colors">
                  Checkout
                </Link>
              </li>
              <li>
                <button
                  onClick={handleOpenContact}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Social Media Links (Round icon buttons) */}
          <div className="space-y-4">
            <h4 className="text-accent font-bold uppercase tracking-wider text-xs mb-4">
              Follow Us
            </h4>
            <p className="text-muted-text text-xs leading-relaxed">
              Connect with us on social media for exclusive drops and updates.
            </p>
            <div className="flex items-center space-x-3">
              <a
                href="https://www.facebook.com/profile.php?id=61592732604172"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-card-bg border border-card-border rounded-full text-white hover:text-accent hover:border-accent hover:scale-105 transition-all duration-200 flex items-center justify-center shadow-xs"
                aria-label="Facebook"
                title="Follow us on Facebook"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/urbanstyle_172/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-card-bg border border-card-border rounded-full text-white hover:text-accent hover:border-accent hover:scale-105 transition-all duration-200 flex items-center justify-center shadow-xs"
                aria-label="Instagram"
                title="Follow us on Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 4: Contact Details & Address */}
          <div className="space-y-3">
            <h4 className="text-accent font-bold uppercase tracking-wider text-xs mb-4">
              Get In Touch
            </h4>
            <ul className="space-y-3 text-sm text-muted-text">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed text-xs sm:text-sm">
                  House: 532, Road: 11, Block: G, Bashundhara R/A, Dhaka-1229, 1229
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-accent flex-shrink-0" />
                <a href="mailto:urbanstyle172@gmail.com" className="hover:text-white transition-colors text-xs sm:text-sm">
                  urbanstyle172@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-accent flex-shrink-0" />
                <a href="tel:01571232758" className="hover:text-white transition-colors font-mono text-xs sm:text-sm">
                  01571232758
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-card-border/50 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-text">
          <p>&copy; {new Date().getFullYear()} Urban Style. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link href="/admin/login" className="hover:text-white transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
