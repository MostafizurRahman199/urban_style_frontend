'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setCredentials } from '@/redux/slices/authSlice';
import { useLoginMutation } from '@/redux/services/api';
import { Lock, Mail, AlertCircle, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If token is already present, redirect to admin dashboard
  useEffect(() => {
    if (token) {
      router.push('/admin');
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      const response = await login({ email, password }).unwrap();
      dispatch(setCredentials({ token: response.accessToken || response.access_token }));
      router.push('/admin');
    } catch (err: any) {
      console.error('Login failed:', err);
      if (err?.data?.message) {
        setErrorMsg(err.data.message);
      } else {
        setErrorMsg('Invalid email or password. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4">
      {/* Brand Header */}
      <div className="mb-8 text-center space-y-2">
        <Link href="/" className="text-3xl font-black tracking-widest text-accent font-sans">
          URBAN STYLE
        </Link>
        <p className="text-xs uppercase tracking-widest text-muted-text">
          Control Panel Authorization
        </p>
      </div>

      <div className="w-full max-w-md bg-card-bg border border-card-border rounded-lg p-8 shadow-2xl">
        <h2 className="text-xl font-bold uppercase tracking-wider mb-6 text-center text-white">
          Sign In
        </h2>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded p-3 mb-4 flex items-center gap-2">
            <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest text-muted-text font-bold flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-accent" /> Email Address
            </label>
            <input
              type="email"
              required
              placeholder="admin@urbanstyle.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest text-muted-text font-bold flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-accent" /> Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-accent text-black font-bold uppercase tracking-wider text-sm hover:bg-accent-hover transition-colors rounded flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Login to Dashboard'
              )}
            </button>
          </div>
        </form>
      </div>

      <Link
        href="/"
        className="mt-6 text-xs text-muted-text hover:text-accent transition-colors flex items-center gap-1 uppercase tracking-wider"
      >
        <ShoppingCart className="h-3.5 w-3.5" /> Return to Storefront
      </Link>
    </div>
  );
}
