import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, updateOrderStatus, getOrderById } from '../../redux/slices/orderSlice';
import { Pagination } from '../../components/common';
import {
  MdSearch, MdVisibility, MdFilterList, MdDownload,
  MdPrint, MdLocalShipping, MdCheckCircle, MdCancel,
  MdPendingActions, MdRefresh, MdPhone, MdEmail,
  MdLocationOn, MdPayment, MdClose, MdContentCopy,
  MdCheck, MdArrowUpward, MdArrowDownward, MdShoppingCart,
  MdCheckBox, MdCheckBoxOutlineBlank, MdIndeterminateCheckBox,
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_CONFIG = {
  pending:    { icon: MdPendingActions,  color: 'text-amber-500',  bg: 'bg-amber-50',   border: 'border-amber-200',  label: 'Pending',    dot: 'bg-amber-400' },
  processing: { icon: MdRefresh,          color: 'text-blue-500',   bg: 'bg-blue-50',    border: 'border-blue-200',   label: 'Processing', dot: 'bg-blue-400' },
  shipped:    { icon: MdLocalShipping,    color: 'text-indigo-500', bg: 'bg-indigo-50',  border: 'border-indigo-200', label: 'Shipped',    dot: 'bg-indigo-400' },
  delivered:  { icon: MdCheckCircle,      color: 'text-green-500',  bg: 'bg-green-50',   border: 'border-green-200',  label: 'Delivered',  dot: 'bg-green-500' },
  cancelled:  { icon: MdCancel,           color: 'text-red-500',    bg: 'bg-red-50',     border: 'border-red-200',    label: 'Cancelled',  dot: 'bg-red-500' },
};

const STATUS_TIMELINE = ['pending', 'processing', 'shipped', 'delivered'];

const StatCard = ({ icon, label, value, color }) => (
  <div className={`rounded-2xl border ${color} bg-white p-4 shadow-sm`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="mt-0.5 text-2xl font-black text-gray-900">{value ?? '—'}</p>
      </div>
      <div className="text-2xl">{icon}</div>
    </div>
  </div>
);

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-50">
    <td className="px-4 py-3"><div className="h-4 w-4 rounded bg-gray-200" /></td>
    <td className="px-4 py-3"><div className="h-8 w-20 rounded-lg bg-gray-200" /></td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-200" />
        <div className="space-y-1">
          <div className="h-3 w-24 rounded bg-gray-200" />
          <div className="h-2.5 w-32 rounded bg-gray-100" />
        </div>
      </div>
    </td>
    <td className="px-4 py-3"><div className="h-3 w-16 rounded bg-gray-200" /></td>
    <td className="px-4 py-3"><div className="h-3 w-20 rounded bg-gray-200" /></td>
    <td className="px-4 py-3"><div className="h-5 w-16 rounded-full bg-gray-200" /></td>
    <td className="px-4 py-3"><div className="h-5 w-20 rounded-lg bg-gray-200" /></td>
    <td className="px-4 py-3"><div className="h-3 w-20 rounded bg-gray-200" /></td>
    <td className="px-4 py-3"><div className="h-8 w-8 rounded-lg bg-gray-200" /></td>
  </tr>
);

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
      {copied ? <MdCheck size={13} className="text-green-500" /> : <MdContentCopy size={13} />}
    </button>
  );
}

