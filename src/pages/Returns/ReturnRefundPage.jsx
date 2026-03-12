// src/pages/admin/AdminReturnsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  MdCheckCircle, MdCancel, MdSchedule, MdAttachMoney, MdInventory,
  MdSearch, MdFilterList, MdRefresh, MdExpandMore, MdExpandLess,
  MdVisibility, MdClose, MdImage, MdArrowUpward, MdArrowDownward,
} from 'react-icons/md';
import axios from 'axios';
import toast from 'react-hot-toast';

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200',  icon: <MdSchedule size={13}/> },
  approved:   { label: 'Approved',   color: 'text-green-700',  bg: 'bg-green-50',   border: 'border-green-200',  icon: <MdCheckCircle size={13}/> },
  rejected:   { label: 'Rejected',   color: 'text-red-600',    bg: 'bg-red-50',     border: 'border-red-200',    icon: <MdCancel size={13}/> },
  refunded:   { label: 'Refunded',   color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200',   icon: <MdAttachMoney size={13}/> },
  processing: { label: 'Processing', color: 'text-purple-700', bg: 'bg-purple-50',  border: 'border-purple-200', icon: <MdInventory size={13}/> },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${s.color} ${s.bg} ${s.border}`}>
      {s.icon} {s.label}
    </span>
  );
};

// ── Skeleton ───────────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-50">
    <td className="px-4 py-4"><div className="h-3.5 w-24 rounded bg-gray-200"/></td>
    <td className="px-4 py-4"><div className="h-3.5 w-32 rounded bg-gray-200"/></td>
    <td className="px-4 py-4"><div className="h-3.5 w-28 rounded bg-gray-200"/></td>
    <td className="px-4 py-4"><div className="h-3.5 w-20 rounded bg-gray-200"/></td>
    <td className="px-4 py-4"><div className="h-6 w-20 rounded-full bg-gray-200"/></td>
    <td className="px-4 py-4"><div className="h-8 w-28 rounded-lg bg-gray-200"/></td>
  </tr>
);

// ── Detail Modal ───────────────────────────────────────────────────────────────
const DetailModal = ({ req, onClose, onAction }) => {
  const [adminNote, setAdminNote] = useState(req.adminNote || '');
  const [actionLoading, setActionLoading] = useState(false);

  const handle = async (newStatus) => {
    setActionLoading(true);
    try {
      await onAction(req._id, newStatus, adminNote);
      onClose();
    } finally { setActionLoading(false); }
  };

  const canApprove   = ['pending', 'processing'].includes(req.status);
  const canReject    = ['pending', 'processing'].includes(req.status);
  const canRefund    = req.status === 'approved';
  const canProcess   = req.status === 'approved';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="font-black text-gray-900">
              Request #{req.requestNumber || req._id.slice(-6).toUpperCase()}
            </h2>
            <p className="mt-0.5 text-xs text-gray-400">
              Submitted {new Date(req.createdAt).toLocaleDateString('en-BD', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={req.status} />
            <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
              <MdClose size={20}/>
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">

          {/* Customer & Order info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-400">Customer</p>
              <p className="font-semibold text-gray-900">{req.user?.name || 'N/A'}</p>
              <p className="mt-0.5 text-xs text-gray-500">{req.user?.email || ''}</p>
              <p className="text-xs text-gray-500">{req.user?.phone || ''}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-400">Order Info</p>
              <p className="font-semibold text-gray-900">
                #{req.order?.orderNumber || req.order?._id?.slice(-6).toUpperCase() || 'N/A'}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">৳{req.order?.totalAmount?.toLocaleString() || '—'}</p>
              <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${req.requestType === 'exchange' ? 'border-purple-200 bg-purple-50 text-purple-700' : 'border-indigo-200 bg-indigo-50 text-indigo-700'}`}>
                {req.requestType === 'exchange' ? 'Exchange Request' : 'Return & Refund'}
              </span>
            </div>
          </div>

          {/* Item */}
          {req.orderItem && (
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
              {req.orderItem.image
                ? <img src={req.orderItem.image} alt="" className="h-14 w-12 rounded-lg border border-gray-100 object-cover"/>
                : <div className="flex h-14 w-12 items-center justify-center rounded-lg bg-gray-100"><MdImage size={20} className="text-gray-300"/></div>}
              <div>
                <p className="text-sm font-semibold text-gray-900">{req.orderItem.title}</p>
                <p className="text-xs text-gray-500">{req.orderItem.size ? `Size: ${req.orderItem.size}` : ''}{req.orderItem.color ? ` · Color: ${req.orderItem.color}` : ''}</p>
                <p className="mt-0.5 text-xs font-bold text-gray-700">৳{req.orderItem.price?.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Reason & Description */}
          <div className="space-y-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400">Return Reason</p>
              <p className="text-sm font-semibold text-gray-800">{req.reason}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400">Customer Description</p>
              <p className="text-sm leading-relaxed text-gray-700">{req.description || '—'}</p>
            </div>
          </div>

          {/* Attached images */}
          {req.images?.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-400">Attached Photos</p>
              <div className="flex flex-wrap gap-2">
                {req.images.map((src, i) => (
                  <a key={i} href={src} target="_blank" rel="noreferrer">
                    <img src={src} alt="" className="h-20 w-20 rounded-xl border border-gray-200 object-cover shadow-sm transition-opacity hover:opacity-80"/>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Admin note */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-gray-400">
              Admin Note <span className="font-normal normal-case text-gray-300">(visible to customer)</span>
            </label>
            <textarea rows={3} value={adminNote} onChange={e => setAdminNote(e.target.value)}
              placeholder="Add a note for the customer, e.g. reason for rejection, pickup instructions..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {canApprove && (
              <button onClick={() => handle('approved')} disabled={actionLoading}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-60">
                {actionLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"/> : <MdCheckCircle size={16}/>}
                Approve
              </button>
            )}
            {canReject && (
              <button onClick={() => handle('rejected')} disabled={actionLoading}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60">
                <MdCancel size={16}/> Reject
              </button>
            )}
            {canProcess && (
              <button onClick={() => handle('processing')} disabled={actionLoading}
                className="flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 py-2.5 text-sm font-bold text-purple-700 transition-colors hover:bg-purple-100 disabled:opacity-60">
                <MdInventory size={16}/> Mark Processing
              </button>
            )}
            {canRefund && (
              <button onClick={() => handle('refunded')} disabled={actionLoading}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60">
                <MdAttachMoney size={16}/> Mark Refunded
              </button>
            )}
            {req.status === 'approved' && (
              <button onClick={() => handle('refunded')} disabled={actionLoading}
                className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60">
                <MdAttachMoney size={16}/> Confirm Refund Issued
              </button>
            )}
            {(req.status === 'rejected' || req.status === 'refunded') && (
              <div className="col-span-2 rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-center text-sm text-gray-400">
                This request is closed · No further action available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Admin Page ────────────────────────────────────────────────────────────
export default function AdminReturnsPage() {
  const [returns, setReturns]     = useState([]);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]     = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);

  // Filters
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter]   = useState('');
  const [sortDir, setSortDir]         = useState('desc');

  // Stats
  const [stats, setStats] = useState({ pending:0, approved:0, rejected:0, refunded:0, processing:0 });

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadReturns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/returns', {
        params: { page, search, status: statusFilter, type: typeFilter, sort: sortDir, limit: 12 },
      });
      const d = res.data?.data || res.data || {};
      setReturns(d.returns || d.list || []);
      setTotal(d.total || 0);
      setTotalPages(d.totalPages || 1);
      if (d.stats) setStats(d.stats);
    } catch { toast.error('Failed to load return requests'); }
    finally { setLoading(false); }
  }, [page, search, statusFilter, typeFilter, sortDir]);

  useEffect(() => { loadReturns(); }, [loadReturns]);

  const handleAction = async (id, status, adminNote) => {
    try {
      await axios.patch(`/api/returns/${id}/status`, { status, adminNote });
      toast.success(`Request marked as ${status}`);
      loadReturns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
      throw err;
    }
  };

  const STAT_CARDS = [
    { key: 'pending',    label: 'Pending',    color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-200' },
    { key: 'approved',   label: 'Approved',   color: 'text-green-700',  bg: 'bg-green-50',   border: 'border-green-200' },
    { key: 'processing', label: 'Processing', color: 'text-purple-700', bg: 'bg-purple-50',  border: 'border-purple-200' },
    { key: 'refunded',   label: 'Refunded',   color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200' },
    { key: 'rejected',   label: 'Rejected',   color: 'text-red-600',    bg: 'bg-red-50',     border: 'border-red-200' },
  ];

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">Returns & Refunds</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{total}</span> total requests
          </p>
        </div>
        <button onClick={loadReturns}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:border-indigo-300 hover:text-indigo-600">
          <MdRefresh size={16} className={loading ? 'animate-spin' : ''}/> Refresh
        </button>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {STAT_CARDS.map(({ key, label, color, bg, border }) => (
          <button key={key}
            onClick={() => { setStatusFilter(statusFilter === key ? '' : key); setPage(1); }}
            className={`rounded-2xl border p-4 text-left transition-all hover:shadow-md ${
              statusFilter === key ? `${bg} ${border} shadow-sm` : 'border-gray-100 bg-white hover:border-gray-200'
            }`}>
            <p className={`text-2xl font-black ${statusFilter === key ? color : 'text-gray-800'}`}>
              {loading ? <span className="inline-block h-7 w-8 animate-pulse rounded bg-gray-200"/> : (stats[key] ?? 0)}
            </p>
            <p className={`mt-0.5 text-xs font-semibold ${statusFilter === key ? color : 'text-gray-500'}`}>{label}</p>
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by customer, order #..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"/>
          {searchInput && <button onClick={() => setSearchInput('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><MdClose size={14}/></button>}
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1">
          {[{ v: '', l: 'All' }, ...STAT_CARDS.map(s => ({ v: s.key, l: s.label }))].map(({ v, l }) => (
            <button key={v} onClick={() => { setStatusFilter(v); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${statusFilter === v ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1">
          {[{ v: '', l: 'All Types' }, { v: 'return', l: '↩ Return' }, { v: 'exchange', l: '🔄 Exchange' }].map(({ v, l }) => (
            <button key={v} onClick={() => { setTypeFilter(v); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${typeFilter === v ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {l}
            </button>
          ))}
        </div>

        <button onClick={() => { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); setPage(1); }}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:text-indigo-600">
          {sortDir === 'desc' ? <MdArrowDownward size={14}/> : <MdArrowUpward size={14}/>}
          {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
        </button>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-50">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-400">Request #</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-400">Customer</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-400">Order / Reason</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-400">Type</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-400">Date</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-400">Status</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wide text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i}/>)
                : returns.length === 0
                ? (
                  <tr><td colSpan={7}>
                    <div className="py-16 text-center">
                      <p className="text-3xl">📋</p>
                      <p className="mt-2 font-bold text-gray-600">No return requests found</p>
                      <p className="mt-1 text-sm text-gray-400">{statusFilter ? `No ${statusFilter} requests.` : 'All clear!'}</p>
                    </div>
                  </td></tr>
                )
                : returns.map((req) => (
                  <tr key={req._id} className="group transition-colors hover:bg-gray-50/60">
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-gray-900">
                        #{req.requestNumber || req._id.slice(-6).toUpperCase()}
                      </span>
                      {req.images?.length > 0 && (
                        <span className="ml-1.5 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600">
                          📷 {req.images.length}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900">{req.user?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-400">{req.user?.phone || req.user?.email || ''}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-indigo-600">
                        #{req.order?.orderNumber || req.order?._id?.slice(-6).toUpperCase() || '—'}
                      </p>
                      <p className="mt-0.5 max-w-[160px] truncate text-xs text-gray-500">{req.reason}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                        req.requestType === 'exchange'
                          ? 'border-purple-200 bg-purple-50 text-purple-700'
                          : 'border-gray-200 bg-gray-50 text-gray-600'
                      }`}>
                        {req.requestType === 'exchange' ? '🔄 Exchange' : '↩ Return'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-gray-600">{new Date(req.createdAt).toLocaleDateString('en-BD', { day:'numeric', month:'short', year:'numeric' })}</p>
                      <p className="text-[10px] text-gray-400">{new Date(req.createdAt).toLocaleTimeString('en-BD', { hour:'2-digit', minute:'2-digit' })}</p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={req.status}/>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick approve / reject for pending */}
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={async (e) => { e.stopPropagation(); await handleAction(req._id, 'approved', ''); }}
                              className="rounded-lg border border-green-200 bg-green-50 p-1.5 text-green-600 transition-colors hover:bg-green-100"
                              title="Quick Approve">
                              <MdCheckCircle size={15}/>
                            </button>
                            <button
                              onClick={async (e) => { e.stopPropagation(); await handleAction(req._id, 'rejected', ''); }}
                              className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-500 transition-colors hover:bg-red-100"
                              title="Quick Reject">
                              <MdCancel size={15}/>
                            </button>
                          </>
                        )}
                        {req.status === 'approved' && (
                          <button
                            onClick={async (e) => { e.stopPropagation(); await handleAction(req._id, 'refunded', ''); }}
                            className="rounded-lg border border-blue-200 bg-blue-50 p-1.5 text-blue-600 transition-colors hover:bg-blue-100"
                            title="Mark Refunded">
                            <MdAttachMoney size={15}/>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedReq(req)}
                          className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 shadow-sm transition-colors hover:border-indigo-300 hover:text-indigo-600"
                          title="View Details">
                          <MdVisibility size={15}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-50 px-5 py-4">
            <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40">
                ← Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                return p <= totalPages ? (
                  <button key={p} onClick={() => setPage(p)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${p === page ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {p}
                  </button>
                ) : null;
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selectedReq && (
        <DetailModal
          req={selectedReq}
          onClose={() => setSelectedReq(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}