import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSpecialOffers, createSpecialOffer, updateSpecialOffer, deleteSpecialOffer,
} from '../redux/slices/specialOfferSlice';
import { fetchProducts } from '../redux/slices/productSlice';
import { Spinner, EmptyState, ConfirmModal, Modal, Badge } from '../components/common';
import {
  MdAdd, MdEdit, MdDelete, MdSearch, MdClose, MdImage, MdCheckBox,
  MdCheckBoxOutlineBlank, MdTimerOff, MdVisibility, MdVisibilityOff,
  MdLocalOffer, MdDragIndicator, MdExpandMore, MdExpandLess, MdFilterList,
} from 'react-icons/md';
import toast from 'react-hot-toast';

const EMPTY = { title: '', subtitle: '', discount: '', couponCode: '', validUntil: '', isActive: true };

// ─── Countdown Timer ───────────────────────────────────────────────────────────
const Countdown = ({ until }) => {
  const [time, setTime] = useState('');
  useEffect(() => {
    const calc = () => {
      const diff = new Date(until) - new Date();
      if (diff <= 0) return setTime('Expired');
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTime(d > 0 ? `${d}d ${h}h left` : `${h}h ${m}m left`);
    };
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [until]);
  const expired = time === 'Expired';
  return (
    <span className={`text-xs font-medium ${expired ? 'text-red-500' : 'text-orange-500'}`}>
      {expired ? '⛔ Expired' : `⏱ ${time}`}
    </span>
  );
};

// ─── Image Upload Preview ──────────────────────────────────────────────────────
const ImageUpload = ({ image, setImage, existingImage }) => {
  const [preview, setPreview] = useState(null);
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    setImage(file);
    const r = new FileReader();
    r.onload = (e) => setPreview(e.target.result);
    r.readAsDataURL(file);
  };

  const clear = () => { setImage(null); setPreview(null); };
  const display = preview || (existingImage && !image ? existingImage : null);

  return (
    <div>
      <label className="form-label">Banner Image</label>
      {display ? (
        <div className="relative inline-block">
          <img src={display} alt="preview" className="h-24 w-full max-w-xs rounded-xl border border-gray-200 object-cover shadow-sm" />
          <button type="button" onClick={clear}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white shadow hover:bg-red-600">
            <MdClose size={12} />
          </button>
          <button type="button" onClick={() => inputRef.current.click()}
            className="mt-1 block text-xs text-indigo-500 hover:underline">Change</button>
        </div>
      ) : (
        <div onClick={() => inputRef.current.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-5 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50">
          <MdImage size={26} className="text-gray-300" />
          <p className="mt-1 text-xs text-gray-400">Click or drag & drop</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => handleFile(e.target.files[0])} />
    </div>
  );
};

// ─── Product Selector ──────────────────────────────────────────────────────────
const ProductSelector = ({ selectedIds, onChange }) => {
  const { list: allProducts } = useSelector((s) => s.products);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = allProducts.filter(
    (p) => p.title.toLowerCase().includes(search.toLowerCase()) && p.isActive !== false
  );

  const toggle = (id) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  };

  const selectedProducts = allProducts.filter((p) => selectedIds.includes(p._id));

  return (
    <div>
      <label className="form-label">Linked Products</label>
      <p className="mb-1.5 text-[11px] text-gray-400">Products that will show under this offer</p>

      {/* Selected chips */}
      {selectedProducts.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selectedProducts.map((p) => (
            <div key={p._id}
              className="flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 py-0.5 pl-1 pr-2">
              {p.images?.[0]
                ? <img src={p.images[0]} alt="" className="h-5 w-5 rounded-full object-cover" />
                : <div className="h-5 w-5 rounded-full bg-indigo-200" />}
              <span className="max-w-[120px] truncate text-xs text-indigo-700">{p.title}</span>
              <button type="button" onClick={() => toggle(p._id)}
                className="text-indigo-400 transition-colors hover:text-red-500">
                <MdClose size={12} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => onChange([])}
            className="self-center text-[11px] text-red-400 transition-colors hover:text-red-600">
            Clear all
          </button>
        </div>
      )}

      {/* Dropdown toggle */}
      <button type="button" onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition-colors hover:border-indigo-400">
        <span>{selectedIds.length > 0 ? `${selectedIds.length} product(s) selected` : 'Select products...'}</span>
        {open ? <MdExpandLess size={16} /> : <MdExpandMore size={16} />}
      </button>

      {open && (
        <div className="mt-1 rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 p-2">
            <div className="relative">
              <MdSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-lg border border-gray-200 py-1.5 pl-8 pr-3 text-xs focus:border-indigo-400 focus:outline-none" />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="p-3 text-center text-xs text-gray-400">No products found</p>
            ) : filtered.map((p) => (
              <button key={p._id} type="button" onClick={() => toggle(p._id)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-gray-50">
                <div className="text-indigo-600">
                  {selectedIds.includes(p._id)
                    ? <MdCheckBox size={16} />
                    : <MdCheckBoxOutlineBlank size={16} className="text-gray-300" />}
                </div>
                <div className="h-8 w-7 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                    : <div className="flex h-full items-center justify-center text-gray-300"><MdImage size={12} /></div>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-gray-800">{p.title}</p>
                  <p className="text-[10px] text-gray-400">৳{p.price?.toLocaleString()}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Offer Card ────────────────────────────────────────────────────────────────
const OfferCard = ({ item, allProducts, onEdit, onDelete, onToggle }) => {
  const [expanded, setExpanded] = useState(false);
  const linked = allProducts.filter((p) => (item.products || []).includes(p._id));
  const isExpired = item.validUntil && new Date(item.validUntil) < new Date();

  return (
    <div className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${
      isExpired ? 'border-red-100 opacity-80' : 'border-gray-100 hover:shadow-md'}`}>
      {/* Main row */}
      <div className="flex items-center gap-4 p-4">
        {/* Banner image */}
        <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100">
          {item.image
            ? <img src={item.image} alt="" className="h-full w-full object-cover" />
            : (
              <div className="flex h-full items-center justify-center">
                <MdLocalOffer size={24} className="text-indigo-300" />
              </div>
            )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-gray-900">{item.title}</h3>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              item.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${item.isActive !== false ? 'bg-green-500' : 'bg-gray-400'}`} />
              {item.isActive !== false ? 'Active' : 'Hidden'}
            </span>
            {isExpired && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">Expired</span>
            )}
          </div>

          {item.subtitle && <p className="mt-0.5 text-sm text-gray-500">{item.subtitle}</p>}

          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            {item.discount && (
              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-600">
                🔥 {item.discount}% OFF
              </span>
            )}
            {item.couponCode && (
              <span className="rounded-lg border border-dashed border-indigo-300 bg-indigo-50 px-2 py-0.5 font-mono text-xs font-bold text-indigo-700">
                {item.couponCode}
              </span>
            )}
            {item.validUntil && <Countdown until={item.validUntil} />}
            {linked.length > 0 && (
              <button type="button" onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-indigo-500 transition-colors hover:underline">
                {expanded ? <MdExpandLess size={14} /> : <MdExpandMore size={14} />}
                {linked.length} product{linked.length > 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-1">
          <button onClick={() => onToggle(item)}
            title={item.isActive !== false ? 'Hide offer' : 'Activate offer'}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100">
            {item.isActive !== false
              ? <MdVisibilityOff size={16} />
              : <MdVisibility size={16} />}
          </button>
          <button onClick={() => onEdit(item)}
            className="rounded-lg p-2 text-blue-500 transition-colors hover:bg-blue-50">
            <MdEdit size={16} />
          </button>
          <button onClick={() => onDelete(item._id)}
            className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50">
            <MdDelete size={16} />
          </button>
        </div>
      </div>

      {/* Linked products expanded */}
      {expanded && linked.length > 0 && (
        <div className="border-t border-gray-50 bg-gray-50 px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Linked Products</p>
          <div className="flex flex-wrap gap-2">
            {linked.map((p) => (
              <div key={p._id}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2 py-1.5 shadow-sm">
                <div className="h-8 w-7 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                    : <div className="flex h-full items-center justify-center"><MdImage size={12} className="text-gray-300" /></div>}
                </div>
                <div>
                  <p className="max-w-[120px] truncate text-xs font-medium text-gray-800">{p.title}</p>
                  <p className="text-[10px] text-gray-400">৳{p.price?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="flex animate-pulse items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
    <div className="h-16 w-24 flex-shrink-0 rounded-xl bg-gray-200" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-1/3 rounded bg-gray-200" />
      <div className="h-3 w-1/2 rounded bg-gray-100" />
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-full bg-gray-200" />
        <div className="h-5 w-20 rounded-full bg-gray-100" />
      </div>
    </div>
    <div className="flex gap-1">
      <div className="h-8 w-8 rounded-lg bg-gray-200" />
      <div className="h-8 w-8 rounded-lg bg-gray-200" />
    </div>
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SpecialOffersPage() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.specialOffers);
  const { list: allProducts } = useSelector((s) => s.products);

  // UI
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  // Form
  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { dispatch(fetchSpecialOffers()); }, [dispatch]);
  useEffect(() => { dispatch(fetchProducts({ limit: 100 })); }, [dispatch]);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = list
    .filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.subtitle || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.couponCode || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' ? true
        : filterStatus === 'active' ? item.isActive !== false
        : filterStatus === 'hidden' ? item.isActive === false
        : filterStatus === 'expired' ? (item.validUntil && new Date(item.validUntil) < new Date())
        : true;
      return matchSearch && matchStatus;
    });

  const activeCount = list.filter((i) => i.isActive !== false).length;
  const expiredCount = list.filter((i) => i.validUntil && new Date(i.validUntil) < new Date()).length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY);
    setImage(null);
    setSelectedProducts([]);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      title: item.title,
      subtitle: item.subtitle || '',
      discount: item.discount || '',
      couponCode: item.couponCode || '',
      validUntil: item.validUntil?.split('T')[0] || '',
      isActive: item.isActive !== false,
    });
    setSelectedProducts(item.products || []);
    setImage(null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append('image', image);
    selectedProducts.forEach((id) => fd.append('products[]', id));
    try {
      if (editItem) {
        await dispatch(updateSpecialOffer({ id: editItem._id, formData: fd })).unwrap();
        toast.success('Offer updated!');
      } else {
        await dispatch(createSpecialOffer(fd)).unwrap();
        toast.success('Offer created!');
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
      await dispatch(deleteSpecialOffer(deleteModal.id)).unwrap();
      toast.success('Offer deleted');
      setDeleteModal({ open: false, id: null });
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleToggle = async (item) => {
    const fd = new FormData();
    Object.entries({
      title: item.title,
      subtitle: item.subtitle || '',
      discount: item.discount || '',
      couponCode: item.couponCode || '',
      validUntil: item.validUntil?.split('T')[0] || '',
      isActive: String(item.isActive === false ? true : false),
    }).forEach(([k, v]) => fd.append(k, v));
    (item.products || []).forEach((id) => fd.append('products[]', id));
    try {
      await dispatch(updateSpecialOffer({ id: item._id, formData: fd })).unwrap();
      toast.success(item.isActive === false ? 'Offer activated' : 'Offer hidden');
    } catch {
      toast.error('Failed to update status');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{list.length}</span> offers
          </p>
          {activeCount > 0 && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              {activeCount} active
            </span>
          )}
          {expiredCount > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
              {expiredCount} expired
            </span>
          )}
        </div>
        <button className="btn-primary flex items-center gap-1.5" onClick={openCreate}>
          <MdAdd size={18} /> Add Offer
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative min-w-[180px] max-w-sm flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, coupon code..."
            className="form-input py-2 pl-9 pr-8 text-sm" />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <MdClose size={14} />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {[
            { v: 'all', l: 'All' },
            { v: 'active', l: 'Active' },
            { v: 'hidden', l: 'Hidden' },
            { v: 'expired', l: '⛔ Expired' },
          ].map(({ v, l }) => (
            <button key={v} onClick={() => setFilterStatus(v)}
              className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                filterStatus === v ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results info ── */}
      {(search || filterStatus !== 'all') && filtered.length !== list.length && (
        <p className="text-xs text-gray-400">
          Showing <span className="font-medium text-gray-700">{filtered.length}</span> of {list.length} offers
          {' · '}
          <button onClick={() => { setSearch(''); setFilterStatus('all'); }}
            className="text-indigo-500 hover:underline">Clear filters</button>
        </p>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : list.length === 0 ? (
        <EmptyState icon="🎁" title="No Special Offers" description="Create your first special offer to attract customers."
          action={
            <button className="btn-primary flex items-center gap-1.5" onClick={openCreate}>
              <MdAdd size={18} /> Add Offer
            </button>} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="No Results"
          description={`No offers match "${search || filterStatus}".`}
          action={
            <button className="btn-outline" onClick={() => { setSearch(''); setFilterStatus('all'); }}>
              Clear Filters
            </button>} />
      ) : (
        <div className="grid gap-4">
          {filtered.map((item) => (
            <OfferCard
              key={item._id}
              item={item}
              allProducts={allProducts}
              onEdit={openEdit}
              onDelete={(id) => setDeleteModal({ open: true, id })}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Offer' : 'Add Special Offer'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">

          {/* Title */}
          <div>
            <label className="form-label">Title <span className="text-red-400">*</span></label>
            <input className="form-input" value={form.title} onChange={f('title')}
              placeholder="e.g. Summer Sale 2025" required />
          </div>

          {/* Subtitle */}
          <div>
            <label className="form-label">Subtitle</label>
            <input className="form-input" value={form.subtitle} onChange={f('subtitle')}
              placeholder="e.g. Up to 50% off on selected items" />
          </div>

          {/* Discount + Coupon */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Discount (%)</label>
              <input type="number" className="form-input" value={form.discount} onChange={f('discount')}
                placeholder="30" min="0" max="100" />
              {form.discount > 0 && (
                <p className="mt-1 text-xs font-semibold text-orange-500">🔥 {form.discount}% OFF</p>
              )}
            </div>
            <div>
              <label className="form-label">Coupon Code</label>
              <input className="form-input font-mono uppercase tracking-widest" value={form.couponCode}
                onChange={(e) => setForm({ ...form, couponCode: e.target.value.toUpperCase() })}
                placeholder="SUMMER30" />
            </div>
          </div>

          {/* Valid Until + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Valid Until</label>
              <input type="date" className="form-input" value={form.validUntil} onChange={f('validUntil')}
                min={new Date().toISOString().split('T')[0]} />
              {form.validUntil && new Date(form.validUntil) < new Date() && (
                <p className="mt-1 text-xs text-red-500">⚠ This date is in the past</p>
              )}
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
          </div>

          {/* Image */}
          <ImageUpload image={image} setImage={setImage} existingImage={editItem?.image} />

          {/* Product Selector */}
          <ProductSelector selectedIds={selectedProducts} onChange={setSelectedProducts} />

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center gap-2">
              {saving && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {saving ? 'Saving...' : editItem ? 'Update Offer' : 'Create Offer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Modal ── */}
      <ConfirmModal
        open={deleteModal.open}
        title="Delete Offer"
        message="Are you sure you want to delete this offer? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, id: null })}
      />
    </div>
  );
}