function OrderTimeline({ status }) {
  if (status === 'cancelled') return (
    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-500">
      <MdCancel size={18} /> Order Cancelled
    </div>
  );
  const current = STATUS_TIMELINE.indexOf(status);
  return (
    <div className="flex items-center">
      {STATUS_TIMELINE.map((s, i) => {
        const cfg = STATUS_CONFIG[s];
        const Icon = cfg.icon;
        const done = i <= current;
        const active = i === current;
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full transition-all
                ${done ? (active ? 'bg-indigo-500 shadow-lg shadow-indigo-200' : 'bg-green-500') : 'bg-gray-100'}`}>
                <Icon size={16} className={done ? 'text-white' : 'text-gray-400'} />
              </div>
              <span className={`whitespace-nowrap text-xs font-semibold
                ${active ? 'text-indigo-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
                {cfg.label}
              </span>
            </div>
            {i < STATUS_TIMELINE.length - 1 && (
              <div className={`mb-5 h-0.5 flex-1 mx-1 ${i < current ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function InvoiceModal({ order, onClose }) {
  const printRef = useRef();
  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Invoice #${order._id?.slice(-8).toUpperCase()}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; font-size: 13px; }
        th { background: #f9fafb; font-weight: 600; }
        .total-row td { font-weight: bold; font-size: 15px; }
        @media print { button { display: none; } }
      </style></head>
      <body>${content}</body></html>`);
    win.document.close(); win.print();
  };
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 px-4 pb-8 pt-10">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-bold text-gray-900">Invoice Preview</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">
              <MdPrint size={14} /> Print / PDF
            </button>
            <button onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><MdClose size={18} /></button>
          </div>
        </div>
        <div className="p-6" ref={printRef}>
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900">ROYEL ATTIRE</h1>
              <p className="text-sm text-gray-500">Fashion & Lifestyle</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">INVOICE</p>
              <p className="text-sm text-gray-500">#{order._id?.slice(-8).toUpperCase()}</p>
              <p className="mt-1 text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-BD', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="mb-8 grid grid-cols-2 gap-8">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Bill To</p>
              <p className="font-semibold text-gray-900">{order.user?.name}</p>
              <p className="text-sm text-gray-500">{order.user?.email}</p>
              <p className="text-sm text-gray-500">{order.user?.phone}</p>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Ship To</p>
              <p className="text-sm text-gray-700">{order.shippingAddress?.address}</p>
              <p className="text-sm text-gray-700">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
              <p className="text-sm text-gray-700">{order.shippingAddress?.country || 'Bangladesh'}</p>
            </div>
          </div>
          <table className="mb-6 w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50">
                {['#', 'Product', 'Size', 'Qty', 'Unit Price', 'Total'].map(h => (
                  <th key={h} className="border border-gray-200 px-3 py-2 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.orderItems?.map((item, i) => (
                <tr key={item._id || i}>
                  <td className="border border-gray-200 px-3 py-2 text-gray-500">{i + 1}</td>
                  <td className="border border-gray-200 px-3 py-2">{item.name}</td>
                  <td className="border border-gray-200 px-3 py-2 text-center">{item.size || '—'}</td>
                  <td className="border border-gray-200 px-3 py-2 text-center">{item.qty}</td>
                  <td className="border border-gray-200 px-3 py-2 text-right">৳{item.price?.toLocaleString()}</td>
                  <td className="border border-gray-200 px-3 py-2 text-right font-semibold">৳{(item.price * item.qty)?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td colSpan={5} className="border border-gray-200 px-3 py-2 text-right text-gray-500">Subtotal</td><td className="border border-gray-200 px-3 py-2 text-right">৳{order.itemsPrice?.toLocaleString()}</td></tr>
              <tr><td colSpan={5} className="border border-gray-200 px-3 py-2 text-right text-gray-500">Shipping</td><td className="border border-gray-200 px-3 py-2 text-right">৳{order.shippingPrice?.toLocaleString()}</td></tr>
              {order.discount > 0 && <tr><td colSpan={5} className="border border-gray-200 px-3 py-2 text-right text-green-600">Discount</td><td className="border border-gray-200 px-3 py-2 text-right text-green-600">-৳{order.discount?.toLocaleString()}</td></tr>}
              <tr className="bg-gray-50 font-bold">
                <td colSpan={5} className="border border-gray-200 px-3 py-2 text-right">TOTAL</td>
                <td className="border border-gray-200 px-3 py-2 text-right text-lg">৳{order.totalPrice?.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
          <div className="flex justify-between border-t pt-4 text-xs text-gray-400">
            <span>Payment: {order.paymentMethod || 'COD'} — {order.isPaid ? '✅ Paid' : '⏳ Unpaid'}</span>
            <span>Thank you for shopping with Voyage!</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const dispatch = useDispatch();
  // ✅ detailLoading ও নেওয়া হলো slice থেকে
  const { list, total, totalPages, loading, detailLoading, selected } = useSelector((s) => s.orders);

  const [page, setPage]                   = useState(1);
  const [searchInput, setSearchInput]     = useState('');
  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [dateFrom, setDateFrom]           = useState('');
  const [dateTo, setDateTo]               = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [sortBy, setSortBy]               = useState('createdAt');
  const [sortDir, setSortDir]             = useState('desc');
  const [detailModal, setDetailModal]     = useState(false);
  const [invoiceModal, setInvoiceModal]   = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [showFilters, setShowFilters]     = useState(false);
  const [selected2, setSelected2]         = useState([]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch
  useEffect(() => {
    dispatch(fetchOrders({
      page, search, status: statusFilter, limit: 12,
      dateFrom, dateTo, isPaid: paymentFilter, sortBy, sortDir,
    }));
  }, [dispatch, page, search, statusFilter, dateFrom, dateTo, paymentFilter, sortBy, sortDir]);

  const pendingCount   = list.filter(o => o.status === 'pending').length;
  const deliveredCount = list.filter(o => o.status === 'delivered').length;
  const revenue        = list.reduce((s, o) => s + (o.totalPrice || 0), 0);

  const allSelected  = list.length > 0 && list.every(o => selected2.includes(o._id));
  const someSelected = selected2.length > 0 && !allSelected;
  const toggleSelect = (id) => setSelected2(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll    = () => allSelected ? setSelected2([]) : setSelected2(list.map(o => o._id));

  const handleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('desc'); }
    setPage(1);
  };
  const SortIcon = ({ field }) => sortBy !== field ? null
    : sortDir === 'asc' ? <MdArrowUpward size={11} /> : <MdArrowDownward size={11} />;

  // ✅ FIX: id guard যোগ করা হয়েছে — undefined id দিয়ে API call হবে না
  const viewDetail = async (id) => {
    if (!id) {
      toast.error('Invalid order ID');
      return;
    }
    const result = await dispatch(getOrderById(id));
    if (getOrderById.fulfilled.match(result)) {
      setDetailModal(true);
    } else {
      toast.error('Failed to load order details');
    }
  };

  const handleStatus = async (id, status) => {
    if (!id) return;
    setStatusUpdating(id);
    try {
      await dispatch(updateOrderStatus({ id, status })).unwrap();
      toast.success(`Order marked as "${status}"`);
    } catch { toast.error('Status update failed'); }
    finally { setStatusUpdating(null); }
  };

  const clearFilters = () => {
    setSearchInput(''); setSearch(''); setStatusFilter('');
    setDateFrom(''); setDateTo(''); setPaymentFilter(''); setPage(1);
  };

  const hasFilters = searchInput || statusFilter || dateFrom || dateTo || paymentFilter;

  const handleBulkStatus = async (status) => {
    const results = await Promise.allSettled(
      selected2.map(id => dispatch(updateOrderStatus({ id, status })).unwrap())
    );
    const ok = results.filter(r => r.status === 'fulfilled').length;
    if (ok) toast.success(`${ok} order${ok > 1 ? 's' : ''} updated to "${status}"`);
    setSelected2([]);
  };

  const handleExport = () => {
    const rows = [
      ['Order ID', 'Customer', 'Email', 'Phone', 'Items', 'Amount', 'Payment', 'Status', 'Date'],
      ...list.map(o => [
        '#' + o._id?.slice(-8).toUpperCase(),
        o.user?.name || 'Guest', o.user?.email || '', o.user?.phone || '',
        o.orderItems?.length || 0, o.totalPrice,
        o.isPaid ? 'Paid' : 'Unpaid', o.status,
        new Date(o.createdAt).toLocaleDateString(),
      ]),
    ];
    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('Orders exported as CSV');
  };

  const handleRefresh = () => {
    dispatch(fetchOrders({ page, search, status: statusFilter, limit: 12, dateFrom, dateTo, isPaid: paymentFilter, sortBy, sortDir }));
  };

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon="🛒" label="Total Orders"    value={total}          color="border-gray-100" />
        <StatCard icon="⏳" label="Pending"          value={pendingCount}   color="border-yellow-100" />
        <StatCard icon="✅" label="Delivered"        value={deliveredCount} color="border-green-100" />
        <StatCard icon="💰" label="Revenue (Page)"   value={`৳${revenue.toLocaleString()}`} color="border-indigo-100" />
      </div>

      {/* Status Quick Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button onClick={() => { setStatusFilter(''); setPage(1); }}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold transition-colors
            ${!statusFilter ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
          All <span className="opacity-70">({total})</span>
        </button>
        {STATUSES.map(s => {
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          return (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-colors
                ${statusFilter === s ? `${cfg.bg} ${cfg.color} ${cfg.border}` : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
              <Icon size={13} /> {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] max-w-sm flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
            placeholder="Search order ID, customer, email..."
            className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-8 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          {searchInput && (
            <button onClick={() => setSearchInput('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <MdClose size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {[{ v: '', l: 'All' }, { v: 'true', l: '✅ Paid' }, { v: 'false', l: '⏳ Unpaid' }].map(({ v, l }) => (
            <button key={v} onClick={() => { setPaymentFilter(v); setPage(1); }}
              className={`whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-colors
                ${paymentFilter === v ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {l}
            </button>
          ))}
        </div>

        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors
            ${showFilters ? 'border-indigo-300 bg-indigo-50 text-indigo-600' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
          <MdFilterList size={14} /> Filters
          {hasFilters && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />}
        </button>

        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-gray-600">
            <MdRefresh size={14} /> Reset
          </button>
        )}

        <div className="flex-1" />

        {selected2.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">{selected2.length} selected</span>
            {['processing', 'shipped', 'delivered'].map(s => {
              const cfg = STATUS_CONFIG[s];
              const Icon = cfg.icon;
              return (
                <button key={s} onClick={() => handleBulkStatus(s)}
                  className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${cfg.bg} ${cfg.color} ${cfg.border} hover:opacity-80`}>
                  <Icon size={12} /> {cfg.label}
                </button>
              );
            })}
          </div>
        )}

        {list.length > 0 && (
          <button onClick={toggleAll} title="Select all"
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition-colors hover:text-indigo-600">
            {allSelected ? <MdCheckBox size={16} className="text-indigo-600" />
              : someSelected ? <MdIndeterminateCheckBox size={16} className="text-indigo-400" />
              : <MdCheckBoxOutlineBlank size={16} />}
          </button>
        )}

        <button onClick={handleRefresh}
          className="rounded-lg border border-gray-200 bg-white p-2 text-gray-400 transition-colors hover:text-indigo-600" title="Refresh">
          <MdRefresh size={16} />
        </button>

        <button onClick={handleExport}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50">
          <MdDownload size={14} /> Export CSV
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">From Date</label>
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">To Date</label>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
            </div>
            {hasFilters && (
              <button onClick={clearFilters}
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-100">
                Clear All
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-800">{total}</span> orders found
          {hasFilters && (
            <> · <button onClick={clearFilters} className="ml-1 text-xs text-indigo-500 hover:underline">Clear filters</button></>
          )}
        </p>
        {pendingCount > 0 && (
          <button onClick={() => { setStatusFilter('pending'); setPage(1); }}
            className="flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 transition-colors hover:bg-yellow-200">
            ⏳ {pendingCount} pending
          </button>
        )}
      </div>

      {/* Table */}
      {list.length === 0 && !loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-16 text-center shadow-sm">
          <MdShoppingCart size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="font-semibold text-gray-400">No Orders Found</p>
          <p className="mt-1 text-sm text-gray-300">
            {hasFilters ? 'No orders match your filters.' : 'Orders will appear here once customers place them.'}
          </p>
          {hasFilters && (
            <button onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Clear Filters
            </button>
          )}
        </div>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <button onClick={() => handleSort('totalPrice')} className="flex items-center gap-1 hover:text-gray-700">
                      Amount <SortIcon field="totalPrice" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Payment</th>
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
                  : list.map((o) => {
                    const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
                    const Icon = cfg.icon;
                    // ✅ FIX: o._id দিয়ে key, কিন্তু undefined হলে fallback হিসেবে index ব্যবহার
                    return (
                      <tr key={o._id ?? Math.random()}
                        className={`transition-colors hover:bg-gray-50/60 ${selected2.includes(o._id) ? 'bg-indigo-50' : ''}`}>

                        <td className="px-4 py-3">
                          <button onClick={() => toggleSelect(o._id)} className="text-gray-400 hover:text-indigo-600">
                            {selected2.includes(o._id)
                              ? <MdCheckBox size={16} className="text-indigo-600" />
                              : <MdCheckBoxOutlineBlank size={16} />}
                          </button>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-lg bg-gray-100 px-2 py-1 font-mono text-xs font-bold text-gray-700">
                              #{o._id?.slice(-8).toUpperCase()}
                            </span>
                            <CopyBtn text={o._id} />
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold uppercase text-indigo-600">
                              {o.user?.name?.[0] || '?'}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-900">{o.user?.name || 'Guest'}</p>
                              <p className="max-w-[120px] truncate text-[10px] text-gray-400">{o.user?.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex -space-x-2">
                            {o.orderItems?.slice(0, 3).map((item, i) => (
                              // ✅ FIX: key এ item._id বা fallback
                              <div key={item._id || i} className="h-8 w-7 flex-shrink-0 overflow-hidden rounded border-2 border-white bg-gray-100">
                                {item.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}
                              </div>
                            ))}
                            {o.orderItems?.length > 3 && (
                              <div className="flex h-8 w-7 items-center justify-center rounded border-2 border-white bg-gray-200 text-xs font-bold text-gray-600">
                                +{o.orderItems.length - 3}
                              </div>
                            )}
                          </div>
                          <p className="mt-1 text-[10px] text-gray-400">{o.orderItems?.length || 0} items</p>
                        </td>

                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-gray-900">৳{o.totalPrice?.toLocaleString()}</p>
                          {o.discount > 0 && <p className="text-[10px] text-green-600">-৳{o.discount?.toLocaleString()} off</p>}
                        </td>

                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold
                            ${o.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${o.isPaid ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                            {o.isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                          {o.paymentMethod && <p className="mt-0.5 text-[10px] capitalize text-gray-400">{o.paymentMethod}</p>}
                        </td>

                        <td className="px-4 py-3">
                          {statusUpdating === o._id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
                          ) : (
                            <div className={`flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1.5 ${cfg.bg}`}>
                              <Icon size={11} className={cfg.color} />
                              <select value={o.status} onChange={e => handleStatus(o._id, e.target.value)}
                                className={`cursor-pointer border-none bg-transparent text-xs font-semibold outline-none ${cfg.color}`}>
                                {STATUSES.map(s => (
                                  <option key={s} value={s} className="bg-white capitalize text-gray-800">{STATUS_CONFIG[s].label}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3">
                          <p className="text-xs font-medium text-gray-700">{new Date(o.createdAt).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          <p className="text-[10px] text-gray-400">{new Date(o.createdAt).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>

                        {/* ✅ FIX: detailLoading দেখিয়ে বোঝা যাবে loading হচ্ছে */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => viewDetail(o._id)}
                            disabled={detailLoading}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-indigo-600 disabled:opacity-50">
                            {detailLoading
                              ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-500" />
                              : <MdVisibility size={15} />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-50 px-5 py-4">
            <p className="text-xs text-gray-500">
              Showing {((page - 1) * 12) + 1}–{Math.min(page * 12, total)} of <span className="font-semibold text-gray-800">{total}</span> orders
            </p>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </div>
      )}

      {/* ORDER DETAIL MODAL */}
      {detailModal && selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 pb-8 pt-10">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-900">Order #{selected._id?.slice(-8).toUpperCase()}</h2>
                  {(() => {
                    const cfg = STATUS_CONFIG[selected.status];
                    if (!cfg) return null;
                    const Icon = cfg.icon;
                    return (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                        <Icon size={11} /> {cfg.label}
                      </span>
                    );
                  })()}
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold
                    ${selected.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${selected.isPaid ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                    {selected.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-400">Placed on {new Date(selected.createdAt).toLocaleString('en-BD')}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setDetailModal(false); setInvoiceModal(true); }}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                  <MdPrint size={14} /> Invoice
                </button>
                <button onClick={() => setDetailModal(false)}
                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100">
                  <MdClose size={18} />
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">

              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">Order Progress</p>
                <OrderTimeline status={selected.status} />
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map(s => {
                    const cfg = STATUS_CONFIG[s];
                    const Icon = cfg.icon;
                    const active = selected.status === s;
                    return (
                      <button key={s} onClick={() => handleStatus(selected._id, s)} disabled={active || statusUpdating === selected._id}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all
                          ${active ? `${cfg.bg} ${cfg.color} ${cfg.border}` : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        <Icon size={13} /> {cfg.label}
                        {statusUpdating === selected._id && active && (
                          <div className="border-current/30 h-3 w-3 animate-spin rounded-full border-2 border-t-current" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Customer</p>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold uppercase text-indigo-600">
                      {selected.user?.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selected.user?.name}</p>
                      <p className="text-xs text-gray-400">Customer</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {selected.user?.email && (
                      <a href={`mailto:${selected.user.email}`}
                        className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-indigo-600">
                        <MdEmail size={14} className="flex-shrink-0 text-gray-400" /> {selected.user.email}
                      </a>
                    )}
                    {selected.user?.phone && (
                      <div className="flex items-center gap-2">
                        <a href={`tel:${selected.user.phone}`}
                          className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-green-600">
                          <MdPhone size={14} className="text-gray-400" /> {selected.user.phone}
                        </a>
                        <a href={`https://wa.me/${selected.user.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                          className="text-green-500 transition-colors hover:text-green-600">
                          <FaWhatsapp size={14} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Shipping Address</p>
                  <div className="flex items-start gap-2">
                    <MdLocationOn size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
                    <div className="space-y-0.5 text-sm text-gray-700">
                      <p>{selected.shippingAddress?.address}</p>
                      <p>{selected.shippingAddress?.city}{selected.shippingAddress?.postalCode ? `, ${selected.shippingAddress.postalCode}` : ''}</p>
                      <p>{selected.shippingAddress?.country || 'Bangladesh'}</p>
                      {selected.shippingAddress?.phone && <p className="text-gray-500">📞 {selected.shippingAddress.phone}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Order Items ({selected.orderItems?.length})
                </p>
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  {selected.orderItems?.map((item, i) => (
                    <div key={item._id || i} className={`flex items-center gap-3 p-3 ${i < selected.orderItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      <div className="h-14 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-100">
                        {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                          {item.size && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Size: {item.size}</span>}
                          {item.color && <span className="text-xs text-gray-500">Color: {item.color}</span>}
                          <span className="text-xs text-gray-400">Qty: {item.qty}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="font-bold text-gray-900">৳{(item.price * item.qty)?.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">৳{item.price?.toLocaleString()} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5 rounded-xl bg-gray-50 p-4 text-sm">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Payment Summary</p>
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({selected.orderItems?.length} items)</span>
                  <span>৳{selected.itemsPrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Charge</span>
                  <span>{selected.shippingPrice === 0
                    ? <span className="font-semibold text-green-600">Free</span>
                    : `৳${selected.shippingPrice?.toLocaleString()}`}</span>
                </div>
                {selected.taxPrice > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span><span>৳{selected.taxPrice?.toLocaleString()}</span>
                  </div>
                )}
                {selected.discount > 0 && (
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>Discount {selected.couponCode && `(${selected.couponCode})`}</span>
                    <span>-৳{selected.discount?.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>৳{selected.totalPrice?.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <MdPayment size={15} className="text-gray-400" />
                  <span className="text-xs text-gray-500">
                    Method: <span className="font-semibold capitalize text-gray-700">{selected.paymentMethod || 'COD'}</span>
                    {selected.isPaid && selected.paidAt && (
                      <span className="ml-2 text-green-600">• Paid on {new Date(selected.paidAt).toLocaleDateString()}</span>
                    )}
                  </span>
                </div>
              </div>

              {selected.notes && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-700">Customer Note</p>
                  <p className="text-sm text-amber-800">{selected.notes}</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* INVOICE MODAL */}
      {invoiceModal && (
        <InvoiceModal order={selected} onClose={() => { setInvoiceModal(false); setDetailModal(true); }} />
      )}

    </div>
  );
}