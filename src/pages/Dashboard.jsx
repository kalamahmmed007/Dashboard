import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats, fetchSalesChart, fetchRecentOrders } from '../redux/slices/dashboardSlice';
import { StatCard, Badge } from '../components/common';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie,
  Cell, LineChart, Line,
} from 'recharts';
import {
  MdShoppingBag, MdPeople, MdInventory, MdAttachMoney,
  MdTrendingUp, MdTrendingDown, MdWarning, MdArrowForward,
  MdAdd, MdRefresh, MdLocalShipping, MdCheckCircle,
  MdCancel, MdPendingActions, MdVisibility, MdLocationOn,
  MdAssignmentReturn, MdLocalOffer, MdStar, MdStarHalf,
  MdStarOutline, MdPayment, MdCategory, MdNotifications,
  MdPerson, MdTimeline, MdSchedule, MdThumbUp, MdThumbDown,
  MdDateRange, MdFileDownload, MdCompareArrows, MdPushPin,
  MdClose, MdCalendarToday, MdPictureAsPdf, MdKeyboardArrowDown,
} from 'react-icons/md';


// ── Constants ─────────────────────────────────────────────
const PERIODS = [
  { key:'7d',  label:'7 Days'   },
  { key:'30d', label:'30 Days'  },
  { key:'90d', label:'3 Months' },
  { key:'1y',  label:'1 Year'   },
];
const ORDER_STATUS_BADGE = { pending:'warning', processing:'info', shipped:'info', delivered:'success', cancelled:'danger' };
const STATUS_ICONS = { pending:MdPendingActions, processing:MdRefresh, shipped:MdLocalShipping, delivered:MdCheckCircle, cancelled:MdCancel };
const PIE_COLORS      = ['#f59e0b','#3b82f6','#8b5cf6','#10b981','#ef4444'];
const PAYMENT_COLORS  = ['#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6'];
const CATEGORY_COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#f97316'];

const WIDGET_LABELS = {
  'sales-chart':'Sales Overview','order-status':'Order Status',
  'customer-growth':'Customer Growth','category-revenue':'Category Revenue',
  'heatmap':'Hourly Heatmap','map':'Division Map',
  'payment':'Payment Methods','satisfaction':'Customer Satisfaction',
  'coupons':'Coupons & Promos','returns':'Returns & Refunds','activity':'Live Activity',
};

// ── Bangladesh Division Data ───────────────────────────────
const BD_DIVISIONS = [
  { id:'dhaka',      name:'Dhaka',      cx:178, cy:198, path:'M 155 170 L 195 165 L 215 180 L 210 210 L 195 225 L 170 230 L 150 215 L 145 195 Z' },
  { id:'chittagong', name:'Chattogram', cx:230, cy:245, path:'M 205 215 L 240 205 L 265 215 L 270 240 L 265 270 L 245 285 L 220 280 L 205 260 L 200 240 Z' },
  { id:'rajshahi',   name:'Rajshahi',   cx:105, cy:155, path:'M 70 130 L 115 125 L 140 140 L 148 165 L 135 185 L 110 190 L 80 180 L 65 160 Z' },
  { id:'khulna',     name:'Khulna',     cx:110, cy:240, path:'M 75 210 L 115 205 L 145 215 L 150 240 L 140 265 L 115 275 L 85 268 L 68 248 Z' },
  { id:'barishal',   name:'Barishal',   cx:168, cy:265, path:'M 148 240 L 180 235 L 205 248 L 202 272 L 185 285 L 160 285 L 142 272 Z' },
  { id:'sylhet',     name:'Sylhet',     cx:240, cy:168, path:'M 210 148 L 255 142 L 278 155 L 275 180 L 258 195 L 230 198 L 210 185 L 205 168 Z' },
  { id:'rangpur',    name:'Rangpur',    cx:108, cy:95,  path:'M 72 68 L 115 62 L 145 75 L 148 100 L 138 120 L 112 128 L 80 118 L 65 98 Z' },
  { id:'mymensingh', name:'Mymensingh', cx:185, cy:148, path:'M 155 128 L 200 122 L 225 135 L 225 158 L 210 172 L 185 175 L 158 165 L 148 148 Z' },
];

const fmt    = (d) => d?.toLocaleDateString('en-BD', { day:'2-digit', month:'short', year:'numeric' }) || '';
const toISO  = (d) => d?.toISOString().split('T')[0] || '';

