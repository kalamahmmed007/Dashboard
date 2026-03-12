import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  MdInventory, MdWarning, MdAdd, MdSearch, MdFilterList,
  MdEdit, MdDelete, MdTrendingUp, MdTrendingDown, MdRefresh,
  MdCheckCircle, MdCancel, MdArrowForward, MdClose, MdSave,
  MdUpload, MdDownload, MdBarChart, MdMoreVert, MdAttachMoney,
  MdPeople, MdHistory, MdQrCode, MdPrint, MdViewColumn,
  MdSelectAll, MdDeselect, MdSwapVert, MdArrowDropDown,
  MdArrowDropUp, MdContentCopy, MdCategory, MdStorefront,
  MdLocalShipping, MdAutorenew, MdNotifications, MdLabel,
  MdStar, MdStarBorder, MdInfo, MdChevronLeft, MdChevronRight,
  MdOpenInNew, MdDragIndicator, MdSpeed, MdAnalytics,
} from 'react-icons/md';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, AreaChart, Area, Cell, LineChart,
  Line, PieChart, Pie, RadialBarChart, RadialBar, Legend,
  ScatterChart, Scatter, ReferenceLine,
} from 'recharts';

// ══════════════════════════════════════════════════════════
// FAKE DATA
// ══════════════════════════════════════════════════════════

const FAKE_PRODUCTS = [
  { _id:'p001', title:'Samsung Galaxy A54 5G',     category:'Electronics',     sku:'SAM-A54-BLK', stock:45,  threshold:10, costPrice:32000, sellPrice:38500, supplier:'TechZone BD',   status:'active',   tags:['bestseller'], reorderQty:50, leadDays:7  },
  { _id:'p002', title:'Nike Air Max 270',           category:'Footwear',        sku:'NK-AM270-42',  stock:8,   threshold:15, costPrice:9000,  sellPrice:12500, supplier:'Sports World',  status:'active',   tags:['low-stock'],  reorderQty:30, leadDays:14 },
  { _id:'p003', title:'Dove Body Wash 500ml',       category:'Personal Care',   sku:'DOV-BW-500',   stock:120, threshold:20, costPrice:300,   sellPrice:450,   supplier:'Daily Needs',   status:'active',   tags:[],             reorderQty:100,leadDays:3  },
  { _id:'p004', title:'Aluminium Laptop Stand',    category:'Accessories',     sku:'LAP-STD-ALU',  stock:3,   threshold:5,  costPrice:2200,  sellPrice:3200,  supplier:'GadgetHub',     status:'active',   tags:['critical'],   reorderQty:20, leadDays:10 },
  { _id:'p005', title:'Organic Green Tea 100g',    category:'Food & Beverage', sku:'TEA-GRN-100',  stock:65,  threshold:25, costPrice:200,   sellPrice:320,   supplier:'Nature Pure',   status:'active',   tags:[],             reorderQty:200,leadDays:5  },
  { _id:'p006', title:'USB-C Hub 7-in-1',          category:'Electronics',     sku:'USB-C7-HUB',   stock:22,  threshold:10, costPrice:1800,  sellPrice:2800,  supplier:'TechZone BD',   status:'active',   tags:[],             reorderQty:40, leadDays:7  },
  { _id:'p007', title:'Wireless Earbuds Pro',      category:'Electronics',     sku:'WE-PRO-WHT',   stock:0,   threshold:8,  costPrice:2500,  sellPrice:3800,  supplier:'AudioWorld',    status:'inactive', tags:['out-of-stock'],reorderQty:25, leadDays:12 },
  { _id:'p008', title:'Leather Wallet Slim',       category:'Accessories',     sku:'LTH-WLT-BRN',  stock:37,  threshold:10, costPrice:650,   sellPrice:980,   supplier:'Fashion Hub',   status:'active',   tags:[],             reorderQty:50, leadDays:6  },
  { _id:'p009', title:'Whey Protein 1kg Choco',    category:'Health & Fitness',sku:'WHP-1KG-CHC',  stock:14,  threshold:15, costPrice:2800,  sellPrice:4200,  supplier:'FitLife Store', status:'active',   tags:['low-stock'],  reorderQty:30, leadDays:8  },
  { _id:'p010', title:'Ceramic Coffee Mug 350ml',  category:'Kitchen',         sku:'CRM-MUG-350',  stock:88,  threshold:20, costPrice:180,   sellPrice:290,   supplier:'HomeDecor BD',  status:'active',   tags:[],             reorderQty:120,leadDays:4  },
  { _id:'p011', title:'Mechanical Keyboard TKL',   category:'Electronics',     sku:'MKB-TKL-BLK',  stock:7,   threshold:8,  costPrice:3500,  sellPrice:5200,  supplier:'TechZone BD',   status:'active',   tags:['low-stock'],  reorderQty:20, leadDays:10 },
  { _id:'p012', title:'Yoga Mat Non-Slip 6mm',     category:'Health & Fitness',sku:'YGA-MT-6MM',   stock:0,   threshold:10, costPrice:550,   sellPrice:850,   supplier:'FitLife Store', status:'inactive', tags:['out-of-stock'],reorderQty:35, leadDays:7  },
  { _id:'p013', title:'Stainless Water Bottle 1L', category:'Kitchen',         sku:'STL-BTL-1L',   stock:55,  threshold:15, costPrice:420,   sellPrice:680,   supplier:'HomeDecor BD',  status:'active',   tags:[],             reorderQty:60, leadDays:4  },
  { _id:'p014', title:'Running Shorts Dry-Fit',    category:'Footwear',        sku:'RUN-SHT-BLK',  stock:31,  threshold:12, costPrice:600,   sellPrice:950,   supplier:'Sports World',  status:'active',   tags:[],             reorderQty:40, leadDays:10 },
  { _id:'p015', title:'Vitamin C Supplement 60tab',category:'Health & Fitness',sku:'VTC-60T-500',  stock:90,  threshold:30, costPrice:350,   sellPrice:580,   supplier:'FitLife Store', status:'active',   tags:['bestseller'], reorderQty:150,leadDays:5  },
  { _id:'p016', title:'Smart Watch Fitness Band',  category:'Electronics',     sku:'SWF-BND-BLK',  stock:19,  threshold:8,  costPrice:4500,  sellPrice:6800,  supplier:'TechZone BD',   status:'active',   tags:[],             reorderQty:25, leadDays:9  },
];

