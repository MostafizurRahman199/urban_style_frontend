'use client';

import React from 'react';
import { useGetMessagesQuery, useDeleteMessageMutation } from '@/redux/services/api';
import { Trash2, Mail, MailOpen, Clock, User, Phone } from 'lucide-react';

export default function AdminMessagesPage() {
  const { data: messages, isLoading, error, refetch } = useGetMessagesQuery(undefined);
  const [deleteMessage, { isLoading: deleteLoading }] = useDeleteMessageMutation();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(id).unwrap();
      } catch (err) {
        console.error('Failed to delete message:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-card-border pb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white">
            User <span className="text-accent">Messages</span>
          </h1>
          <p className="text-muted-text text-xs uppercase tracking-widest mt-1">
            Review and manage inquiries from the contact form
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="text-xs uppercase font-extrabold tracking-widest text-accent hover:text-white transition-colors"
        >
          Refresh Feed
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-28 bg-card-bg border border-card-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-red-900/20 border border-red-500/30 text-red-500 rounded text-sm text-center">
          Failed to load messages. Please ensure you are logged in as admin.
        </div>
      ) : !messages || messages.length === 0 ? (
        <div className="text-center py-16 bg-card-bg border border-card-border rounded-lg flex flex-col items-center justify-center space-y-4">
          <MailOpen className="h-12 w-12 text-muted-text/30" />
          <p className="text-muted-text font-medium uppercase tracking-widest text-xs">No Messages Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {messages.map((msg: any) => (
            <div
              key={msg.id}
              className="bg-card-bg border border-card-border hover:border-accent/30 p-6 rounded-lg transition-all duration-300 flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-3 flex-1">
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-text">
                  <span className="flex items-center gap-1 font-bold text-white uppercase tracking-wider">
                    <User className="h-3.5 w-3.5 text-accent" /> {msg.name}
                  </span>
                  <span className="flex items-center gap-1 font-mono font-semibold text-white/80">
                    <Phone className="h-3.5 w-3.5 text-accent" /> {msg.contactNumber}
                  </span>
                  {msg.email && (
                    <span className="flex items-center gap-1 font-mono">
                      <Mail className="h-3.5 w-3.5 text-accent" /> {msg.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-accent" /> {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Message body */}
                <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.message}
                </p>
              </div>

              {/* Action */}
              <div className="flex items-center justify-end md:self-center">
                <button
                  onClick={() => handleDelete(msg.id)}
                  disabled={deleteLoading}
                  className="p-2.5 bg-red-600/10 text-red-500 rounded border border-red-500/20 hover:bg-red-600 hover:text-black transition-colors"
                  title="Delete message"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
