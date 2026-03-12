import React, { useState, useEffect, useRef } from 'react';
import {
  MdAdd, MdEdit, MdDelete, MdClose, MdRefresh, MdVisibility,
  MdCheckCircle, MdArrowUpward, MdArrowDownward,
  MdImage, MdCheckBox, MdCheckBoxOutlineBlank,
  MdIndeterminateCheckBox, MdSlideshow,
} from 'react-icons/md';
import toast from 'react-hot-toast';

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const API_BASE = 'https://localhost:5000/api'; // ← change to your base URL

// ─── API HELPERS ───────────────────────────────────────────────────────────────
const api = {
  getSlides: () =>
    fetch(`${API_BASE}/hero`).then((r) => {
      if (!r.ok) throw new Error(`GET /hero failed: ${r.status}`);
      return r.json();
    }),
  createSlide: (fd) =>
    fetch(`${API_BASE}/hero`, { method: 'POST', body: fd }).then((r) => {
      if (!r.ok) throw new Error(`POST /hero failed: ${r.status}`);
      return r.json();
    }),
  updateSlide: (id, fd) =>
    fetch(`${API_BASE}/hero/${id}`, { method: 'PUT', body: fd }).then((r) => {
      if (!r.ok) throw new Error(`PUT /hero/${id} failed: ${r.status}`);
      return r.json();
    }),
  deleteSlide: (id) =>
    fetch(`${API_BASE}/hero/${id}`, { method: 'DELETE' }).then((r) => {
      if (!r.ok) throw new Error(`DELETE /hero/${id} failed: ${r.status}`);
      return r.json();
    }),
  reorderSlides: (ids) =>
    fetch(`${API_BASE}/hero/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    }).then((r) => {
      if (!r.ok) throw new Error(`PATCH /hero/reorder failed: ${r.status}`);
      return r.json();
    }),
};

// ─── DUMMY DATA ────────────────────────────────────────────────────────────────
const dummySlides = [
  { _id: '1', title: 'Spring Collection', description: 'Fresh styles for the new season.', image: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=600&q=80', active: true, order: 0 },
  { _id: '2', title: 'Summer Sale', description: 'Up to 50% off on select items!', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80', active: true, order: 1 },
  { _id: '3', title: 'New Arrivals', description: 'Check out the latest trends.', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80', active: false, order: 2 },
];

// ─── STAT CARD ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color }) => (
  <div className={`rounded-2xl border ${color} bg-white p-4 shadow-sm`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="mt-0.5 text-2xl font-black text-gray-900">{value}</p>
      </div>
      <div className="text-2xl">{icon}</div>
    </div>
  </div>
);

// ─── SKELETON ROW ──────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-50">
    <td className="px-4 py-3"><div className="h-4 w-4 rounded bg-gray-200" /></td>
    <td className="px-4 py-3"><div className="h-4 w-4 rounded bg-gray-200" /></td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="h-12 w-16 rounded-xl bg-gray-200" />
        <div className="h-3.5 w-28 rounded bg-gray-200" />
      </div>
    </td>
    <td className="px-4 py-3"><div className="h-3 w-40 rounded bg-gray-100" /></td>
    <td className="px-4 py-3"><div className="h-5 w-16 rounded-full bg-gray-200" /></td>
    <td className="px-4 py-3"><div className="h-3 w-16 rounded bg-gray-200" /></td>
    <td className="px-4 py-3"><div className="h-8 w-20 rounded-lg bg-gray-200" /></td>
  </tr>
);

// ─── SLIDE FORM MODAL ──────────────────────────────────────────────────────────
const SlideModal = ({ slide, open, onClose, onSave, saving }) => {
  const isEdit = !!slide?._id;
  const [form, setForm] = useState({ title: '', description: '', active: true, imageFile: null, imagePreview: '' });
  const fileRef = useRef();

  useEffect(() => {
    if (open) {
      setForm({
        title: slide?.title || '',
        description: slide?.description || '',
        active: slide?.active ?? true,
        imageFile: null,
        imagePreview: slide?.image || '',
      });
    }
  }, [open, slide]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    set('imageFile', file);
    set('imagePreview', URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    const fd = new FormData();
    fd.append('title', form.title.trim());
    fd.append('description', form.description.trim());
    fd.append('active', form.active);
    if (form.imageFile) fd.append('image', form.imageFile);
    onSave(fd, isEdit ? slide._id : null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="font-bold text-gray-900">{isEdit ? 'Edit Slide' : 'New Slide'}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100">
            <MdClose size={18} />
          </button>
        </div>
        <div className="space-y-4 p-5">
          {/* Image Upload */}
          <div
            onClick={() => fileRef.current.click()}
            className="relative flex h-44 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-indigo-300 hover:bg-indigo-50/30"
          >
            {form.imagePreview ? (
              <>
                <img src={form.imagePreview} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                  <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-700">Change Image</span>
                </div>
              </>
            ) : (
              <div className="text-center">
                <MdImage size={32} className="mx-auto text-gray-300" />
                <p className="mt-2 text-sm text-gray-400">Click to upload image</p>
                <p className="text-xs text-gray-300">PNG, JPG, WEBP</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Summer Sale 2025"
              className="form-input text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Short tagline or promotional text..."
              className="form-input resize-none text-sm"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">Active</p>
              <p className="text-xs text-gray-400">Show this slide in the hero section</p>
            </div>
            <button
              onClick={() => set('active', !form.active)}
              className={`relative h-6 w-11 rounded-full transition-colors ${form.active ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${form.active ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !form.title.trim()}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MdCheckCircle size={16} />
              {saving ? 'Saving…' : isEdit ? 'Update Slide' : 'Create Slide'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── SLIDE DETAIL MODAL ────────────────────────────────────────────────────────
const SlideDetailModal = ({ slide, open, onClose, onEdit, onDelete }) => {
  if (!slide) return null;
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="font-bold text-gray-900">Slide Detail</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100">
            <MdClose size={18} />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div className="overflow-hidden rounded-2xl bg-gray-100">
            {slide.image
              ? <img src={slide.image} alt={slide.title} className="h-52 w-full object-cover" />
              : <div className="flex h-52 items-center justify-center text-gray-300"><MdImage size={40} /></div>}
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900">{slide.title}</h4>
            <p className="mt-1 text-sm text-gray-500">{slide.description || <span className="italic">No description</span>}</p>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2">
            <span className="text-xs text-gray-500">Status</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${slide.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${slide.active ? 'bg-green-500' : 'bg-gray-400'}`} />
              {slide.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => { onEdit(slide); onClose(); }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-indigo-200 py-2.5 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50">
              <MdEdit size={16} /> Edit
            </button>
            <button onClick={() => { onDelete(slide._id); onClose(); }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50">
              <MdDelete size={16} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── CONFIRM MODAL ─────────────────────────────────────────────────────────────
const ConfirmModal = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <MdDelete size={24} className="text-red-600" />
        </div>
        <h3 className="mb-1 font-bold text-gray-900">{title}</h3>
        <p className="mb-5 text-sm text-gray-500">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function AdminHero() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [useDummy, setUseDummy] = useState(false);

  const [selected, setSelected] = useState([]);
  const [formModal, setFormModal] = useState({ open: false, slide: null });
  const [detailModal, setDetailModal] = useState({ open: false, slide: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchSlides = async () => {
    setLoading(true);
    try {
      const data = await api.getSlides();
      const arr = Array.isArray(data) ? data : Array.isArray(data.slides) ? data.slides : null;
      if (arr) {
        setSlides(arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        setUseDummy(false);
      } else throw new Error('Unexpected API shape');
    } catch (err) {
      console.warn('API unavailable, using dummy data:', err.message);
      setSlides(dummySlides);
      setUseDummy(true);
      toast('Using demo data — API not connected', { icon: '⚠️' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlides(); }, []);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const activeCount = slides.filter((s) => s.active).length;
  const inactiveCount = slides.filter((s) => !s.active).length;

  // ── Selection ──────────────────────────────────────────────────────────────
  const allSelected = slides.length > 0 && slides.every((s) => selected.includes(s._id));
  const someSelected = selected.length > 0 && !allSelected;
  const toggleSelect = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleAll = () => allSelected ? setSelected([]) : setSelected(slides.map((s) => s._id));

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async (fd, editId) => {
    setSaving(true);
    try {
      if (editId) {
        const updated = await api.updateSlide(editId, fd);
        setSlides((p) => p.map((s) => s._id === editId ? { ...s, ...updated } : s));
        toast.success('Slide updated successfully!');
      } else {
        const created = await api.createSlide(fd);
        setSlides((p) => [...p, created]);
        toast.success('New slide created!');
      }
      setFormModal({ open: false, slide: null });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle Active ──────────────────────────────────────────────────────────
  const toggleActive = async (slide) => {
    const fd = new FormData();
    fd.append('active', !slide.active);
    try {
      const updated = await api.updateSlide(slide._id, fd);
      setSlides((p) => p.map((s) => s._id === slide._id ? { ...s, active: updated.active ?? !slide.active } : s));
      toast.success(`Slide ${!slide.active ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    const id = deleteModal.id;
    try {
      await api.deleteSlide(id);
      setSlides((p) => p.filter((s) => s._id !== id));
      setSelected((p) => p.filter((x) => x !== id));
      toast.success('Slide deleted');
      setDeleteModal({ open: false, id: null });
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── Bulk Delete ────────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    const results = await Promise.allSettled(selected.map((id) => api.deleteSlide(id)));
    const ok = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.length - ok;
    setSlides((p) => p.filter((s) => !selected.includes(s._id)));
    if (ok) toast.success(`${ok} slide${ok > 1 ? 's' : ''} deleted`);
    if (failed) toast.error(`${failed} failed`);
    setSelected([]);
    setBulkDeleteModal(false);
  };

  // ── Reorder ────────────────────────────────────────────────────────────────
  const move = async (idx, dir) => {
    const next = [...slides];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setSlides(next);
    try {
      await api.reorderSlides(next.map((s) => s._id));
      toast.success('Order saved');
    } catch {
      toast.error('Reorder failed');
      fetchSlides();
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon="🖼️" label="Total Slides"  value={slides.length}  color="border-gray-100" />
        <StatCard icon="✅" label="Active"         value={activeCount}    color="border-green-100" />
        <StatCard icon="⏸️" label="Inactive"       value={inactiveCount}  color="border-yellow-100" />
        <StatCard icon={useDummy ? '⚠️' : '🔗'} label="API Status" value={useDummy ? 'Demo' : 'Live'} color={useDummy ? 'border-orange-100' : 'border-indigo-100'} />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1" />

        {/* Bulk delete */}
        {selected.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">{selected.length} selected</span>
            <button onClick={() => setBulkDeleteModal(true)}
              className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100">
              <MdDelete size={13} /> Delete
            </button>
          </div>
        )}

        {/* Select all */}
        {slides.length > 0 && (
          <button onClick={toggleAll} title="Select all"
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition-colors hover:text-indigo-600">
            {allSelected
              ? <MdCheckBox size={16} className="text-indigo-600" />
              : someSelected
              ? <MdIndeterminateCheckBox size={16} className="text-indigo-400" />
              : <MdCheckBoxOutlineBlank size={16} />}
          </button>
        )}

        {/* Refresh */}
        <button onClick={fetchSlides}
          className="rounded-lg border border-gray-200 bg-white p-2 text-gray-400 transition-colors hover:text-indigo-600" title="Refresh">
          <MdRefresh size={16} />
        </button>

        {/* Add slide */}
        <button
          onClick={() => setFormModal({ open: true, slide: null })}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">
          <MdAdd size={18} /> Add Slide
        </button>
      </div>

      {/* ── Results info ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-800">{slides.length}</span> slides total
        </p>
        {inactiveCount > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
            ⏸️ {inactiveCount} inactive
          </span>
        )}
      </div>

      {/* ── Table ── */}
      {slides.length === 0 && !loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-16 text-center shadow-sm">
          <MdSlideshow size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="font-semibold text-gray-400">No slides yet</p>
          <p className="mt-1 text-sm text-gray-300">Click <strong>+ Add Slide</strong> to create your first hero slide</p>
          <button
            onClick={() => setFormModal({ open: true, slide: null })}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">
            <MdAdd size={16} /> Add Slide
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50">
                  <th className="w-10 px-4 py-3">
                    <button onClick={toggleAll} className="text-gray-400 transition-colors hover:text-indigo-600">
                      {allSelected
                        ? <MdCheckBox size={16} className="text-indigo-600" />
                        : someSelected
                        ? <MdIndeterminateCheckBox size={16} className="text-indigo-400" />
                        : <MdCheckBoxOutlineBlank size={16} />}
                    </button>
                  </th>
                  <th className="w-8 px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Slide</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Order</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : slides.map((slide, idx) => (
                    <tr
                      key={slide._id}
                      className={`transition-colors hover:bg-gray-50/60 ${selected.includes(slide._id) ? 'bg-indigo-50' : ''} ${!slide.active ? 'opacity-60' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <button onClick={() => toggleSelect(slide._id)} className="text-gray-400 hover:text-indigo-600">
                          {selected.includes(slide._id)
                            ? <MdCheckBox size={16} className="text-indigo-600" />
                            : <MdCheckBoxOutlineBlank size={16} />}
                        </button>
                      </td>

                      {/* Index */}
                      <td className="px-2 py-3 text-xs font-bold text-gray-300">{idx + 1}</td>

                      {/* Slide preview */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 shadow-sm">
                            {slide.image
                              ? <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                              : <div className="flex h-full items-center justify-center text-gray-300"><MdImage size={16} /></div>}
                          </div>
                          <p className="line-clamp-1 max-w-[130px] text-sm font-semibold text-gray-800">{slide.title}</p>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="max-w-[200px] px-4 py-3">
                        <p className="line-clamp-2 text-xs text-gray-500">
                          {slide.description || <span className="italic text-gray-300">No description</span>}
                        </p>
                      </td>

                      {/* Status — click to toggle */}
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActive(slide)}>
                          <span className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                            slide.active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${slide.active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                            {slide.active ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>

                      {/* Reorder */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-0.5">
                          <button onClick={() => move(idx, -1)} disabled={idx === 0}
                            className="rounded p-1 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                            title="Move up">
                            <MdArrowUpward size={13} />
                          </button>
                          <button onClick={() => move(idx, 1)} disabled={idx === slides.length - 1}
                            className="rounded p-1 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                            title="Move down">
                            <MdArrowDownward size={13} />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setDetailModal({ open: true, slide })} title="View detail"
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-indigo-600">
                            <MdVisibility size={15} />
                          </button>
                          <button onClick={() => setFormModal({ open: true, slide })} title="Edit"
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600">
                            <MdEdit size={15} />
                          </button>
                          <button onClick={() => setDeleteModal({ open: true, id: slide._id })} title="Delete"
                            className="rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-50">
                            <MdDelete size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <SlideModal
        open={formModal.open}
        slide={formModal.slide}
        onClose={() => setFormModal({ open: false, slide: null })}
        onSave={handleSave}
        saving={saving}
      />
      <SlideDetailModal
        open={detailModal.open}
        slide={detailModal.slide}
        onClose={() => setDetailModal({ open: false, slide: null })}
        onEdit={(slide) => setFormModal({ open: true, slide })}
        onDelete={(id) => setDeleteModal({ open: true, id })}
      />
      <ConfirmModal
        open={deleteModal.open}
        title="Delete Slide"
        message="Are you sure you want to delete this slide? It will be removed from the hero section."
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, id: null })}
      />
      <ConfirmModal
        open={bulkDeleteModal}
        title={`Delete ${selected.length} Slides`}
        message={`Permanently delete ${selected.length} selected slides? This cannot be undone.`}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteModal(false)}
      />
    </div>
  );
}