const AUDIT_LOG = {
  p001: [
    { date:'2025-07-18', type:'restock',  qty:+50, note:'New shipment arrived',      user:'Admin' },
    { date:'2025-07-12', type:'sale',     qty:-5,  note:'Bulk order #ORD-9821',       user:'System' },
    { date:'2025-07-05', type:'adjust',   qty:-2,  note:'Damaged during transit',     user:'Manager' },
    { date:'2025-06-28', type:'restock',  qty:+30, note:'Regular reorder fulfilled',  user:'Admin' },
  ],
  p002: [
    { date:'2025-07-17', type:'sale',     qty:-3,  note:'Order #ORD-9845',            user:'System' },
    { date:'2025-07-10', type:'restock',  qty:+15, note:'Partial shipment received',  user:'Admin' },
    { date:'2025-06-30', type:'adjust',   qty:-1,  note:'Defective item returned',    user:'Manager' },
  ],
  default: [
    { date:'2025-07-15', type:'restock',  qty:+20, note:'Regular restock',            user:'Admin' },
    { date:'2025-07-08', type:'sale',     qty:-8,  note:'Orders fulfilled',            user:'System' },
  ],
};

const STOCK_HISTORY = [
  { date:'Jan', added:320, removed:210, value:3800000, orders:142 },
  { date:'Feb', added:280, removed:190, value:3950000, orders:161 },
  { date:'Mar', added:410, removed:340, value:4100000, orders:198 },
  { date:'Apr', added:260, removed:220, value:4050000, orders:175 },
  { date:'May', added:380, removed:290, value:4300000, orders:210 },
  { date:'Jun', added:450, removed:310, value:4600000, orders:238 },
  { date:'Jul', added:310, removed:270, value:4872500, orders:225 },
];

const SUPPLIERS = ['All Suppliers','TechZone BD','Sports World','Daily Needs','GadgetHub','Nature Pure','AudioWorld','Fashion Hub','FitLife Store','HomeDecor BD'];
const CATEGORIES = ['All','Electronics','Footwear','Personal Care','Accessories','Food & Beverage','Health & Fitness','Kitchen'];
const CAT_COLORS  = { Electronics:'#3b82f6', Footwear:'#8b5cf6', 'Personal Care':'#ec4899', Accessories:'#f59e0b', 'Food & Beverage':'#10b981', 'Health & Fitness':'#ef4444', Kitchen:'#06b6d4' };
const PAGE_SIZES  = [10, 25, 50];

// ══════════════════════════════════════════════════════════
// API HOOKS  (Uncomment when connecting backend)
// ══════════════════════════════════════════════════════════

// import { useDispatch, useSelector } from 'react-redux';
// import {
//   fetchProducts, fetchStockStats, fetchAuditLog,
//   updateProduct, deleteProduct, addProduct,
//   bulkDeleteProducts, bulkUpdateStatus,
//   adjustStock, reorderProduct, exportProducts,
// } from '../redux/slices/stockSlice';

// const dispatch = useDispatch();
// const { products, stats, loading, pagination } = useSelector(s => s.stock);
// useEffect(() => { dispatch(fetchProducts({ page, search, category, supplier, sortKey, sortDir, pageSize })); }, [deps]);
// const handleExport = () => dispatch(exportProducts({ format: 'csv', ids: selected }));
// const handleBulkDelete = () => dispatch(bulkDeleteProducts(selected));
// const handleBulkStatus = (status) => dispatch(bulkUpdateStatus({ ids: selected, status }));
// const handleReorder = (id) => dispatch(reorderProduct(id));
// const fetchLog = (id) => dispatch(fetchAuditLog(id));

// ══════════════════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════════════════

const fmt    = n => '৳' + Number(n).toLocaleString('en-BD');
const fmtNum = n => Number(n).toLocaleString('en-BD');
const pct    = (a, b) => b > 0 ? Math.round((a / b) * 100) : 0;

const getStatus = (stock, threshold) => {
  if (stock === 0)        return { key:'out',  label:'Out of Stock', badge:'danger',  dot:'#ef4444' };
  if (stock <= threshold) return { key:'low',  label:'Low Stock',    badge:'warning', dot:'#f59e0b' };
  return                         { key:'ok',   label:'In Stock',     badge:'success', dot:'#10b981' };
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
      {up ? <MdTrendingUp size={13}/> : <MdTrendingDown size={13}/>}{Math.abs(value)}%
    </div>
  );
};

const StatCard = ({ title, value, icon:Icon, color, trend, subtitle, onClick }) => {
  const c = { green:'bg-green-50 text-green-500 border-green-100', blue:'bg-blue-50 text-blue-500 border-blue-100', amber:'bg-amber-50 text-amber-500 border-amber-100', red:'bg-red-50 text-red-500 border-red-100', purple:'bg-purple-50 text-purple-500 border-purple-100' };
  return (
    <div onClick={onClick} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 ${onClick ? 'cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all' : ''}`}>
      <div className="flex items-start justify-between">
        <div className={`${c[color]} border rounded-xl p-2.5`}><Icon size={20}/></div>
        {trend != null && <TrendBadge value={trend}/>}
      </div>
      <div>
        <p className="text-2xl font-extrabold tracking-tight text-gray-900">{value}</p>
        <p className="mt-0.5 text-xs font-semibold text-gray-500">{title}</p>
        {subtitle && <p className="mt-0.5 text-[11px] text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );
};

const Tooltip2 = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm shadow-lg">
      <p className="mb-1 font-semibold text-gray-700">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-bold">
          {p.name === 'value' ? fmt(p.value) : `${fmtNum(p.value)} ${p.name === 'orders' ? 'orders' : 'units'}`}
        </p>
      ))}
    </div>
  );
};

// Mini sparkline bar
const MiniBar = ({ value, max, color }) => (
  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
    <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct(value, max))}%`, background: color }}/>
  </div>
);

