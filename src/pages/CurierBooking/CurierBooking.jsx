import React, { useState, useMemo, useCallback } from 'react';
import {
  MdLocalShipping, MdAdd, MdSearch, MdFilterList, MdClose,
  MdCheckCircle, MdCancel, MdArrowForward, MdRefresh, MdDownload,
  MdPrint, MdContentCopy, MdEdit, MdDelete, MdVisibility,
  MdLocationOn, MdPhone, MdPerson, MdInventory, MdScale,
  MdAttachMoney, MdTrendingUp, MdTrendingDown, MdHistory,
  MdQrCode, MdNotifications, MdStar, MdChevronLeft,
  MdChevronRight, MdSwapVert, MdOpenInNew, MdInfo,
  MdStorefront, MdHome, MdBusiness, MdAccessTime,
  MdFlashOn, MdSpeed, MdVerified, MdWarning, MdLabel,
  MdReceipt, MdDirectionsBike, MdAirplanemodeActive
} from "react-icons/md";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, Cell, PieChart,
  Pie, LineChart, Line,
} from 'recharts';

// ══════════════════════════════════════════════════════════
// FAKE DATA
// ══════════════════════════════════════════════════════════

const COURIERS = [
  { id: 'pathao',    name: 'Pathao Courier',  logo: '🟠', baseRate: 60,  perKg: 15, deliveryDays: '1-2', coverage: 'Nationwide', rating: 4.8, express: true,  cod: true  },
  { id: 'redx',     name: 'RedX',            logo: '🔴', baseRate: 55,  perKg: 12, deliveryDays: '2-3', coverage: 'Nationwide', rating: 4.6, express: true,  cod: true  },
  { id: 'steadfast',name: 'Steadfast',       logo: '🟢', baseRate: 50,  perKg: 10, deliveryDays: '2-4', coverage: 'Nationwide', rating: 4.5, express: false, cod: true  },
  { id: 'sundarban',name: 'Sundarban Courier',logo: '🟡', baseRate: 70,  perKg: 18, deliveryDays: '1-3', coverage: 'Nationwide', rating: 4.3, express: true,  cod: true  },
  { id: 'ecourier', name: 'eCourier',        logo: '🔵', baseRate: 65,  perKg: 14, deliveryDays: '1-2', coverage: 'Dhaka Only', rating: 4.7, express: true,  cod: false },
  { id: 'paperfly', name: 'Paperfly',        logo: '✈️', baseRate: 80,  perKg: 20, deliveryDays: '1',   coverage: 'Nationwide', rating: 4.9, express: true,  cod: true  },
];

const BD_DIVISIONS = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];

const FAKE_BOOKINGS = [
  { id: 'CB-2025-001', date: '2025-07-18', courier: 'pathao',    senderName: 'Rahim Store',       senderPhone: '01711-234567', senderAddress: '45 Mirpur-10, Dhaka',          receiverName: 'Karim Ahmed',      receiverPhone: '01812-345678', receiverAddress: '12 Agrabad, Chattogram', receiverDivision: 'Chattogram', weight: 1.5, declaredValue: 2500, cod: 1200, charge: 82,  paymentStatus: 'paid',    deliveryStatus: 'delivered', trackingNo: 'PTH20250718001', type: 'standard', note: '' },
  { id: 'CB-2025-002', date: '2025-07-17', courier: 'redx',      senderName: 'Rahim Store',       senderPhone: '01711-234567', senderAddress: '45 Mirpur-10, Dhaka',          receiverName: 'Sultana Begum',    receiverPhone: '01916-456789', receiverAddress: '8 Shaheb Bazar, Rajshahi',receiverDivision: 'Rajshahi',   weight: 0.8, declaredValue: 800,  cod: 0,    charge: 57,  paymentStatus: 'paid',    deliveryStatus: 'in_transit', trackingNo: 'RDX20250717002', type: 'standard', note: '' },
  { id: 'CB-2025-003', date: '2025-07-17', courier: 'steadfast', senderName: 'Rahim Store',       senderPhone: '01711-234567', senderAddress: '45 Mirpur-10, Dhaka',          receiverName: 'Mohiuddin Hasan',  receiverPhone: '01615-567890', receiverAddress: '22 KDA Ave, Khulna',       receiverDivision: 'Khulna',     weight: 2.2, declaredValue: 3200, cod: 3200, charge: 72,  paymentStatus: 'pending', deliveryStatus: 'picked_up',  trackingNo: 'STF20250717003', type: 'standard', note: 'Fragile item' },
  { id: 'CB-2025-004', date: '2025-07-16', courier: 'paperfly',  senderName: 'Rahim Store',       senderPhone: '01711-234567', senderAddress: '45 Mirpur-10, Dhaka',          receiverName: 'Farida Khatun',    receiverPhone: '01712-678901', receiverAddress: '5 Zindabazar, Sylhet',     receiverDivision: 'Sylhet',     weight: 0.5, declaredValue: 1500, cod: 1500, charge: 90,  paymentStatus: 'paid',    deliveryStatus: 'delivered', trackingNo: 'PLY20250716004', type: 'express',  note: '' },
  { id: 'CB-2025-005', date: '2025-07-16', courier: 'ecourier',  senderName: 'Rahim Store',       senderPhone: '01711-234567', senderAddress: '45 Mirpur-10, Dhaka',          receiverName: 'Nasrin Akter',     receiverPhone: '01814-789012', receiverAddress: '18 Banani DOHS, Dhaka',    receiverDivision: 'Dhaka',      weight: 1.0, declaredValue: 4500, cod: 0,    charge: 65,  paymentStatus: 'paid',    deliveryStatus: 'delivered', trackingNo: 'ECR20250716005', type: 'express',  note: '' },
  { id: 'CB-2025-006', date: '2025-07-15', courier: 'sundarban', senderName: 'Rahim Store',       senderPhone: '01711-234567', senderAddress: '45 Mirpur-10, Dhaka',          receiverName: 'Jamal Uddin',      receiverPhone: '01911-890123', receiverAddress: '9 Rangpur Sadar',          receiverDivision: 'Rangpur',    weight: 3.0, declaredValue: 1200, cod: 1200, charge: 124, paymentStatus: 'pending', deliveryStatus: 'processing', trackingNo: 'SDB20250715006', type: 'standard', note: '' },
  { id: 'CB-2025-007', date: '2025-07-15', courier: 'redx',      senderName: 'Rahim Store',       senderPhone: '01711-234567', senderAddress: '45 Mirpur-10, Dhaka',          receiverName: 'Rokeya Khanam',    receiverPhone: '01616-901234', receiverAddress: '14 Mymensingh City',       receiverDivision: 'Mymensingh', weight: 1.2, declaredValue: 950,  cod: 950,  charge: 69,  paymentStatus: 'paid',    deliveryStatus: 'cancelled',  trackingNo: 'RDX20250715007', type: 'standard', note: '' },
  { id: 'CB-2025-008', date: '2025-07-14', courier: 'pathao',    senderName: 'Rahim Store',       senderPhone: '01711-234567', senderAddress: '45 Mirpur-10, Dhaka',          receiverName: 'Babul Islam',      receiverPhone: '01713-012345', receiverAddress: '3 Barishal Sadar',         receiverDivision: 'Barishal',   weight: 0.6, declaredValue: 680,  cod: 680,  charge: 69,  paymentStatus: 'paid',    deliveryStatus: 'delivered', trackingNo: 'PTH20250714008', type: 'standard', note: '' },
  { id: 'CB-2025-009', date: '2025-07-14', courier: 'steadfast', senderName: 'Rahim Store',       senderPhone: '01711-234567', senderAddress: '45 Mirpur-10, Dhaka',          receiverName: 'Mitu Akter',       receiverPhone: '01815-123456', receiverAddress: '7 Gulshan-2, Dhaka',       receiverDivision: 'Dhaka',      weight: 1.8, declaredValue: 2200, cod: 0,    charge: 68,  paymentStatus: 'pending', deliveryStatus: 'in_transit', trackingNo: 'STF20250714009', type: 'standard', note: 'Handle carefully' },
  { id: 'CB-2025-010', date: '2025-07-13', courier: 'paperfly',  senderName: 'Rahim Store',       senderPhone: '01711-234567', senderAddress: '45 Mirpur-10, Dhaka',          receiverName: 'Shafiqul Haque',   receiverPhone: '01913-234567', receiverAddress: '20 Rajshahi University',   receiverDivision: 'Rajshahi',   weight: 0.3, declaredValue: 3800, cod: 3800, charge: 84,  paymentStatus: 'paid',    deliveryStatus: 'delivered', trackingNo: 'PLY20250713010', type: 'express',  note: '' },
];