// ══════════════════════════════════════════════════════════
// ── 1. SKELETON LOADING ───────────────────────────────────
// ══════════════════════════════════════════════════════════
const Shimmer = ({ className='' }) => (
  <div className={`rounded-xl bg-gray-200 ${className}`}
    style={{ animation:'pulse 1.8s ease-in-out infinite', background:'linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }}>
    <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
  </div>
);
const StatCardSkeleton = () => (
  <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between"><Shimmer className="h-3 w-24"/><Shimmer className="h-9 w-9 rounded-xl"/></div>
    <Shimmer className="h-7 w-32"/>
    <Shimmer className="h-3 w-20"/>
  </div>
);
const ChartSkeleton = ({ height=230 }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="space-y-2"><Shimmer className="h-4 w-32"/><Shimmer className="h-3 w-20"/></div>
      <Shimmer className="h-8 w-40 rounded-xl"/>
    </div>
    <Shimmer className="w-full rounded-xl" style={{ height }}/>
  </div>
);
const TableSkeleton = ({ rows=5 }) => (
  <div className="divide-y divide-gray-50">
    {Array.from({ length:rows }).map((_,i) => (
      <div key={i} className="flex items-center gap-4 px-5 py-3">
        <Shimmer className="h-5 w-16 rounded-lg"/>
        <div className="flex flex-1 items-center gap-2"><Shimmer className="h-7 w-7 flex-shrink-0 rounded-full"/><Shimmer className="h-3 w-24"/></div>
        <Shimmer className="h-3 w-16"/>
        <Shimmer className="h-5 w-20 rounded-full"/>
        <Shimmer className="h-3 w-12"/>
      </div>
    ))}
  </div>
);

// ══════════════════════════════════════════════════════════
// ── 2. DATE RANGE PICKER ──────────────────────────────────
// ══════════════════════════════════════════════════════════
const PRESETS = [
  { label:'Today',        days:0   },
  { label:'Last 7 days',  days:7   },
  { label:'Last 30 days', days:30  },
  { label:'Last 90 days', days:90  },
  { label:'This year',    days:365 },
];

const DateRangePicker = ({ value, onChange }) => {
  const [open, setOpen]       = useState(false);
  const [localStart, setStart] = useState(value?.start || null);
  const [localEnd,   setEnd]   = useState(value?.end   || null);
  const [hovered,    setHov]   = useState(null);
  const [viewMonth,  setVM]    = useState(() => { const d=new Date(); d.setDate(1); return d; });
  const ref = useRef();

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const applyPreset = (days) => {
    const end=new Date(), start=new Date();
    start.setDate(end.getDate()-days);
    setStart(start); setEnd(end); onChange({ start, end }); setOpen(false);
  };

  const apply = () => { if (localStart && localEnd) { onChange({ start:localStart, end:localEnd }); setOpen(false); } };

  const daysInMonth = (y,m) => new Date(y,m+1,0).getDate();
  const firstDay    = (y,m) => new Date(y,m,1).getDay();

  const renderCal = (base) => {
    const y=base.getFullYear(), m=base.getMonth();
    const cells = [];
    for (let i=0; i<firstDay(y,m); i++) cells.push(null);
    for (let d=1; d<=daysInMonth(y,m); d++) cells.push(new Date(y,m,d));
    return (
      <div className="w-60">
        <div className="mb-3 flex items-center justify-between">
          <button onClick={() => { const d=new Date(viewMonth); d.setMonth(d.getMonth()-1); setVM(d); }} className="rounded-lg p-1.5 text-base font-bold text-gray-500 transition-colors hover:bg-gray-100">‹</button>
          <span className="text-xs font-bold text-gray-800">{base.toLocaleDateString('en-BD',{ month:'long', year:'numeric' })}</span>
          <button onClick={() => { const d=new Date(viewMonth); d.setMonth(d.getMonth()+1); setVM(d); }} className="rounded-lg p-1.5 text-base font-bold text-gray-500 transition-colors hover:bg-gray-100">›</button>
        </div>
        <div className="mb-1 grid grid-cols-7">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="py-1 text-center text-[10px] font-bold text-gray-400">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((date,i) => {
            if (!date) return <div key={i}/>;
            const ts=date.getTime(), sTs=localStart?.getTime(), eTs=(localEnd||hovered)?.getTime();
            const isS=sTs===ts, isE=eTs===ts;
            const inR=sTs && eTs && ts>Math.min(sTs,eTs) && ts<Math.max(sTs,eTs);
            const isFut=date>new Date();
            return (
              <button key={i} disabled={isFut}
                onClick={() => {
                  if (!localStart || (localStart && localEnd)) { setStart(date); setEnd(null); }
                  else if (date<localStart) { setEnd(localStart); setStart(date); }
                  else setEnd(date);
                }}
                onMouseEnter={() => localStart && !localEnd && setHov(date)}
                onMouseLeave={() => setHov(null)}
                className={`h-7 w-full rounded-lg text-[11px] font-semibold transition-all
                  ${isFut?'cursor-not-allowed opacity-30':'cursor-pointer'}
                  ${isS||isE?'bg-indigo-600 text-white shadow-sm':''}
                  ${inR?'bg-indigo-100 text-indigo-700 rounded-none':''}
                  ${!isS&&!isE&&!inR&&!isFut?'text-gray-700 hover:bg-indigo-50':''}
                `}>{date.getDate()}</button>
            );
          })}
        </div>
      </div>
    );
  };

  const label = value?.start && value?.end ? `${fmt(value.start)} → ${fmt(value.end)}` : 'Select date range';
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o=>!o)}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50">
        <MdDateRange size={16} className="text-indigo-500"/>
        <span className="max-w-[180px] truncate">{label}</span>
        <MdKeyboardArrowDown size={15} className={`text-gray-400 transition-transform ${open?'rotate-180':''}`}/>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 flex overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="w-36 border-r border-gray-100 bg-gray-50/60 p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Quick Select</p>
            {PRESETS.map(({ label, days }) => (
              <button key={label} onClick={() => applyPreset(days)}
                className="w-full rounded-lg px-2 py-1.5 text-left text-xs font-semibold text-gray-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700">{label}</button>
            ))}
          </div>
          <div className="p-4">
            {renderCal(viewMonth)}
            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
              <div className="space-x-1 text-[10px] text-gray-500">
                {localStart && <span className="font-semibold text-indigo-600">{fmt(localStart)}</span>}
                {localStart && localEnd && <span className="text-gray-400">→</span>}
                {localEnd   && <span className="font-semibold text-indigo-600">{fmt(localEnd)}</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setStart(null); setEnd(null); }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100">Clear</button>
                <button onClick={apply} disabled={!localStart||!localEnd}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-40">Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ── 3. EXPORT BUTTON ──────────────────────────────────────
