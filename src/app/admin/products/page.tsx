'use client';

import React, { useState } from 'react';
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useAddProductImagesMutation,
  useDeleteProductImageMutation,
} from '@/redux/services/api';
import { Plus, Edit2, Trash2, X, Check, ShoppingBag, Eye, Star, Upload, Trash, Image as ImageIcon, AlertCircle } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL (2XL)', 'XXXL (3XL)', '4XL', '5XL'];

export default function ProductsAdminPage() {
  // Query Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [page, setPage] = useState(1);
  const limit = 6;

  // API Hooks
  const { data: categories } = useGetCategoriesQuery(undefined);
  const { data: productsData, isLoading, refetch } = useGetProductsQuery({
    page,
    limit,
    ...(selectedCat && { categoryId: selectedCat }),
    ...(searchQuery && { search: searchQuery }),
  });

  const [createProduct, { isLoading: createLoading }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updateLoading }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [addProductImages, { isLoading: uploadLoading }] = useAddProductImagesMutation();
  const [deleteProductImage] = useDeleteProductImageMutation();

  // Modal / Form States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Forms State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [colorsInput, setColorsInput] = useState('');
  const [selectedSizesMap, setSelectedSizesMap] = useState<{
    [key: string]: { enabled: boolean; customDetail: string };
  }>({});
  const [videoUrl, setVideoUrl] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  // Additional Image Upload & Color Mappings
  const [appendFiles, setAppendFiles] = useState<FileList | null>(null);
  const [appendColor, setAppendColor] = useState('');
  const [colorImageRows, setColorImageRows] = useState<{ color: string; files: FileList | null }[]>([]);

  // Error/Success
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const populateSizesMap = (sizesArray: string[] = []) => {
    const map: { [key: string]: { enabled: boolean; customDetail: string } } = {};
    STANDARD_SIZES.forEach((sz) => {
      map[sz] = { enabled: false, customDetail: '' };
    });

    sizesArray.forEach((szStr) => {
      if (!szStr) return;
      const match = szStr.match(/^([^(]+)(?:\(([^)]+)\))?$/);
      if (match) {
        const key = match[1].trim();
        const detail = match[2] ? match[2].trim() : '';
        map[key] = { enabled: true, customDetail: detail };
      } else {
        map[szStr] = { enabled: true, customDetail: '' };
      }
    });

    setSelectedSizesMap(map);
  };

  const buildSizesArray = () => {
    const result: string[] = [];
    STANDARD_SIZES.forEach((szKey) => {
      const entry = selectedSizesMap[szKey];
      if (entry && entry.enabled) {
        const detail = entry.customDetail.trim();
        if (detail) {
          result.push(`${szKey} (${detail})`);
        } else {
          result.push(szKey);
        }
      }
    });
    Object.keys(selectedSizesMap).forEach((key) => {
      if (!STANDARD_SIZES.includes(key)) {
        const entry = selectedSizesMap[key];
        if (entry && entry.enabled) {
          const detail = entry.customDetail.trim();
          result.push(detail ? `${key} (${detail})` : key);
        }
      }
    });
    return result;
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setDiscountPrice('');
    setQuantity('');
    setCategoryId('');
    setColorsInput('');
    populateSizesMap([]);
    setVideoUrl('');
    setIsPopular(false);
    setIsActive(true);
    setSelectedFiles(null);
    setColorImageRows([]);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price || !quantity || !categoryId) {
      showMsg('error', 'Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    if (discountPrice.trim()) formData.append('discountPrice', discountPrice.trim());
    formData.append('quantity', quantity);
    formData.append('categoryId', categoryId);
    if (videoUrl.trim()) formData.append('videoUrl', videoUrl.trim());
    formData.append('isPopular', String(isPopular));
    formData.append('isActive', String(isActive));

    // Handle colors array
    const colorsArray = colorsInput
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c !== '');

    // Incorporate any colors defined in color-specific image rows
    colorImageRows.forEach((row) => {
      const trimmedColor = row.color.trim();
      if (trimmedColor && !colorsArray.includes(trimmedColor)) {
        colorsArray.push(trimmedColor);
      }
    });

    colorsArray.forEach((c) => formData.append('colors[]', c));

    // Handle sizes array
    const sizesArray = buildSizesArray();
    sizesArray.forEach((s) => formData.append('sizes[]', s));

    // Handle general image files
    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('images', selectedFiles[i]);
        formData.append('imageColors', ''); // No color mapping for general images
      }
    }

    // Handle color-specific image files
    colorImageRows.forEach((row) => {
      if (row.files && row.color.trim()) {
        for (let i = 0; i < row.files.length; i++) {
          formData.append('images', row.files[i]);
          formData.append('imageColors', row.color.trim());
        }
      }
    });

    try {
      await createProduct(formData).unwrap();
      showMsg('success', 'Product created successfully!');
      setIsCreateOpen(false);
      resetForm();
    } catch (err: any) {
      console.error(err);
      showMsg('error', err?.data?.message || 'Failed to create product.');
    }
  };

  const openEdit = (product: any) => {
    setSelectedProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(String(product.price));
    setDiscountPrice(product.discountPrice ? String(product.discountPrice) : '');
    setQuantity(String(product.quantity));
    setCategoryId(product.categoryId);
    setColorsInput(product.colors?.join(', ') || '');
    populateSizesMap(product.sizes || []);
    setVideoUrl(product.videoUrl || '');
    setIsPopular(product.isPopular);
    setIsActive(product.isActive);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const colorsArray = colorsInput
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c !== '');

    const sizesArray = buildSizesArray();

    const payload = {
      id: selectedProduct.id,
      name,
      description,
      price: parseFloat(price),
      ...(discountPrice.trim() ? { discountPrice: parseFloat(discountPrice) } : { discountPrice: null }),
      quantity: parseInt(quantity, 10),
      categoryId,
      isPopular,
      isActive,
      colors: colorsArray,
      sizes: sizesArray,
      ...(videoUrl.trim() && { videoUrl: videoUrl.trim() }),
    };

    try {
      await updateProduct(payload).unwrap();
      showMsg('success', 'Product details updated!');
      setIsEditOpen(false);
    } catch (err: any) {
      console.error(err);
      showMsg('error', err?.data?.message || 'Failed to update product details.');
    }
  };

  const handleAppendImages = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !appendFiles || appendFiles.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < appendFiles.length; i++) {
      formData.append('images', appendFiles[i]);
      formData.append('imageColors', appendColor.trim());
    }

    try {
      // If a color is specified and not present in the product's colors, add it automatically
      if (appendColor.trim()) {
        const trimmedColor = appendColor.trim();
        const currentColors = selectedProduct.colors || [];
        if (!currentColors.includes(trimmedColor)) {
          const updatedColors = [...currentColors, trimmedColor];
          await updateProduct({ id: selectedProduct.id, colors: updatedColors }).unwrap();
          setColorsInput(updatedColors.join(', '));
        }
      }

      await addProductImages({ id: selectedProduct.id, formData }).unwrap();
      showMsg('success', 'Images added successfully!');
      setAppendFiles(null);
      setAppendColor('');
      // Update selected product state to show new images in Edit view
      refetch().then((res) => {
        const updated = res.data?.data?.find((p: any) => p.id === selectedProduct.id);
        if (updated) setSelectedProduct(updated);
      });
    } catch (err: any) {
      console.error(err);
      showMsg('error', err?.data?.message || 'Failed to upload images.');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!selectedProduct) return;
    if (!window.confirm('Delete this image from the product?')) return;

    try {
      await deleteProductImage({ productId: selectedProduct.id, imageId }).unwrap();
      showMsg('success', 'Image deleted.');
      refetch().then((res) => {
        const updated = res.data?.data?.find((p: any) => p.id === selectedProduct.id);
        if (updated) setSelectedProduct(updated);
      });
    } catch (err: any) {
      console.error(err);
      showMsg('error', err?.data?.message || 'Failed to delete image.');
    }
  };

  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${prodName}"?`)) return;

    try {
      await deleteProduct(id).unwrap();
      showMsg('success', 'Product deleted.');
    } catch (err: any) {
      console.error(err);
      showMsg('error', err?.data?.message || 'Failed to delete product.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider">
            Products <span className="text-accent">Manager</span>
          </h1>
          <p className="text-xs text-muted-text uppercase tracking-widest mt-1">
            Manage your inventory list, colors, and Cloudinary uploads
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-black font-extrabold uppercase tracking-wider text-xs hover:bg-accent-hover transition-colors rounded cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Product
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

      {/* Filters & Search Row */}
      <div className="flex flex-col sm:flex-row gap-4 bg-card-bg border border-card-border p-4 rounded-lg">
        <input
          type="text"
          placeholder="Search by name or description..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          className="flex-grow bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2 rounded text-xs outline-none transition-colors"
        />

        <select
          value={selectedCat}
          onChange={(e) => {
            setSelectedCat(e.target.value);
            setPage(1);
          }}
          className="bg-input-bg border border-input-border focus:border-accent text-muted-text px-4 py-2 rounded text-xs outline-none transition-colors"
        >
          <option value="">All Categories</option>
          {categories?.map((cat: any) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table List */}
      <div className="bg-card-bg border border-card-border rounded-lg p-6">
        {isLoading ? (
          <div className="space-y-4 py-10">
            <div className="h-10 bg-card-border animate-pulse rounded" />
            <div className="h-10 bg-card-border animate-pulse rounded" />
            <div className="h-10 bg-card-border animate-pulse rounded" />
          </div>
        ) : !productsData?.data || productsData.data.length === 0 ? (
          <div className="text-center py-20 text-muted-text text-sm flex flex-col items-center justify-center gap-4">
            <ShoppingBag className="h-10 w-10 text-muted-text/30" />
            <span>No products in database matching criteria.</span>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-card-border text-muted-text uppercase tracking-widest font-bold">
                    <th className="pb-3 w-16">Image</th>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Stock</th>
                    <th className="pb-3 text-center">Popular</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border/40">
                  {productsData.data.map((prod: any) => {
                    const firstImage = prod.images?.[0]?.url;
                    return (
                      <tr key={prod.id} className="hover:bg-black/20 transition-colors">
                        {/* Thumbnail */}
                        <td className="py-4">
                          <div className="h-10 w-10 border border-card-border rounded overflow-hidden bg-black flex items-center justify-center flex-shrink-0">
                            {firstImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={firstImage} alt={prod.name} className="h-full w-full object-cover" />
                            ) : (
                              <ShoppingBag className="h-5 w-5 text-muted-text/30" />
                            )}
                          </div>
                        </td>

                        {/* Name */}
                        <td className="py-4 font-bold text-white max-w-xs truncate pr-4">
                          {prod.name}
                        </td>

                        {/* Category */}
                        <td className="py-4 text-accent font-bold uppercase">
                          {prod.category?.name || 'N/A'}
                        </td>

                        {/* Price */}
                        <td className="py-4 font-mono font-bold">
                          {prod.discountPrice && Number(prod.discountPrice) > 0 && Number(prod.discountPrice) < Number(prod.price) ? (
                            <div className="flex flex-col">
                              <span className="text-accent">৳{Number(prod.discountPrice).toFixed(2)}</span>
                              <span className="text-[10px] text-muted-text line-through decoration-red-500">
                                ৳{Number(prod.price).toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span>৳{Number(prod.price).toFixed(2)}</span>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="py-4 font-mono">
                          <span
                            className={
                              prod.quantity <= 0
                                ? 'text-red-500 font-extrabold'
                                : prod.quantity <= 5
                                ? 'text-yellow-600 font-bold'
                                : 'text-white'
                            }
                          >
                            {prod.quantity}
                          </span>
                        </td>

                        {/* Popular */}
                        <td className="py-4 text-center">
                          {prod.isPopular ? (
                            <span className="inline-flex p-1 bg-accent/10 border border-accent/20 rounded text-accent">
                              <Star className="h-3 w-3 fill-accent" />
                            </span>
                          ) : (
                            <span className="text-muted-text text-[10px] uppercase font-bold">-</span>
                          )}
                        </td>

                        {/* Active Status */}
                        <td className="py-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                              prod.isActive
                                ? 'bg-green-600/10 border-green-500/20 text-green-500'
                                : 'bg-card-border border-card-border text-muted-text'
                            }`}
                          >
                            {prod.isActive ? 'Active' : 'Hidden'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(prod)}
                              className="p-1.5 border border-card-border rounded hover:border-accent/40 text-muted-text hover:text-accent transition-colors"
                              title="Edit Details & Images"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id, prod.name)}
                              className="p-1.5 border border-card-border rounded hover:border-red-500/40 text-muted-text hover:text-red-500 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {productsData.meta && productsData.meta.totalPages > 1 && (
              <div className="flex justify-between items-center border-t border-card-border/60 pt-4">
                <span className="text-[10px] text-muted-text uppercase font-bold">
                  Page {productsData.meta.page} of {productsData.meta.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 bg-card-bg border border-card-border hover:border-white text-[10px] font-bold uppercase rounded disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    disabled={page === productsData.meta.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 bg-card-bg border border-card-border hover:border-white text-[10px] font-bold uppercase rounded disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE PRODUCT MODAL DRAWER */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs" onClick={() => setIsCreateOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-black border-l border-card-border shadow-xl flex flex-col h-full text-white">
              <div className="px-6 py-5 border-b border-card-border flex items-center justify-between">
                <h2 className="text-lg font-black uppercase tracking-wider text-accent">Create New Product</h2>
                <button onClick={() => setIsCreateOpen(false)} className="text-muted-text hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-muted-text font-bold">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Slim Fit Denim Jacket"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-muted-text font-bold">Description *</label>
                  <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    placeholder="Provide details about fit, quality, material..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-muted-text font-bold">Price (৳) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="89.99"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-muted-text font-bold">Discount (৳)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Optional"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-muted-text font-bold">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      placeholder="45"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-muted-text font-bold">Category *</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-input-bg border border-input-border focus:border-accent text-muted-text px-4 py-2.5 rounded text-sm outline-none transition-colors"
                  >
                    <option value="">Select Category</option>
                    {categories?.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-muted-text font-bold">Colors (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Blue, Black, White"
                    value={colorsInput}
                    onChange={(e) => setColorsInput(e.target.value)}
                    className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2 border-t border-card-border/40 pt-3">
                  <label className="text-xs uppercase tracking-widest text-muted-text font-bold flex items-center justify-between">
                    <span>Product Sizes</span>
                    <span className="text-[10px] text-accent font-normal lowercase">Check size & type measurement (e.g. 28 inch)</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin p-2 bg-input-bg border border-input-border rounded">
                    {STANDARD_SIZES.map((szKey) => {
                      const entry = selectedSizesMap[szKey] || { enabled: false, customDetail: '' };
                      return (
                        <div key={szKey} className="flex items-center gap-2 bg-card-bg p-1.5 rounded border border-card-border/60">
                          <input
                            type="checkbox"
                            id={`sz-create-${szKey}`}
                            checked={entry.enabled}
                            onChange={(e) => {
                              setSelectedSizesMap({
                                ...selectedSizesMap,
                                [szKey]: { ...entry, enabled: e.target.checked },
                              });
                            }}
                            className="accent-accent h-3.5 w-3.5 cursor-pointer"
                          />
                          <label htmlFor={`sz-create-${szKey}`} className="text-xs font-bold text-white uppercase cursor-pointer min-w-[55px]">
                            {szKey}
                          </label>

                          {entry.enabled && (
                            <input
                              type="text"
                              placeholder="e.g. 28 inch"
                              value={entry.customDetail}
                              onChange={(e) => {
                                setSelectedSizesMap({
                                  ...selectedSizesMap,
                                  [szKey]: { ...entry, customDetail: e.target.value },
                                });
                              }}
                              className="w-full bg-black border border-input-border focus:border-accent text-white px-2 py-0.5 rounded text-[11px] outline-none transition-colors"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-muted-text font-bold">YouTube Video URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors"
                  />
                </div>

                <div className="flex gap-6 py-2">
                  <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-text font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPopular}
                      onChange={(e) => setIsPopular(e.target.checked)}
                      className="accent-accent h-4 w-4"
                    />
                    Mark as Popular
                  </label>

                  <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-text font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="accent-accent h-4 w-4"
                    />
                    Active / Visible
                  </label>
                </div>

                <div className="space-y-2 border-t border-card-border/60 pt-4">
                  <label className="text-xs uppercase tracking-widest text-muted-text font-bold flex items-center gap-1.5">
                    <Upload className="h-4 w-4 text-accent" /> Upload Product Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setSelectedFiles(e.target.files)}
                    className="w-full text-xs text-muted-text file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:uppercase file:bg-accent file:text-black file:cursor-pointer"
                  />
                  {selectedFiles && (
                    <p className="text-[10px] text-accent font-bold uppercase">
                      {selectedFiles.length} files selected for upload
                    </p>
                  )}
                </div>

                {/* Color-Specific Images Section */}
                <div className="space-y-3 border-t border-card-border/60 pt-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs uppercase tracking-widest text-muted-text font-bold flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-accent" /> Color Specific Images
                    </label>
                    <button
                      type="button"
                      onClick={() => setColorImageRows([...colorImageRows, { color: '', files: null }])}
                      className="px-2.5 py-1 bg-card-bg border border-card-border hover:border-accent text-accent font-bold uppercase tracking-wider text-[10px] transition-colors rounded cursor-pointer"
                    >
                      + Add Color and Image
                    </button>
                  </div>

                  {colorImageRows.map((row, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 p-3 bg-card-bg border border-card-border rounded relative">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...colorImageRows];
                          updated.splice(idx, 1);
                          setColorImageRows(updated);
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>

                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-muted-text font-bold">Color Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Red"
                          value={row.color}
                          onChange={(e) => {
                            const updated = [...colorImageRows];
                            updated[idx].color = e.target.value;
                            setColorImageRows(updated);
                          }}
                          className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-3 py-1.5 rounded text-xs outline-none transition-colors"
                        />
                      </div>

                      <div className="flex-grow space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-muted-text font-bold">Upload Images</label>
                        <input
                          type="file"
                          multiple
                          required
                          accept="image/*"
                          onChange={(e) => {
                            const updated = [...colorImageRows];
                            updated[idx].files = e.target.files;
                            setColorImageRows(updated);
                          }}
                          className="w-full text-[10px] text-muted-text file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[9px] file:font-bold file:uppercase file:bg-accent file:text-black file:cursor-pointer"
                        />
                        {row.files && (
                          <p className="text-[9px] text-accent font-bold uppercase">
                            {row.files.length} files selected
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="w-full py-3 bg-accent text-black font-extrabold uppercase tracking-wider text-sm hover:bg-accent-hover transition-colors rounded disabled:opacity-40"
                  >
                    {createLoading ? 'Uploading & Creating...' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL DRAWER */}
      {isEditOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs" onClick={() => setIsEditOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-black border-l border-card-border shadow-xl flex flex-col h-full text-white">
              <div className="px-6 py-5 border-b border-card-border flex items-center justify-between">
                <h2 className="text-lg font-black uppercase tracking-wider text-accent">Edit Product</h2>
                <button onClick={() => setIsEditOpen(false)} className="text-muted-text hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-8">
                {/* Text Metadata Update Form */}
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <h3 className="text-xs uppercase font-extrabold tracking-widest text-accent pb-2 border-b border-card-border/50">
                    Product Metadata
                  </h3>

                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-muted-text font-bold">Product Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-muted-text font-bold">Description</label>
                    <RichTextEditor
                      value={description}
                      onChange={setDescription}
                      placeholder="Provide details about fit, quality, material..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-widest text-muted-text font-bold">Price (৳)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-widest text-muted-text font-bold">Discount (৳)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={discountPrice}
                        onChange={(e) => setDiscountPrice(e.target.value)}
                        className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-widest text-muted-text font-bold">Stock Quantity</label>
                      <input
                        type="number"
                        required
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-muted-text font-bold">Category</label>
                    <select
                      required
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-input-bg border border-input-border focus:border-accent text-muted-text px-4 py-2.5 rounded text-sm outline-none transition-colors"
                    >
                      {categories?.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-muted-text font-bold">Colors (Comma separated)</label>
                    <input
                      type="text"
                      value={colorsInput}
                      onChange={(e) => setColorsInput(e.target.value)}
                      className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-2 border-t border-card-border/40 pt-3">
                    <label className="text-xs uppercase tracking-widest text-muted-text font-bold flex items-center justify-between">
                      <span>Product Sizes</span>
                      <span className="text-[10px] text-accent font-normal lowercase">Check size & type measurement (e.g. 28 inch)</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin p-2 bg-input-bg border border-input-border rounded">
                      {STANDARD_SIZES.map((szKey) => {
                        const entry = selectedSizesMap[szKey] || { enabled: false, customDetail: '' };
                        return (
                          <div key={szKey} className="flex items-center gap-2 bg-card-bg p-1.5 rounded border border-card-border/60">
                            <input
                              type="checkbox"
                              id={`sz-edit-${szKey}`}
                              checked={entry.enabled}
                              onChange={(e) => {
                                setSelectedSizesMap({
                                  ...selectedSizesMap,
                                  [szKey]: { ...entry, enabled: e.target.checked },
                                });
                              }}
                              className="accent-accent h-3.5 w-3.5 cursor-pointer"
                            />
                            <label htmlFor={`sz-edit-${szKey}`} className="text-xs font-bold text-white uppercase cursor-pointer min-w-[55px]">
                              {szKey}
                            </label>

                            {entry.enabled && (
                              <input
                                type="text"
                                placeholder="e.g. 28 inch"
                                value={entry.customDetail}
                                onChange={(e) => {
                                  setSelectedSizesMap({
                                    ...selectedSizesMap,
                                    [szKey]: { ...entry, customDetail: e.target.value },
                                  });
                                }}
                                className="w-full bg-black border border-input-border focus:border-accent text-white px-2 py-0.5 rounded text-[11px] outline-none transition-colors"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-muted-text font-bold">YouTube Video URL</label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors"
                    />
                  </div>

                  <div className="flex gap-6 py-2">
                    <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-text font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPopular}
                        onChange={(e) => setIsPopular(e.target.checked)}
                        className="accent-accent h-4 w-4"
                      />
                      Mark as Popular
                    </label>

                    <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-text font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="accent-accent h-4 w-4"
                      />
                      Active / Visible
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="w-full py-2.5 bg-accent text-black font-extrabold uppercase tracking-wider text-xs hover:bg-accent-hover transition-colors rounded disabled:opacity-40"
                  >
                    {updateLoading ? 'Saving...' : 'Update Details'}
                  </button>
                </form>

                {/* Images Upload & List management */}
                <div className="space-y-4 border-t border-card-border/60 pt-6">
                  <h3 className="text-xs uppercase font-extrabold tracking-widest text-accent pb-2 border-b border-card-border/50 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Manage Product Images
                  </h3>

                  {/* List current images */}
                  <div className="grid grid-cols-4 gap-3">
                    {selectedProduct.images?.map((img: any) => (
                      <div key={img.id} className="relative aspect-square border border-card-border rounded overflow-hidden group bg-black flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt="product" className="h-full w-full object-cover" />
                        {img.color && (
                          <span className="absolute top-1 left-1 bg-accent text-black text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase z-10 pointer-events-none">
                            {img.color}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-500 hover:text-red-400"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    {(!selectedProduct.images || selectedProduct.images.length === 0) && (
                      <div className="col-span-4 py-4 text-center text-muted-text text-xs uppercase tracking-widest">
                        No images uploaded
                      </div>
                    )}
                  </div>

                  {/* Add more images */}
                  <form onSubmit={handleAppendImages} className="space-y-3 pt-3 border-t border-card-border/30">
                    <label className="text-[10px] uppercase tracking-widest text-muted-text font-bold block">
                      Append Additional Images:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-muted-text font-bold">Associated Color (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Red (Leave empty for general)"
                          value={appendColor}
                          onChange={(e) => setAppendColor(e.target.value)}
                          className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-3 py-1.5 rounded text-xs outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-muted-text font-bold">Select Files</label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => setAppendFiles(e.target.files)}
                          className="w-full text-xs text-muted-text file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-accent file:text-black file:cursor-pointer"
                        />
                      </div>
                    </div>
                    {appendFiles && (
                      <p className="text-[10px] text-accent font-bold uppercase">
                        {appendFiles.length} files selected
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={uploadLoading || !appendFiles}
                      className="w-full py-2 bg-accent text-black font-extrabold uppercase tracking-wider text-[10px] hover:bg-accent-hover transition-colors rounded disabled:opacity-40"
                    >
                      {uploadLoading ? 'Uploading...' : 'Upload Images'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