const CHART_DATA = [
  { date: 'Jan', bookings: 84,  delivered: 78,  revenue: 6720,  cod: 48500  },
  { date: 'Feb', bookings: 96,  delivered: 89,  revenue: 7680,  cod: 52000  },
  { date: 'Mar', bookings: 120, delivered: 111, revenue: 9600,  cod: 68000  },
  { date: 'Apr', bookings: 108, delivered: 98,  revenue: 8640,  cod: 61000  },
  { date: 'May', bookings: 145, delivered: 134, revenue: 11600, cod: 82000  },
  { date: 'Jun', bookings: 162, delivered: 149, revenue: 12960, cod: 94000  },
  { date: 'Jul', bookings: 138, delivered: 128, revenue: 11040, cod: 79500  },
];

const EMPTY_FORM = {
  // Sender
  senderName: '', senderPhone: '', senderAddress: '', senderDivision: 'Dhaka',
  // Receiver
  receiverName: '', receiverPhone: '', receiverAddress: '', receiverDivision: '',
  // Package
  weight: '', declaredValue: '', cod: '', packageType: 'parcel', note: '',
  // Courier
  courierId: '', type: 'standard',
};

const PACKAGE_TYPES = [
  { id: 'document', label: 'Document',  icon: '📄', maxWeight: 0.5 },
  { id: 'parcel',   label: 'Parcel',    icon: '📦', maxWeight: 30  },
  { id: 'fragile',  label: 'Fragile',   icon: '🪟', maxWeight: 10  },
  { id: 'food',     label: 'Perishable',icon: '🥩', maxWeight: 5   },
];

// ══════════════════════════════════════════════════════════
// API HOOKS — Uncomment when backend is ready
// ══════════════════════════════════════════════════════════

// import { useDispatch, useSelector } from 'react-redux';
// import {
//   fetchBookings, fetchBookingStats, fetchCouriers,
//   createBooking, updateBooking, cancelBooking,
//   bulkCreateBookings, exportBookings,
//   fetchTrackingInfo,
// } from '../redux/slices/courierSlice';

// const dispatch = useDispatch();
// const { bookings, stats, couriers, loading, pagination } = useSelector(s => s.courier);

// useEffect(() => {
//   dispatch(fetchBookings({ page, search, status, courier, sortKey, sortDir }));
//   dispatch(fetchBookingStats());
//   dispatch(fetchCouriers());
// }, [deps]);

// const handleCreate  = (data) => dispatch(createBooking(data));
// const handleCancel  = (id)   => dispatch(cancelBooking(id));
// const handleExport  = ()     => dispatch(exportBookings({ ids: selected, format: 'csv' }));
// const handleTrack   = (trackingNo, courierId) => dispatch(fetchTrackingInfo({ trackingNo, courierId }));

// ══════════════════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════════════════

const fmt    = n => '৳' + Number(n).toLocaleString('en-BD');
const fmtNum = n => Number(n).toLocaleString('en-BD');
const genId  = () => 'CB-2025-' + String(Math.floor(Math.random() * 900) + 100).padStart(3, '0');
const genTracking = (cId) => cId.slice(0, 3).toUpperCase() + Date.now().toString().slice(-9);

const calcCharge = (courier, weight, type) => {
  if (!courier) return 0;
  const base = type === 'express' ? courier.baseRate * 1.5 : courier.baseRate;
  return Math.round(base + (parseFloat(weight) || 0) * courier.perKg);
};

const DELIVERY_STATUS = {
  processing:  { label: 'Processing',  badge: 'info',    dot: '#3b82f6', icon: '⏳' },
  picked_up:   { label: 'Picked Up',   badge: 'purple',  dot: '#8b5cf6', icon: '🏪' },
  in_transit:  { label: 'In Transit',  badge: 'warning', dot: '#f59e0b', icon: '🚚' },
  out_delivery:{ label: 'Out Delivery',badge: 'warning', dot: '#f97316', icon: '🛵' },
  delivered:   { label: 'Delivered',   badge: 'success', dot: '#10b981', icon: '✅' },
  cancelled:   { label: 'Cancelled',   badge: 'danger',  dot: '#ef4444', icon: '❌' },
  returned:    { label: 'Returned',    badge: 'gray',    dot: '#9ca3af', icon: '↩️' },
};

const PAYMENT_STATUS = {
  paid:    { label: 'Paid',    badge: 'success' },
  pending: { label: 'Pending', badge: 'warning' },
  failed:  { label: 'Failed',  badge: 'danger'  },
};

const BADGE = {
  success: 'bg-green-50 text-green-700 border border-green-100',
  warning: 'bg-amber-50 text-amber-700 border border-amber-100',
  danger:  'bg-red-50 text-red-600 border border-red-100',
  info:    'bg-blue-50 text-blue-700 border border-blue-100',
  purple:  'bg-purple-50 text-purple-700 border border-purple-100',
  gray:    'bg-gray-100 text-gray-600',
};

// ══════════════════════════════════════════════════════════
// SMALL COMPONENTS
// ══════════════════════════════════════════════════════════

