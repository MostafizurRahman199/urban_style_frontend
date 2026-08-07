'use client';

import React, { useState } from 'react';
import { X, Send, CheckCircle } from 'lucide-react';
import { useCreateMessageMutation } from '@/redux/services/api';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [createMessage, { isLoading, error }] = useCreateMessageMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMessage({
        name,
        email: email.trim() ? email.trim() : undefined,
        contactNumber,
        message,
      }).unwrap();
      setSubmitted(true);
      setName('');
      setEmail('');
      setContactNumber('');
      setMessage('');
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2500);
    } catch (err) {
      console.error('Failed to submit message:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-card-bg border border-accent/30 rounded-lg p-6 sm:p-8 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-text hover:text-accent transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-accent/10 border border-accent flex items-center justify-center text-accent animate-bounce">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-widest text-white">Message Sent!</h3>
            <p className="text-muted-text text-sm max-w-xs">
              Thank you for reaching out. We will get back to you as soon as possible.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-white">
                Contact <span className="text-accent">Us</span>
              </h2>
              <p className="text-muted-text text-xs uppercase tracking-widest mt-1">
                Drop us a line and we will get back to you shortly
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 text-red-500 rounded text-xs">
                Failed to submit message. Please try again.
              </div>
            )}

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-muted-text font-bold">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors placeholder:text-muted-text/30"
                />
              </div>

              {/* Contact Number */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-muted-text font-bold">Contact Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +880 1712-345678"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors placeholder:text-muted-text/30"
                />
              </div>

              {/* Email (Optional) */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-muted-text font-bold">Your Email (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors placeholder:text-muted-text/30"
                />
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-muted-text font-bold">Your Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us what you need..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors resize-none placeholder:text-muted-text/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-accent hover:bg-accent-hover disabled:bg-accent/40 text-black font-extrabold uppercase tracking-widest rounded text-xs transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="animate-pulse">Submitting...</span>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