// Pill tag
const Tag = ({ label }) => {
  const colors = { bestseller:'bg-amber-100 text-amber-700', 'low-stock':'bg-orange-100 text-orange-700', critical:'bg-red-100 text-red-700', 'out-of-stock':'bg-gray-100 text-gray-500' };
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors[label] || 'bg-gray-100 text-gray-500'}`}>{label}</span>;
};

// Progress ring
const Ring = ({ value, max, color, size = 52 }) => {
  const r = 20; const circ = 2 * Math.PI * r;
  const fill = circ - (pct(value, max) / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r={r} fill="none" stroke="#f3f4f6" strokeWidth="4"/>
      <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={fill} strokeLinecap="round"
        transform="rotate(-90 24 24)" style={{ transition: 'stroke-dashoffset .6s ease' }}/>
      <text x="24" y="28" textAnchor="middle" fontSize="10" fontWeight="800" fill={color}>{pct(value,max)}%</text>
    </svg>
  );
};

// ══════════════════════════════════════════════════════════
// PRODUCT DRAWER
// ══════════════════════════════════════════════════════════

const ProductDrawer = ({ product, onClose, onEdit, onAdjust, onReorder }) => {
  const [tab, setTab] = useState('overview');
  if (!product) return null;
  const s = getStatus(product.stock, product.threshold);
  const margin = pct(product.sellPrice - product.costPrice, product.sellPrice);
  const profit = product.sellPrice - product.costPrice;
  const stockValue = product.stock * product.costPrice;
  const log = AUDIT_LOG[product._id] || AUDIT_LOG.default;

  const LOG_COLORS = { restock:'text-green-600 bg-green-50', sale:'text-blue-600 bg-blue-50', adjust:'text-amber-600 bg-amber-50' };
  const LOG_ICONS  = { restock:'▲', sale:'↘', adjust:'~' };

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/30 backdrop-blur-sm"/>
      <div className="flex w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1 pr-3">
              <p className="mb-0.5 font-mono text-xs text-gray-400">{product.sku}</p>
              <h2 className="font-extrabold leading-tight text-gray-900">{product.title}</h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Badge type={s.badge}>{s.label}</Badge>
                <Badge type="gray">{product.category}</Badge>
                {product.tags.map(t => <Tag key={t} label={t}/>)}
              </div>
            </div>
            <button onClick={onClose} className="flex-shrink-0 rounded-lg p-1.5 hover:bg-gray-100"><MdClose size={20} className="text-gray-500"/></button>
          </div>
          {/* Sub-tabs */}
          <div className="mt-4 flex gap-1 rounded-xl bg-gray-100 p-1">
            {['overview','history','reorder'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${tab===t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 px-6 py-5">
          {tab === 'overview' && (
            <>
              {/* Stock visual */}
              <div className="flex items-center gap-5 rounded-2xl bg-gray-50 p-5">
                <Ring value={product.stock} max={product.stock + product.threshold * 2} color={s.dot} size={72}/>
                <div>
                  <p className="text-4xl font-black text-gray-900">{product.stock}</p>
                  <p className="mt-0.5 text-sm text-gray-500">units in stock</p>
                  <p className="mt-1 text-xs text-gray-400">Min threshold: <span className="font-bold text-gray-600">{product.threshold}</span></p>
                </div>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label:'Stock Value',   value:fmt(stockValue),      color:'text-indigo-600', bg:'bg-indigo-50' },
                  { label:'Gross Margin',  value:`${margin}%`,          color:'text-green-600',  bg:'bg-green-50'  },
                  { label:'Unit Profit',   value:fmt(profit),           color:'text-emerald-600',bg:'bg-emerald-50'},
                  { label:'Sell Price',    value:fmt(product.sellPrice),color:'text-blue-600',   bg:'bg-blue-50'   },
                  { label:'Cost Price',    value:fmt(product.costPrice),color:'text-gray-600',   bg:'bg-gray-50'   },
                  { label:'Lead Time',     value:`${product.leadDays}d`,color:'text-purple-600', bg:'bg-purple-50' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`${bg} rounded-xl px-4 py-3`}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
                    <p className={`text-base font-extrabold mt-0.5 ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Supplier */}
              <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50"><MdStorefront size={16} className="text-indigo-500"/></div>
                  <div>
                    <p className="text-xs text-gray-400">Supplier</p>
                    <p className="text-sm font-bold text-gray-800">{product.supplier}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Reorder Qty</p>
                  <p className="text-sm font-bold text-gray-800">{product.reorderQty} units</p>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { onAdjust(product); onClose(); }}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-200 py-3 text-sm font-bold text-indigo-600 transition-all hover:border-indigo-400 hover:bg-indigo-50">
                  <MdAutorenew size={18}/> Adjust Stock
                </button>
                <button onClick={() => { onEdit(product); onClose(); }}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-bold text-gray-600 transition-all hover:border-gray-400 hover:bg-gray-50">
                  <MdEdit size={18}/> Edit Product
                </button>
              </div>
            </>
          )}

          {tab === 'history' && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Audit Log</p>
              {log.map((entry, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${LOG_COLORS[entry.type]}`}>
                    {LOG_ICONS[entry.type]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold capitalize ${entry.qty > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {entry.qty > 0 ? '+' : ''}{entry.qty} units
                      </span>
                      <span className="text-[10px] text-gray-400">{entry.date}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{entry.note}</p>
                    <p className="mt-0.5 text-[10px] text-gray-400">by {entry.user}</p>
                  </div>
                  {i < log.length - 1 && <div className="absolute left-9 mt-7 h-4 w-0.5 bg-gray-100"/>}
                </div>
              ))}
            </div>
          )}

          {tab === 'reorder' && (
            <div className="space-y-4">
              <div className={`rounded-2xl p-4 ${product.stock <= product.threshold ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-100'}`}>
                <div className="mb-2 flex items-center gap-2">
                  <MdNotifications size={16} className={product.stock <= product.threshold ? 'text-amber-500' : 'text-gray-400'}/>
                  <p className="text-sm font-bold text-gray-800">Reorder Recommendation</p>
                </div>
                <p className="text-xs text-gray-500">
                  {product.stock === 0 ? '⚠️ Immediately order — out of stock' :
                   product.stock <= product.threshold ? `⚠️ Below threshold. Order within ${product.leadDays} days.` :
                   '✅ Stock level is healthy.'}
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { label:'Recommended Order',  value:`${product.reorderQty} units` },
                  { label:'Reorder Cost',        value:fmt(product.reorderQty * product.costPrice) },
                  { label:'Supplier Lead Time',  value:`${product.leadDays} business days` },
                  { label:'Expected Stock After',value:`${product.stock + product.reorderQty} units` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between border-b border-gray-50 py-2 last:border-0">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-xs font-bold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => onReorder(product._id)}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white"
                style={{ background:'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                <MdLocalShipping size={18}/> Place Reorder
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ADD / EDIT MODAL
// ══════════════════════════════════════════════════════════

const EMPTY = { title:'', category:'Electronics', sku:'', stock:'', threshold:'', costPrice:'', sellPrice:'', supplier:'', reorderQty:'', leadDays:'' };

const ProductModal = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState(product ? { title:product.title, category:product.category, sku:product.sku, stock:product.stock, threshold:product.threshold, costPrice:product.costPrice, sellPrice:product.sellPrice, supplier:product.supplier, reorderQty:product.reorderQty, leadDays:product.leadDays } : EMPTY);
  const [step, setStep] = useState(0);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const margin = form.sellPrice && form.costPrice ? pct(form.sellPrice - form.costPrice, form.sellPrice) : 0;
  const steps = ['Basic Info', 'Stock & Pricing', 'Reorder'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-extrabold text-gray-900">{product ? 'Edit Product' : 'Add New Product'}</h2>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100"><MdClose size={20} className="text-gray-500"/></button>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <button onClick={() => setStep(i)} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${step===i ? 'bg-indigo-600 text-white' : step>i ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {step > i ? '✓' : i+1} {s}
                </button>
                {i < steps.length-1 && <div className={`flex-1 h-0.5 rounded ${step > i ? 'bg-green-200' : 'bg-gray-100'}`}/>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[260px] space-y-4 px-6 py-5">
          {step === 0 && (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">Product Title *</label>
                <input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Samsung Galaxy A54"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">SKU *</label>
                  <input value={form.sku} onChange={e=>set('sku',e.target.value)} placeholder="SAM-A54-BLK"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">Category</label>
                  <select value={form.category} onChange={e=>set('category',e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    {CATEGORIES.filter(c=>c!=='All').map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">Supplier</label>
                <select value={form.supplier} onChange={e=>set('supplier',e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">Select supplier</option>
                  {SUPPLIERS.filter(s=>s!=='All Suppliers').map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">Stock Qty</label>
                  <input type="number" value={form.stock} onChange={e=>set('stock',e.target.value)} placeholder="0"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">Min Threshold</label>
                  <input type="number" value={form.threshold} onChange={e=>set('threshold',e.target.value)} placeholder="10"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">Cost Price (৳)</label>
                  <input type="number" value={form.costPrice} onChange={e=>set('costPrice',e.target.value)} placeholder="0"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">Selling Price (৳)</label>
                  <input type="number" value={form.sellPrice} onChange={e=>set('sellPrice',e.target.value)} placeholder="0"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
              </div>
              {form.costPrice && form.sellPrice && (
                <div className={`rounded-xl p-3 ${margin >= 20 ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-600">Gross Margin</span>
                    <span className={`text-sm font-black ${margin >= 20 ? 'text-green-700' : 'text-amber-700'}`}>{margin}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/60">
                    <div className={`h-full rounded-full ${margin >= 20 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width:`${Math.min(100,margin)}%` }}/>
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400">Unit profit: {fmt(+form.sellPrice - +form.costPrice)}</p>
                </div>
              )}
            </>
          )}
          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">Reorder Quantity</label>
                  <input type="number" value={form.reorderQty} onChange={e=>set('reorderQty',e.target.value)} placeholder="50"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">Lead Days</label>
                  <input type="number" value={form.leadDays} onChange={e=>set('leadDays',e.target.value)} placeholder="7"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
              </div>
              {form.reorderQty && form.costPrice && (
                <div className="space-y-2 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                  <p className="text-xs font-bold text-indigo-700">Reorder Summary</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Order cost</span>
                    <span className="font-bold text-gray-900">{fmt(+form.reorderQty * +form.costPrice)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Stock after reorder</span>
                    <span className="font-bold text-gray-900">{+form.stock + +form.reorderQty} units</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100">Cancel</button>
          {step > 0 && (
            <button onClick={()=>setStep(s=>s-1)} className="flex items-center gap-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100">
              <MdChevronLeft size={16}/> Back
            </button>
          )}
          <div className="flex-1"/>
          {step < 2 ? (
            <button onClick={()=>setStep(s=>s+1)}
              className="flex items-center gap-1 rounded-xl px-6 py-2.5 text-sm font-bold text-white"
              style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              Next <MdChevronRight size={16}/>
            </button>
          ) : (
            <button onClick={()=>onSave(form)}
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white"
              style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              <MdSave size={16}/> {product ? 'Save Changes' : 'Add Product'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// STOCK ADJUST MODAL
// ══════════════════════════════════════════════════════════

const AdjustModal = ({ product, onClose, onAdjust }) => {
  const [qty,  setQty]  = useState('');
  const [type, setType] = useState('add');
  const [note, setNote] = useState('');
  const preview = type === 'set' ? +qty : type === 'add' ? product.stock + +qty : Math.max(0, product.stock - +qty);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="font-extrabold text-gray-900">Adjust Stock</h2>
            <p className="mt-0.5 font-mono text-xs text-gray-400">{product.sku}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100"><MdClose size={18} className="text-gray-500"/></button>
        </div>
        <div className="space-y-4 px-5 py-4">
          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
            <div>
              <p className="text-xs text-gray-400">Current Stock</p>
              <p className="text-2xl font-black text-gray-900">{product.stock}</p>
            </div>
            {qty && (
              <>
                <MdArrowForward size={20} className="text-gray-300"/>
                <div className="text-right">
                  <p className="text-xs text-gray-400">After Adjustment</p>
                  <p className={`text-2xl font-black ${preview > product.stock ? 'text-green-600' : preview < product.stock ? 'text-red-500' : 'text-gray-900'}`}>{preview}</p>
                </div>
              </>
            )}
          </div>
          <div className="flex gap-2">
            {[['add','Add Stock','#10b981'],['remove','Remove','#ef4444'],['set','Set Exact','#3b82f6']].map(([t,l,c]) => (
              <button key={t} onClick={()=>setType(t)}
                className="flex-1 rounded-xl py-2 text-xs font-bold transition-all"
                style={type===t ? { background:c, color:'#fff' } : { background:'#f3f4f6', color:'#6b7280' }}>
                {l}
              </button>
            ))}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">Quantity</label>
            <input type="number" value={qty} onChange={e=>setQty(e.target.value)} placeholder="Enter quantity" min="0"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">Reason / Note</label>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. New shipment received"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
          </div>
        </div>
        <div className="flex gap-3 border-t border-gray-100 bg-gray-50/60 px-5 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
          <button onClick={()=>{ if(qty) { onAdjust(product._id, +qty, type); onClose(); } }}
            className="flex-[2] rounded-xl py-2.5 text-sm font-bold text-white" style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            Apply Adjustment
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// ADVANCED FILTER PANEL
// ══════════════════════════════════════════════════════════

const FilterPanel = ({ filters, onChange, onReset, onClose }) => (
  <div className="absolute right-0 top-full z-30 mt-2 w-80 space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-xl">
    <div className="flex items-center justify-between">
      <p className="text-sm font-bold text-gray-900">Advanced Filters</p>
      <button onClick={onClose}><MdClose size={16} className="text-gray-400"/></button>
    </div>
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-500">Status</label>
      <div className="flex gap-2">
        {['all','active','inactive'].map(s => (
          <button key={s} onClick={()=>onChange('status', s)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize ${filters.status===s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            {s}
          </button>
        ))}
      </div>
    </div>
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-500">Stock Status</label>
      <div className="flex flex-wrap gap-2">
        {[['all','All'],['ok','In Stock'],['low','Low'],['out','Out']].map(([v,l]) => (
          <button key={v} onClick={()=>onChange('stockStatus', v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filters.stockStatus===v ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            {l}
          </button>
        ))}
      </div>
    </div>
    <div>
      <label className="mb-2 block text-xs font-semibold text-gray-500">Price Range (৳)</label>
      <div className="grid grid-cols-2 gap-3">
        <input type="number" placeholder="Min" value={filters.minPrice} onChange={e=>onChange('minPrice',e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
        <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e=>onChange('maxPrice',e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
      </div>
    </div>
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-500">Supplier</label>
      <select value={filters.supplier} onChange={e=>onChange('supplier',e.target.value)}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400">
        {SUPPLIERS.map(s=><option key={s}>{s}</option>)}
      </select>
    </div>
    <div className="flex gap-2 pt-1">
      <button onClick={onReset} className="flex-1 rounded-xl border border-gray-200 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">Reset</button>
      <button onClick={onClose} className="flex-[2] rounded-xl py-2 text-xs font-bold text-white" style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>Apply</button>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════

export default function StockManagement() {
  // ── State ──────────────────────────────────────────────
  const [products, setProducts]     = useState(FAKE_PRODUCTS);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('All');
  const [sortKey, setSortKey]       = useState('title');
  const [sortDir, setSortDir]       = useState('asc');
  const [activeTab, setActiveTab]   = useState('products');
  const [selected, setSelected]     = useState([]);
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState(10);
  const [drawer, setDrawer]         = useState(null);
  const [editProd, setEditProd]     = useState(null);
  const [showAdd, setShowAdd]       = useState(false);
  const [adjustProd, setAdjustProd] = useState(null);
  const [delId, setDelId]           = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [toast, setToast]           = useState(null);
  const [colVis, setColVis]         = useState({ sku:true, supplier:true, cost:true, margin:true, reorder:false });
  const [showColMenu, setShowColMenu] = useState(false);
  const [filters, setFilters]       = useState({ status:'all', stockStatus:'all', minPrice:'', maxPrice:'', supplier:'All Suppliers' });
  const [bulkAction, setBulkAction] = useState('');

  // ── Helpers ────────────────────────────────────────────
  const notify = useCallback((msg, type='success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const toggleSort = (key) => {
    if (sortKey===key) setSortDir(d => d==='asc'?'desc':'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const resetFilters = () => setFilters({ status:'all', stockStatus:'all', minPrice:'', maxPrice:'', supplier:'All Suppliers' });

  const activeFilterCount = [
    filters.status !== 'all', filters.stockStatus !== 'all',
    filters.minPrice, filters.maxPrice, filters.supplier !== 'All Suppliers',
  ].filter(Boolean).length;

  // ── Derived data ───────────────────────────────────────
  const filtered = useMemo(() => {
    let arr = products.filter(p => {
      if (category !== 'All' && p.category !== category) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.status !== 'all' && p.status !== filters.status) return false;
      if (filters.supplier !== 'All Suppliers' && p.supplier !== filters.supplier) return false;
      if (filters.minPrice && p.sellPrice < +filters.minPrice) return false;
      if (filters.maxPrice && p.sellPrice > +filters.maxPrice) return false;
      if (filters.stockStatus !== 'all') {
        const s = getStatus(p.stock, p.threshold).key;
        if (filters.stockStatus !== s) return false;
      }
      return true;
    });
    arr.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'string') av = av.toLowerCase(), bv = bv.toLowerCase();
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return arr;
  }, [products, search, category, sortKey, sortDir, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page-1)*pageSize, page*pageSize);

  const summary = useMemo(() => ({
    total:      products.length,
    inStock:    products.filter(p => p.stock > p.threshold).length,
    lowStock:   products.filter(p => p.stock > 0 && p.stock <= p.threshold).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalValue: products.reduce((s,p) => s + p.stock*p.costPrice, 0),
    totalRevVal:products.reduce((s,p) => s + p.stock*p.sellPrice, 0),
    avgMargin:  Math.round(products.reduce((s,p) => s + pct(p.sellPrice-p.costPrice, p.sellPrice), 0) / products.length),
    needReorder:products.filter(p => p.stock <= p.threshold).length,
  }), [products]);

  // ── Handlers ───────────────────────────────────────────
  const handleSave = (data, id) => {
    // TODO: dispatch(id ? updateProduct({ id, ...data }) : addProduct(data))
    if (id) {
      setProducts(ps => ps.map(p => p._id===id ? { ...p, ...data, stock:+data.stock, threshold:+data.threshold, costPrice:+data.costPrice, sellPrice:+data.sellPrice, reorderQty:+data.reorderQty, leadDays:+data.leadDays } : p));
      notify('Product updated successfully ✓');
    } else {
      setProducts(ps => [...ps, { ...data, _id:'p'+Date.now(), stock:+data.stock, threshold:+data.threshold, costPrice:+data.costPrice, sellPrice:+data.sellPrice, reorderQty:+data.reorderQty||50, leadDays:+data.leadDays||7, status:'active', tags:[], image:'' }]);
      notify('Product added successfully ✓');
    }
    setShowAdd(false); setEditProd(null);
  };

  const handleDelete = (ids) => {
    // TODO: dispatch(ids.length > 1 ? bulkDeleteProducts(ids) : deleteProduct(ids[0]))
    setProducts(ps => ps.filter(p => !ids.includes(p._id)));
    setSelected([]); setDelId(null);
    notify(`${ids.length} product${ids.length>1?'s':''} deleted`, 'danger');
  };

  const handleAdjust = (id, qty, type) => {
    // TODO: dispatch(adjustStock({ productId:id, quantity:qty, type }))
    setProducts(ps => ps.map(p => {
      if (p._id !== id) return p;
      const n = type==='add' ? p.stock+qty : type==='remove' ? Math.max(0,p.stock-qty) : Math.max(0,qty);
      return { ...p, stock:n };
    }));
    notify('Stock adjusted ✓');
  };

  const handleReorder = (id) => {
    // TODO: dispatch(reorderProduct(id))
    notify('Reorder placed successfully 📦');
  };

  const handleBulkAction = () => {
    if (!bulkAction || !selected.length) return;
    if (bulkAction === 'delete') { setDelId(selected); return; }
    if (bulkAction === 'activate' || bulkAction === 'deactivate') {
      // TODO: dispatch(bulkUpdateStatus({ ids:selected, status: bulkAction==='activate'?'active':'inactive' }))
      setProducts(ps => ps.map(p => selected.includes(p._id) ? { ...p, status: bulkAction==='activate'?'active':'inactive' } : p));
      notify(`${selected.length} products ${bulkAction}d ✓`);
      setSelected([]); setBulkAction('');
    }
    if (bulkAction === 'export') {
      // TODO: dispatch(exportProducts({ ids:selected }))
      notify(`Exporting ${selected.length} products...`);
      setSelected([]); setBulkAction('');
    }
  };

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id]);
  const toggleAll    = () => setSelected(s => s.length === paginated.length ? [] : paginated.map(p=>p._id));
  const allSelected  = paginated.length > 0 && paginated.every(p => selected.includes(p._id));

  // ── Category chart data ────────────────────────────────
  const catData = useMemo(() =>
    CATEGORIES.filter(c=>c!=='All').map(c => ({
      name: c.length > 10 ? c.slice(0,10)+'…' : c,
      fullName: c,
      count: products.filter(p=>p.category===c).length,
      value: products.filter(p=>p.category===c).reduce((s,p)=>s+p.stock*p.costPrice,0),
    })).filter(d=>d.count>0)
  , [products]);

  // ── Profit scatter data ────────────────────────────────
  const scatterData = useMemo(() =>
    products.map(p => ({
      name: p.title.slice(0,15),
      margin: pct(p.sellPrice-p.costPrice, p.sellPrice),
      stock: p.stock,
      value: p.stock * p.sellPrice,
    }))
  , [products]);

  const TH = ({ col, label, className='' }) => (
    <th onClick={()=>toggleSort(col)}
      className={`px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none hover:text-gray-800 whitespace-nowrap ${className}`}>
      <div className="flex items-center gap-1">
        {label}
        {sortKey===col ? <span className="text-indigo-500">{sortDir==='asc'?'↑':'↓'}</span> : <MdSwapVert size={13} className="opacity-30"/>}
      </div>
    </th>
  );

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white transition-all animate-bounce-in
          ${toast.type==='danger'?'bg-red-500':'bg-emerald-500'}`}>
          {toast.type==='danger' ? <MdCancel size={18}/> : <MdCheckCircle size={18}/>}
          {toast.msg}
          <button onClick={()=>setToast(null)} className="ml-1 opacity-70 hover:opacity-100"><MdClose size={16}/></button>
        </div>
      )}

      {/* Modals */}
      {(showAdd || editProd) && (
        <ProductModal product={editProd} onClose={()=>{setShowAdd(false);setEditProd(null);}} onSave={(d)=>handleSave(d,editProd?._id)}/>
      )}
      {adjustProd && (
        <AdjustModal product={adjustProd} onClose={()=>setAdjustProd(null)} onAdjust={handleAdjust}/>
      )}
      {drawer && (
        <ProductDrawer product={products.find(p=>p._id===drawer)} onClose={()=>setDrawer(null)}
          onEdit={setEditProd} onAdjust={setAdjustProd} onReorder={handleReorder}/>
      )}
      {delId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <MdDelete size={28} className="text-red-500"/>
            </div>
            <h3 className="text-lg font-extrabold text-gray-900">Delete {Array.isArray(delId)?`${delId.length} Products`:'Product'}?</h3>
            <p className="mb-6 mt-1 text-sm text-gray-500">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={()=>setDelId(null)} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={()=>handleDelete(Array.isArray(delId)?delId:[delId])} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Stock Management</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {new Date().toLocaleDateString('en-BD',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
            {' · '}<span className="font-semibold text-gray-700">{summary.total} products</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50">
            <MdDownload size={16}/> Export
          </button>
          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50">
            <MdUpload size={16}/> Import CSV
          </button>
          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50">
            <MdPrint size={16}/> Print
          </button>
          <button onClick={()=>setShowAdd(true)}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90"
            style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            <MdAdd size={18}/> Add Product
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total Products"  value={fmtNum(summary.total)}       icon={MdInventory}   color="blue"   trend={6.4}  subtitle="All SKUs tracked"/>
        <StatCard title="Stock Value"     value={fmt(summary.totalValue)}     icon={MdAttachMoney} color="green"  trend={-2.1} subtitle="At cost price"/>
        <StatCard title="Need Reorder"    value={summary.needReorder}         icon={MdWarning}     color="amber"  subtitle={`${summary.outOfStock} out of stock`}
          onClick={()=>{ setFilters(f=>({...f,stockStatus:'low'})); setActiveTab('products'); }}/>
        <StatCard title="Avg. Margin"     value={`${summary.avgMargin}%`}     icon={MdTrendingUp}  color="purple" trend={1.8}  subtitle="Gross profit margin"/>
      </div>

      {/* ── Secondary Stats ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label:'In Stock',      value:summary.inStock,            color:'text-green-600',  bg:'bg-green-50'  },
          { label:'Low Stock',     value:summary.lowStock,           color:'text-amber-600',  bg:'bg-amber-50'  },
          { label:'Out of Stock',  value:summary.outOfStock,         color:'text-red-600',    bg:'bg-red-50'    },
          { label:'Revenue Value', value:fmt(summary.totalRevVal),   color:'text-indigo-600', bg:'bg-indigo-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl px-4 py-3 flex items-center justify-between`}>
            <span className="text-xs font-semibold text-gray-600">{label}</span>
            <span className={`text-lg font-extrabold ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex w-fit gap-1 rounded-xl bg-gray-100 p-1">
        {[['products','Products',MdInventory],['analytics','Analytics',MdAnalytics],['reorder','Reorder',MdLocalShipping]].map(([key,label,Icon])=>(
          <button key={key} onClick={()=>setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab===key?'bg-white text-gray-900 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>
            <Icon size={16}/>{label}
            {key==='reorder' && summary.needReorder>0 && (
              <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">{summary.needReorder}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════ PRODUCTS TAB ══════════════ */}
      {activeTab === 'products' && (
        <>
          {/* Controls bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1">
              <MdSearch size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search product name or SKU..."
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-1 overflow-x-auto pb-0.5">
              {CATEGORIES.map(c => (
                <button key={c} onClick={()=>{setCategory(c);setPage(1);}}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${category===c ? 'text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  style={category===c ? { background:c==='All'?'#4f46e5': CAT_COLORS[c]||'#4f46e5' } : {}}>
                  {c}
                </button>
              ))}
            </div>

            {/* Filter button */}
            <div className="relative">
              <button onClick={()=>setShowFilter(f=>!f)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${showFilter||activeFilterCount>0?'border-indigo-400 bg-indigo-50 text-indigo-700':'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <MdFilterList size={16}/>
                Filters
                {activeFilterCount>0 && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white">{activeFilterCount}</span>}
              </button>
              {showFilter && (
                <FilterPanel filters={filters} onChange={setFilter} onReset={resetFilters} onClose={()=>setShowFilter(false)}/>
              )}
            </div>

            {/* Column visibility */}
            <div className="relative">
              <button onClick={()=>setShowColMenu(f=>!f)}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50">
                <MdViewColumn size={16}/> Columns
              </button>
              {showColMenu && (
                <div className="absolute right-0 top-full z-30 mt-2 w-44 rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">Toggle Columns</p>
                  {Object.entries(colVis).map(([col,vis]) => (
                    <label key={col} className="flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1.5 hover:bg-gray-50">
                      <input type="checkbox" checked={vis} onChange={()=>setColVis(c=>({...c,[col]:!c[col]}))} className="accent-indigo-600"/>
                      <span className="text-xs font-medium capitalize text-gray-700">{col}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <p className="ml-auto text-sm text-gray-400">{filtered.length} of {products.length}</p>
          </div>

          {/* Bulk action bar */}
          {selected.length > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3">
              <span className="text-sm font-bold text-indigo-700">{selected.length} selected</span>
              <div className="flex-1"/>
              <select value={bulkAction} onChange={e=>setBulkAction(e.target.value)}
                className="rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="">Bulk Action…</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
                <option value="export">Export</option>
                <option value="delete">Delete</option>
              </select>
              <button onClick={handleBulkAction}
                className="rounded-xl px-4 py-1.5 text-xs font-bold text-white" style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                Apply
              </button>
              <button onClick={()=>setSelected([])} className="rounded-lg p-1.5 text-indigo-500 hover:bg-indigo-100"><MdClose size={16}/></button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="w-10 px-4 py-3.5">
                      <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 accent-indigo-600"/>
                    </th>
                    <TH col="title"     label="Product"/>
                    {colVis.sku      && <TH col="sku"       label="SKU"/>}
                    <TH col="category" label="Category"/>
                    {colVis.supplier && <TH col="supplier"  label="Supplier"/>}
                    <TH col="stock"    label="Stock"/>
                    {colVis.cost     && <TH col="costPrice" label="Cost"/>}
                    <TH col="sellPrice" label="Price"/>
                    {colVis.margin   && <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Margin</th>}
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                    {colVis.reorder  && <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Reorder</th>}
                    <th className="w-24 px-4 py-3.5"/>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.length === 0 ? (
                    <tr><td colSpan={12} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100"><MdInventory size={32} className="text-gray-300"/></div>
                        <p className="text-sm font-semibold text-gray-400">No products match your filters</p>
                        <button onClick={resetFilters} className="text-xs font-semibold text-indigo-600 hover:underline">Clear filters</button>
                      </div>
                    </td></tr>
                  ) : paginated.map(p => {
                    const s = getStatus(p.stock, p.threshold);
                    const margin = pct(p.sellPrice - p.costPrice, p.sellPrice);
                    const isSel = selected.includes(p._id);
                    return (
                      <tr key={p._id}
                        className={`group transition-colors ${isSel ? 'bg-indigo-50/60' : 'hover:bg-gray-50/50'}`}>
                        <td className="px-4 py-3" onClick={e=>e.stopPropagation()}>
                          <input type="checkbox" checked={isSel} onChange={()=>toggleSelect(p._id)} className="h-4 w-4 accent-indigo-600"/>
                        </td>
                        <td className="cursor-pointer px-4 py-3" onClick={()=>setDrawer(p._id)}>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100" style={{ background: (CAT_COLORS[p.category]||'#6366f1')+'18' }}>
                              <span className="text-lg">{{'Electronics':'💻','Footwear':'👟','Personal Care':'🧴','Accessories':'👜','Food & Beverage':'🍵','Health & Fitness':'💪','Kitchen':'☕'}[p.category]||'📦'}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-semibold leading-tight text-gray-900 transition-colors hover:text-indigo-700">{p.title}</p>
                                {p.tags.includes('bestseller') && <MdStar size={12} className="text-amber-400"/>}
                              </div>
                              <div className="mt-0.5 flex items-center gap-1">
                                {p.tags.filter(t=>t!=='bestseller').map(t=><Tag key={t} label={t}/>)}
                                <span className="text-[10px] text-gray-400">{p.supplier}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        {colVis.sku && (
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-500">{p.sku}</span>
                            </div>
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <span className="rounded-lg px-2 py-1 text-[11px] font-semibold" style={{ background:(CAT_COLORS[p.category]||'#6366f1')+'18', color:CAT_COLORS[p.category]||'#6366f1' }}>
                            {p.category}
                          </span>
                        </td>
                        {colVis.supplier && (
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{p.supplier}</td>
                        )}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background:s.dot }}/>
                            <span className={`font-bold text-sm ${p.stock===0?'text-red-500':p.stock<=p.threshold?'text-amber-600':'text-gray-900'}`}>{p.stock}</span>
                            <MiniBar value={p.stock} max={Math.max(p.stock, p.threshold*3)} color={s.dot}/>
                            <span className="text-[10px] text-gray-400">/{p.threshold}</span>
                          </div>
                        </td>
                        {colVis.cost && (
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-400">{fmt(p.costPrice)}</td>
                        )}
                        <td className="whitespace-nowrap px-4 py-3 font-bold text-gray-900">{fmt(p.sellPrice)}</td>
                        {colVis.margin && (
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold ${margin>=25?'text-green-600':margin>=15?'text-amber-600':'text-red-500'}`}>+{margin}%</span>
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full" style={{ background: p.status==='active'?'#10b981':'#9ca3af' }}/>
                            <Badge type={p.status==='active'?'success':'gray'} size="xs">{s.label}</Badge>
                          </div>
                        </td>
                        {colVis.reorder && (
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-400">{p.reorderQty} @ {p.leadDays}d</td>
                        )}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button onClick={()=>setDrawer(p._id)} title="View Details"
                              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"><MdOpenInNew size={15}/></button>
                            <button onClick={e=>{e.stopPropagation();setAdjustProd(p);}} title="Adjust Stock"
                              className="rounded-lg p-1.5 text-indigo-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"><MdAutorenew size={15}/></button>
                            <button onClick={e=>{e.stopPropagation();setEditProd(p);}} title="Edit"
                              className="rounded-lg p-1.5 text-blue-400 transition-colors hover:bg-blue-50 hover:text-blue-600"><MdEdit size={15}/></button>
                            <button onClick={e=>{e.stopPropagation();setDelId(p._id);}} title="Delete"
                              className="rounded-lg p-1.5 text-red-300 transition-colors hover:bg-red-50 hover:text-red-500"><MdDelete size={15}/></button>
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
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Rows per page:</span>
                <select value={pageSize} onChange={e=>{setPageSize(+e.target.value);setPage(1);}}
                  className="rounded-lg border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  {PAGE_SIZES.map(s=><option key={s}>{s}</option>)}
                </select>
                <span className="text-xs text-gray-400">{(page-1)*pageSize+1}–{Math.min(page*pageSize, filtered.length)} of {filtered.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                  className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 disabled:opacity-30"><MdChevronLeft size={18} className="text-gray-600"/></button>
                {Array.from({length:Math.min(5,totalPages)},(_,i)=>{
                  const p = totalPages<=5 ? i+1 : page<=3 ? i+1 : page>=totalPages-2 ? totalPages-4+i : page-2+i;
                  return (
                    <button key={p} onClick={()=>setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${page===p?'bg-indigo-600 text-white shadow-sm':'text-gray-500 hover:bg-gray-100'}`}>{p}</button>
                  );
                })}
                <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                  className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 disabled:opacity-30"><MdChevronRight size={18} className="text-gray-600"/></button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════ ANALYTICS TAB ══════════════ */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Row 1 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Stock movement */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="mb-5">
                <h3 className="font-bold text-gray-900">Stock Movement</h3>
                <p className="mt-0.5 text-sm text-gray-500">Units added vs removed — monthly</p>
              </div>
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={STOCK_HISTORY} margin={{top:5,right:5,left:-20,bottom:0}}>
                  <defs>
                    <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.18}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.13}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                  <XAxis dataKey="date" tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<Tooltip2/>}/>
                  <Area type="monotone" dataKey="added"   name="added"   stroke="#10b981" strokeWidth={2.5} fill="url(#gA)" dot={false} activeDot={{r:5,strokeWidth:0}}/>
                  <Area type="monotone" dataKey="removed" name="removed" stroke="#ef4444" strokeWidth={2}   fill="url(#gR)" dot={false} activeDot={{r:4,strokeWidth:0}}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Category breakdown */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-1 font-bold text-gray-900">By Category</h3>
              <p className="mb-4 text-sm text-gray-500">{catData.length} categories</p>
              <div className="space-y-3">
                {catData.sort((a,b)=>b.value-a.value).map(cat => {
                  const maxVal = Math.max(...catData.map(c=>c.value));
                  return (
                    <div key={cat.name}>
                      <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full" style={{ background:CAT_COLORS[cat.fullName]||'#6366f1' }}/>
                          <span className="text-xs font-semibold text-gray-700">{cat.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-900">{fmt(cat.value)}</span>
                          <span className="ml-1 text-[10px] text-gray-400">{cat.count}</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width:`${pct(cat.value,maxVal)}%`, background:CAT_COLORS[cat.fullName]||'#6366f1' }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Stock value bar chart */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="mb-5">
                <h3 className="font-bold text-gray-900">Inventory Value Trend</h3>
                <p className="mt-0.5 text-sm text-gray-500">Total inventory value — monthly</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={STOCK_HISTORY} margin={{top:5,right:5,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
                  <XAxis dataKey="date" tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<Tooltip2/>}/>
                  <Bar dataKey="value" name="value" radius={[8,8,0,0]}>
                    {STOCK_HISTORY.map((_,i) => (
                      <Cell key={i} fill={i===STOCK_HISTORY.length-1 ? '#4f46e5' : '#c7d2fe'}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top 5 products by value */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 font-bold text-gray-900">Top Products by Value</h3>
              <div className="space-y-3">
                {[...products].sort((a,b)=>b.stock*b.sellPrice-a.stock*a.sellPrice).slice(0,5).map((p,i)=>{
                  const val = p.stock * p.sellPrice;
                  const maxVal = products.reduce((m,pr) => Math.max(m, pr.stock*pr.sellPrice), 0);
                  return (
                    <div key={p._id} className="flex items-center gap-3">
                      <span className={`text-xs font-black w-5 flex-shrink-0 ${i===0?'text-amber-500':i===1?'text-gray-400':i===2?'text-amber-700':'text-gray-300'}`}>#{i+1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-gray-800">{p.title}</p>
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full" style={{ width:`${pct(val,maxVal)}%`, background:CAT_COLORS[p.category]||'#6366f1' }}/>
                        </div>
                      </div>
                      <span className="flex-shrink-0 whitespace-nowrap text-xs font-bold text-gray-900">{fmt(val)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 3 — Margin scatter + Orders line */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Profit margin scatter */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-1 font-bold text-gray-900">Margin vs Stock Level</h3>
              <p className="mb-4 text-sm text-gray-500">Bubble size = stock value</p>
              <ResponsiveContainer width="100%" height={220}>
                <ScatterChart margin={{top:5,right:5,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                  <XAxis dataKey="margin" name="Margin %" unit="%" tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
                  <YAxis dataKey="stock" name="Stock" tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
                  <ReferenceLine x={20} stroke="#f59e0b" strokeDasharray="4 4" label={{value:'20%',fontSize:10,fill:'#f59e0b'}}/>
                  <Tooltip cursor={{strokeDasharray:'3 3'}} content={({active,payload})=>{
                    if (!active||!payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs shadow-lg">
                        <p className="font-bold text-gray-800">{d.name}</p>
                        <p className="text-indigo-600">Margin: {d.margin}%</p>
                        <p className="text-gray-500">Stock: {d.stock}</p>
                      </div>
                    );
                  }}/>
                  <Scatter data={scatterData} fill="#6366f1" fillOpacity={0.7}/>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Orders line */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-1 font-bold text-gray-900">Monthly Orders</h3>
              <p className="mb-4 text-sm text-gray-500">Orders fulfilled from stock</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={STOCK_HISTORY} margin={{top:5,right:5,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                  <XAxis dataKey="date" tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<Tooltip2/>}/>
                  <Line type="monotone" dataKey="orders" name="orders" stroke="#8b5cf6" strokeWidth={3} dot={{ fill:'#8b5cf6', r:4, strokeWidth:0 }} activeDot={{ r:6, strokeWidth:0 }}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ REORDER TAB ══════════════ */}
      {activeTab === 'reorder' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{summary.needReorder} products need attention</p>
            <button onClick={()=>notify('All reorders placed! 📦')}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white"
              style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              <MdLocalShipping size={16}/> Place All Reorders
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.filter(p=>p.stock<=p.threshold).sort((a,b)=>a.stock-b.stock).map(p=>{
              const s = getStatus(p.stock, p.threshold);
              const reorderCost = p.reorderQty * p.costPrice;
              return (
                <div key={p._id} className={`rounded-2xl border p-5 ${p.stock===0 ? 'border-red-200 bg-red-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
                  <div className="mb-3 flex items-start justify-between">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="truncate text-sm font-bold text-gray-900">{p.title}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-gray-400">{p.sku}</p>
                    </div>
                    <Badge type={s.badge} size="xs">{s.label}</Badge>
                  </div>
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Current stock</span>
                      <span className={`font-bold ${p.stock===0?'text-red-600':'text-amber-600'}`}>{p.stock} / {p.threshold} min</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/80">
                      <div className="h-full rounded-full" style={{ width:`${Math.min(100,pct(p.stock,p.threshold*2))}%`, background:p.stock===0?'#ef4444':'#f59e0b' }}/>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Reorder qty</span>
                      <span className="font-semibold text-gray-700">{p.reorderQty} units</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Est. cost</span>
                      <span className="font-bold text-gray-900">{fmt(reorderCost)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Lead time</span>
                      <span className="font-semibold text-gray-700">{p.leadDays} days · {p.supplier}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>setDrawer(p._id)} className="flex-1 rounded-xl border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50">Details</button>
                    <button onClick={()=>handleReorder(p._id)}
                      className="flex flex-[2] items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-white transition-all hover:opacity-90"
                      style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                      <MdLocalShipping size={14}/> Reorder Now
                    </button>
                  </div>
                </div>
              );
            })}
            {summary.needReorder === 0 && (
              <div className="py-20 text-center sm:col-span-2 lg:col-span-3">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
                  <MdCheckCircle size={32} className="text-green-500"/>
                </div>
                <p className="font-bold text-gray-700">All Stock Levels Healthy</p>
                <p className="mt-1 text-sm text-gray-400">No products need restocking right now.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}