const Badge = ({ type = 'gray', children, size = 'sm' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold capitalize ${size === 'xs' ? 'text-[10px]' : 'text-[11px]'} ${BADGE[type]}`}>
    {children}
  </span>
);

const TrendBadge = ({ value }) => {
  if (value == null) return null;
  const up = value >= 0;
  return (
    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
      {up ? <MdTrendingUp size={13} /> : <MdTrendingDown size={13} />}
      {Math.abs(value)}%
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, trend, subtitle, onClick }) => {
  const c = {
    green:  'bg-green-50 text-green-500 border-green-100',
    blue:   'bg-blue-50 text-blue-500 border-blue-100',
    amber:  'bg-amber-50 text-amber-500 border-amber-100',
    red:    'bg-red-50 text-red-500 border-red-100',
    purple: 'bg-purple-50 text-purple-500 border-purple-100',
    indigo: 'bg-indigo-50 text-indigo-500 border-indigo-100',
  };
  return (
    <div onClick={onClick} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 ${onClick ? 'cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all' : ''}`}>
      <div className="flex items-start justify-between">
        <div className={`${c[color]} border rounded-xl p-2.5`}><Icon size={20} /></div>
        {trend != null && <TrendBadge value={trend} />}
      </div>
      <div>
        <p className="text-2xl font-extrabold tracking-tight text-gray-900">{value}</p>
        <p className="mt-0.5 text-xs font-semibold text-gray-500">{title}</p>
        {subtitle && <p className="mt-0.5 text-[11px] text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm shadow-lg">
      <p className="mb-1 font-semibold text-gray-700">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-bold">
          {p.name === 'revenue' || p.name === 'cod' ? fmt(p.value) : `${fmtNum(p.value)} ${p.name}`}
        </p>
      ))}
    </div>
  );
};

const InputField = ({ label, required, children, hint }) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold text-gray-500">
      {label}{required && <span className="ml-0.5 text-red-400">*</span>}
    </label>
    {children}
    {hint && <p className="mt-1 text-[10px] text-gray-400">{hint}</p>}
  </div>
);

const Input = ({ value, onChange, placeholder, type = 'text', className = '' }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all ${className}`} />
);

const Select = ({ value, onChange, children, className = '' }) => (
  <select value={value} onChange={onChange}
    className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all ${className}`}>
    {children}
  </select>
);

const Divider = ({ label }) => (
  <div className="flex items-center gap-3">
    <div className="h-px flex-1 bg-gray-100" />
    <span className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</span>
    <div className="h-px flex-1 bg-gray-100" />
  </div>
);

// ══════════════════════════════════════════════════════════
// TRACKING TIMELINE
// ══════════════════════════════════════════════════════════

