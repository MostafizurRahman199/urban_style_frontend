import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="contact" className="bg-black border-t border-card-border py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4 md:col-span-2">
            <span className="text-xl font-black tracking-widest text-accent font-sans">
              URBAN STYLE
            </span>
            <p className="text-muted-text text-sm max-w-sm leading-relaxed">
              Curated premium streetwear and apparel for the fashion-forward. Blending underground culture with high-end modern design.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-accent font-bold uppercase tracking-wider text-xs mb-4">Store</h4>
            <ul className="space-y-2 text-sm text-muted-text">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  All Collections
                </Link>
              </li>
              <li>
                <Link href="/#products" className="hover:text-white transition-colors">
                  Popular Products
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-white transition-colors">
                  Checkout Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-accent font-bold uppercase tracking-wider text-xs mb-4">Contact Info</h4>
            <ul className="space-y-2 text-sm text-muted-text">
              <li>Dhaka, Bangladesh</li>
              <li>support@urbanstyle.com</li>
              <li>+880 1712-345678</li>
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
