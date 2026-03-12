import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFlashDeals, createFlashDeal, updateFlashDeal, deleteFlashDeal } from '../redux/slices/flashDealSlice';
import { fetchProducts } from '../redux/slices/productSlice';
import { Table, Spinner, EmptyState, ConfirmModal, Modal, Badge } from '../components/common';
import {
  MdAdd, MdEdit, MdDelete, MdFlashOn, MdSearch, MdClose, MdFilterList,
  MdCheckBox, MdCheckBoxOutlineBlank, MdIndeterminateCheckBox,
  MdToggleOn, MdToggleOff, MdArrowUpward, MdArrowDownward,
  MdImage, MdRefresh, MdAccessTime,
} from 'react-icons/md';
import toast from 'react-hot-toast';

const EMPTY = { product: '', discountPercent: '', startTime: '', endTime: '', isActive: true };

// ─── Live Countdown ────────────────────────────────────────────────────────────
const Countdown = ({ startTime, endTime }) => {
  const [label, setLabel] = useState('');
  const [phase, setPhase] = useState(''); // 'upcoming' | 'live' | 'expired'

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const start = startTime ? new Date(startTime) : null;
      const end = endTime ? new Date(endTime) : null;

      if (end && now > end) {
        setPhase('expired');
        setLabel('Expired');
        return;
      }
      if (start && now < start) {
        const diff = start - now;
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        setPhase('upcoming');
        setLabel(d > 0 ? `Starts in ${d}d ${h}h` : `Starts in ${h}h ${m}m`);
        return;
      }
      if (end) {
        const diff = end - now;
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setPhase('live');
        setLabel(d > 0 ? `${d}d ${h}h ${m}m left` : h > 0 ? `${h}h ${m}m left` : `${m}m ${s}s left`);
        return;
      }
      setPhase('live');
      setLabel('Live');
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [startTime, endTime]);

  if (!label) return null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
      phase === 'live' ? 'bg-green-100 text-green-700 animate-pulse' :
      phase === 'upcoming' ? 'bg-blue-100 text-blue-700' :
      'bg-red-100 text-red-600'}`}>
      <MdAccessTime size={10} />
      {label}
    </span>
  );
};

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ item }) => {
  const now = new Date();
  const start = item.startTime ? new Date(item.startTime) : null;
  const end = item.endTime ? new Date(item.endTime) : null;
  const expired = end && now > end;
  const upcoming = start && now < start;
  const active = item.isActive !== false;

  if (expired) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Expired
    </span>
  );
  if (!active) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" /> Hidden
    </span>
  );
  if (upcoming) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Upcoming
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" /> Live
    </span>
  );
};

// ─── Product Search Select ─────────────────────────────────────────────────────
const ProductSearchSelect = ({ products, value, onChange }) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const selected = products.find((p) => p._id === value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <label className="form-label">Product <span className="text-red-400">*</span></label>
      <button type="button" onClick={() => setOpen(!open)}
        className="form-input flex w-full items-center gap-2 text-left">
        {selected ? (
          <>
            <div className="h-7 w-6 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {selected.images?.[0]
                ? <img src={selected.images[0]} alt="" className="h-full w-full object-cover" />
                : <div className="flex h-full items-center justify-center"><MdImage size={10} className="text-gray-300" /></div>}
            </div>
            <span className="flex-1 truncate text-sm text-gray-800">{selected.title}</span>
            <span className="flex-shrink-0 text-xs text-gray-400">৳{selected.price?.toLocaleString()}</span>
          </>
        ) : (
          <span className="text-sm text-gray-400">Select a product...</span>
        )}
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-100 p-2">
            <div className="relative">
              <MdSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-lg border border-gray-200 py-1.5 pl-8 pr-3 text-xs focus:border-indigo-400 focus:outline-none" />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="p-3 text-center text-xs text-gray-400">No products found</p>
            ) : filtered.map((p) => (
              <button key={p._id} type="button"
                onClick={() => { onChange(p._id); setOpen(false); setSearch(''); }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${value === p._id ? 'bg-indigo-50' : ''}`}>
                <div className="h-9 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                    : <div className="flex h-full items-center justify-center"><MdImage size={12} className="text-gray-300" /></div>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-gray-800">{p.title}</p>
                  <p className="text-[10px] text-gray-400">{p.brand || p.category?.name || '—'}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs font-bold text-gray-700">৳{p.price?.toLocaleString()}</p>
                  {p.stock !== undefined && (
                    <p className={`text-[10px] ${(p.stock || 0) < 10 ? 'text-orange-500' : 'text-gray-400'}`}>
                      Stock: {p.stock}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Skeleton Row ──────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-50">
    <td className="px-4 py-3"><div className="h-4 w-4 rounded bg-gray-200" /></td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="h-12 w-10 rounded-lg bg-gray-200" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-32 rounded bg-gray-200" />
          <div className="h-3 w-20 rounded bg-gray-100" />
        </div>
      </div>
    </td>
    <td className="px-4 py-3"><div className="h-6 w-12 rounded bg-gray-200" /></td>
    <td className="px-4 py-3"><div className="h-3 w-24 rounded bg-gray-200" /></td>
    <td className="px-4 py-3"><div className="h-3 w-24 rounded bg-gray-200" /></td>
    <td className="px-4 py-3"><div className="h-5 w-16 rounded-full bg-gray-200" /></td>
    <td className="px-4 py-3"><div className="h-8 w-16 rounded-lg bg-gray-200" /></td>
  </tr>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function FlashDealsPage() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.flashDeals);
  const { list: products } = useSelector((s) => s.products);

  // UI
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('endTime');
  const [sortDir, setSortDir] = useState('asc');

  // Selection
  const [selected, setSelected] = useState([]);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

  // Form
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchFlashDeals());
    dispatch(fetchProducts({ limit: 200 }));
  }, [dispatch]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getDealPhase = (item) => {
    const now = new Date();
    const start = item.startTime ? new Date(item.startTime) : null;
    const end = item.endTime ? new Date(item.endTime) : null;
    if (end && now > end) return 'expired';
    if (item.isActive === false) return 'hidden';
    if (start && now < start) return 'upcoming';
    return 'live';
  };

  // ── Filtering & Sorting ───────────────────────────────────────────────────
  const filtered = list
    .filter((item) => {
      const title = item.product?.title || '';
      const matchSearch = title.toLowerCase().includes(search.toLowerCase());
      const phase = getDealPhase(item);
      const matchStatus = filterStatus === 'all' ? true : phase === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let va, vb;
      if (sortBy === 'discount') { va = a.discountPercent; vb = b.discountPercent; }
      else if (sortBy === 'endTime') { va = new Date(a.endTime || 0); vb = new Date(b.endTime || 0); }
      else if (sortBy === 'startTime') { va = new Date(a.startTime || 0); vb = new Date(b.startTime || 0); }
      else { va = a.product?.title || ''; vb = b.product?.title || ''; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  // ── Selection ─────────────────────────────────────────────────────────────
  const allSelected = filtered.length > 0 && filtered.every((i) => selected.includes(i._id));
  const someSelected = selected.length > 0 && !allSelected;
  const toggleSelect = (id) => setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => allSelected ? setSelected([]) : setSelected(filtered.map(i => i._id));

  // ── Counts ────────────────────────────────────────────────────────────────
  const liveCount = list.filter((i) => getDealPhase(i) === 'live').length;
  const upcomingCount = list.filter((i) => getDealPhase(i) === 'upcoming').length;
  const expiredCount = list.filter((i) => getDealPhase(i) === 'expired').length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const openCreate = () => { setEditItem(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      product: item.product?._id || item.product,
      discountPercent: item.discountPercent,
      startTime: item.startTime?.slice(0, 16) || '',
      endTime: item.endTime?.slice(0, 16) || '',
      isActive: item.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.product) return toast.error('Please select a product');
    if (!form.discountPercent) return toast.error('Discount is required');
    if (form.startTime && form.endTime && new Date(form.startTime) >= new Date(form.endTime))
      return toast.error('End time must be after start time');
    setSaving(true);
    try {
      if (editItem) {
        await dispatch(updateFlashDeal({ id: editItem._id, body: form })).unwrap();
        toast.success('Flash deal updated!');
      } else {
        await dispatch(createFlashDeal(form)).unwrap();
        toast.success('Flash deal created!');
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
      await dispatch(deleteFlashDeal(deleteModal.id)).unwrap();
      toast.success('Deleted');
      setDeleteModal({ open: false, id: null });
      setSelected(prev => prev.filter(x => x !== deleteModal.id));
    } catch { toast.error('Delete failed'); }
  };

  const handleBulkDelete = async () => {
    const results = await Promise.allSettled(
      selected.map(id => dispatch(deleteFlashDeal(id)).unwrap())
    );
    const ok = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.length - ok;
    if (ok) toast.success(`${ok} deal${ok > 1 ? 's' : ''} deleted`);
    if (failed) toast.error(`${failed} failed`);
    setSelected([]);
    setBulkDeleteModal(false);
  };

  const handleToggle = async (item) => {
    try {
      await dispatch(updateFlashDeal({
        id: item._id,
        body: { ...item, product: item.product?._id || item.product, isActive: item.isActive === false ? true : false },
      })).unwrap();
      toast.success(item.isActive === false ? 'Deal activated' : 'Deal hidden');
    } catch { toast.error('Failed'); }
  };

  const handleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => sortBy !== field ? null
    : sortDir === 'asc' ? <MdArrowUpward size={12} /> : <MdArrowDownward size={12} />;

  // ── Selected product preview in form ─────────────────────────────────────
  const selectedProduct = products.find(p => p._id === form.product);
  const previewDiscount = form.discountPercent && selectedProduct?.price
    ? Math.round(selectedProduct.price * (1 - form.discountPercent / 100))
    : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{list.length}</span> flash deals
          </p>
          {liveCount > 0 && (
            <span className="animate-pulse rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
              ⚡ {liveCount} live
            </span>
          )}
          {upcomingCount > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              🕐 {upcomingCount} upcoming
            </span>
          )}
          {expiredCount > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
              {expiredCount} expired
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selected.length > 0 && (
            <button onClick={() => setBulkDeleteModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100">
              <MdDelete size={13} /> Delete {selected.length}
            </button>
          )}
          <button className="btn-primary flex items-center gap-1.5" onClick={openCreate}>
            <MdFlashOn size={18} /> Add Flash Deal
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative min-w-[160px] max-w-xs flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product name..."
            className="form-input py-2 pl-9 pr-8 text-sm" />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <MdClose size={14} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {[
            { v: 'all', l: 'All' },
            { v: 'live', l: '⚡ Live' },
            { v: 'upcoming', l: '🕐 Upcoming' },
            { v: 'hidden', l: 'Hidden' },
            { v: 'expired', l: '⛔ Expired' },
          ].map(({ v, l }) => (
            <button key={v} onClick={() => setFilterStatus(v)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                filterStatus === v ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Select all */}
        {filtered.length > 0 && (
          <button onClick={toggleAll} title="Select all"
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition-colors hover:text-indigo-600">
            {allSelected ? <MdCheckBox size={16} className="text-indigo-600" />
              : someSelected ? <MdIndeterminateCheckBox size={16} className="text-indigo-400" />
              : <MdCheckBoxOutlineBlank size={16} />}
          </button>
        )}

        {/* Refresh */}
        <button onClick={() => dispatch(fetchFlashDeals())}
          className="rounded-lg border border-gray-200 bg-white p-2 text-gray-400 transition-colors hover:text-indigo-600" title="Refresh">
          <MdRefresh size={16} />
        </button>
      </div>

      {/* ── Results info ── */}
      {(search || filterStatus !== 'all') && (
        <p className="text-xs text-gray-400">
          Showing <span className="font-medium text-gray-700">{filtered.length}</span> of {list.length}
          {' · '}
          <button onClick={() => { setSearch(''); setFilterStatus('all'); }}
            className="text-indigo-500 hover:underline">Clear</button>
        </p>
      )}

      {/* ── Table ── */}
      {list.length === 0 && !loading ? (
        <EmptyState icon="⚡" title="No Flash Deals"
          description="Create limited-time flash deals to boost sales."
          action={<button className="btn-primary flex items-center gap-1.5" onClick={openCreate}><MdAdd size={18} /> Add Deal</button>} />
      ) : filtered.length === 0 && !loading ? (
        <EmptyState icon="🔍" title="No Results"
          description={`No deals match your filter.`}
          action={<button className="btn-outline" onClick={() => { setSearch(''); setFilterStatus('all'); }}>Clear Filters</button>} />
      ) : (
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
                    <button onClick={() => handleSort('discount')} className="flex items-center gap-1 hover:text-gray-700">
                      Discount <SortIcon field="discount" />
                    </button>
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 md:table-cell">
                    <button onClick={() => handleSort('startTime')} className="flex items-center gap-1 hover:text-gray-700">
                      Start <SortIcon field="startTime" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <button onClick={() => handleSort('endTime')} className="flex items-center gap-1 hover:text-gray-700">
                      End / Timer <SortIcon field="endTime" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  : filtered.map((item) => {
                      const phase = getDealPhase(item);
                      const product = item.product;
                      return (
                        <tr key={item._id}
                          className={`transition-colors hover:bg-gray-50/60 ${selected.includes(item._id) ? 'bg-indigo-50' : ''} ${phase === 'expired' ? 'opacity-60' : ''}`}>
                          <td className="px-4 py-3">
                            <button onClick={() => toggleSelect(item._id)} className="text-gray-400 hover:text-indigo-600">
                              {selected.includes(item._id)
                                ? <MdCheckBox size={16} className="text-indigo-600" />
                                : <MdCheckBoxOutlineBlank size={16} />}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 shadow-sm">
                                {product?.images?.[0]
                                  ? <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                                  : <div className="flex h-full items-center justify-center"><MdImage size={14} className="text-gray-300" /></div>}
                              </div>
                              <div className="min-w-0">
                                <p className="line-clamp-1 text-sm font-semibold text-gray-800">{product?.title || 'N/A'}</p>
                                <p className="text-xs text-gray-400">{product?.brand || product?.category?.name || '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="text-xl font-black leading-none text-orange-500">{item.discountPercent}%</span>
                              <span className="text-[10px] text-gray-400">off</span>
                              {product?.price && (
                                <span className="text-xs font-semibold text-indigo-700">
                                  ৳{Math.round(product.price * (1 - item.discountPercent / 100)).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 text-xs text-gray-500 md:table-cell">
                            {item.startTime ? new Date(item.startTime).toLocaleString('en-BD', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500">
                                {item.endTime ? new Date(item.endTime).toLocaleString('en-BD', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                              </p>
                              <Countdown startTime={item.startTime} endTime={item.endTime} />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge item={item} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => handleToggle(item)} title="Toggle status"
                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100">
                                {item.isActive !== false
                                  ? <MdToggleOn size={20} className="text-green-500" />
                                  : <MdToggleOff size={20} />}
                              </button>
                              <button onClick={() => openEdit(item)}
                                className="rounded-lg p-1.5 text-blue-500 transition-colors hover:bg-blue-50">
                                <MdEdit size={15} />
                              </button>
                              <button onClick={() => setDeleteModal({ open: true, id: item._id })}
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
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Flash Deal' : 'Add Flash Deal'}>
        <form onSubmit={handleSave} className="space-y-4">

          {/* Product Search */}
          <ProductSearchSelect
            products={products}
            value={form.product}
            onChange={(id) => setForm({ ...form, product: id })}
          />

          {/* Product preview */}
          {selectedProduct && (
            <div className="flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50 px-3 py-2">
              <div className="h-10 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-orange-100">
                {selectedProduct.images?.[0]
                  ? <img src={selectedProduct.images[0]} alt="" className="h-full w-full object-cover" />
                  : <div className="flex h-full items-center justify-center"><MdImage size={14} className="text-orange-300" /></div>}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">{selectedProduct.title}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-xs text-gray-500">৳{selectedProduct.price?.toLocaleString()}</span>
                  {previewDiscount && (
                    <>
                      <span className="text-gray-300">→</span>
                      <span className="text-sm font-bold text-orange-600">৳{previewDiscount.toLocaleString()}</span>
                      {form.discountPercent > 0 && (
                        <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          -{form.discountPercent}%
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Discount */}
          <div>
            <label className="form-label">Discount % <span className="text-red-400">*</span></label>
            <div className="relative">
              <input type="number" min="1" max="99" className="form-input pr-10"
                value={form.discountPercent} onChange={f('discountPercent')} placeholder="30" required />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg font-black text-orange-400">%</span>
            </div>
            {form.discountPercent > 0 && (
              <div className="mt-1.5 flex items-center gap-1">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full rounded-full bg-orange-500 transition-all"
                    style={{ width: `${Math.min(form.discountPercent, 99)}%` }} />
                </div>
                <span className="text-xs font-bold text-orange-500">{form.discountPercent}% OFF</span>
              </div>
            )}
          </div>

          {/* Start & End */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Start Time</label>
              <input type="datetime-local" className="form-input" value={form.startTime} onChange={f('startTime')} />
            </div>
            <div>
              <label className="form-label">End Time</label>
              <input type="datetime-local" className="form-input" value={form.endTime} onChange={f('endTime')} />
              {form.endTime && new Date(form.endTime) < new Date() && (
                <p className="mt-1 text-[11px] text-red-500">⚠ End time is in the past</p>
              )}
              {form.startTime && form.endTime && new Date(form.endTime) <= new Date(form.startTime) && (
                <p className="mt-1 text-[11px] text-red-500">⚠ Must be after start time</p>
              )}
            </div>
          </div>

          {/* Duration preview */}
          {form.startTime && form.endTime && new Date(form.endTime) > new Date(form.startTime) && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
              ⏱ Duration: {(() => {
                const diff = new Date(form.endTime) - new Date(form.startTime);
                const d = Math.floor(diff / 86400000);
                const h = Math.floor((diff % 86400000) / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                return d > 0 ? `${d} day${d > 1 ? 's' : ''} ${h}h ${m}m` : h > 0 ? `${h}h ${m}m` : `${m} minutes`;
              })()}
            </div>
          )}

          {/* Status */}
          <div>
            <label className="form-label">Status</label>
            <div className="mt-1 flex gap-2">
              {[{ v: true, l: '⚡ Active' }, { v: false, l: 'Hidden' }].map(({ v, l }) => (
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

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center gap-2">
              {saving && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {saving ? 'Saving...' : editItem ? 'Update Deal' : 'Create Deal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Modal ── */}
      <ConfirmModal open={deleteModal.open} title="Delete Flash Deal"
        message="Are you sure you want to delete this flash deal?"
        onConfirm={handleDelete} onCancel={() => setDeleteModal({ open: false, id: null })} />

      {/* ── Bulk Delete Modal ── */}
      <ConfirmModal open={bulkDeleteModal} title={`Delete ${selected.length} Flash Deals`}
        message={`Permanently delete ${selected.length} selected flash deals?`}
        onConfirm={handleBulkDelete} onCancel={() => setBulkDeleteModal(false)} />
    </div>
  );
}