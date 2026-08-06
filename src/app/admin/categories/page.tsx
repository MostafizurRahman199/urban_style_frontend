'use client';

import React, { useState } from 'react';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '@/redux/services/api';
import { Plus, Edit2, Trash2, X, Check, FolderKanban, AlertCircle } from 'lucide-react';

export default function CategoriesAdminPage() {
  const { data: categories, isLoading, error } = useGetCategoriesQuery(undefined);
  const [createCategory, { isLoading: createLoading }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updateLoading }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  // Component States
  const [newCatName, setNewCatName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!newCatName.trim()) return;

    try {
      await createCategory({ name: newCatName.trim() }).unwrap();
      setNewCatName('');
      setSuccessMessage('Category created successfully!');
      setTimeout(clearMessages, 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.data?.message || 'Failed to create category.');
    }
  };

  const handleUpdate = async (id: string) => {
    clearMessages();
    if (!editName.trim()) return;

    try {
      await updateCategory({ id, name: editName.trim() }).unwrap();
      setEditId(null);
      setEditName('');
      setSuccessMessage('Category updated successfully!');
      setTimeout(clearMessages, 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.data?.message || 'Failed to update category.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    clearMessages();
    if (!window.confirm(`Are you sure you want to delete the category "${name}"?`)) return;

    try {
      await deleteCategory(id).unwrap();
      setSuccessMessage('Category deleted successfully!');
      setTimeout(clearMessages, 3000);
    } catch (err: any) {
      console.error(err);
      if (err?.status === 400) {
        setErrorMessage(`Cannot delete category "${name}" because it contains associated products.`);
      } else {
        setErrorMessage(err?.data?.message || 'Failed to delete category.');
      }
    }
  };

  const startEdit = (id: string, currentName: string) => {
    setEditId(id);
    setEditName(currentName);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider">
          Categories <span className="text-accent">Manager</span>
        </h1>
        <p className="text-xs text-muted-text uppercase tracking-widest mt-1">
          Add, rename, or remove product classifications
        </p>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-550/10 border border-green-500/30 text-green-500 text-sm rounded p-4 flex items-center gap-2">
          <Check className="h-5 w-5 flex-shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Create Category Form */}
        <div className="lg:col-span-4 bg-card-bg border border-card-border p-6 rounded-lg space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b border-card-border pb-3">
            <Plus className="h-4.5 w-4.5 text-accent" /> Add Category
          </h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-muted-text font-bold">Category Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Winter Wear"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full bg-input-bg border border-input-border focus:border-accent text-white px-4 py-2.5 rounded text-sm outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={createLoading}
              className="w-full py-2.5 bg-accent text-black font-bold uppercase tracking-wider text-xs hover:bg-accent-hover transition-colors rounded disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {createLoading ? 'Adding...' : 'Create Category'}
            </button>
          </form>
        </div>

        {/* Categories List Table */}
        <div className="lg:col-span-8 bg-card-bg border border-card-border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b border-card-border pb-3">
            <FolderKanban className="h-4.5 w-4.5 text-accent" /> Categories List
          </h2>

          {isLoading ? (
            <div className="space-y-4 py-6">
              <div className="h-8 bg-card-border animate-pulse rounded" />
              <div className="h-8 bg-card-border animate-pulse rounded" />
              <div className="h-8 bg-card-border animate-pulse rounded" />
            </div>
          ) : error ? (
            <div className="text-center py-6 text-muted-text text-sm">Failed to load categories.</div>
          ) : !categories || categories.length === 0 ? (
            <div className="text-center py-10 text-muted-text text-sm">No categories created yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-card-border/80 text-muted-text text-xs uppercase tracking-widest font-bold">
                    <th className="pb-3 w-1/2">Name</th>
                    <th className="pb-3 w-1/3">Slug</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border/40">
                  {categories.map((cat: any) => (
                    <tr key={cat.id} className="hover:bg-black/20 transition-colors">
                      {/* Name / Edit Input */}
                      <td className="py-4 pr-4">
                        {editId === cat.id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-input-bg border border-accent focus:border-accent text-white px-2 py-1 rounded text-sm outline-none w-full"
                          />
                        ) : (
                          <span className="font-semibold text-white">{cat.name}</span>
                        )}
                      </td>

                      {/* Slug */}
                      <td className="py-4 pr-4 font-mono text-xs text-muted-text">
                        {cat.slug}
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 text-right">
                        {editId === cat.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleUpdate(cat.id)}
                              disabled={updateLoading}
                              className="p-1.5 bg-green-600/10 text-green-500 rounded border border-green-500/20 hover:bg-green-600 hover:text-black transition-colors"
                              title="Save"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="p-1.5 bg-card-border text-muted-text rounded border border-card-border hover:bg-white hover:text-black transition-colors"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => startEdit(cat.id, cat.name)}
                              className="p-1.5 border border-card-border rounded hover:border-accent/40 text-muted-text hover:text-accent transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id, cat.name)}
                              className="p-1.5 border border-card-border rounded hover:border-red-500/40 text-muted-text hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
