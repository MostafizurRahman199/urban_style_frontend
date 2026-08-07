'use client';

import React, { useState } from 'react';
import {
  useGetAllBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} from '@/redux/services/api';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Upload, Eye, EyeOff, ArrowUpDown, AlertCircle } from 'lucide-react';

export default function BannersAdminPage() {
  const { data: banners, isLoading, error } = useGetAllBannersQuery(undefined);
  const [createBanner, { isLoading: createLoading }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: updateLoading }] = useUpdateBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<any>(null);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState('0');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMobileFile, setSelectedMobileFile] = useState<File | null>(null);

  // Status
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setIsActive(true);
    setSortOrder('0');
    setSelectedFile(null);
    setSelectedMobileFile(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showMsg('error', 'A desktop image file is required for new banners.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('isActive', String(isActive));
    formData.append('sortOrder', sortOrder);
    formData.append('image', selectedFile);
    if (selectedMobileFile) {
      formData.append('mobileImage', selectedMobileFile);
    }

    try {
      await createBanner(formData).unwrap();
      showMsg('success', 'Banner created successfully!');
      setIsCreateOpen(false);
      resetForm();
    } catch (err: any) {
      console.error(err);
      showMsg('error', err?.data?.message || 'Failed to create banner.');
    }
  };

  const openEdit = (banner: any) => {
    setSelectedBanner(banner);
    setTitle(banner.title || '');
    setDescription(banner.description || '');
    setIsActive(banner.isActive);
    setSortOrder(String(banner.sortOrder));
    setSelectedFile(null);
    setSelectedMobileFile(null);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBanner) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('isActive', String(isActive));
    formData.append('sortOrder', sortOrder);
    if (selectedFile) {
      formData.append('image', selectedFile);
    }
    if (selectedMobileFile) {
      formData.append('mobileImage', selectedMobileFile);
    }

    try {
      await updateBanner({ id: selectedBanner.id, formData }).unwrap();
      showMsg('success', 'Banner updated successfully!');
      setIsEditOpen(false);
      resetForm();
    } catch (err: any) {
      console.error(err);
      showMsg('error', err?.data?.message || 'Failed to update banner.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this banner?')) return;

    try {
      await deleteBanner(id).unwrap();
      showMsg('success', 'Banner deleted successfully!');
    } catch (err: any) {
      console.error(err);
      showMsg('error', err?.data?.message || 'Failed to delete banner.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider">
            Banners <span className="text-accent">Manager</span>
          </h1>
          <p className="text-xs text-muted-text uppercase tracking-widest mt-1">
            Configure desktop & mobile hero slides for storefront home page
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-black font-extrabold uppercase tracking-wider text-xs hover:bg-accent-hover transition-colors rounded cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Slide Banner
        </button>
      </div>

      {/* Notifications */}
      {msg && (
        <div
          className={`border text-sm rounded p-4 flex items-center gap-2 animate-fade-in ${
            msg.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-500'
              : 'bg-red-500/10 border-red-500/30 text-red-500'
          }`}
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-semibold">{msg.text}</span>
        </div>
      )}

      {/* Banners list */}
      <div className="bg-card-bg border border-card-border rounded-lg p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b border-card-border pb-3">
          <ImageIcon className="h-4.5 w-4.5 text-accent" /> Active Carousel Slides
        </h2>

        {isLoading ? (
          <div className="space-y-4 py-8">
            <div className="h-14 bg-card-border animate-pulse rounded" />
            <div className="h-14 bg-card-border animate-pulse rounded" />
          </div>
        ) : error ? (
          <div className="text-center py-6 text-muted-text text-sm">Failed to load banners.</div>
        ) : !banners || banners.length === 0 ? (
          <div className="text-center py-12 text-muted-text text-sm flex flex-col items-center justify-center gap-4">
            <ImageIcon className="h-10 w-10 text-muted-text/30" />
            <span>No banners added yet. Add one to show on your landing page carousel.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((banner: any) => (
              <div
                key={banner.id}
                className="bg-black border border-card-border rounded overflow-hidden flex flex-col hover:border-accent/30 transition-colors"
              >
                {/* Image display */}
                <div className="grid grid-cols-1 sm:grid-cols-2 bg-card-bg border-b border-card-border divide-y sm:divide-y-0 sm:divide-x divide-card-border">
                  {/* Desktop Preview */}
                  <div className="relative aspect-[16/9] overflow-hidden flex flex-col items-center justify-center bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={banner.imageUrl} alt={banner.title || 'Desktop Banner'} className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase text-accent border border-accent/30">
                      Desktop Banner
                    </span>
                  </div>

                  {/* Mobile Preview */}
                  <div className="relative aspect-[16/9] overflow-hidden flex items-center justify-center bg-black/60">
                    {banner.mobileImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={banner.mobileImageUrl} alt={banner.title || 'Mobile Banner'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center px-4">
                        <span className="text-[10px] text-muted-text uppercase font-bold block">No Mobile Image</span>
                        <span className="text-[8px] text-accent/70 uppercase block mt-0.5">(Uses Desktop Image)</span>
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase text-white/80 border border-card-border">
                      Mobile Banner
                    </span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="px-4 py-2 bg-card-bg/60 border-b border-card-border/40 flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border flex items-center gap-1 ${
                      banner.isActive
                        ? 'bg-green-600/10 border-green-500/20 text-green-500'
                        : 'bg-red-500/10 border-red-500/25 text-red-500'
                    }`}
                  >
                    {banner.isActive ? (
                      <>
                        <Eye className="h-3 w-3" /> Visible
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" /> Hidden
                      </>
                    )}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border bg-accent/10 border-accent/20 text-accent flex items-center gap-1">
                    <ArrowUpDown className="h-3 w-3" /> Sort: {banner.sortOrder}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide line-clamp-1">
                      {banner.title || 'Untitled Slide'}
                    </h3>
                    <p className="text-xs text-muted-text line-clamp-2 leading-relaxed">
                      {banner.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-card-border/50">
                    <span className="text-[10px] text-muted-text uppercase font-bold">
                      Created: {new Date(banner.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(banner)}
                        className="p-1.5 border border-card-border rounded hover:border-accent/40 text-muted-text hover:text-accent transition-colors"
                        title="Edit Banner"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="p-1.5 border border-card-border rounded hover:border-red-500/40 text-muted-text hover:text-red-500 transition-colors"
                        title="Delete Banner"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE SLIDE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs" onClick={() => setIsCreateOpen(false)} />
          <div className="relative w-full max-w-lg bg-card-bg border border-card-border rounded-lg shadow-2xl overflow-hidden text-white animate-fade-in max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-card-border flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-accent">Create Carousel Banner</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-muted-text hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted-text font-bold">Banner Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Clearance Sale"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted-text font-bold">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Flat 50% discount on all apparel"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-muted-text font-bold">Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-text font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="accent-accent h-4 w-4"
                    />
                    Visible on Site
                  </label>
                </div>
              </div>

              <div className="space-y-2 border-t border-card-border/60 pt-4">
                <label className="text-xs uppercase tracking-widest text-muted-text font-bold flex items-center gap-1.5">
                  <Upload className="h-4 w-4 text-accent" /> Desktop Banner Image (Required) *
                </label>
                <input
                  type="file"
                  required
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-muted-text file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:uppercase file:bg-accent file:text-black file:cursor-pointer"
                />
              </div>

              <div className="space-y-2 border-t border-card-border/60 pt-4">
                <label className="text-xs uppercase tracking-widest text-muted-text font-bold flex items-center gap-1.5">
                  <Upload className="h-4 w-4 text-accent" /> Mobile Banner Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedMobileFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-muted-text file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:uppercase file:bg-card-border file:text-white file:cursor-pointer"
                />
                <p className="text-[9px] text-muted-text uppercase font-semibold">
                  If left empty, desktop image will be shown on mobile screens.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full py-3 bg-accent text-black font-extrabold uppercase tracking-wider text-sm hover:bg-accent-hover transition-colors rounded disabled:opacity-40"
                >
                  {createLoading ? 'Uploading Banner...' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SLIDE MODAL */}
      {isEditOpen && selectedBanner && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs" onClick={() => setIsEditOpen(false)} />
          <div className="relative w-full max-w-lg bg-card-bg border border-card-border rounded-lg shadow-2xl overflow-hidden text-white animate-fade-in max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-card-border flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-accent">Edit Carousel Banner</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-muted-text hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted-text font-bold">Banner Title (Optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted-text font-bold">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-muted-text font-bold">Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-text font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="accent-accent h-4 w-4"
                    />
                    Visible on Site
                  </label>
                </div>
              </div>

              <div className="space-y-2 border-t border-card-border/60 pt-4">
                <label className="text-xs uppercase tracking-widest text-muted-text font-bold flex items-center gap-1.5">
                  <Upload className="h-4 w-4 text-accent" /> Replace Desktop Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-muted-text file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:uppercase file:bg-accent file:text-black file:cursor-pointer"
                />
                <p className="text-[9px] text-muted-text uppercase font-semibold">
                  Leave empty to keep existing desktop banner image.
                </p>
              </div>

              <div className="space-y-2 border-t border-card-border/60 pt-4">
                <label className="text-xs uppercase tracking-widest text-muted-text font-bold flex items-center gap-1.5">
                  <Upload className="h-4 w-4 text-accent" /> Replace Mobile Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedMobileFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-muted-text file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:uppercase file:bg-card-border file:text-white file:cursor-pointer"
                />
                <p className="text-[9px] text-muted-text uppercase font-semibold">
                  Leave empty to keep existing mobile banner image.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="w-full py-3 bg-accent text-black font-extrabold uppercase tracking-wider text-sm hover:bg-accent-hover transition-colors rounded disabled:opacity-40"
                >
                  {updateLoading ? 'Uploading & Updating...' : 'Update Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
