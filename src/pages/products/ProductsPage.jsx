import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProducts, createProduct, updateProduct, deleteProduct,
  toggleProductStatus, setSelectedProduct,
} from '../../redux/slices/productSlice';
import { fetchCategories } from '../../redux/slices/categorySlice';
import { Table, Pagination, ConfirmModal, Spinner, EmptyState, Modal, Badge } from '../../components/common';
import {
  MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList, MdToggleOn, MdToggleOff,
  MdImage, MdClose, MdGridView, MdViewList, MdCheckBox, MdCheckBoxOutlineBlank,
  MdIndeterminateCheckBox, MdSort, MdExpandMore, MdExpandLess, MdRefresh,
  MdVisibility, MdLocalOffer, MdInventory, MdCategory, MdArrowUpward, MdArrowDownward,
} from 'react-icons/md';
import toast from 'react-hot-toast';

// ─── Constants ─────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  title: '', description: '', price: '', originalPrice: '',
  stock: '', category: '', brand: '', fabric: '', care: '',
  styleTips: '', tags: '', sizes: '', colors: '', isActive: true,
};

// ─── Skeleton Row ──────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-50">
    <td className="px-4 py-3"><div className="h-4 w-4 rounded bg-gray-200" /></td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="h-14 w-12 rounded-lg bg-gray-200" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-36 rounded bg-gray-200" />
          <div className="h-3 w-20 rounded bg-gray-100" />
        </div>
      </div>
    </td>
    <td className="px-4 py-3"><div className="h-3.5 w-16 rounded bg-gray-200" /></td>
    <td className="px-4 py-3"><div className="h-3.5 w-20 rounded bg-gray-200" /></td>
    <td className="px-4 py-3"><div className="h-3.5 w-12 rounded bg-gray-200" /></td>
    <td className="px-4 py-3"><div className="h-5 w-14 rounded-full bg-gray-200" /></td>
    <td className="px-4 py-3"><div className="h-8 w-24 rounded-lg bg-gray-200" /></td>
  </tr>
);