// ══════════════════════════════════════════════════════════
const ExportButton = ({ stats, salesChart, recentOrders }) => {
  const [open, setOpen]         = useState(false);
  const [exporting, setExporting] = useState(null);
  const ref = useRef();
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);

  const dl = (content, filename, mime='text/csv;charset=utf-8;') => {
    const blob=new Blob(['\uFEFF'+content],{ type:mime });
    const url=URL.createObjectURL(blob), a=document.createElement('a');
    a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
  };

  const exportCSV = async (type) => {
    setExporting(type); await new Promise(r=>setTimeout(r,500));
    if (type==='orders') {
      const rows = (recentOrders||[]).map(o => [`#${o._id?.slice(-6).toUpperCase()}`,o.user?.name||'Guest',o.totalPrice||0,o.status,new Date(o.createdAt).toLocaleDateString('en-BD')]);
      dl(['Order ID,Customer,Amount,Status,Date',...rows.map(r=>r.join(','))].join('\n'), `orders_${toISO(new Date())}.csv`);
    } else if (type==='sales') {
      const rows=(salesChart||[]).map(d=>[d.date,d.revenue||0,d.orders||0]);
      dl(['Date,Revenue,Orders',...rows.map(r=>r.join(','))].join('\n'), `sales_${toISO(new Date())}.csv`);
    } else {
      const rows=[['Metric','Value'],['Total Revenue',stats?.totalRevenue||0],['Total Orders',stats?.totalOrders||0],['Total Products',stats?.totalProducts||0],["Today's Revenue",stats?.todayRevenue||0],['Avg Order Value',stats?.avgOrderValue||0],['Export Date',new Date().toLocaleDateString('en-BD')]];
      dl(rows.map(r=>r.join(',')).join('\n'), `stats_${toISO(new Date())}.csv`);
    }
    setExporting(null); setOpen(false);
  };

  const exportReport = async () => {
    setExporting('pdf'); await new Promise(r=>setTimeout(r,700));
    const lines = [
      '══════════════════════════════',
      '   DASHBOARD REPORT',
      `   ${new Date().toLocaleDateString('en-BD',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}`,
      '══════════════════════════════','',
      '── KEY METRICS ───────────────',
      `Total Revenue   : BDT ${(stats?.totalRevenue||0).toLocaleString()}`,
      `Total Orders    : ${stats?.totalOrders||0}`,
      `Total Customers : ${stats?.totalUsers||0}`,
      `Total Products  : ${stats?.totalProducts||0}`,
      `Today Revenue   : BDT ${(stats?.todayRevenue||0).toLocaleString()}`,
      `Avg Order Value : BDT ${(stats?.avgOrderValue||0).toLocaleString()}`,
      '','── ORDER STATUS ──────────────',
      `Pending    : ${stats?.ordersByStatus?.pending||0}`,
      `Processing : ${stats?.ordersByStatus?.processing||0}`,
      `Delivered  : ${stats?.ordersByStatus?.delivered||0}`,
      `Cancelled  : ${stats?.ordersByStatus?.cancelled||0}`,
      '','── TOP PRODUCTS ──────────────',
      ...(stats?.topProducts||[]).slice(0,5).map((p,i)=>`${i+1}. ${p.title} — ${p.sold||0} sold`),
      '',`Generated: ${new Date().toISOString()}`,
    ];
    dl(lines.join('\n'), `dashboard_report_${toISO(new Date())}.txt`, 'text/plain;charset=utf-8;');
    setExporting(null); setOpen(false);
  };

  const opts = [
    { id:'stats',  label:'Export Stats',     sub:'Key metrics CSV',   Icon:MdFileDownload, action:()=>exportCSV('stats'),  clr:'text-emerald-600 bg-emerald-50' },
    { id:'sales',  label:'Export Sales',     sub:'Sales chart CSV',   Icon:MdFileDownload, action:()=>exportCSV('sales'),  clr:'text-emerald-600 bg-emerald-50' },
    { id:'orders', label:'Export Orders',    sub:'Recent orders CSV',  Icon:MdFileDownload, action:()=>exportCSV('orders'), clr:'text-emerald-600 bg-emerald-50' },
    { id:'pdf',    label:'Dashboard Report', sub:'Full summary TXT',   Icon:MdPictureAsPdf, action:exportReport,            clr:'text-red-500 bg-red-50'         },
  ];

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o=>!o)}
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50">
        <MdFileDownload size={16} className="text-emerald-500"/> Export
        <MdKeyboardArrowDown size={15} className={`text-gray-400 transition-transform ${open?'rotate-180':''}`}/>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="border-b border-gray-100 px-4 py-2.5"><p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Export Data</p></div>
          <div className="p-1.5">
            {opts.map(({ id, label, sub, Icon, action, clr }) => (
              <button key={id} onClick={action} disabled={!!exporting}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-gray-50 disabled:opacity-50">
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${clr}`}>
                  {exporting===id
                    ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"/>
                    : <Icon size={15}/>}
                </div>
                <div><p className="text-xs font-semibold text-gray-800">{label}</p><p className="text-[10px] text-gray-400">{sub}</p></div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ── 4. COMPARISON MODE ────────────────────────────────────
// ══════════════════════════════════════════════════════════
const CompareCard = ({ label, current, previous, prefix='', suffix='' }) => {
  const diff = previous ? ((current-previous)/previous)*100 : null;
  const up   = diff !== null && diff >= 0;
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="mb-2 text-xs font-semibold text-gray-500">{label}</p>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="mb-0.5 text-[10px] font-medium text-indigo-400">Current</p>
          <p className="text-lg font-black text-gray-900">{prefix}{(current||0).toLocaleString()}{suffix}</p>
        </div>
        <div className="mb-0.5">
          <p className="mb-0.5 text-[10px] font-medium text-gray-400">Previous</p>
          <p className="text-sm font-bold text-gray-400">{prefix}{(previous||0).toLocaleString()}{suffix}</p>
        </div>
        {diff !== null && (
          <div className={`mb-0.5 ml-auto flex items-center gap-1 rounded-full px-2 py-1 text-xs font-black ${up?'bg-green-100 text-green-600':'bg-red-100 text-red-500'}`}>
            {up?<MdTrendingUp size={13}/>:<MdTrendingDown size={13}/>}{Math.abs(diff).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-indigo-500 transition-all duration-700"
          style={{ width:`${Math.min((current/Math.max(current,previous,1))*100,100)}%` }}/>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ── 5. PIN / FAVOURITE WIDGETS ────────────────────────────
// ══════════════════════════════════════════════════════════
const PinButton = ({ widgetId, pinnedWidgets, onToggle }) => {
  const isPinned = pinnedWidgets.includes(widgetId);
  return (
    <button onClick={() => onToggle(widgetId)}
      title={isPinned?'Unpin widget':'Pin to top'}
      className={`flex h-6 w-6 items-center justify-center rounded-lg transition-all ${isPinned?'bg-indigo-100 text-indigo-600 hover:bg-red-100 hover:text-red-500':'text-gray-300 hover:bg-gray-100 hover:text-gray-500'}`}>
      {isPinned?<MdClose size={13}/>:<MdPushPin size={13}/>}
    </button>
  );
};

const PinnedSection = ({ pinnedWidgets, onUnpin, stats, salesChart }) => {
  if (!pinnedWidgets.length) return null;
  const snapshots = {
    'sales-chart':    { label:'Total Sales',    value:`৳${(salesChart||[]).reduce((s,d)=>s+(d.revenue||0),0).toLocaleString()}`, color:'text-indigo-600' },
    'order-status':   { label:'Total Orders',   value:(stats?.totalOrders||0).toLocaleString(),                                   color:'text-blue-600'   },
    'payment':        { label:'Top Payment',    value:stats?.paymentMethods?.[0]?.name||'N/A',                                    color:'text-violet-600' },
    'satisfaction':   { label:'Avg Rating',     value:`${(stats?.satisfaction?.avgRating||0).toFixed(1)}★`,                      color:'text-amber-500'  },
    'returns':        { label:'Return Rate',    value:`${(stats?.returnStats?.returnRate||0).toFixed(1)}%`,                       color:'text-red-500'    },
    'coupons':        { label:'Active Coupons', value:stats?.couponStats?.activeCoupons||0,                                       color:'text-emerald-600'},
    'activity':       { label:'Live Events',    value:(stats?.recentActivity||[]).length,                                          color:'text-green-600'  },
    'customer-growth':{ label:'New Customers',  value:stats?.customerGrowth?.slice(-1)[0]?.newCustomers||0,                       color:'text-teal-600'   },
    'category-revenue':{ label:'Top Category', value:stats?.categoryRevenue?.[0]?.category||'N/A',                                color:'text-blue-600'   },
    'map':            { label:'Top Division',   value:(()=>{ const m=BD_DIVISIONS.reduce((b,d)=>(stats?.divisionStats?.[d.id]?.revenue||0)>(stats?.divisionStats?.[b.id]?.revenue||0)?d:b,BD_DIVISIONS[0]); return m.name; })(), color:'text-violet-600' },
    'heatmap':        { label:'Peak Hour',      value:'See heatmap',                                                               color:'text-orange-600' },
  };
  return (
    <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-4">
      <div className="mb-3 flex items-center gap-2">
        <MdPushPin size={14} className="text-indigo-500"/>
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Pinned Widgets</h3>
        <span className="rounded-full bg-indigo-200 px-1.5 py-0.5 text-[10px] font-black text-indigo-700">{pinnedWidgets.length}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {pinnedWidgets.map(id => {
          const snap = snapshots[id] || { label:WIDGET_LABELS[id]||id, value:'—', color:'text-gray-600' };
          return (
            <div key={id} className="relative rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
              <button onClick={() => onUnpin(id)} className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-gray-300 transition-all hover:bg-red-100 hover:text-red-500">
                <MdClose size={11}/>
              </button>
              <p className="truncate pr-4 text-[10px] font-semibold text-gray-400">{snap.label}</p>
              <p className={`mt-1 text-base font-black truncate ${snap.color}`}>{snap.value}</p>
              <p className="mt-0.5 text-[9px] text-gray-400">{WIDGET_LABELS[id]}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ── CHART / WIDGET COMPONENTS ─────────────────────────────
// ══════════════════════════════════════════════════════════
const BangladeshMap = ({ divisionData, onHover, hoveredDiv, onLeave }) => {
  const maxVal=Math.max(...Object.values(divisionData).map(d=>d.revenue||0),1);
  const getColor=id=>{ const v=divisionData[id]?.revenue||0; if(!v) return '#f1f5f9'; const t=v/maxVal; return `rgb(${Math.round(199-t*132)},${Math.round(210-t*154)},${Math.round(254-t*52)})`; };
  return (
    <svg viewBox="0 30 320 290" className="h-full w-full" style={{ filter:'drop-shadow(0 4px 24px rgba(79,70,229,0.10))' }}>
      <defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e7ff" strokeWidth="0.5"/></pattern></defs>
      <rect x="0" y="0" width="320" height="350" fill="url(#grid)" rx="16"/>
      {BD_DIVISIONS.map(div => {
        const h=hoveredDiv===div.id;
        return (
          <g key={div.id} onMouseEnter={()=>onHover(div.id)} onMouseLeave={onLeave} style={{ cursor:'pointer' }}>
            <path d={div.path} fill={getColor(div.id)} stroke={h?'#4f46e5':'#c7d2fe'} strokeWidth={h?2.5:1.5}
              style={{ transition:'all 0.2s', filter:h?'drop-shadow(0 4px 12px rgba(79,70,229,0.35))':'none', transform:h?'scale(1.03)':'scale(1)', transformOrigin:`${div.cx}px ${div.cy}px` }}/>
            <text x={div.cx} y={div.cy-3} textAnchor="middle" fontSize={h?'8.5':'7.5'} fontWeight={h?'800':'600'} fill={h?'#3730a3':'#4f46e5'} style={{ pointerEvents:'none' }}>{div.name}</text>
            {divisionData[div.id]?.revenue>0 && <text x={div.cx} y={div.cy+9} textAnchor="middle" fontSize="6.5" fontWeight="700" fill={h?'#1e1b4b':'#6366f1'} style={{ pointerEvents:'none' }}>৳{(divisionData[div.id].revenue/1000).toFixed(1)}k</text>}
          </g>
        );
      })}
      <text x="148" y="318" textAnchor="middle" fontSize="8" fill="#94a3b8" fontStyle="italic">Bay of Bengal</text>
      <g transform="translate(285,48)">
        <circle cx="0" cy="0" r="12" fill="white" stroke="#e0e7ff" strokeWidth="1.5"/>
        <text x="0" y="-5" textAnchor="middle" fontSize="7" fontWeight="800" fill="#4f46e5">N</text>
        <line x1="0" y1="-3" x2="0" y2="3" stroke="#4f46e5" strokeWidth="1.5"/>
        <line x1="-3" y1="0" x2="3" y2="0" stroke="#c7d2fe" strokeWidth="1"/>
      </g>
    </svg>
  );
};

const MapSection = ({ divisionStats, pinBtn }) => {
  const [hoveredDiv,setHoveredDiv]=useState(null);
  const divisionData={}; BD_DIVISIONS.forEach(d=>{ divisionData[d.id]=divisionStats?.[d.id]||{}; });
  const totalRevenue=Object.values(divisionData).reduce((s,d)=>s+(d.revenue||0),0);
  const maxDiv=BD_DIVISIONS.reduce((b,d)=>(divisionData[d.id]?.revenue||0)>(divisionData[b.id]?.revenue||0)?d:b,BD_DIVISIONS[0]);
  const hInfo=BD_DIVISIONS.find(d=>d.id===hoveredDiv), hData=hoveredDiv?divisionData[hoveredDiv]:null;
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
        <div><h3 className="flex items-center gap-1.5 font-bold text-gray-900"><MdLocationOn size={16} className="text-indigo-500"/>Revenue by Division</h3><p className="mt-0.5 text-xs text-gray-400">Bangladesh — hover a division</p></div>
        <div className="flex items-center gap-2">
          {maxDiv&&divisionData[maxDiv.id]?.revenue>0&&<div className="text-right"><p className="text-[10px] text-gray-400">Top Division</p><p className="text-sm font-black text-indigo-600">{maxDiv.name}</p></div>}
          {pinBtn}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-0 md:grid-cols-5">
        <div className="relative p-4 md:col-span-3" style={{ minHeight:280 }}>
          <BangladeshMap divisionData={divisionData} onHover={setHoveredDiv} hoveredDiv={hoveredDiv} onLeave={()=>setHoveredDiv(null)}/>
          {hoveredDiv&&hInfo&&(
            <div className="pointer-events-none absolute bottom-4 left-4 min-w-[140px] rounded-xl border border-indigo-100 bg-white p-3 shadow-xl">
              <p className="text-sm font-bold text-indigo-700">{hInfo.name}</p>
              <div className="mt-1.5 space-y-1">
                {[['Revenue',`৳${(hData?.revenue||0).toLocaleString()}`],['Orders',hData?.orders||0],['Customers',hData?.customers||0]].map(([k,v])=>(
                  <div key={k} className="flex items-center justify-between gap-4"><span className="text-[10px] text-gray-500">{k}</span><span className="text-xs font-bold text-gray-900">{v}</span></div>
                ))}
                {totalRevenue>0&&<div className="mt-1 flex items-center justify-between border-t border-gray-100 pt-1"><span className="text-[10px] text-gray-500">Share</span><span className="text-xs font-black text-indigo-600">{Math.round(((hData?.revenue||0)/totalRevenue)*100)}%</span></div>}
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-gray-50 p-4 md:col-span-2 md:border-l md:border-t-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">All Divisions</p>
          <div className="space-y-2.5">
            {BD_DIVISIONS.map(d=>({...d,revenue:divisionData[d.id]?.revenue||0})).sort((a,b)=>b.revenue-a.revenue).map((div,i)=>{
              const pct=totalRevenue>0?(div.revenue/totalRevenue)*100:0;
              return (
                <div key={div.id} onMouseEnter={()=>setHoveredDiv(div.id)} onMouseLeave={()=>setHoveredDiv(null)}
                  className={`rounded-xl p-2.5 cursor-pointer transition-all ${hoveredDiv===div.id?'bg-indigo-50':'hover:bg-gray-50'}`}>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">{i===0&&div.revenue>0&&<span className="text-[10px] font-black text-amber-500">🏆</span>}<span className={`text-xs font-semibold ${hoveredDiv===div.id?'text-indigo-700':'text-gray-700'}`}>{div.name}</span></div>
                    <span className="text-xs font-bold text-gray-900">৳{(div.revenue/1000).toFixed(1)}k <span className="font-normal text-gray-400">{pct.toFixed(0)}%</span></span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width:`${pct}%`, background:hoveredDiv===div.id?'linear-gradient(90deg,#4f46e5,#818cf8)':'linear-gradient(90deg,#6366f1,#a5b4fc)' }}/>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4"><div className="h-2 w-full rounded-full" style={{ background:'linear-gradient(90deg,#f1f5f9,#c7d2fe,#6366f1,#3730a3)' }}/><div className="mt-1 flex justify-between text-[9px] text-gray-400"><span>Low</span><span>High</span></div></div>
        </div>
      </div>
    </div>
  );
};

const CustomerGrowthChart = ({ data=[], pinBtn }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <div><h3 className="flex items-center gap-1.5 font-bold text-gray-900"><MdTimeline size={16} className="text-emerald-500"/>Customer Growth</h3><p className="mt-0.5 text-xs text-gray-400">New vs returning customers</p></div>
      <div className="flex items-center gap-2"><div className="flex items-center gap-3 text-xs"><span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"/>New</span><span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-400"/>Returning</span></div>{pinBtn}</div>
    </div>
    {data.length===0?<div className="flex h-44 items-center justify-center text-sm text-gray-300">No data available</div>:(
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top:5, right:5, left:-20, bottom:0 }}>
          <defs>
            <linearGradient id="gN" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
            <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2}/><stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
          <XAxis dataKey="date" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false}/>
          <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false}/>
          <Tooltip contentStyle={{ borderRadius:10, fontSize:12, border:'1px solid #e5e7eb' }}/>
          <Area type="monotone" dataKey="newCustomers" name="New" stroke="#10b981" strokeWidth={2.5} fill="url(#gN)" dot={false} activeDot={{ r:5, strokeWidth:0 }}/>
          <Area type="monotone" dataKey="returning" name="Returning" stroke="#60a5fa" strokeWidth={2} fill="url(#gR)" dot={false} activeDot={{ r:4, strokeWidth:0 }}/>
        </AreaChart>
      </ResponsiveContainer>
    )}
  </div>
);

const CategoryRevenueChart = ({ data=[], pinBtn }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <div><h3 className="flex items-center gap-1.5 font-bold text-gray-900"><MdCategory size={16} className="text-blue-500"/>Category Revenue</h3><p className="mt-0.5 text-xs text-gray-400">Revenue by product category</p></div>
      {pinBtn}
    </div>
    {data.length===0?<div className="flex h-44 items-center justify-center text-sm text-gray-300">No data available</div>:(
      <>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top:5, right:5, left:-20, bottom:0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
            <XAxis dataKey="category" tick={{ fontSize:10, fill:'#9ca3af' }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false}/>
            <Tooltip cursor={{ fill:'#f8fafc' }} contentStyle={{ borderRadius:10, fontSize:12, border:'1px solid #e5e7eb' }} formatter={v=>[`৳${v.toLocaleString()}`,'Revenue']}/>
            <Bar dataKey="revenue" radius={[6,6,0,0]}>{data.map((_,i)=><Cell key={i} fill={CATEGORY_COLORS[i%CATEGORY_COLORS.length]}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.map((d,i)=><span key={d.category} className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background:`${CATEGORY_COLORS[i%CATEGORY_COLORS.length]}18`, color:CATEGORY_COLORS[i%CATEGORY_COLORS.length] }}><span className="h-1.5 w-1.5 rounded-full" style={{ background:CATEGORY_COLORS[i%CATEGORY_COLORS.length] }}/>{d.category}</span>)}
        </div>
      </>
    )}
  </div>
);

const PaymentBreakdown = ({ data=[], pinBtn }) => {
  const total=data.reduce((s,d)=>s+d.value,0);
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h3 className="flex items-center gap-1.5 font-bold text-gray-900"><MdPayment size={16} className="text-violet-500"/>Payment Methods</h3><p className="mt-0.5 text-xs text-gray-400">{total} total transactions</p></div>{pinBtn}</div>
      {data.length===0?<div className="flex h-44 items-center justify-center text-sm text-gray-300">No data</div>:(
        <>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart><Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>{data.map((_,i)=><Cell key={i} fill={PAYMENT_COLORS[i%PAYMENT_COLORS.length]}/>)}</Pie><Tooltip formatter={(v,n)=>[`${v} orders`,n]} contentStyle={{ borderRadius:10, fontSize:12 }}/></PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-2">
            {data.map((d,i)=>{ const pct=total?Math.round((d.value/total)*100):0; return <div key={d.name} className="flex items-center gap-2"><div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background:PAYMENT_COLORS[i%PAYMENT_COLORS.length] }}/><span className="flex-1 text-xs text-gray-600">{d.name}</span><span className="text-xs font-bold text-gray-800">{d.value}</span><span className="w-8 text-right text-xs text-gray-400">{pct}%</span></div>; })}
          </div>
        </>
      )}
    </div>
  );
};

const HourlySalesHeatmap = ({ data={}, pinBtn }) => {
  const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], HOURS=Array.from({length:24},(_,i)=>i);
  const maxVal=Math.max(...Object.values(data).flatMap(d=>Object.values(d)),1);
  const getLabel=h=>h===0?'12a':h===12?'12p':h<12?`${h}a`:`${h-12}p`;
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div><h3 className="flex items-center gap-1.5 font-bold text-gray-900"><MdSchedule size={16} className="text-orange-500"/>Hourly Sales Heatmap</h3><p className="mt-0.5 text-xs text-gray-400">Orders by day & hour</p></div>
        <div className="flex items-center gap-2"><div className="flex items-center gap-1.5"><div className="h-3 w-16 rounded-full" style={{ background:'linear-gradient(90deg,#fff7ed,#f97316)' }}/><div className="flex w-16 justify-between text-[9px] text-gray-400"><span>Low</span><span>High</span></div></div>{pinBtn}</div>
      </div>
      <div className="overflow-x-auto">
        <div style={{ minWidth:480 }}>
          <div className="mb-1 flex"><div className="w-8 flex-shrink-0"/>{HOURS.filter(h=>h%3===0).map(h=><div key={h} className="text-center text-[9px] text-gray-400" style={{ width:`${100/8}%` }}>{getLabel(h)}</div>)}</div>
          {DAYS.map(day=>(
            <div key={day} className="mb-0.5 flex items-center gap-1">
              <div className="w-7 flex-shrink-0 text-[10px] font-semibold text-gray-500">{day}</div>
              <div className="flex flex-1 gap-0.5">
                {HOURS.map(hour=>{ const val=data[day]?.[hour]||0, op=val/maxVal; return <div key={hour} title={`${day} ${getLabel(hour)}: ${val} orders`} className="group relative flex-1 cursor-pointer rounded-sm transition-transform hover:scale-125" style={{ height:14, background:op===0?'#f8fafc':`rgba(249,115,22,${0.12+op*0.88})`, border:'1px solid rgba(249,115,22,0.1)' }}>{val>0&&<div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-1.5 py-0.5 text-[9px] text-white group-hover:block">{val}</div>}</div>; })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ReturnRefundStats = ({ stats={}, pinBtn }) => {
  const items=[
    { label:'Total Returns',   value:stats.totalReturns||0,                             icon:MdAssignmentReturn, color:'text-red-500',   bg:'bg-red-50'   },
    { label:'Refund Amount',   value:`৳${(stats.refundAmount||0).toLocaleString()}`,     icon:MdAttachMoney,      color:'text-orange-600',bg:'bg-orange-50'},
    { label:'Return Rate',     value:`${(stats.returnRate||0).toFixed(1)}%`,             icon:MdTrendingDown,     color:'text-amber-600', bg:'bg-amber-50' },
    { label:'Avg Resolve Time',value:`${stats.avgResolveHours||0}h`,                     icon:MdSchedule,         color:'text-blue-600',  bg:'bg-blue-50'  },
  ];
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h3 className="flex items-center gap-1.5 font-bold text-gray-900"><MdAssignmentReturn size={16} className="text-red-500"/>Returns & Refunds</h3><p className="mt-0.5 text-xs text-gray-400">Return requests & refund overview</p></div>{pinBtn}</div>
      <div className="mb-4 grid grid-cols-2 gap-3">
        {items.map(({ label, value, icon:Icon, color, bg })=>(
          <div key={label} className={`${bg} flex items-center gap-3 rounded-xl p-3`}>
            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ${color}`}><Icon size={17}/></div>
            <div><p className="text-[10px] font-medium text-gray-500">{label}</p><p className={`text-sm font-black ${color}`}>{value}</p></div>
          </div>
        ))}
      </div>
      {stats.reasons?.length>0&&<div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Top Return Reasons</p><div className="space-y-2">{stats.reasons.map((r,i)=><div key={i} className="flex items-center gap-2"><span className="w-28 truncate text-xs text-gray-600">{r.reason}</span><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-red-400 transition-all duration-500" style={{ width:`${Math.round((r.count/(stats.reasons[0]?.count||1))*100)}%` }}/></div><span className="w-6 text-right text-xs font-bold text-gray-700">{r.count}</span></div>)}</div></div>}
    </div>
  );
};

const CouponAnalytics = ({ data={}, pinBtn }) => {
  const coupons=data.topCoupons||[];
  const summary=[
    { label:'Active Coupons',value:data.activeCoupons||0,                         color:'text-emerald-600',bg:'bg-emerald-50'},
    { label:'Total Redeemed',value:data.totalRedeemed||0,                         color:'text-blue-600',   bg:'bg-blue-50'  },
    { label:'Discount Given',value:`৳${(data.totalDiscount||0).toLocaleString()}`, color:'text-purple-600', bg:'bg-purple-50'},
    { label:'Avg Discount',  value:`${(data.avgDiscount||0).toFixed(0)}%`,        color:'text-amber-600',  bg:'bg-amber-50' },
  ];
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h3 className="flex items-center gap-1.5 font-bold text-gray-900"><MdLocalOffer size={16} className="text-emerald-500"/>Coupons & Promos</h3><p className="mt-0.5 text-xs text-gray-400">Coupon performance overview</p></div>{pinBtn}</div>
      <div className="mb-4 grid grid-cols-2 gap-2">{summary.map(({ label, value, color, bg })=><div key={label} className={`${bg} rounded-xl p-2.5`}><p className="text-[10px] text-gray-500">{label}</p><p className={`text-base font-black ${color}`}>{value}</p></div>)}</div>
      {coupons.length>0&&<div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Top Coupons</p><div className="space-y-2">{coupons.slice(0,5).map((c,i)=><div key={i} className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2"><span className="rounded-md bg-emerald-100 px-1.5 py-0.5 font-mono text-[10px] font-black text-emerald-700">{c.code}</span><span className="flex-1 text-xs text-gray-600">{c.used} used</span><span className="text-xs font-bold text-emerald-600">৳{(c.discount||0).toLocaleString()}</span></div>)}</div></div>}
    </div>
  );
};

const SatisfactionWidget = ({ data={}, pinBtn }) => {
  const score=data.avgRating||0, dist=data.distribution||[0,0,0,0,0], maxD=Math.max(...dist,1);
  const renderStars=r=>[1,2,3,4,5].map(s=>{ const Icon=s<=Math.floor(r)?MdStar:s<=r+0.5?MdStarHalf:MdStarOutline; return <Icon key={s} size={16} className={s<=r+0.5?'text-amber-400':'text-gray-300'}/>; });
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><h3 className="flex items-center gap-1.5 font-bold text-gray-900"><MdStar size={16} className="text-amber-400"/>Customer Satisfaction</h3><p className="mt-0.5 text-xs text-gray-400">{(data.totalReviews||0).toLocaleString()} reviews</p></div>{pinBtn}</div>
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-50"><span className="text-3xl font-black text-amber-500">{score.toFixed(1)}</span></div>
        <div>
          <div className="flex">{renderStars(score)}</div>
          <p className="mt-1 text-xs text-gray-500">{score>=4.5?'Excellent':score>=4?'Very Good':score>=3?'Good':'Needs Improvement'}</p>
          <div className="mt-2 flex gap-2">
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600"><MdThumbUp size={11}/>{data.positive||0}</span>
            <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-500"><MdThumbDown size={11}/>{data.negative||0}</span>
          </div>
        </div>
      </div>
      <div className="space-y-1.5">{[5,4,3,2,1].map(star=>{ const count=dist[5-star]||0; return <div key={star} className="flex items-center gap-2"><span className="flex w-4 items-center text-[10px] font-semibold text-gray-600">{star}</span><MdStar size={10} className="flex-shrink-0 text-amber-400"/><div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-amber-400 transition-all duration-700" style={{ width:`${Math.round((count/maxD)*100)}%` }}/></div><span className="w-6 text-right text-[10px] text-gray-400">{count}</span></div>; })}</div>
    </div>
  );
};

const LiveActivityFeed = ({ activities=[], pinBtn }) => {
  const getIcon=t=>({ order:{Icon:MdShoppingBag,color:'text-blue-500',bg:'bg-blue-50'}, payment:{Icon:MdAttachMoney,color:'text-green-500',bg:'bg-green-50'}, user:{Icon:MdPerson,color:'text-purple-500',bg:'bg-purple-50'}, refund:{Icon:MdAssignmentReturn,color:'text-red-500',bg:'bg-red-50'}, coupon:{Icon:MdLocalOffer,color:'text-amber-500',bg:'bg-amber-50'}, shipped:{Icon:MdLocalShipping,color:'text-cyan-500',bg:'bg-cyan-50'} }[t]||{Icon:MdNotifications,color:'text-gray-500',bg:'bg-gray-100'});
  const timeAgo=ts=>{ if(!ts) return ''; const s=Math.floor((Date.now()-new Date(ts))/1000); return s<60?`${s}s ago`:s<3600?`${Math.floor(s/60)}m ago`:s<86400?`${Math.floor(s/3600)}h ago`:`${Math.floor(s/86400)}d ago`; };
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
        <div className="flex items-center gap-2"><div className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"/><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"/></div><h3 className="font-bold text-gray-900">Live Activity</h3><span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-600">LIVE</span></div>
        {pinBtn}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {activities.length===0?<div className="flex h-40 items-center justify-center text-sm text-gray-300">No recent activity</div>:(
          <div className="divide-y divide-gray-50">
            {activities.map((a,i)=>{ const { Icon, color, bg }=getIcon(a.type); return <div key={i} className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-gray-50/50"><div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}><Icon size={15}/></div><div className="min-w-0 flex-1"><p className="text-xs font-semibold leading-snug text-gray-800">{a.message}</p>{a.detail&&<p className="mt-0.5 truncate text-[10px] text-gray-400">{a.detail}</p>}</div><span className="mt-0.5 flex-shrink-0 text-[10px] text-gray-400">{timeAgo(a.timestamp)}</span></div>; })}
          </div>
        )}
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm shadow-lg"><p className="mb-1 font-semibold text-gray-700">{label}</p>{payload.map((p,i)=><p key={i} style={{ color:p.color }} className="font-bold">{p.name==='revenue'?`৳${p.value?.toLocaleString()}`:p.value}</p>)}</div>;
};

const QuickAction = ({ icon:Icon, label, color, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed transition-all hover:border-solid hover:shadow-sm ${color} cursor-pointer`}>
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm"><Icon size={20}/></div>
    <span className="text-center text-xs font-semibold leading-tight text-gray-700">{label}</span>
  </button>
);

// ══════════════════════════════════════════════════════════
// ── MAIN DASHBOARD ────────────────────────────────────────
// ══════════════════════════════════════════════════════════
export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stats, salesChart, recentOrders, loading } = useSelector(s => s.dashboard);

  const [period,       setPeriod]       = useState('30d');
  const [refreshing,   setRefreshing]   = useState(false);
  const [dateRange,    setDateRange]    = useState(null);
  const [compareMode,  setCompareMode]  = useState(false);
  const [pinnedWidgets, setPinnedWidgets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dash_pins')||'[]'); } catch { return []; }
  });

  const togglePin = useCallback(id => {
    setPinnedWidgets(prev => {
      const next = prev.includes(id) ? prev.filter(p=>p!==id) : [...prev, id];
      try { localStorage.setItem('dash_pins', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const loadAll = (range = dateRange) => {
    dispatch(fetchDashboardStats({ dateRange:range }));
    dispatch(fetchRecentOrders({ dateRange:range }));
    dispatch(fetchSalesChart({ period, dateRange:range }));
  };

  useEffect(() => { loadAll(); }, [dispatch]);
  useEffect(() => { dispatch(fetchSalesChart({ period, dateRange })); }, [dispatch, period, dateRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([dispatch(fetchDashboardStats({ dateRange })), dispatch(fetchRecentOrders({ dateRange })), dispatch(fetchSalesChart({ period, dateRange }))]);
    setRefreshing(false);
  };

  const handleDateChange = range => { setDateRange(range); loadAll(range); };

  const pinBtn = id => <PinButton widgetId={id} pinnedWidgets={pinnedWidgets} onToggle={togglePin}/>;

  const pieData = [
    { name:'Pending',    value:stats?.ordersByStatus?.pending||0    },
    { name:'Processing', value:stats?.ordersByStatus?.processing||0 },
    { name:'Shipped',    value:stats?.ordersByStatus?.shipped||0    },
    { name:'Delivered',  value:stats?.ordersByStatus?.delivered||0  },
    { name:'Cancelled',  value:stats?.ordersByStatus?.cancelled||0  },
  ].filter(d=>d.value>0);
  const totalOrders = pieData.reduce((s,d)=>s+d.value,0);

  const hour     = new Date().getHours();
  const greeting = hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';
  const cmp      = stats?.previousPeriod || {};

  return (
    <div className="space-y-6">

      {/* ── Top Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">{greeting} 👋</h2>
          <p className="mt-0.5 text-sm text-gray-500">{new Date().toLocaleDateString('en-BD',{ weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Picker */}
          <DateRangePicker value={dateRange} onChange={handleDateChange}/>

          {/* Comparison Mode Toggle */}
          <button onClick={() => setCompareMode(m=>!m)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold shadow-sm transition-all ${compareMode?'border-indigo-400 bg-indigo-600 text-white':'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'}`}>
            <MdCompareArrows size={16}/> Compare
          </button>

          {/* Export */}
          <ExportButton stats={stats} salesChart={salesChart} recentOrders={recentOrders}/>

          {/* Refresh */}
          <button onClick={handleRefresh} disabled={refreshing} className="btn-outline gap-2">
            <MdRefresh size={16} className={refreshing?'animate-spin':''}/> Refresh
          </button>
        </div>
      </div>

      {/* ── Active date range banner ── */}
      {dateRange?.start && dateRange?.end && (
        <div className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5">
          <MdCalendarToday size={14} className="text-indigo-500"/>
          <span className="text-xs font-semibold text-indigo-700">
            Showing: <strong>{fmt(dateRange.start)}</strong> → <strong>{fmt(dateRange.end)}</strong>
          </span>
          <button onClick={() => handleDateChange(null)} className="ml-auto flex items-center gap-1 text-xs font-semibold text-indigo-500 transition-colors hover:text-indigo-700">
            <MdClose size={13}/> Clear
          </button>
        </div>
      )}

      {/* ── Pinned Widgets ── */}
      <PinnedSection pinnedWidgets={pinnedWidgets} onUnpin={togglePin} stats={stats} salesChart={salesChart}/>

      {/* ── Primary Stat Cards ── */}
      {loading && !stats
        ? <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0,1,2,3].map(i=><StatCardSkeleton key={i}/>)}</div>
        : <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard title="Total Revenue"   value={`৳${(stats?.totalRevenue||0).toLocaleString()}`}  icon={MdAttachMoney} color="green"  trend={stats?.revenueTrend} subtitle="vs last month"/>
            <StatCard title="Total Orders"    value={(stats?.totalOrders||0).toLocaleString()}          icon={MdShoppingBag} color="blue"   trend={stats?.orderTrend}   subtitle="vs last month"/>
            <StatCard title="Total Products"  value={stats?.totalProducts||0}                           icon={MdInventory}   color="purple" subtitle={stats?.lowStock>0?`⚠️ ${stats.lowStock} low stock`:'All stocked'}/>
            <StatCard title="Total Customers" value={stats?.totalUsers||0}                              icon={MdPeople}      color="amber"  trend={stats?.userTrend}    subtitle="Registered users"/>
          </div>
      }

      {/* ── Comparison Mode ── */}
      {compareMode && stats && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4">
          <div className="mb-3 flex items-center gap-2">
            <MdCompareArrows size={15} className="text-indigo-500"/>
            <h3 className="text-sm font-bold text-gray-700">Period Comparison</h3>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-600">COMPARE MODE ON</span>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <CompareCard label="Revenue"    prefix="৳" current={stats.totalRevenue||0}   previous={cmp.totalRevenue||0}/>
            <CompareCard label="Orders"               current={stats.totalOrders||0}    previous={cmp.totalOrders||0}/>
            <CompareCard label="Customers"            current={stats.totalUsers||0}     previous={cmp.totalUsers||0}/>
            <CompareCard label="Avg Order"  prefix="৳" current={stats.avgOrderValue||0} previous={cmp.avgOrderValue||0}/>
          </div>
          {salesChart.length > 0 && (
            <div className="rounded-2xl border border-indigo-100 bg-white p-4">
              <h4 className="mb-3 text-xs font-bold text-gray-700">Revenue — Current vs Previous Period</h4>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={salesChart} margin={{ top:5, right:5, left:-20, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                  <XAxis dataKey="date" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Line type="monotone" dataKey="revenue"         name="revenue"  stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r:5 }}/>
                  <Line type="monotone" dataKey="previousRevenue" name="previous" stroke="#d1d5db" strokeWidth={2} strokeDasharray="5 5" dot={false}/>
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-2 flex gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-5 rounded-full bg-indigo-500"/><span className="text-gray-500">This period</span></span>
                <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-5 rounded border-t-2 border-dashed border-gray-400"/><span className="text-gray-500">Previous period</span></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Secondary Stats ── */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {[
            { label:"Today's Orders",  value:stats.todayOrders||0,                                 color:'text-blue-600',    bg:'bg-blue-50'    },
            { label:"Today's Revenue", value:`৳${(stats.todayRevenue||0).toLocaleString()}`,        color:'text-green-600',   bg:'bg-green-50'   },
            { label:'Pending Orders',  value:stats.ordersByStatus?.pending||0,                      color:'text-amber-600',   bg:'bg-amber-50'   },
            { label:'Avg Order Value', value:`৳${(stats.avgOrderValue||0).toLocaleString()}`,       color:'text-purple-600',  bg:'bg-purple-50'  },
            { label:'Return Rate',     value:`${(stats.returnStats?.returnRate||0).toFixed(1)}%`,   color:'text-red-500',     bg:'bg-red-50'     },
            { label:'Active Coupons',  value:stats.couponStats?.activeCoupons||0,                   color:'text-emerald-600', bg:'bg-emerald-50' },
            { label:'Avg Rating',      value:`${(stats.satisfaction?.avgRating||0).toFixed(1)}★`,  color:'text-amber-500',   bg:'bg-amber-50'   },
            { label:'Gross Margin',    value:`${(stats.grossMargin||0).toFixed(0)}%`,              color:'text-indigo-600',  bg:'bg-indigo-50'  },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl px-3 py-3 flex flex-col gap-1`}>
              <span className="text-[10px] font-semibold leading-tight text-gray-500">{label}</span>
              <span className={`text-base font-extrabold ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Sales Chart + Order Status ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
          {loading && !salesChart.length ? <ChartSkeleton height={230}/> : (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div><h3 className="font-bold text-gray-900">Sales Overview</h3><p className="mt-0.5 text-sm text-gray-500">Total: <span className="font-bold text-gray-800">৳{salesChart.reduce((s,d)=>s+(d.revenue||0),0).toLocaleString()}</span></p></div>
                <div className="flex items-center gap-2">
                  {pinBtn('sales-chart')}
                  <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
                    {PERIODS.map(({ key, label }) => <button key={key} onClick={()=>setPeriod(key)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period===key?'bg-white text-gray-900 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>{label}</button>)}
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={salesChart} margin={{ top:5, right:5, left:-20, bottom:0 }}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b5bdb" stopOpacity={0.18}/><stop offset="95%" stopColor="#3b5bdb" stopOpacity={0}/></linearGradient>
                    <linearGradient id="gOrd" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                  <XAxis dataKey="date" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Area type="monotone" dataKey="revenue" name="revenue" stroke="#3b5bdb" strokeWidth={2.5} fill="url(#gRev)" dot={false} activeDot={{ r:5, strokeWidth:0 }}/>
                  {salesChart[0]?.orders!==undefined && <Area type="monotone" dataKey="orders" name="orders" stroke="#10b981" strokeWidth={2} fill="url(#gOrd)" dot={false} activeDot={{ r:4, strokeWidth:0 }}/>}
                </AreaChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-1 flex items-center justify-between"><h3 className="font-bold text-gray-900">Order Status</h3>{pinBtn('order-status')}</div>
          <p className="mb-4 text-sm text-gray-500">{totalOrders} total orders</p>
          {loading && !stats ? <Shimmer className="h-44 w-full"/> : totalOrders===0 ? <div className="flex h-44 items-center justify-center text-sm text-gray-300">No data</div> : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3}>{pieData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}</Pie><Tooltip formatter={(v,n)=>[`${v} orders`,n]} contentStyle={{ borderRadius:10, fontSize:12 }}/></PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {pieData.map((d,i)=>{ const pct=totalOrders?Math.round((d.value/totalOrders)*100):0; return <div key={d.name} className="flex items-center gap-2"><div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background:PIE_COLORS[i%PIE_COLORS.length] }}/><span className="flex-1 text-xs capitalize text-gray-600">{d.name}</span><span className="text-xs font-bold text-gray-800">{d.value}</span><span className="w-8 text-right text-xs text-gray-400">{pct}%</span></div>; })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Customer Growth + Category Revenue ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CustomerGrowthChart data={stats?.customerGrowth||[]}   pinBtn={pinBtn('customer-growth')}/>
        <CategoryRevenueChart data={stats?.categoryRevenue||[]} pinBtn={pinBtn('category-revenue')}/>
      </div>

      {/* ── Heatmap ── */}
      <HourlySalesHeatmap data={stats?.hourlyHeatmap||{}} pinBtn={pinBtn('heatmap')}/>

      {/* ── Map ── */}
      <MapSection divisionStats={stats?.divisionStats||{}} pinBtn={pinBtn('map')}/>

      {/* ── Payment + Satisfaction + Coupons ── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <PaymentBreakdown   data={stats?.paymentMethods||[]}  pinBtn={pinBtn('payment')}/>
        <SatisfactionWidget data={stats?.satisfaction||{}}    pinBtn={pinBtn('satisfaction')}/>
        <CouponAnalytics    data={stats?.couponStats||{}}      pinBtn={pinBtn('coupons')}/>
      </div>

      {/* ── Returns + Activity ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReturnRefundStats stats={stats?.returnStats||{}}      pinBtn={pinBtn('returns')}/>
        <LiveActivityFeed  activities={stats?.recentActivity||[]} pinBtn={pinBtn('activity')}/>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <button onClick={() => navigate('/orders')} className="flex items-center gap-1 text-sm font-semibold text-primary-500 hover:underline">View all <MdArrowForward size={14}/></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50/60 text-xs font-semibold uppercase tracking-wider text-gray-500">{['Order','Customer','Amount','Status','Date'].map(h=><th key={h} className="px-5 py-3 text-left">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {loading && recentOrders.length===0 ? <tr><td colSpan={5}><TableSkeleton rows={5}/></td></tr>
                  : recentOrders.length===0 ? <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400">No recent orders</td></tr>
                  : recentOrders.map(o => {
                      const StatusIcon=STATUS_ICONS[o.status]||MdShoppingBag;
                      return (
                        <tr key={o._id} className="group transition-colors hover:bg-gray-50/50">
                          <td className="px-5 py-3"><span className="rounded-lg bg-gray-100 px-2 py-1 font-mono text-xs font-bold text-gray-600">#{o._id?.slice(-6).toUpperCase()}</span></td>
                          <td className="px-5 py-3"><div className="flex items-center gap-2"><div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold uppercase text-primary-600">{o.user?.name?.[0]||'?'}</div><span className="text-xs font-medium text-gray-800">{o.user?.name||'Guest'}</span></div></td>
                          <td className="px-5 py-3 font-bold text-gray-900">৳{o.totalPrice?.toLocaleString()}</td>
                          <td className="px-5 py-3"><div className="flex items-center gap-1.5"><StatusIcon size={13} className={`${o.status==='delivered'?'text-green-500':o.status==='cancelled'?'text-red-500':o.status==='pending'?'text-amber-500':'text-blue-500'}`}/><Badge type={ORDER_STATUS_BADGE[o.status]||'gray'}>{o.status}</Badge></div></td>
                          <td className="px-5 py-3 text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('en-BD',{ day:'2-digit', month:'short' })}</td>
                        </tr>
                      );
                    })
                }
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-5">
          {stats?.topProducts?.length>0&&(
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between"><h3 className="text-sm font-bold text-gray-900">Top Products</h3><button onClick={()=>navigate('/products')} className="flex items-center gap-1 text-xs font-semibold text-primary-500 hover:underline">All <MdArrowForward size={12}/></button></div>
              <div className="space-y-3">{stats.topProducts.slice(0,5).map((p,i)=><div key={p._id||i} className="flex items-center gap-3"><span className={`text-xs font-black w-5 flex-shrink-0 ${i===0?'text-amber-500':'text-gray-400'}`}>#{i+1}</span><div className="h-10 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">{p.image&&<img src={p.image} alt="" className="h-full w-full object-cover"/>}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-gray-800">{p.title}</p><p className="text-xs text-gray-400">{p.sold||0} sold</p></div><span className="flex-shrink-0 text-xs font-bold text-gray-900">৳{(p.revenue||p.price||0).toLocaleString()}</span></div>)}</div>
            </div>
          )}
          {stats?.lowStockProducts?.length>0&&(
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="mb-3 flex items-center gap-2"><MdWarning size={16} className="text-amber-500"/><h3 className="text-sm font-bold text-amber-800">Low Stock Alert</h3></div>
              <div className="space-y-2">{stats.lowStockProducts.slice(0,4).map((p,i)=><div key={i} className="flex items-center justify-between"><span className="flex-1 truncate text-xs text-amber-700">{p.title}</span><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.stock===0?'bg-red-100 text-red-600':'bg-amber-100 text-amber-700'}`}>{p.stock===0?'Out':`${p.stock} left`}</span></div>)}</div>
              <button onClick={()=>navigate('/products')} className="mt-3 flex items-center gap-1 text-xs font-semibold text-amber-700 hover:underline">Manage Stock <MdArrowForward size={12}/></button>
            </div>
          )}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-gray-900">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <QuickAction icon={MdAdd}         label="Add Product" color="border-blue-200 hover:bg-blue-50"    onClick={()=>navigate('/products')}/>
              <QuickAction icon={MdShoppingBag} label="View Orders" color="border-green-200 hover:bg-green-50"   onClick={()=>navigate('/orders')}/>
              <QuickAction icon={MdPeople}      label="Customers"   color="border-purple-200 hover:bg-purple-50" onClick={()=>navigate('/users')}/>
              <QuickAction icon={MdVisibility}  label="Flash Deals" color="border-amber-200 hover:bg-amber-50"  onClick={()=>navigate('/flash-deals')}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}