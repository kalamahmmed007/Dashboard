import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../redux/slices/categorySlice';
import { Spinner, EmptyState, ConfirmModal, Modal } from '../../components/common';
import {
  MdAdd, MdEdit, MdDelete, MdImage, MdSearch, MdClose,
  MdGridView, MdViewList, MdSort, MdFilterList, MdCheckBox,
  MdCheckBoxOutlineBlank, MdIndeterminateCheckBox, MdDragIndicator,
  MdVisibility, MdVisibilityOff
} from 'react-icons/md';
import toast from 'react-hot-toast';

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
    <div className="h-36 bg-gray-200" />
    <div className="space-y-2 p-4">
      <div className="h-4 w-3/4 rounded bg-gray-200" />
      <div className="h-3 w-1/2 rounded bg-gray-100" />
      <div className="h-3 w-full rounded bg-gray-100" />
      <div className="mt-3 flex gap-2">
        <div className="h-8 flex-1 rounded-lg bg-gray-200" />
        <div className="h-8 w-8 rounded-lg bg-gray-200" />
      </div>
    </div>
  </div>
);

// ─── Image Upload Preview ─────────────────────────────────────────────────────
const ImageUpload = ({ image, setImage, existingImage }) => {
  const [preview, setPreview] = useState(null);
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  const clearImage = () => { setImage(null); setPreview(null); };

  const displayImg = preview || (existingImage && !image ? existingImage : null);

  return (
    <div>
      <label className="form-label">Image</label>
      {displayImg ? (
        <div className="relative inline-block">
          <img src={displayImg} alt="preview" className="h-24 w-32 rounded-xl border border-gray-200 object-cover shadow-sm" />
          <button type="button" onClick={clearImage}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white shadow hover:bg-red-600">
            <MdClose size={12} />
          </button>
          <button type="button" onClick={() => inputRef.current.click()}
            className="mt-2 block text-xs text-indigo-500 hover:underline">
            Change image
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50">
          <MdImage size={28} className="text-gray-300" />
          <p className="mt-1 text-xs text-gray-400">Drag & drop or <span className="text-indigo-500">browse</span></p>
          <p className="mt-0.5 text-[10px] text-gray-300">PNG, JPG, WEBP up to 5MB</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => handleFile(e.target.files[0])} />
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.categories);

  // UI state
  const [view, setView] = useState('grid'); // 'grid' | 'list'
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'hidden'
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'newest' | 'oldest'
  const [selected, setSelected] = useState([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

  // Form state
  const [form, setForm] = useState({ name: '', slug: '', description: '', isActive: true });
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  // Drag state
  const [dragId, setDragId] = useState(null);
  const [orderedList, setOrderedList] = useState([]);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);
  useEffect(() => { setOrderedList(list); }, [list]);

  // ── Filtering & Sorting ───────────────────────────────────────────────────
  const filtered = orderedList
    .filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' ? true
        : filterStatus === 'active' ? c.isActive !== false
        : c.isActive === false;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      return 0;
    });

  // ── Selection ─────────────────────────────────────────────────────────────
  const allSelected = filtered.length > 0 && filtered.every((c) => selected.includes(c._id));
  const someSelected = selected.length > 0 && !allSelected;
  const toggleSelect = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll = () => allSelected ? setSelected([]) : setSelected(filtered.map((c) => c._id));
  const clearSelection = () => setSelected([]);

  // ── Drag & Drop reorder ───────────────────────────────────────────────────
  const handleDragStart = (id) => setDragId(id);
  const handleDragOver = useCallback((e, targetId) => {
    e.preventDefault();
    if (dragId === targetId) return;
    setOrderedList((prev) => {
      const from = prev.findIndex((c) => c._id === dragId);
      const to = prev.findIndex((c) => c._id === targetId);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }, [dragId]);
  const handleDragEnd = () => setDragId(null);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const autoSlug = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const openCreate = () => {
    setEditCat(null);
    setForm({ name: '', slug: '', description: '', isActive: true });
    setImage(null);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditCat(c);
    setForm({ name: c.name, slug: c.slug, description: c.description || '', isActive: c.isActive !== false });
    setImage(null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.slug.trim()) return toast.error('Slug is required');
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append('image', image);
    try {
      if (editCat) {
        await dispatch(updateCategory({ id: editCat._id, formData: fd })).unwrap();
        toast.success('Category updated!');
      } else {
        await dispatch(createCategory(fd)).unwrap();
        toast.success('Category created!');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteCategory(deleteModal.id)).unwrap();
      toast.success('Category deleted');
      setDeleteModal({ open: false, id: null });
      setSelected((prev) => prev.filter((x) => x !== deleteModal.id));
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleBulkDelete = async () => {
    const results = await Promise.allSettled(
      selected.map((id) => dispatch(deleteCategory(id)).unwrap())
    );
    const failed = results.filter((r) => r.status === 'rejected').length;
    const ok = results.length - failed;
    if (ok) toast.success(`${ok} categor${ok > 1 ? 'ies' : 'y'} deleted`);
    if (failed) toast.error(`${failed} failed`);
    clearSelection();
    setBulkDeleteModal(false);
  };

  const handleToggleStatus = async (cat) => {
    const fd = new FormData();
    fd.append('name', cat.name);
    fd.append('slug', cat.slug);
    fd.append('description', cat.description || '');
    fd.append('isActive', String(cat.isActive === false ? true : false));
    try {
      await dispatch(updateCategory({ id: cat._id, formData: fd })).unwrap();
      toast.success(`Category ${cat.isActive === false ? 'activated' : 'hidden'}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const activeCount = list.filter((c) => c.isActive !== false).length;
  const hiddenCount = list.filter((c) => c.isActive === false).length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{list.length}</span> categories
          </p>
          {activeCount > 0 && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              {activeCount} active
            </span>
          )}
          {hiddenCount > 0 && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              {hiddenCount} hidden
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <button
              onClick={() => setBulkDeleteModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100">
              <MdDelete size={14} /> Delete {selected.length} selected
            </button>
          )}
          <button className="btn-primary flex items-center gap-1.5" onClick={openCreate}>
            <MdAdd size={18} /> Add Category
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative min-w-[180px] max-w-xs flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="form-input py-2 pl-8 pr-8 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <MdClose size={15} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {['all', 'active', 'hidden'].map((s) => (
            <button key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                filterStatus === s ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
          <MdSort size={15} className="text-gray-400" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="border-0 bg-transparent text-xs text-gray-600 focus:outline-none focus:ring-0">
            <option value="name">Name A–Z</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          <button onClick={() => setView('grid')}
            className={`rounded-md p-1.5 transition-colors ${view === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}>
            <MdGridView size={15} />
          </button>
          <button onClick={() => setView('list')}
            className={`rounded-md p-1.5 transition-colors ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}>
            <MdViewList size={15} />
          </button>
        </div>

        {/* Select all */}
        {filtered.length > 0 && (
          <button onClick={toggleAll} title={allSelected ? 'Deselect all' : 'Select all'}
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition-colors hover:text-indigo-600">
            {allSelected ? <MdCheckBox size={16} className="text-indigo-600" />
              : someSelected ? <MdIndeterminateCheckBox size={16} className="text-indigo-400" />
              : <MdCheckBoxOutlineBlank size={16} />}
          </button>
        )}
      </div>

      {/* ── Results info ── */}
      {(search || filterStatus !== 'all') && (
        <p className="text-xs text-gray-400">
          Showing <span className="font-medium text-gray-700">{filtered.length}</span> of {list.length} categories
          {search && <> matching <span className="font-medium text-gray-700">"{search}"</span></>}
          {filterStatus !== 'all' && <> · <span className="capitalize">{filterStatus}</span> only</>}
          {' '}
          <button onClick={() => { setSearch(''); setFilterStatus('all'); }}
            className="text-indigo-500 hover:underline">Clear filters</button>
        </p>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className={view === 'grid'
          ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "space-y-2"}>
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : list.length === 0 ? (
        <EmptyState icon="🗂️" title="No Categories" description="Add your first category to get started."
          action={<button className="btn-primary flex items-center gap-1.5" onClick={openCreate}><MdAdd size={18} /> Add Category</button>} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="No Results" description={`No categories match "${search || filterStatus}".`}
          action={<button className="btn-outline" onClick={() => { setSearch(''); setFilterStatus('all'); }}>Clear Filters</button>} />
      ) : view === 'grid' ? (
        // ── Grid view ──
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((cat) => (
            <div
              key={cat._id}
              draggable
              onDragStart={() => handleDragStart(cat._id)}
              onDragOver={(e) => handleDragOver(e, cat._id)}
              onDragEnd={handleDragEnd}
              className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md cursor-grab active:cursor-grabbing ${
                dragId === cat._id ? 'opacity-50 scale-95' : ''
              } ${selected.includes(cat._id) ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-gray-100'}`}>

              {/* Image */}
              <div className="relative h-36 bg-gray-100" onClick={() => toggleSelect(cat._id)}>
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <MdImage size={36} className="text-gray-300" />
                  </div>
                )}

                {/* Checkbox overlay */}
                <div className={`absolute top-2 left-2 transition-opacity ${selected.includes(cat._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <div className={`rounded-md p-0.5 ${selected.includes(cat._id) ? 'bg-indigo-600 text-white' : 'bg-white/80 text-gray-500 backdrop-blur-sm'}`}>
                    {selected.includes(cat._id) ? <MdCheckBox size={16} /> : <MdCheckBoxOutlineBlank size={16} />}
                  </div>
                </div>

                {/* Status dot */}
                <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ${cat.isActive !== false ? 'bg-green-400' : 'bg-gray-300'}`} />

                {/* Drag handle */}
                <div className="absolute bottom-2 right-2 text-white opacity-0 transition-opacity group-hover:opacity-60">
                  <MdDragIndicator size={16} />
                </div>
              </div>

              {/* Body */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-gray-900">{cat.name}</h3>
                    <p className="mt-0.5 truncate text-xs text-gray-400">/{cat.slug}</p>
                  </div>
                  {cat.productCount !== undefined && (
                    <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                      {cat.productCount} products
                    </span>
                  )}
                </div>
                {cat.description && (
                  <p className="mt-1.5 line-clamp-2 text-xs text-gray-500">{cat.description}</p>
                )}
                <div className="mt-3 flex gap-2">
                  <button onClick={() => openEdit(cat)}
                    className="btn-outline flex flex-1 items-center justify-center gap-1 px-3 py-1.5 text-xs">
                    <MdEdit size={13} /> Edit
                  </button>
                  <button onClick={() => handleToggleStatus(cat)} title={cat.isActive !== false ? 'Hide category' : 'Activate category'}
                    className="rounded-lg border border-gray-200 p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600">
                    {cat.isActive !== false ? <MdVisibilityOff size={15} /> : <MdVisibility size={15} />}
                  </button>
                  <button onClick={() => setDeleteModal({ open: true, id: cat._id })}
                    className="rounded-lg border border-gray-200 p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600">
                    <MdDelete size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // ── List view ──
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50">
                <th className="w-10 px-4 py-3">
                  <button onClick={toggleAll} className="text-gray-400 transition-colors hover:text-indigo-600">
                    {allSelected ? <MdCheckBox size={16} className="text-indigo-600" />
                      : someSelected ? <MdIndeterminateCheckBox size={16} className="text-indigo-400" />
                      : <MdCheckBoxOutlineBlank size={16} />}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Category</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 md:table-cell">Slug</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 lg:table-cell">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((cat) => (
                <tr key={cat._id}
                  className={`transition-colors hover:bg-gray-50/60 ${selected.includes(cat._id) ? 'bg-indigo-50' : ''}`}>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(cat._id)} className="text-gray-400 hover:text-indigo-600">
                      {selected.includes(cat._id) ? <MdCheckBox size={16} className="text-indigo-600" /> : <MdCheckBoxOutlineBlank size={16} />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        {cat.image
                          ? <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                          : <div className="flex h-full items-center justify-center"><MdImage size={18} className="text-gray-300" /></div>}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                        {cat.productCount !== undefined && (
                          <p className="text-xs text-gray-400">{cat.productCount} products</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-gray-400 md:table-cell">/{cat.slug}</td>
                  <td className="hidden max-w-[200px] px-4 py-3 text-xs text-gray-500 lg:table-cell">
                    <span className="line-clamp-1">{cat.description || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      cat.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cat.isActive !== false ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {cat.isActive !== false ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(cat)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600" title="Edit">
                        <MdEdit size={15} />
                      </button>
                      <button onClick={() => handleToggleStatus(cat)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        title={cat.isActive !== false ? 'Hide' : 'Activate'}>
                        {cat.isActive !== false ? <MdVisibilityOff size={15} /> : <MdVisibility size={15} />}
                      </button>
                      <button onClick={() => setDeleteModal({ open: true, id: cat._id })}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500" title="Delete">
                        <MdDelete size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editCat ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="form-label">Name <span className="text-red-400">*</span></label>
            <input
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: autoSlug(e.target.value) })}
              placeholder="e.g. Shirts"
              required
            />
          </div>
          <div>
            <label className="form-label">Slug</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">/</span>
              <input
                className="form-input pl-5"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: autoSlug(e.target.value) })}
                placeholder="shirts"
              />
            </div>
            <p className="mt-1 text-[11px] text-gray-400">Auto-generated from name. URL-safe characters only.</p>
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short description..."
            />
          </div>
          <div>
            <label className="form-label">Status</label>
            <div className="mt-1 flex gap-2">
              {[{ value: true, label: 'Active', color: 'green' }, { value: false, label: 'Hidden', color: 'gray' }].map(({ value, label, color }) => (
                <button key={String(value)} type="button"
                  onClick={() => setForm({ ...form, isActive: value })}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    form.isActive === value
                      ? color === 'green' ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-300 bg-gray-100 text-gray-600'
                      : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <ImageUpload image={image} setImage={setImage} existingImage={editCat?.image} />
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center gap-2">
              {saving && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {saving ? 'Saving...' : editCat ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Modal ── */}
      <ConfirmModal
        open={deleteModal.open}
        title="Delete Category"
        message="This will permanently delete the category. Products in this category won't be deleted."
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, id: null })}
      />

      {/* ── Bulk Delete Modal ── */}
      <ConfirmModal
        open={bulkDeleteModal}
        title={`Delete ${selected.length} Categories`}
        message={`Are you sure you want to delete ${selected.length} selected categories? This cannot be undone.`}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteModal(false)}
      />
    </div>
  );
}