// ─── Product Card (Grid) ───────────────────────────────────────────────────────
const ProductCard = ({ p, selected, onSelect, onEdit, onDelete, onToggle }) => {
  const discount = p.originalPrice && p.price
    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
    : null;

  return (
    <div className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${
      selected ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-gray-100'}`}>
      {/* Image */}
      <div className="relative h-44 bg-gray-100" onClick={() => onSelect(p._id)}>
        {p.images?.[0]
          ? <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
          : <div className="flex h-full items-center justify-center"><MdImage size={36} className="text-gray-300" /></div>}

        {/* Checkbox */}
        <div className={`absolute top-2 left-2 transition-opacity ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className={`rounded-md p-0.5 ${selected ? 'bg-indigo-600 text-white' : 'bg-white/80 text-gray-500 backdrop-blur-sm'}`}>
            {selected ? <MdCheckBox size={16} /> : <MdCheckBoxOutlineBlank size={16} />}
          </div>
        </div>

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute right-2 top-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
            -{discount}%
          </div>
        )}

        {/* Status dot */}
        <div className={`absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold shadow-sm backdrop-blur-sm ${
          p.isActive !== false ? 'text-green-600' : 'text-gray-400'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${p.isActive !== false ? 'bg-green-500' : 'bg-gray-400'}`} />
          {p.isActive !== false ? 'Active' : 'Hidden'}
        </div>

        {/* Stock warning */}
        {(p.stock || 0) < 10 && (p.stock || 0) > 0 && (
          <div className="absolute bottom-2 right-2 rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
            Low Stock
          </div>
        )}
        {(p.stock || 0) === 0 && (
          <div className="absolute bottom-2 right-2 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
            Out of Stock
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <h3 className="line-clamp-1 text-sm font-bold text-gray-900">{p.title}</h3>
        <p className="mt-0.5 text-[11px] text-gray-400">{p.brand || p.category?.name || '—'}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-sm font-bold text-gray-900">৳{p.price?.toLocaleString()}</span>
          {p.originalPrice && <span className="text-xs text-gray-400 line-through">৳{p.originalPrice?.toLocaleString()}</span>}
        </div>
        <div className="mt-2.5 flex gap-1.5">
          <button onClick={() => onEdit(p)}
            className="btn-outline flex flex-1 items-center justify-center gap-1 py-1.5 text-xs">
            <MdEdit size={13} /> Edit
          </button>
          <button onClick={() => onToggle(p._id)}
            title={p.isActive !== false ? 'Hide' : 'Activate'}
            className="rounded-lg border border-gray-200 p-1.5 text-gray-400 transition-colors hover:bg-gray-50">
            {p.isActive !== false ? <MdToggleOn size={16} className="text-green-500" /> : <MdToggleOff size={16} />}
          </button>
          <button onClick={() => onDelete(p._id)}
            className="rounded-lg border border-gray-200 p-1.5 text-red-400 transition-colors hover:bg-red-50">
            <MdDelete size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Image Upload (Multi) ──────────────────────────────────────────────────────
const MultiImageUpload = ({ images, setImages, existingImages }) => {
  const [previews, setPreviews] = useState([]);
  const inputRef = useRef();

  const handleFiles = (files) => {
    const arr = Array.from(files);
    setImages(arr);
    const readers = arr.map((file) => new Promise((res) => {
      const r = new FileReader();
      r.onload = (e) => res(e.target.result);
      r.readAsDataURL(file);
    }));
    Promise.all(readers).then(setPreviews);
  };

  const removeNew = (i) => {
    const ni = images.filter((_, idx) => idx !== i);
    const np = previews.filter((_, idx) => idx !== i);
    setImages(ni);
    setPreviews(np);
  };

  const displayImages = previews.length > 0 ? previews : (images.length === 0 ? existingImages || [] : []);
  const isExisting = previews.length === 0 && images.length === 0;

  return (
    <div>
      <label className="form-label">Product Images</label>
      {displayImages.length > 0 ? (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {displayImages.map((src, i) => (
              <div key={i} className="relative">
                <img src={src} alt="" className="h-16 w-14 rounded-xl border border-gray-200 object-cover shadow-sm" />
                {!isExisting && (
                  <button type="button" onClick={() => removeNew(i)}
                    className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 p-0.5 text-white shadow hover:bg-red-600">
                    <MdClose size={10} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => inputRef.current.click()}
              className="flex h-16 w-14 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:border-indigo-400 hover:text-indigo-500">
              <MdAdd size={20} />
            </button>
          </div>
          {isExisting && (
            <button type="button" onClick={() => inputRef.current.click()}
              className="text-xs text-indigo-500 hover:underline">
              Replace all images
            </button>
          )}
        </div>
      ) : (
        <div onClick={() => inputRef.current.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50">
          <MdImage size={28} className="text-gray-300" />
          <p className="mt-1 text-xs text-gray-400">Drag & drop or <span className="text-indigo-500">browse</span></p>
          <p className="mt-0.5 text-[10px] text-gray-300">Multiple images supported</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
};

// ─── Size Builder ──────────────────────────────────────────────────────────────
const SizeBuilder = ({ value, onChange }) => {
  const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const parsed = value.split(',').map(s => s.trim()).filter(Boolean).reduce((acc, s) => {
    const [sz, stock] = s.split(':');
    if (sz) acc[sz.trim()] = stock?.trim() !== '0';
    return acc;
  }, {});

  const toggle = (sz) => {
    const next = { ...parsed };
    if (next[sz] !== undefined) delete next[sz];
    else next[sz] = true;
    onChange(Object.entries(next).map(([k, v]) => `${k}:${v ? '1' : '0'}`).join(', '));
  };

  const toggleStock = (sz) => {
    const next = { ...parsed, [sz]: !parsed[sz] };
    onChange(Object.entries(next).map(([k, v]) => `${k}:${v ? '1' : '0'}`).join(', '));
  };

  return (
    <div>
      <label className="form-label">Sizes</label>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {SIZES.map((sz) => {
          const selected = parsed[sz] !== undefined;
          const inStock = parsed[sz] === true;
          return (
            <div key={sz} className="flex flex-col items-center gap-0.5">
              <button type="button" onClick={() => toggle(sz)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-200 text-gray-500 hover:border-indigo-400'}`}>
                {sz}
              </button>
              {selected && (
                <button type="button" onClick={() => toggleStock(sz)}
                  className={`text-[9px] font-medium transition-colors ${inStock ? 'text-green-600' : 'text-red-400'}`}>
                  {inStock ? '✓ Stock' : '✗ Out'}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-1 text-[11px] text-gray-400">Or type manually: S:1, M:1, XL:0</p>
      <input className="form-input mt-1.5 text-xs" value={value}
        onChange={(e) => onChange(e.target.value)} placeholder="S:1, M:1, L:1, XL:0" />
    </div>
  );
};

// ─── Color Picker ──────────────────────────────────────────────────────────────
const ColorPicker = ({ value, onChange }) => {
  const colors = value.split(',').map(c => c.trim()).filter(Boolean);
  const [inputVal, setInputVal] = useState('');

  const add = (hex) => {
    if (!hex) return;
    const next = [...new Set([...colors, hex])];
    onChange(next.join(', '));
    setInputVal('');
  };

  const remove = (c) => onChange(colors.filter(x => x !== c).join(', '));

  return (
    <div>
      <label className="form-label">Colors</label>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {colors.map((c) => (
          <div key={c} className="group relative">
            <div className="h-7 w-7 cursor-pointer rounded-full border-2 border-white shadow" style={{ backgroundColor: c }}
              title={c} onClick={() => remove(c)} />
            <div className="absolute -right-1 -top-1 hidden h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white group-hover:flex"
              onClick={() => remove(c)}>
              <MdClose size={8} />
            </div>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <input type="color" value={inputVal || '#000000'}
            onChange={(e) => setInputVal(e.target.value)}
            className="h-7 w-7 cursor-pointer rounded-full border-0 p-0" />
          <button type="button" onClick={() => add(inputVal)}
            className="rounded-lg border border-dashed border-gray-300 px-2 py-1 text-[11px] text-gray-500 transition-colors hover:border-indigo-400 hover:text-indigo-600">
            + Add
          </button>
        </div>
      </div>
      <input className="form-input mt-1.5 text-xs" value={value}
        onChange={(e) => onChange(e.target.value)} placeholder="#ffffff, #000000, #ff5733" />
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const dispatch = useDispatch();
  const { list, total, totalPages, loading } = useSelector((s) => s.products);
  const { list: categories } = useSelector((s) => s.categories);

  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState('desc');
  const [view, setView] = useState('table');
  const [showFilters, setShowFilters] = useState(false);

  // Selection
  const [selected, setSelected] = useState([]);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

  // Form
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts({
      page, search, category: categoryFilter,
      status: statusFilter, stock: stockFilter,
      sortBy, sortDir, limit: view === 'grid' ? 12 : 10,
    }));
  }, [dispatch, page, search, categoryFilter, statusFilter, stockFilter, sortBy, sortDir, view]);

  // ── Selection ────────────────────────────────────────────────────────────────
  const allSelected = list.length > 0 && list.every((p) => selected.includes(p._id));
  const someSelected = selected.length > 0 && !allSelected;
  const toggleSelect = (id) => setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => allSelected ? setSelected([]) : setSelected(list.map(p => p._id));

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const openCreate = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setImages([]);
    setActiveTab('basic');
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      title: p.title || '', description: p.description || '',
      price: p.price || '', originalPrice: p.originalPrice || '',
      stock: p.stock || '', category: p.category?._id || p.category || '',
      brand: p.brand || '', fabric: p.fabric || '', care: p.care || '',
      styleTips: p.styleTips || '', tags: (p.tags || []).join(', '),
      sizes: (p.sizes || []).map(s => `${s.size}:${s.inStock ? '1' : '0'}`).join(', '),
      colors: (p.colors || []).join(', '), isActive: p.isActive !== false,
    });
    setImages([]);
    setActiveTab('basic');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.price) return toast.error('Price is required');
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    images.forEach(img => fd.append('images', img));
    try {
      if (editProduct) {
        await dispatch(updateProduct({ id: editProduct._id, formData: fd })).unwrap();
        toast.success('Product updated!');
      } else {
        await dispatch(createProduct(fd)).unwrap();
        toast.success('Product created!');
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
      await dispatch(deleteProduct(deleteModal.id)).unwrap();
      toast.success('Product deleted');
      setDeleteModal({ open: false, id: null });
      setSelected(prev => prev.filter(x => x !== deleteModal.id));
    } catch { toast.error('Delete failed'); }
  };

  const handleBulkDelete = async () => {
    const results = await Promise.allSettled(
      selected.map(id => dispatch(deleteProduct(id)).unwrap())
    );
    const failed = results.filter(r => r.status === 'rejected').length;
    const ok = results.length - failed;
    if (ok) toast.success(`${ok} product${ok > 1 ? 's' : ''} deleted`);
    if (failed) toast.error(`${failed} failed`);
    setSelected([]);
    setBulkDeleteModal(false);
  };

  const handleToggle = async (id) => {
    try {
      await dispatch(toggleProductStatus(id)).unwrap();
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
  };

  const handleBulkToggle = async (status) => {
    const results = await Promise.allSettled(
      selected.map(id => dispatch(toggleProductStatus(id)).unwrap())
    );
    const ok = results.filter(r => r.status === 'fulfilled').length;
    if (ok) toast.success(`${ok} products ${status ? 'activated' : 'hidden'}`);
    setSelected([]);
  };

  const resetFilters = () => {
    setSearchInput('');
    setCategoryFilter('');
    setStatusFilter('');
    setStockFilter('');
    setSortBy('');
    setPage(1);
  };

  const hasFilters = searchInput || categoryFilter || statusFilter || stockFilter || sortBy;

  const handleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('desc'); }
    setPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortDir === 'asc' ? <MdArrowUpward size={12} /> : <MdArrowDownward size={12} />;
  };

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const activeCount = list.filter(p => p.isActive !== false).length;
  const lowStockCount = list.filter(p => (p.stock || 0) < 10).length;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{total}</span> products
          </p>
          {activeCount > 0 && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              {activeCount} active on this page
            </span>
          )}
          {lowStockCount > 0 && (
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
              ⚠ {lowStockCount} low stock
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selected.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">{selected.length} selected</span>
              <button onClick={() => handleBulkToggle(true)}
                className="rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100">
                Activate
              </button>
              <button onClick={() => handleBulkToggle(false)}
                className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100">
                Hide
              </button>
              <button onClick={() => setBulkDeleteModal(true)}
                className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100">
                <MdDelete size={13} /> Delete
              </button>
            </div>
          )}
          <button className="btn-primary flex items-center gap-1.5" onClick={openCreate}>
            <MdAdd size={18} /> Add Product
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative min-w-[180px] max-w-sm flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search title, brand, tags..."
            className="form-input py-2 pl-9 pr-8 text-sm" />
          {searchInput && (
            <button onClick={() => setSearchInput('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <MdClose size={14} />
            </button>
          )}
        </div>

        {/* Category */}
        <select className="form-input w-auto py-2 text-sm" value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        {/* More filters toggle */}
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
            showFilters || (statusFilter || stockFilter || sortBy) ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
          <MdFilterList size={15} />
          Filters
          {(statusFilter || stockFilter) && <span className="ml-0.5 rounded-full bg-indigo-600 px-1.5 py-0.5 text-[9px] font-bold text-white">!</span>}
          {showFilters ? <MdExpandLess size={15} /> : <MdExpandMore size={15} />}
        </button>

        {/* Reset */}
        {hasFilters && (
          <button onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-gray-600">
            <MdRefresh size={14} /> Reset
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          <button onClick={() => setView('table')}
            className={`rounded-md p-1.5 transition-colors ${view === 'table' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}>
            <MdViewList size={15} />
          </button>
          <button onClick={() => setView('grid')}
            className={`rounded-md p-1.5 transition-colors ${view === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}>
            <MdGridView size={15} />
          </button>
        </div>

        {/* Select all */}
        {list.length > 0 && (
          <button onClick={toggleAll} title={allSelected ? 'Deselect all' : 'Select all'}
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition-colors hover:text-indigo-600">
            {allSelected ? <MdCheckBox size={16} className="text-indigo-600" />
              : someSelected ? <MdIndeterminateCheckBox size={16} className="text-indigo-400" />
              : <MdCheckBoxOutlineBlank size={16} />}
          </button>
        )}
      </div>

      {/* ── Expanded Filters ── */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-xs font-medium text-gray-500">Status</label>
            <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-0.5">
              {[{ v: '', l: 'All' }, { v: 'active', l: 'Active' }, { v: 'hidden', l: 'Hidden' }].map(({ v, l }) => (
                <button key={v} onClick={() => { setStatusFilter(v); setPage(1); }}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    statusFilter === v ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-xs font-medium text-gray-500">Stock</label>
            <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-0.5">
              {[{ v: '', l: 'All' }, { v: 'low', l: '⚠ Low (<10)' }, { v: 'out', l: '✗ Out' }, { v: 'in', l: '✓ In Stock' }].map(({ v, l }) => (
                <button key={v} onClick={() => { setStockFilter(v); setPage(1); }}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    stockFilter === v ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500">Sort</label>
            <select className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 focus:outline-none"
              value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}>
              <option value="">Default</option>
              <option value="title">Name</option>
              <option value="price">Price</option>
              <option value="stock">Stock</option>
              <option value="createdAt">Date Added</option>
            </select>
            <button onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 transition-colors hover:text-indigo-600">
              {sortDir === 'asc' ? <MdArrowUpward size={14} /> : <MdArrowDownward size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      {list.length === 0 && !loading ? (
        <EmptyState icon="📦" title="No Products" description="Add your first product to get started."
          action={<button className="btn-primary flex items-center gap-1.5" onClick={openCreate}><MdAdd size={18} /> Add Product</button>} />
      ) : view === 'grid' ? (
        // ── Grid ──
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="h-44 rounded-t-2xl bg-gray-200" />
                  <div className="space-y-2 p-3">
                    <div className="h-3.5 w-3/4 rounded bg-gray-200" />
                    <div className="h-3 w-1/2 rounded bg-gray-100" />
                    <div className="h-8 rounded-lg bg-gray-200" />
                  </div>
                </div>
              ))
            : list.map((p) => (
                <ProductCard key={p._id} p={p}
                  selected={selected.includes(p._id)}
                  onSelect={toggleSelect}
                  onEdit={openEdit}
                  onDelete={(id) => setDeleteModal({ open: true, id })}
                  onToggle={handleToggle}
                />
              ))}
        </div>
      ) : (
        // ── Table ──
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <button onClick={() => handleSort('title')} className="flex items-center gap-1 hover:text-gray-700">
                      Product <SortIcon field="title" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <button onClick={() => handleSort('price')} className="flex items-center gap-1 hover:text-gray-700">
                      Price <SortIcon field="price" />
                    </button>
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 md:table-cell">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <button onClick={() => handleSort('stock')} className="flex items-center gap-1 hover:text-gray-700">
                      Stock <SortIcon field="stock" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                  : list.map((p) => {
                      const discount = p.originalPrice && p.price
                        ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : null;
                      return (
                        <tr key={p._id} className={`transition-colors hover:bg-gray-50/60 ${selected.includes(p._id) ? 'bg-indigo-50' : ''}`}>
                          <td className="px-4 py-3">
                            <button onClick={() => toggleSelect(p._id)} className="text-gray-400 hover:text-indigo-600">
                              {selected.includes(p._id) ? <MdCheckBox size={16} className="text-indigo-600" /> : <MdCheckBoxOutlineBlank size={16} />}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-14 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 shadow-sm">
                                {p.images?.[0]
                                  ? <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                                  : <div className="flex h-full items-center justify-center"><MdImage size={18} className="text-gray-300" /></div>}
                              </div>
                              <div className="min-w-0">
                                <p className="line-clamp-1 text-sm font-semibold text-gray-900">{p.title}</p>
                                <p className="text-xs text-gray-400">{p.brand || 'No brand'}</p>
                                {p.tags?.length > 0 && (
                                  <div className="mt-0.5 flex flex-wrap gap-1">
                                    {p.tags.slice(0, 2).map((tag) => (
                                      <span key={tag} className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">{tag}</span>
                                    ))}
                                    {p.tags.length > 2 && <span className="text-[10px] text-gray-400">+{p.tags.length - 2}</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-bold text-gray-900">৳{p.price?.toLocaleString()}</p>
                            {p.originalPrice && (
                              <div className="flex items-center gap-1">
                                <p className="text-xs text-gray-400 line-through">৳{p.originalPrice?.toLocaleString()}</p>
                                {discount > 0 && (
                                  <span className="rounded-full bg-red-100 px-1 text-[10px] font-bold text-red-600">-{discount}%</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="hidden px-4 py-3 text-sm text-gray-600 md:table-cell">
                            {p.category?.name || p.category || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-bold ${(p.stock || 0) === 0 ? 'text-red-500' : (p.stock || 0) < 10 ? 'text-orange-500' : 'text-gray-700'}`}>
                              {p.stock ?? '—'}
                            </span>
                            {(p.stock || 0) < 10 && (p.stock || 0) > 0 && (
                              <p className="text-[10px] text-orange-500">Low stock</p>
                            )}
                            {(p.stock || 0) === 0 && (
                              <p className="text-[10px] text-red-500">Out of stock</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              p.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${p.isActive !== false ? 'bg-green-500' : 'bg-gray-400'}`} />
                              {p.isActive !== false ? 'Active' : 'Hidden'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => handleToggle(p._id)} title="Toggle status"
                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100">
                                {p.isActive !== false
                                  ? <MdToggleOn size={20} className="text-green-500" />
                                  : <MdToggleOff size={20} className="text-gray-400" />}
                              </button>
                              <button onClick={() => openEdit(p)}
                                className="rounded-lg p-1.5 text-blue-500 transition-colors hover:bg-blue-50">
                                <MdEdit size={15} />
                              </button>
                              <button onClick={() => setDeleteModal({ open: true, id: p._id })}
                                className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50">
                                <MdDelete size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-50 p-4">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </div>
      )}

      {/* Grid pagination */}
      {view === 'grid' && !loading && list.length > 0 && (
        <div className="border-t border-gray-100 pt-4">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}

      {/* ── Create/Edit Modal ── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editProduct ? 'Edit Product' : 'Add Product'} size="xl">
        <form onSubmit={handleSave} className="space-y-0">

          {/* Tabs */}
          <div className="-mt-1 mb-5 flex gap-1 border-b border-gray-100 pb-0">
            {[
              { id: 'basic', label: 'Basic Info' },
              { id: 'details', label: 'Details' },
              { id: 'variants', label: 'Sizes & Colors' },
              { id: 'media', label: 'Images' },
            ].map(({ id, label }) => (
              <button key={id} type="button" onClick={() => setActiveTab(id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Basic Tab */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="form-label">Title <span className="text-red-400">*</span></label>
                <input className="form-input" value={form.title} onChange={f('title')} placeholder="Product title" required />
              </div>
              <div>
                <label className="form-label">Price (৳) <span className="text-red-400">*</span></label>
                <input type="number" className="form-input" value={form.price} onChange={f('price')} placeholder="1299" required min="0" />
              </div>
              <div>
                <label className="form-label">Original Price (৳)</label>
                <input type="number" className="form-input" value={form.originalPrice} onChange={f('originalPrice')} placeholder="1850" min="0" />
                {form.price && form.originalPrice && form.originalPrice > form.price && (
                  <p className="mt-1 text-xs text-green-600">
                    {Math.round(((form.originalPrice - form.price) / form.originalPrice) * 100)}% discount
                  </p>
                )}
              </div>
              <div>
                <label className="form-label">Stock</label>
                <input type="number" className="form-input" value={form.stock} onChange={f('stock')} placeholder="50" min="0" />
              </div>
              <div>
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={f('category')}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Brand</label>
                <input className="form-input" value={form.brand} onChange={f('brand')} placeholder="Voyage" />
              </div>
              <div>
                <label className="form-label">Status</label>
                <div className="mt-1 flex gap-2">
                  {[{ v: true, l: 'Active' }, { v: false, l: 'Hidden' }].map(({ v, l }) => (
                    <button key={String(v)} type="button"
                      onClick={() => setForm({ ...form, isActive: v })}
                      className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                        form.isActive === v
                          ? v ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-300 bg-gray-100 text-gray-600'
                          : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={f('description')}
                  placeholder="Describe the product..." />
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Fabric</label>
                <input className="form-input" value={form.fabric} onChange={f('fabric')} placeholder="100% Cotton" />
              </div>
              <div>
                <label className="form-label">Care Instructions</label>
                <input className="form-input" value={form.care} onChange={f('care')} placeholder="Machine wash cold" />
              </div>
              <div className="col-span-2">
                <label className="form-label">Style Tips</label>
                <textarea className="form-input" rows={2} value={form.styleTips} onChange={f('styleTips')}
                  placeholder="Pair with slim-fit jeans and white sneakers..." />
              </div>
              <div className="col-span-2">
                <label className="form-label">Tags (comma separated)</label>
                <input className="form-input" value={form.tags} onChange={f('tags')} placeholder="Shirt, Casual, Cotton, Summer" />
                {form.tags && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {form.tags.split(',').map(t => t.trim()).filter(Boolean).map((tag) => (
                      <span key={tag} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Variants Tab */}
          {activeTab === 'variants' && (
            <div className="space-y-5">
              <SizeBuilder value={form.sizes} onChange={(v) => setForm({ ...form, sizes: v })} />
              <ColorPicker value={form.colors} onChange={(v) => setForm({ ...form, colors: v })} />
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <MultiImageUpload images={images} setImages={setImages} existingImages={editProduct?.images} />
          )}

          {/* Actions */}
          <div className="mt-5 flex gap-3 border-t border-gray-100 pt-5">
            {activeTab !== 'basic' && (
              <button type="button"
                onClick={() => setActiveTab(['basic', 'details', 'variants', 'media'][['basic', 'details', 'variants', 'media'].indexOf(activeTab) - 1])}
                className="btn-outline px-5">
                ← Back
              </button>
            )}
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline flex-1 justify-center">Cancel</button>
            {activeTab !== 'media' ? (
              <button type="button"
                onClick={() => setActiveTab(['basic', 'details', 'variants', 'media'][['basic', 'details', 'variants', 'media'].indexOf(activeTab) + 1])}
                className="btn-primary flex-1 justify-center">
                Next →
              </button>
            ) : (
              <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center gap-2">
                {saving && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}
              </button>
            )}
          </div>
        </form>
      </Modal>

      {/* ── Delete Modal ── */}
      <ConfirmModal
        open={deleteModal.open}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, id: null })}
      />

      {/* ── Bulk Delete Modal ── */}
      <ConfirmModal
        open={bulkDeleteModal}
        title={`Delete ${selected.length} Products`}
        message={`Are you sure? This will permanently delete ${selected.length} selected products.`}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteModal(false)}
      />
    </div>
  );
}