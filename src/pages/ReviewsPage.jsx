import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReviews, approveReview, deleteReview } from '../redux/slices/reviewSlice';
import { Table, Pagination, Spinner, EmptyState, ConfirmModal, Badge } from '../components/common';
import {
  MdSearch, MdCheckCircle, MdDelete, MdClose, MdFilterList, MdRefresh,
  MdCheckBox, MdCheckBoxOutlineBlank, MdIndeterminateCheckBox,
  MdStar, MdVisibility, MdArrowUpward, MdArrowDownward, MdPerson,
  MdShoppingBag, MdOutlineRateReview,
} from 'react-icons/md';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

// ─── Star Rating Display ───────────────────────────────────────────────────────
const StarRating = ({ rating, size = 12 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s}>
        {rating >= s
          ? <FaStar size={size} className="text-amber-400" />
          : rating >= s - 0.5
          ? <FaStarHalfAlt size={size} className="text-amber-400" />
          : <FaRegStar size={size} className="text-gray-300" />}
      </span>
    ))}
  </div>
);

// ─── Rating Badge ──────────────────────────────────────────────────────────────
const RatingBadge = ({ rating }) => {
  const color = rating >= 4 ? 'bg-green-100 text-green-700'
    : rating >= 3 ? 'bg-yellow-100 text-yellow-700'
    : 'bg-red-100 text-red-600';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${color}`}>
      <FaStar size={10} /> {rating}
    </span>
  );
};

// ─── Review Detail Modal ───────────────────────────────────────────────────────
const ReviewDetailModal = ({ review, open, onClose, onApprove, onDelete }) => {
  if (!review) return null;
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="font-bold text-gray-900">Review Detail</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100">
            <MdClose size={18} />
          </button>
        </div>
        <div className="space-y-4 p-5">
          {/* Product */}
          {review.product && (
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
              <div className="h-14 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gray-200">
                {review.product.images?.[0]
                  ? <img src={review.product.images[0]} alt="" className="h-full w-full object-cover" />
                  : <div className="flex h-full items-center justify-center text-gray-400"><MdShoppingBag size={18} /></div>}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{review.product.title}</p>
                {review.product.price && (
                  <p className="text-xs text-gray-400">৳{review.product.price?.toLocaleString()}</p>
                )}
              </div>
            </div>
          )}

          {/* Reviewer */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
              {(review.userName || review.user || '?')[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{review.userName || review.user}</p>
              <p className="text-xs text-gray-400">{review.userEmail || ''}</p>
            </div>
            <div className="ml-auto">
              <StarRating rating={review.rating} size={14} />
              <p className="mt-0.5 text-right text-[10px] text-gray-400">
                {new Date(review.date || review.createdAt).toLocaleDateString('en-BD', { dateStyle: 'medium' })}
              </p>
            </div>
          </div>

          {/* Comment */}
          <div className="rounded-xl bg-gray-50 px-4 py-3">
            <p className="text-sm leading-relaxed text-gray-700">{review.comment || '(No comment)'}</p>
          </div>

          {/* Review images */}
          {review.images?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {review.images.map((img, i) => (
                <img key={i} src={img} alt="" className="h-20 w-20 rounded-xl border border-gray-200 object-cover" />
              ))}
            </div>
          )}

          {/* Status */}
          <div className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2">
            <span className="text-xs text-gray-500">Status</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${review.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {review.approved ? '✓ Approved' : '⏳ Pending'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {!review.approved && (
              <button onClick={() => { onApprove(review._id); onClose(); }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700">
                <MdCheckCircle size={16} /> Approve Review
              </button>
            )}
            <button onClick={() => { onDelete(review._id); onClose(); }}
              className={`flex items-center justify-center gap-1.5 rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors ${review.approved ? 'flex-1' : 'px-4'}`}>
              <MdDelete size={16} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton Row ──────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-50">
    <td className="px-4 py-3"><div className="h-4 w-4 rounded bg-gray-200" /></td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="h-10 w-9 rounded-lg bg-gray-200" />
        <div className="h-3.5 w-28 rounded bg-gray-200" />
      </div>
    </td>
    <td className="px-4 py-3"><div className="h-3.5 w-20 rounded bg-gray-200" /></td>
    <td className="px-4 py-3"><div className="h-5 w-12 rounded-full bg-gray-200" /></td>
    <td className="px-4 py-3"><div className="h-3 w-40 rounded bg-gray-100" /></td>
    <td className="px-4 py-3"><div className="h-5 w-16 rounded-full bg-gray-200" /></td>
    <td className="px-4 py-3"><div className="h-3 w-20 rounded bg-gray-200" /></td>
    <td className="px-4 py-3"><div className="h-8 w-20 rounded-lg bg-gray-200" /></td>
  </tr>
);

// ─── Stats Card ────────────────────────────────────────────────────────────────
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

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ReviewsPage() {
  const dispatch = useDispatch();
  const { list, total, totalPages, loading } = useSelector((s) => s.reviews);

  // Filters
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  // Selection
  const [selected, setSelected] = useState([]);

  // Modals
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [detailModal, setDetailModal] = useState({ open: false, review: null });

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    dispatch(fetchReviews({ page, search, approved: statusFilter, rating: ratingFilter, sortBy, sortDir, limit: 12 }));
  }, [dispatch, page, search, statusFilter, ratingFilter, sortBy, sortDir]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const pendingCount = list.filter((r) => !r.approved).length;
  const approvedCount = list.filter((r) => r.approved).length;
  const avgRating = list.length > 0
    ? (list.reduce((s, r) => s + (r.rating || 0), 0) / list.length).toFixed(1)
    : '—';

  // ── Selection ─────────────────────────────────────────────────────────────
  const allSelected = list.length > 0 && list.every((r) => selected.includes(r._id));
  const someSelected = selected.length > 0 && !allSelected;
  const toggleSelect = (id) => setSelected((p) => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => allSelected ? setSelected([]) : setSelected(list.map(r => r._id));

  // ── Sort ──────────────────────────────────────────────────────────────────
  const handleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('desc'); }
    setPage(1);
  };
  const SortIcon = ({ field }) => sortBy !== field ? null
    : sortDir === 'asc' ? <MdArrowUpward size={11} /> : <MdArrowDownward size={11} />;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    try {
      await dispatch(approveReview(id)).unwrap();
      toast.success('Review approved — now visible on product page!');
    } catch { toast.error('Failed to approve'); }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteReview(deleteModal.id)).unwrap();
      toast.success('Review deleted');
      setDeleteModal({ open: false, id: null });
      setSelected(p => p.filter(x => x !== deleteModal.id));
    } catch { toast.error('Delete failed'); }
  };

  const handleBulkApprove = async () => {
    const results = await Promise.allSettled(
      selected.filter(id => {
        const r = list.find(r => r._id === id);
        return r && !r.approved;
      }).map(id => dispatch(approveReview(id)).unwrap())
    );
    const ok = results.filter(r => r.status === 'fulfilled').length;
    if (ok) toast.success(`${ok} review${ok > 1 ? 's' : ''} approved`);
    setSelected([]);
  };

  const handleBulkDelete = async () => {
    const results = await Promise.allSettled(
      selected.map(id => dispatch(deleteReview(id)).unwrap())
    );
    const ok = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.length - ok;
    if (ok) toast.success(`${ok} review${ok > 1 ? 's' : ''} deleted`);
    if (failed) toast.error(`${failed} failed`);
    setSelected([]);
    setBulkDeleteModal(false);
  };

  const resetFilters = () => {
    setSearchInput('');
    setStatusFilter('');
    setRatingFilter('');
    setSortBy('createdAt');
    setSortDir('desc');
    setPage(1);
  };

  const hasFilters = searchInput || statusFilter || ratingFilter;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon="⭐" label="Total Reviews" value={total} color="border-gray-100" />
        <StatCard icon="⏳" label="Pending" value={pendingCount} color="border-yellow-100" />
        <StatCard icon="✅" label="Approved" value={approvedCount} color="border-green-100" />
        <StatCard icon="📊" label="Avg. Rating" value={avgRating} color="border-amber-100" />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative min-w-[180px] max-w-sm flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search product, customer, comment..."
            className="form-input py-2 pl-9 pr-8 text-sm" />
          {searchInput && (
            <button onClick={() => setSearchInput('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <MdClose size={14} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {[{ v: '', l: 'All' }, { v: 'false', l: '⏳ Pending' }, { v: 'true', l: '✅ Approved' }].map(({ v, l }) => (
            <button key={v} onClick={() => { setStatusFilter(v); setPage(1); }}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === v ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Rating filter */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          <button onClick={() => { setRatingFilter(''); setPage(1); }}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${!ratingFilter ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
            All ⭐
          </button>
          {[5, 4, 3, 2, 1].map((r) => (
            <button key={r} onClick={() => { setRatingFilter(String(r)); setPage(1); }}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                ratingFilter === String(r) ? 'bg-amber-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
              {r}★
            </button>
          ))}
        </div>

        {/* Reset */}
        {hasFilters && (
          <button onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-gray-600">
            <MdRefresh size={14} /> Reset
          </button>
        )}

        <div className="flex-1" />

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">{selected.length} selected</span>
            <button onClick={handleBulkApprove}
              className="flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100">
              <MdCheckCircle size={13} /> Approve
            </button>
            <button onClick={() => setBulkDeleteModal(true)}
              className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100">
              <MdDelete size={13} /> Delete
            </button>
          </div>
        )}

        {/* Select all */}
        {list.length > 0 && (
          <button onClick={toggleAll} title="Select all"
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition-colors hover:text-indigo-600">
            {allSelected ? <MdCheckBox size={16} className="text-indigo-600" />
              : someSelected ? <MdIndeterminateCheckBox size={16} className="text-indigo-400" />
              : <MdCheckBoxOutlineBlank size={16} />}
          </button>
        )}

        {/* Refresh */}
        <button onClick={() => dispatch(fetchReviews({ page, search, approved: statusFilter, rating: ratingFilter, sortBy, sortDir, limit: 12 }))}
          className="rounded-lg border border-gray-200 bg-white p-2 text-gray-400 transition-colors hover:text-indigo-600" title="Refresh">
          <MdRefresh size={16} />
        </button>
      </div>

      {/* ── Results info ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-800">{total}</span> reviews found
          {(search || statusFilter || ratingFilter) && (
            <> · <button onClick={resetFilters} className="ml-1 text-xs text-indigo-500 hover:underline">Clear filters</button></>
          )}
        </p>
        {pendingCount > 0 && (
          <button onClick={() => { setStatusFilter('false'); setPage(1); }}
            className="flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 transition-colors hover:bg-yellow-200">
            ⏳ {pendingCount} pending approval
          </button>
        )}
      </div>

      {/* ── Table ── */}
      {list.length === 0 && !loading ? (
        <EmptyState icon="⭐" title="No Reviews"
          description={hasFilters ? 'No reviews match your filters.' : 'Reviews will appear here once customers submit them.'}
          action={hasFilters ? <button className="btn-outline" onClick={resetFilters}>Clear Filters</button> : null} />
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <button onClick={() => handleSort('rating')} className="flex items-center gap-1 hover:text-gray-700">
                      Rating <SortIcon field="rating" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Comment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1 hover:text-gray-700">
                      Date <SortIcon field="createdAt" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                  : list.map((r) => (
                      <tr key={r._id}
                        className={`transition-colors hover:bg-gray-50/60 ${selected.includes(r._id) ? 'bg-indigo-50' : ''} ${!r.approved ? 'border-l-2 border-yellow-400' : ''}`}>
                        {/* Checkbox */}
                        <td className="px-4 py-3">
                          <button onClick={() => toggleSelect(r._id)} className="text-gray-400 hover:text-indigo-600">
                            {selected.includes(r._id)
                              ? <MdCheckBox size={16} className="text-indigo-600" />
                              : <MdCheckBoxOutlineBlank size={16} />}
                          </button>
                        </td>

                        {/* Product */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-10 w-9 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 shadow-sm">
                              {r.product?.images?.[0]
                                ? <img src={r.product.images[0]} alt="" className="h-full w-full object-cover" />
                                : <div className="flex h-full items-center justify-center text-gray-300"><MdShoppingBag size={14} /></div>}
                            </div>
                            <p className="line-clamp-1 max-w-[110px] text-xs font-semibold text-gray-800">
                              {r.product?.title || '—'}
                            </p>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                              {(r.userName || r.user || '?')[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="max-w-[90px] truncate text-xs font-medium text-gray-800">{r.userName || r.user}</p>
                              {r.userEmail && <p className="max-w-[90px] truncate text-[10px] text-gray-400">{r.userEmail}</p>}
                            </div>
                          </div>
                        </td>

                        {/* Rating */}
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            <RatingBadge rating={r.rating} />
                            <StarRating rating={r.rating} size={9} />
                          </div>
                        </td>

                        {/* Comment */}
                        <td className="max-w-[180px] px-4 py-3">
                          <p className="line-clamp-2 text-xs text-gray-600">{r.comment || <span className="italic text-gray-300">No comment</span>}</p>
                          {r.images?.length > 0 && (
                            <p className="mt-0.5 text-[10px] text-indigo-500">📷 {r.images.length} photo{r.images.length > 1 ? 's' : ''}</p>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            r.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${r.approved ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                            {r.approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-400">
                          {new Date(r.date || r.createdAt).toLocaleDateString('en-BD', { dateStyle: 'medium' })}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setDetailModal({ open: true, review: r })}
                              title="View full review"
                              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-indigo-600">
                              <MdVisibility size={15} />
                            </button>
                            {!r.approved && (
                              <button onClick={() => handleApprove(r._id)} title="Approve"
                                className="rounded-lg p-1.5 text-green-500 transition-colors hover:bg-green-50">
                                <MdCheckCircle size={16} />
                              </button>
                            )}
                            <button onClick={() => setDeleteModal({ open: true, id: r._id })}
                              className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50">
                              <MdDelete size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-50 p-4">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </div>
      )}

      {/* ── Review Detail Modal ── */}
      <ReviewDetailModal
        open={detailModal.open}
        review={detailModal.review}
        onClose={() => setDetailModal({ open: false, review: null })}
        onApprove={(id) => { handleApprove(id); setDetailModal({ open: false, review: null }); }}
        onDelete={(id) => { setDeleteModal({ open: true, id }); setDetailModal({ open: false, review: null }); }}
      />

      {/* ── Delete Modal ── */}
      <ConfirmModal open={deleteModal.open} title="Delete Review"
        message="Are you sure you want to delete this review? It will be removed from the product page."
        onConfirm={handleDelete} onCancel={() => setDeleteModal({ open: false, id: null })} />

      {/* ── Bulk Delete Modal ── */}
      <ConfirmModal open={bulkDeleteModal} title={`Delete ${selected.length} Reviews`}
        message={`Permanently delete ${selected.length} selected reviews?`}
        onConfirm={handleBulkDelete} onCancel={() => setBulkDeleteModal(false)} />
    </div>
  );
}