const TrackingTimeline = ({ booking }) => {
  const steps = [
    { key: 'processing',   label: 'Order Placed',    time: booking.date + ' 10:30 AM' },
    { key: 'picked_up',    label: 'Picked Up',       time: booking.date + ' 02:45 PM' },
    { key: 'in_transit',   label: 'In Transit',      time: booking.date + ' 06:00 PM' },
    { key: 'out_delivery', label: 'Out for Delivery', time: 'Tomorrow 09:00 AM' },
    { key: 'delivered',    label: 'Delivered',        time: '' },
  ];
  const statusOrder = ['processing', 'picked_up', 'in_transit', 'out_delivery', 'delivered'];
  const curIdx = booking.deliveryStatus === 'cancelled' ? -1 : statusOrder.indexOf(booking.deliveryStatus);

  if (booking.deliveryStatus === 'cancelled') {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center">
        <p className="mb-1 text-2xl">❌</p>
        <p className="text-sm font-bold text-red-700">Shipment Cancelled</p>
        <p className="mt-0.5 text-xs text-red-500">This booking has been cancelled</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const done    = i <= curIdx;
        const current = i === curIdx;
        const future  = i > curIdx;
        return (
          <div key={step.key} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 border-2 transition-all
                ${done ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-400'}
                ${current ? 'ring-4 ring-indigo-100' : ''}`}>
                {done ? '✓' : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-0.5 h-8 mt-0.5 ${done ? 'bg-indigo-200' : 'bg-gray-100'}`} />
              )}
            </div>
            <div className={`pb-6 ${i === steps.length - 1 ? 'pb-0' : ''}`}>
              <p className={`text-xs font-bold ${done ? 'text-indigo-700' : 'text-gray-400'}`}>{step.label}</p>
              {step.time && done && <p className="mt-0.5 text-[10px] text-gray-400">{step.time}</p>}
              {current && <p className="mt-0.5 text-[10px] font-semibold text-indigo-500">Current Status</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// BOOKING DETAIL DRAWER
// ══════════════════════════════════════════════════════════

const BookingDrawer = ({ booking, couriers, onClose, onCancel, onPrint }) => {
  const [tab, setTab] = useState('details');
  if (!booking) return null;
  const courier   = couriers.find(c => c.id === booking.courier);
  const dStatus   = DELIVERY_STATUS[booking.deliveryStatus] || DELIVERY_STATUS.processing;
  const pStatus   = PAYMENT_STATUS[booking.paymentStatus]   || PAYMENT_STATUS.pending;

  const copyTracking = () => {
    navigator.clipboard?.writeText(booking.trackingNo);
  };

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/30 backdrop-blur-sm" />
      <div className="flex w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 py-4">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <p className="font-mono text-xs text-gray-400">{booking.id}</p>
              <h2 className="mt-0.5 text-lg font-extrabold text-gray-900">{booking.receiverName}</h2>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                <MdLocationOn size={12} />{booking.receiverAddress}
              </p>
            </div>
            <button onClick={onClose} className="ml-2 flex-shrink-0 rounded-lg p-1.5 hover:bg-gray-100">
              <MdClose size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xl">{dStatus.icon}</span>
            <Badge type={dStatus.badge}>{dStatus.label}</Badge>
            <Badge type={pStatus.badge}>{pStatus.label}</Badge>
            {booking.type === 'express' && <Badge type="purple">⚡ Express</Badge>}
          </div>
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            {['details', 'tracking', 'receipt'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 px-6 py-5">

          {tab === 'details' && (
            <>
              {/* Tracking number */}
              <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-400">Tracking Number</p>
                  <p className="mt-0.5 font-mono text-sm font-black text-indigo-700">{booking.trackingNo}</p>
                </div>
                <button onClick={copyTracking} className="rounded-lg bg-white p-2 transition-colors hover:bg-indigo-100">
                  <MdContentCopy size={16} className="text-indigo-600" />
                </button>
              </div>

              {/* Courier info */}
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                <span className="text-2xl">{courier?.logo}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{courier?.name}</p>
                  <p className="text-xs text-gray-500">ETA: {courier?.deliveryDays} business days</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Charge</p>
                  <p className="font-extrabold text-gray-900">{fmt(booking.charge)}</p>
                </div>
              </div>

              {/* Sender & Receiver */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Sender', name: booking.senderName, phone: booking.senderPhone, addr: booking.senderAddress },
                  { label: 'Receiver', name: booking.receiverName, phone: booking.receiverPhone, addr: booking.receiverAddress },
                ].map(({ label, name, phone, addr }) => (
                  <div key={label} className="rounded-xl bg-gray-50 p-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
                    <div className="mb-1 flex items-center gap-1.5">
                      <MdPerson size={12} className="flex-shrink-0 text-indigo-500" />
                      <p className="truncate text-xs font-bold text-gray-900">{name}</p>
                    </div>
                    <div className="mb-1 flex items-center gap-1.5">
                      <MdPhone size={12} className="flex-shrink-0 text-indigo-500" />
                      <p className="text-xs text-gray-600">{phone}</p>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <MdLocationOn size={12} className="mt-0.5 flex-shrink-0 text-indigo-500" />
                      <p className="text-[11px] leading-tight text-gray-500">{addr}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Package details */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Package Details</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Weight',         value: `${booking.weight} kg` },
                    { label: 'Package Type',   value: booking.packageType || 'Parcel' },
                    { label: 'Declared Value', value: fmt(booking.declaredValue) },
                    { label: 'COD Amount',     value: booking.cod > 0 ? fmt(booking.cod) : 'No COD' },
                    { label: 'Delivery Type',  value: booking.type === 'express' ? '⚡ Express' : '📦 Standard' },
                    { label: 'Booking Date',   value: booking.date },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl bg-gray-50 px-3 py-2.5">
                      <p className="text-[10px] font-semibold text-gray-400">{label}</p>
                      <p className="mt-0.5 text-xs font-bold text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {booking.note && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3">
                  <MdInfo size={15} className="mt-0.5 flex-shrink-0 text-amber-500" />
                  <p className="text-xs text-amber-700">{booking.note}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button onClick={() => onPrint(booking)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50">
                  <MdPrint size={16} /> Print Label
                </button>
                {booking.deliveryStatus !== 'delivered' && booking.deliveryStatus !== 'cancelled' && (
                  <button onClick={() => { onCancel(booking.id); onClose(); }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100">
                    <MdCancel size={16} /> Cancel
                  </button>
                )}
              </div>
            </>
          )}

          {tab === 'tracking' && (
            <>
              <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-400">Tracking</p>
                  <p className="font-mono text-sm font-black text-indigo-700">{booking.trackingNo}</p>
                </div>
                <span className="text-2xl">{dStatus.icon}</span>
              </div>
              <TrackingTimeline booking={booking} />
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="mb-2 text-xs font-bold text-gray-700">Live Tracking</p>
                <p className="text-xs text-gray-500">For real-time updates visit the {courier?.name} website or app.</p>
                <button className="mt-2 flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline">
                  <MdOpenInNew size={13} /> Track on {courier?.name}
                </button>
              </div>
            </>
          )}

          {tab === 'receipt' && (
            <>
              <div className="rounded-2xl border border-dashed border-gray-200 p-5">
                <div className="mb-4 text-center">
                  <p className="text-lg font-black text-gray-900">Courier Receipt</p>
                  <p className="font-mono text-xs text-gray-400">{booking.id}</p>
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    ['Courier Partner',  courier?.name || '—'],
                    ['Tracking No',      booking.trackingNo],
                    ['Booking Date',     booking.date],
                    ['Sender',           booking.senderName],
                    ['Receiver',         booking.receiverName],
                    ['Destination',      booking.receiverDivision],
                    ['Weight',           `${booking.weight} kg`],
                    ['Declared Value',   fmt(booking.declaredValue)],
                    ['COD Collected',    booking.cod > 0 ? fmt(booking.cod) : 'N/A'],
                    ['Delivery Charge',  fmt(booking.charge)],
                    ['Payment Status',   booking.paymentStatus.toUpperCase()],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between border-b border-dashed border-gray-100 py-1 last:border-0">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-bold text-gray-900">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-gray-200 pt-3 text-center">
                  <p className="text-[10px] text-gray-400">Thank you for shipping with us!</p>
                </div>
              </div>
              <button onClick={() => onPrint(booking)}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                <MdPrint size={18} /> Download / Print Receipt
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// NEW BOOKING MODAL — Multi-Step
// ══════════════════════════════════════════════════════════

const BookingModal = ({ onClose, onSave }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const selectedCourier = COURIERS.find(c => c.id === form.courierId);
  const charge = calcCharge(selectedCourier, form.weight, form.type);

  const STEPS = ['Sender', 'Receiver', 'Package', 'Courier', 'Confirm'];

  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.senderName)    e.senderName    = 'Required';
      if (!form.senderPhone)   e.senderPhone   = 'Required';
      if (!form.senderAddress) e.senderAddress = 'Required';
    }
    if (step === 1) {
      if (!form.receiverName)    e.receiverName    = 'Required';
      if (!form.receiverPhone)   e.receiverPhone   = 'Required';
      if (!form.receiverAddress) e.receiverAddress = 'Required';
      if (!form.receiverDivision)e.receiverDivision= 'Required';
    }
    if (step === 2) {
      if (!form.weight)        e.weight        = 'Required';
      if (!form.declaredValue) e.declaredValue = 'Required';
    }
    if (step === 3) {
      if (!form.courierId) e.courierId = 'Please select a courier';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const handleSubmit = () => {
    // TODO: dispatch(createBooking({ ...form, charge }))
    onSave({
      ...form,
      id: genId(),
      trackingNo: genTracking(form.courierId),
      charge,
      date: new Date().toISOString().slice(0, 10),
      deliveryStatus: 'processing',
      paymentStatus: 'pending',
      tags: [],
    });
  };

  const ErrMsg = ({ field }) => errors[field] ? <p className="mt-1 text-[10px] text-red-500">{errors[field]}</p> : null;
  const inputCls = field => `w-full border ${errors[field] ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-200'} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" style={{ maxHeight: '92vh' }}>

        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-100 px-6 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-gray-900">New Courier Booking</h2>
              <p className="mt-0.5 text-xs text-gray-400">Step {step + 1} of {STEPS.length}</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100"><MdClose size={20} className="text-gray-500" /></button>
          </div>
          {/* Progress */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all
                  ${step === i ? 'bg-indigo-600 text-white' : step > i ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  <span>{step > i ? '✓' : i + 1}</span> {s}
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded ${step > i ? 'bg-green-200' : 'bg-gray-100'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">

          {/* STEP 0 — Sender */}
          {step === 0 && (
            <>
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50"><MdStorefront size={18} className="text-indigo-600" /></div>
                <p className="text-sm font-bold text-gray-800">Sender Information</p>
              </div>
              <InputField label="Sender / Shop Name" required>
                <input value={form.senderName} onChange={e => set('senderName', e.target.value)} placeholder="e.g. Rahim Electronics" className={inputCls('senderName')} />
                <ErrMsg field="senderName" />
              </InputField>
              <InputField label="Mobile Number" required>
                <input value={form.senderPhone} onChange={e => set('senderPhone', e.target.value)} placeholder="01XXXXXXXXX" className={inputCls('senderPhone')} />
                <ErrMsg field="senderPhone" />
              </InputField>
              <InputField label="Pickup Address" required>
                <textarea value={form.senderAddress} onChange={e => set('senderAddress', e.target.value)} placeholder="House, Road, Area..." rows={2}
                  className={`${inputCls('senderAddress')} resize-none`} />
                <ErrMsg field="senderAddress" />
              </InputField>
              <InputField label="Division">
                <Select value={form.senderDivision} onChange={e => set('senderDivision', e.target.value)}>
                  {BD_DIVISIONS.map(d => <option key={d}>{d}</option>)}
                </Select>
              </InputField>
            </>
          )}

          {/* STEP 1 — Receiver */}
          {step === 1 && (
            <>
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-50"><MdHome size={18} className="text-green-600" /></div>
                <p className="text-sm font-bold text-gray-800">Receiver Information</p>
              </div>
              <InputField label="Receiver Name" required>
                <input value={form.receiverName} onChange={e => set('receiverName', e.target.value)} placeholder="Customer full name" className={inputCls('receiverName')} />
                <ErrMsg field="receiverName" />
              </InputField>
              <InputField label="Mobile Number" required>
                <input value={form.receiverPhone} onChange={e => set('receiverPhone', e.target.value)} placeholder="01XXXXXXXXX" className={inputCls('receiverPhone')} />
                <ErrMsg field="receiverPhone" />
              </InputField>
              <InputField label="Delivery Address" required>
                <textarea value={form.receiverAddress} onChange={e => set('receiverAddress', e.target.value)} placeholder="Full delivery address..." rows={2}
                  className={`${inputCls('receiverAddress')} resize-none`} />
                <ErrMsg field="receiverAddress" />
              </InputField>
              <InputField label="Division / District" required>
                <Select value={form.receiverDivision} onChange={e => set('receiverDivision', e.target.value)}>
                  <option value="">Select Division</option>
                  {BD_DIVISIONS.map(d => <option key={d}>{d}</option>)}
                </Select>
                <ErrMsg field="receiverDivision" />
              </InputField>
            </>
          )}

          {/* STEP 2 — Package */}
          {step === 2 && (
            <>
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50"><MdInventory size={18} className="text-amber-600" /></div>
                <p className="text-sm font-bold text-gray-800">Package Details</p>
              </div>
              {/* Package type */}
              <InputField label="Package Type">
                <div className="grid grid-cols-4 gap-2">
                  {PACKAGE_TYPES.map(pt => (
                    <button key={pt.id} onClick={() => set('packageType', pt.id)}
                      className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-xs font-semibold transition-all
                        ${form.packageType === pt.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-100 hover:border-gray-300 text-gray-500'}`}>
                      <span className="text-xl">{pt.icon}</span>
                      {pt.label}
                    </button>
                  ))}
                </div>
              </InputField>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Weight (kg)" required>
                  <input type="number" step="0.1" min="0.1" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="e.g. 1.5" className={inputCls('weight')} />
                  <ErrMsg field="weight" />
                </InputField>
                <InputField label="Declared Value (৳)" required>
                  <input type="number" value={form.declaredValue} onChange={e => set('declaredValue', e.target.value)} placeholder="Product value" className={inputCls('declaredValue')} />
                  <ErrMsg field="declaredValue" />
                </InputField>
              </div>
              <InputField label="COD Amount (৳)" hint="Leave 0 if no cash collection needed">
                <input type="number" value={form.cod} onChange={e => set('cod', e.target.value)} placeholder="0" className={inputCls('cod')} />
              </InputField>
              <InputField label="Delivery Type">
                <div className="flex gap-3">
                  {[['standard', '📦 Standard', 'Normal delivery time'], ['express', '⚡ Express', 'Faster, priority delivery']].map(([v, l, desc]) => (
                    <button key={v} onClick={() => set('type', v)}
                      className={`flex-1 flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl border-2 transition-all
                        ${form.type === v ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:border-gray-300'}`}>
                      <span className={`text-sm font-bold ${form.type === v ? 'text-indigo-700' : 'text-gray-700'}`}>{l}</span>
                      <span className="text-[10px] text-gray-400">{desc}</span>
                    </button>
                  ))}
                </div>
              </InputField>
              <InputField label="Special Note">
                <textarea value={form.note} onChange={e => set('note', e.target.value)} placeholder="e.g. Fragile, Handle with care..." rows={2}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </InputField>
            </>
          )}

          {/* STEP 3 — Courier Selection */}
          {step === 3 && (
            <>
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50"><MdLocalShipping size={18} className="text-purple-600" /></div>
                <p className="text-sm font-bold text-gray-800">Select Courier Partner</p>
              </div>
              {errors.courierId && <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-500">{errors.courierId}</p>}
              <div className="space-y-3">
                {COURIERS.map(c => {
                  const price = calcCharge(c, form.weight, form.type);
                  const isSelected = form.courierId === c.id;
                  return (
                    <button key={c.id} onClick={() => set('courierId', c.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left
                        ${isSelected ? 'border-indigo-500 bg-indigo-50/70' : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'}`}>
                      <span className="flex-shrink-0 text-2xl">{c.logo}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-gray-900">{c.name}</p>
                          {c.express && form.type === 'express' && <Badge type="purple" size="xs">⚡ Express</Badge>}
                          {c.cod && <Badge type="success" size="xs">COD ✓</Badge>}
                          {!c.cod && <Badge type="gray" size="xs">No COD</Badge>}
                        </div>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="text-[11px] text-gray-500">🕐 {c.deliveryDays} days</span>
                          <span className="text-[11px] text-gray-500">📍 {c.coverage}</span>
                          <span className="text-[11px] text-amber-600">⭐ {c.rating}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-lg font-extrabold text-indigo-700">{fmt(price)}</p>
                        <p className="text-[10px] text-gray-400">{fmt(c.baseRate)} base + {fmt(c.perKg)}/kg</p>
                      </div>
                      {isSelected && <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600"><span className="text-xs text-white">✓</span></div>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* STEP 4 — Confirm */}
          {step === 4 && (
            <>
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-50"><MdCheckCircle size={18} className="text-green-600" /></div>
                <p className="text-sm font-bold text-gray-800">Confirm Booking</p>
              </div>
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 rounded-xl bg-gray-50 p-3">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">Sender → Receiver</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900">{form.senderName}</p>
                      <p className="text-[10px] text-gray-500">{form.senderDivision}</p>
                    </div>
                    <MdArrowForward size={16} className="text-indigo-400" />
                    <div className="flex-1 text-right">
                      <p className="text-xs font-bold text-gray-900">{form.receiverName}</p>
                      <p className="text-[10px] text-gray-500">{form.receiverDivision}</p>
                    </div>
                  </div>
                </div>
                {[
                  ['Courier',        COURIERS.find(c => c.id === form.courierId)?.name || '—'],
                  ['Package Type',   form.packageType],
                  ['Weight',         `${form.weight} kg`],
                  ['Delivery Type',  form.type === 'express' ? '⚡ Express' : '📦 Standard'],
                  ['Declared Value', fmt(form.declaredValue)],
                  ['COD Amount',     form.cod > 0 ? fmt(form.cod) : 'No COD'],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-gray-50 px-3 py-2.5">
                    <p className="text-[10px] font-semibold text-gray-400">{k}</p>
                    <p className="mt-0.5 text-xs font-bold capitalize text-gray-900">{v}</p>
                  </div>
                ))}
              </div>
              {/* Charge box */}
              <div className="flex items-center justify-between rounded-2xl bg-indigo-600 p-5 text-white">
                <div>
                  <p className="text-sm font-semibold opacity-80">Total Delivery Charge</p>
                  <p className="mt-0.5 text-3xl font-black">{fmt(charge)}</p>
                  {form.cod > 0 && <p className="mt-1 text-xs opacity-70">+ COD collection: {fmt(form.cod)}</p>}
                </div>
                <div className="text-right">
                  <span className="text-3xl">{COURIERS.find(c => c.id === form.courierId)?.logo}</span>
                  <p className="mt-1 text-xs opacity-70">{COURIERS.find(c => c.id === form.courierId)?.deliveryDays} days ETA</p>
                </div>
              </div>
              {form.note && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3">
                  <MdInfo size={15} className="mt-0.5 flex-shrink-0 text-amber-500" />
                  <p className="text-xs text-amber-700">{form.note}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100">Cancel</button>
          {step > 0 && (
            <button onClick={back} className="flex items-center gap-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100">
              <MdChevronLeft size={16} /> Back
            </button>
          )}
          <div className="flex-1" />
          {step < STEPS.length - 1 ? (
            <button onClick={next} className="flex items-center gap-1 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              Next <MdChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
              <MdCheckCircle size={16} /> Confirm Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════

export default function CourierBooking() {
  const [bookings, setBookings]         = useState(FAKE_BOOKINGS);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourier, setFilterCourier] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [sortKey, setSortKey]           = useState('date');
  const [sortDir, setSortDir]           = useState('desc');
  const [activeTab, setActiveTab]       = useState('bookings');
  const [page, setPage]                 = useState(1);
  const [pageSize]                      = useState(8);
  const [selected, setSelected]         = useState([]);
  const [drawer, setDrawer]             = useState(null);
  const [showAdd, setShowAdd]           = useState(false);
  const [toast, setToast]               = useState(null);
  const [trackInput, setTrackInput]     = useState('');
  const [trackResult, setTrackResult]   = useState(null);

  const notify = useCallback((msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3200);
  }, []);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  // ── Computed ───────────────────────────────────────────
  const filtered = useMemo(() => {
    let arr = bookings.filter(b => {
      if (filterStatus !== 'all' && b.deliveryStatus !== filterStatus) return false;
      if (filterCourier !== 'all' && b.courier !== filterCourier) return false;
      if (filterPayment !== 'all' && b.paymentStatus !== filterPayment) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!b.id.toLowerCase().includes(q) && !b.receiverName.toLowerCase().includes(q) &&
          !b.trackingNo.toLowerCase().includes(q) && !b.receiverPhone.includes(q)) return false;
      }
      return true;
    });
    arr.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'string') av = av.toLowerCase(), bv = bv.toLowerCase();
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return arr;
  }, [bookings, search, filterStatus, filterCourier, filterPayment, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);

  const stats = useMemo(() => ({
    total:      bookings.length,
    delivered:  bookings.filter(b => b.deliveryStatus === 'delivered').length,
    inTransit:  bookings.filter(b => b.deliveryStatus === 'in_transit').length,
    pending:    bookings.filter(b => b.deliveryStatus === 'processing' || b.deliveryStatus === 'picked_up').length,
    cancelled:  bookings.filter(b => b.deliveryStatus === 'cancelled').length,
    totalCharge:bookings.reduce((s, b) => s + b.charge, 0),
    totalCOD:   bookings.reduce((s, b) => s + b.cod, 0),
    pending_payment: bookings.filter(b => b.paymentStatus === 'pending').length,
    successRate:Math.round((bookings.filter(b => b.deliveryStatus === 'delivered').length / bookings.length) * 100),
  }), [bookings]);

  // ── Handlers ───────────────────────────────────────────
  const handleCreate = (data) => {
    // TODO: dispatch(createBooking(data))
    setBookings(bs => [data, ...bs]);
    setShowAdd(false);
    notify('Booking created! Tracking: ' + data.trackingNo);
  };

  const handleCancel = (id) => {
    // TODO: dispatch(cancelBooking(id))
    setBookings(bs => bs.map(b => b.id === id ? { ...b, deliveryStatus: 'cancelled' } : b));
    notify('Booking cancelled', 'warning');
  };

  const handleTrack = () => {
    if (!trackInput.trim()) return;
    const found = bookings.find(b => b.trackingNo.toLowerCase() === trackInput.toLowerCase() || b.id.toLowerCase() === trackInput.toLowerCase());
    // TODO: dispatch(fetchTrackingInfo({ trackingNo: trackInput }))
    setTrackResult(found || 'not_found');
  };

  const toggleSelect  = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll     = () => setSelected(s => s.length === paginated.length ? [] : paginated.map(b => b.id));
  const allSelected   = paginated.length > 0 && paginated.every(b => selected.includes(b.id));

  const TH = ({ col, label }) => (
    <th onClick={() => toggleSort(col)}
      className="cursor-pointer select-none whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-800">
      <div className="flex items-center gap-1">
        {label}
        {sortKey === col ? <span className="text-indigo-500">{sortDir === 'asc' ? '↑' : '↓'}</span> : <MdSwapVert size={13} className="opacity-30" />}
      </div>
    </th>
  );

  // COD per division
  const divisionCOD = useMemo(() => {
    const map = {};
    BD_DIVISIONS.forEach(d => { map[d] = bookings.filter(b => b.receiverDivision === d).reduce((s, b) => s + b.cod, 0); });
    return Object.entries(map).map(([name, value]) => ({ name: name.slice(0, 6), fullName: name, value })).sort((a, b) => b.value - a.value);
  }, [bookings]);

  // Courier performance
  const courierPerf = useMemo(() =>
    COURIERS.map(c => ({
      name: c.name.split(' ')[0],
      fullName: c.name,
      bookings: bookings.filter(b => b.courier === c.id).length,
      delivered: bookings.filter(b => b.courier === c.id && b.deliveryStatus === 'delivered').length,
      revenue: bookings.filter(b => b.courier === c.id).reduce((s, b) => s + b.charge, 0),
    })).filter(c => c.bookings > 0)
  , [bookings]);

  // ══════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════
  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white
          ${toast.type === 'warning' ? 'bg-amber-500' : toast.type === 'danger' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          <MdCheckCircle size={18} />{toast.msg}
          <button onClick={() => setToast(null)} className="ml-1 opacity-70 hover:opacity-100"><MdClose size={16} /></button>
        </div>
      )}

      {/* Modals */}
      {showAdd && <BookingModal onClose={() => setShowAdd(false)} onSave={handleCreate} />}
      {drawer && (
        <BookingDrawer
          booking={bookings.find(b => b.id === drawer)}
          couriers={COURIERS}
          onClose={() => setDrawer(null)}
          onCancel={handleCancel}
          onPrint={(b) => notify('Printing label for ' + b.trackingNo)}
        />
      )}

      {/* ── Top Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Courier Booking</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' · '}<span className="font-semibold text-gray-700">{stats.total} total bookings</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50">
            <MdDownload size={16} /> Export
          </button>
          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50">
            <MdPrint size={16} /> Bulk Print
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            <MdAdd size={18} /> New Booking
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total Bookings"  value={fmtNum(stats.total)}       icon={MdLocalShipping}  color="blue"   trend={12.4} subtitle="All time" />
        <StatCard title="Total Charges"   value={fmt(stats.totalCharge)}    icon={MdAttachMoney}    color="green"  trend={8.2}  subtitle="Delivery fees" />
        <StatCard title="COD Pending"     value={fmt(stats.totalCOD)}       icon={MdReceipt}        color="amber"  trend={-3.1} subtitle="Cash to collect" />
        <StatCard title="Success Rate"    value={`${stats.successRate}%`}   icon={MdVerified}       color="purple" trend={2.8}  subtitle="Delivered on time" />
      </div>

      {/* ── Secondary Stats ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: 'Delivered',   value: stats.delivered,        color: 'text-green-600',  bg: 'bg-green-50'  },
          { label: 'In Transit',  value: stats.inTransit,        color: 'text-amber-600',  bg: 'bg-amber-50'  },
          { label: 'Processing',  value: stats.pending,          color: 'text-blue-600',   bg: 'bg-blue-50'   },
          { label: 'Cancelled',   value: stats.cancelled,        color: 'text-red-600',    bg: 'bg-red-50'    },
          { label: 'Pay Pending', value: stats.pending_payment,  color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl px-4 py-3 flex items-center justify-between`}>
            <span className="text-xs font-semibold text-gray-600">{label}</span>
            <span className={`text-lg font-extrabold ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex w-fit gap-1 rounded-xl bg-gray-100 p-1">
        {[
          ['bookings',  'Bookings',  MdLocalShipping],
          ['analytics', 'Analytics', MdTrendingUp],
          ['tracking',  'Track',     MdLocationOn],
        ].map(([key, label, Icon]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      {/* ══════════ BOOKINGS TAB ══════════ */}
      {activeTab === 'bookings' && (
        <>
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1">
              <MdSearch size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search ID, name, phone, tracking..."
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            {/* Status filter pills */}
            <div className="flex flex-wrap gap-1">
              {[['all', 'All'], ['processing', '⏳'], ['in_transit', '🚚'], ['delivered', '✅'], ['cancelled', '❌']].map(([v, l]) => (
                <button key={v} onClick={() => { setFilterStatus(v); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all
                    ${filterStatus === v ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {l}
                </button>
              ))}
            </div>
            {/* Courier filter */}
            <select value={filterCourier} onChange={e => { setFilterCourier(e.target.value); setPage(1); }}
              className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="all">All Couriers</option>
              {COURIERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {/* Payment filter */}
            <select value={filterPayment} onChange={e => { setFilterPayment(e.target.value); setPage(1); }}
              className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
            <p className="ml-auto text-sm text-gray-400">{filtered.length} results</p>
          </div>

          {/* Bulk bar */}
          {selected.length > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3">
              <span className="text-sm font-bold text-indigo-700">{selected.length} selected</span>
              <div className="flex-1" />
              <button onClick={() => notify(`Exporting ${selected.length} bookings...`)}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-4 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-50">
                <MdDownload size={14} /> Export
              </button>
              <button onClick={() => notify(`Printing ${selected.length} labels...`)}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-4 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-50">
                <MdPrint size={14} /> Print Labels
              </button>
              <button onClick={() => setSelected([])} className="rounded-lg p-1.5 text-indigo-400 hover:bg-indigo-100"><MdClose size={16} /></button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="w-10 px-4 py-3.5">
                      <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 accent-indigo-600" />
                    </th>
                    <TH col="id"             label="Booking ID" />
                    <TH col="date"           label="Date" />
                    <TH col="receiverName"   label="Receiver" />
                    <TH col="courier"        label="Courier" />
                    <TH col="charge"         label="Charge" />
                    <TH col="cod"            label="COD" />
                    <TH col="deliveryStatus" label="Status" />
                    <TH col="paymentStatus"  label="Payment" />
                    <th className="w-20 px-4 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.length === 0 ? (
                    <tr><td colSpan={10} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                          <MdLocalShipping size={32} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-semibold text-gray-400">No bookings match your filters</p>
                        <button onClick={() => { setSearch(''); setFilterStatus('all'); setFilterCourier('all'); setFilterPayment('all'); }}
                          className="text-xs font-semibold text-indigo-600 hover:underline">Clear filters</button>
                      </div>
                    </td></tr>
                  ) : paginated.map(b => {
                    const ds = DELIVERY_STATUS[b.deliveryStatus] || DELIVERY_STATUS.processing;
                    const ps = PAYMENT_STATUS[b.paymentStatus]   || PAYMENT_STATUS.pending;
                    const courier = COURIERS.find(c => c.id === b.courier);
                    const isSel = selected.includes(b.id);
                    return (
                      <tr key={b.id} className={`group transition-colors ${isSel ? 'bg-indigo-50/60' : 'hover:bg-gray-50/50'}`}>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={isSel} onChange={() => toggleSelect(b.id)} className="h-4 w-4 accent-indigo-600" />
                        </td>
                        <td className="cursor-pointer px-4 py-3" onClick={() => setDrawer(b.id)}>
                          <p className="font-mono text-xs font-bold text-gray-700 hover:text-indigo-700">{b.id}</p>
                          <p className="font-mono text-[10px] text-gray-400">{b.trackingNo}</p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{b.date}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-black text-indigo-600">
                              {b.receiverName[0]}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-900">{b.receiverName}</p>
                              <p className="flex items-center gap-0.5 text-[10px] text-gray-400"><MdLocationOn size={10} />{b.receiverDivision}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{courier?.logo}</span>
                            <span className="whitespace-nowrap text-xs font-semibold text-gray-600">{courier?.name.split(' ')[0]}</span>
                            {b.type === 'express' && <span className="text-[10px] font-bold text-purple-600">⚡</span>}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs font-bold text-gray-900">{fmt(b.charge)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs">
                          {b.cod > 0 ? <span className="font-semibold text-amber-600">{fmt(b.cod)}</span> : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span>{ds.icon}</span>
                            <Badge type={ds.badge} size="xs">{ds.label}</Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge type={ps.badge} size="xs">{ps.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button onClick={() => setDrawer(b.id)} title="View"
                              className="rounded-lg p-1.5 text-indigo-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600">
                              <MdOpenInNew size={15} />
                            </button>
                            <button onClick={() => notify('Printing label...')} title="Print"
                              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                              <MdPrint size={15} />
                            </button>
                            {b.deliveryStatus !== 'delivered' && b.deliveryStatus !== 'cancelled' && (
                              <button onClick={() => handleCancel(b.id)} title="Cancel"
                                className="rounded-lg p-1.5 text-red-300 transition-colors hover:bg-red-50 hover:text-red-500">
                                <MdCancel size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-50 bg-gray-50/40 px-5 py-3">
              <span className="text-xs text-gray-400">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 disabled:opacity-30">
                  <MdChevronLeft size={18} className="text-gray-600" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pg = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                  return (
                    <button key={pg} onClick={() => setPage(pg)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${page === pg ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
                      {pg}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 disabled:opacity-30">
                  <MdChevronRight size={18} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════ ANALYTICS TAB ══════════ */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">

          {/* Row 1 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Bookings + deliveries area chart */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="mb-5">
                <h3 className="font-bold text-gray-900">Bookings & Deliveries</h3>
                <p className="mt-0.5 text-sm text-gray-500">Monthly booking volume vs deliveries</p>
              </div>
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={CHART_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} /><stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.12} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="bookings"  name="bookings"  stroke="#4f46e5" strokeWidth={2.5} fill="url(#gB)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="delivered" name="delivered" stroke="#10b981" strokeWidth={2}   fill="url(#gD)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Courier performance */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-1 font-bold text-gray-900">Courier Performance</h3>
              <p className="mb-4 text-sm text-gray-500">Bookings by partner</p>
              <div className="space-y-3">
                {courierPerf.sort((a, b) => b.bookings - a.bookings).map((c, i) => {
                  const maxB = Math.max(...courierPerf.map(x => x.bookings));
                  const rate = c.bookings > 0 ? Math.round((c.delivered / c.bookings) * 100) : 0;
                  const courier = COURIERS.find(x => x.name === c.fullName);
                  return (
                    <div key={c.name}>
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{courier?.logo}</span>
                          <span className="text-xs font-semibold text-gray-700">{c.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-900">{c.bookings}</span>
                          <span className="ml-1 text-[10px] text-green-600">{rate}%✓</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full" style={{ width: `${(c.bookings / maxB) * 100}%`, background: `linear-gradient(90deg, #4f46e5, #7c3aed)` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Revenue + COD line */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="mb-5">
                <h3 className="font-bold text-gray-900">Revenue & COD Trend</h3>
                <p className="mt-0.5 text-sm text-gray-500">Monthly charges collected vs COD amounts</p>
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={CHART_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="revenue" name="revenue" stroke="#4f46e5" strokeWidth={3} dot={{ fill: '#4f46e5', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="cod"     name="cod"     stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* COD by division */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 font-bold text-gray-900">COD by Division</h3>
              <div className="space-y-2.5">
                {divisionCOD.filter(d => d.value > 0).map((d, i) => {
                  const max = divisionCOD[0]?.value || 1;
                  const colors = ['#4f46e5', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];
                  return (
                    <div key={d.name}>
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full" style={{ background: colors[i] }} />
                          <span className="text-xs font-semibold text-gray-700">{d.fullName}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-900">{fmt(d.value)}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full" style={{ width: `${(d.value / max) * 100}%`, background: colors[i] }} />
                      </div>
                    </div>
                  );
                })}
                {divisionCOD.every(d => d.value === 0) && (
                  <p className="py-4 text-center text-sm text-gray-400">No COD data</p>
                )}
              </div>
            </div>
          </div>

          {/* Row 3 — Charge bar + Status donut */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-5 font-bold text-gray-900">Monthly Delivery Charges</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={CHART_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="revenue" name="revenue" radius={[8, 8, 0, 0]}>
                    {CHART_DATA.map((_, i) => (
                      <Cell key={i} fill={i === CHART_DATA.length - 1 ? '#4f46e5' : '#c7d2fe'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Status breakdown */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-1 font-bold text-gray-900">Delivery Status Breakdown</h3>
              <p className="mb-4 text-sm text-gray-500">{stats.total} total bookings</p>
              <div className="space-y-3">
                {[
                  ['delivered',    'Delivered',    stats.delivered,  '#10b981'],
                  ['in_transit',   'In Transit',   stats.inTransit,  '#f59e0b'],
                  ['processing',   'Processing',   stats.pending,    '#3b82f6'],
                  ['cancelled',    'Cancelled',    stats.cancelled,  '#ef4444'],
                ].map(([key, label, count, color]) => {
                  const p = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={key}>
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{DELIVERY_STATUS[key]?.icon}</span>
                          <span className="text-xs font-semibold text-gray-700">{label}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-900">{count}</span>
                          <span className="ml-1 text-[10px] text-gray-400">{p}%</span>
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ TRACK TAB ══════════ */}
      {activeTab === 'tracking' && (
        <div className="mx-auto max-w-xl space-y-5">
          {/* Search box */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-1 font-extrabold text-gray-900">Track Shipment</h3>
            <p className="mb-5 text-sm text-gray-500">Enter your tracking number or booking ID</p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <MdQrCode size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={trackInput} onChange={e => setTrackInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTrack()}
                  placeholder="PTH20250718001 or CB-2025-001"
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <button onClick={handleTrack}
                className="whitespace-nowrap rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                Track
              </button>
            </div>

            {/* Quick track from bookings */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Quick Track Recent</p>
              <div className="flex flex-wrap gap-2">
                {bookings.filter(b => b.deliveryStatus !== 'delivered').slice(0, 5).map(b => (
                  <button key={b.id} onClick={() => { setTrackInput(b.trackingNo); setTrackResult(b); }}
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 transition-all hover:border-indigo-200 hover:bg-indigo-50">
                    <span className="text-xs">{DELIVERY_STATUS[b.deliveryStatus]?.icon}</span>
                    <span className="font-mono text-[11px] text-gray-600">{b.trackingNo.slice(-8)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Track result */}
          {trackResult === 'not_found' && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
              <p className="mb-2 text-3xl">🔍</p>
              <p className="font-bold text-red-700">Not Found</p>
              <p className="mt-1 text-sm text-red-500">No shipment found with that tracking number.</p>
            </div>
          )}

          {trackResult && trackResult !== 'not_found' && (() => {
            const b = trackResult;
            const ds = DELIVERY_STATUS[b.deliveryStatus] || DELIVERY_STATUS.processing;
            const courier = COURIERS.find(c => c.id === b.courier);
            return (
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                {/* Status header */}
                <div className="p-5" style={{ background: `linear-gradient(135deg, #4f46e5, #7c3aed)` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-xs font-semibold text-white/70">Tracking Number</p>
                      <p className="font-mono text-lg font-black text-white">{b.trackingNo}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-4xl">{ds.icon}</span>
                      <p className="mt-1 text-sm font-bold text-white">{ds.label}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-xs text-white/80">
                    <span>📦 {courier?.name}</span>
                    <span>·</span>
                    <span>🗓️ {b.date}</span>
                    <span>·</span>
                    <span>⚖️ {b.weight} kg</span>
                  </div>
                </div>

                <div className="space-y-5 p-5">
                  {/* Route */}
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <div className="flex-1">
                      <p className="text-[10px] font-semibold text-gray-400">FROM</p>
                      <p className="text-sm font-bold text-gray-900">{b.senderName}</p>
                      <p className="text-xs text-gray-500">{b.senderDivision || 'Dhaka'}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-indigo-600" />
                      <div className="h-0.5 w-16 bg-indigo-200" />
                      <MdLocalShipping size={18} className="text-indigo-600" />
                      <div className="h-0.5 w-16 bg-indigo-200" />
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-[10px] font-semibold text-gray-400">TO</p>
                      <p className="text-sm font-bold text-gray-900">{b.receiverName}</p>
                      <p className="text-xs text-gray-500">{b.receiverDivision}</p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <TrackingTimeline booking={b} />

                  <button onClick={() => setDrawer(b.id)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 py-3 text-sm font-bold text-indigo-700 transition-colors hover:bg-indigo-50">
                    <MdOpenInNew size={16} /> View Full Details
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}