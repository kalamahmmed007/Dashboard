import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats, fetchSalesChart, fetchRecentOrders } from '../redux/slices/dashboardSlice';
import { StatCard, Spinner, Badge } from '../components/common';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie,
  Cell, Legend, LineChart, Line, RadialBarChart, RadialBar,
} from 'recharts';
import {
  MdShoppingBag, MdPeople, MdInventory, MdAttachMoney,
  MdTrendingUp, MdTrendingDown, MdWarning, MdArrowForward,
  MdAdd, MdRefresh, MdLocalShipping, MdCheckCircle,
  MdCancel, MdPendingActions, MdVisibility, MdLocationOn,
  MdAssignmentReturn, MdLocalOffer, MdStar, MdStarHalf,
  MdStarOutline, MdFiberManualRecord, MdPayment, MdCategory,
  MdNotifications, MdPerson, MdBarChart, MdTimeline,
  MdSchedule, MdFlashOn, MdThumbUp, MdThumbDown,
} from 'react-icons/md';

// ── Constants ─────────────────────────────────────────────
const PERIODS = [
  { key: '7d',  label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '3 Months' },
  { key: '1y',  label: '1 Year' },
];

const ORDER_STATUS_BADGE = {
  pending:    'warning',
  processing: 'info',
  shipped:    'info',
  delivered:  'success',
  cancelled:  'danger',
};

const STATUS_ICONS = {
  pending:    MdPendingActions,
  processing: MdRefresh,
  shipped:    MdLocalShipping,
  delivered:  MdCheckCircle,
  cancelled:  MdCancel,
};

const PIE_COLORS      = ['#f59e0b','#3b82f6','#8b5cf6','#10b981','#ef4444'];
const PAYMENT_COLORS  = ['#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6'];
const CATEGORY_COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#f97316'];



// ── Map Section ───────────────────────────────────────────
const MapSection = ({ divisionStats }) => {
  const [hoveredDiv, setHoveredDiv] = useState(null);
  const divisionData = {};
  BD_DIVISIONS.forEach(d => { divisionData[d.id] = divisionStats?.[d.id] || {}; });
  const totalRevenue = Object.values(divisionData).reduce((s, d) => s + (d.revenue || 0), 0);
  const maxDiv = BD_DIVISIONS.reduce((best, d) =>
    (divisionData[d.id]?.revenue || 0) > (divisionData[best.id]?.revenue || 0) ? d : best, BD_DIVISIONS[0]);
  const hoveredData    = hoveredDiv ? divisionData[hoveredDiv] : null;
  const hoveredDivInfo = BD_DIVISIONS.find(d => d.id === hoveredDiv);
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
        <div>
          <h3 className="flex items-center gap-1.5 font-bold text-gray-900"><MdLocationOn size={16} className="text-indigo-500" />Revenue by Division</h3>
          <p className="mt-0.5 text-xs text-gray-400">Bangladesh — hover a division for details</p>
        </div>
        {maxDiv && divisionData[maxDiv.id]?.revenue > 0 && (
          <div className="text-right">
            <p className="text-[10px] text-gray-400">Top Division</p>
            <p className="text-sm font-black text-indigo-600">{maxDiv.name}</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-0 md:grid-cols-5">
        <div className="relative p-4 md:col-span-3" style={{ minHeight:280 }}>
          <BangladeshMap divisionData={divisionData} onHover={setHoveredDiv} hoveredDiv={hoveredDiv} onLeave={() => setHoveredDiv(null)} />
          {hoveredDiv && hoveredDivInfo && (
            <div className="pointer-events-none absolute bottom-4 left-4 min-w-[140px] rounded-xl border border-indigo-100 bg-white p-3 shadow-xl">
              <p className="text-sm font-bold text-indigo-700">{hoveredDivInfo.name}</p>
              <div className="mt-1.5 space-y-1">
                {[['Revenue',`৳${(hoveredData?.revenue||0).toLocaleString()}`],['Orders',hoveredData?.orders||0],['Customers',hoveredData?.customers||0]].map(([k,v]) => (
                  <div key={k} className="flex items-center justify-between gap-4">
                    <span className="text-[10px] text-gray-500">{k}</span>
                    <span className="text-xs font-bold text-gray-900">{v}</span>
                  </div>
                ))}
                {totalRevenue > 0 && (
                  <div className="mt-1 flex items-center justify-between gap-4 border-t border-gray-100 pt-1">
                    <span className="text-[10px] text-gray-500">Share</span>
                    <span className="text-xs font-black text-indigo-600">{Math.round(((hoveredData?.revenue||0)/totalRevenue)*100)}%</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-gray-50 p-4 md:col-span-2 md:border-l md:border-t-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">All Divisions</p>
          <div className="space-y-2.5">
            {BD_DIVISIONS
              .map(d => ({ ...d, revenue: divisionData[d.id]?.revenue||0, orders: divisionData[d.id]?.orders||0 }))
              .sort((a,b) => b.revenue - a.revenue)
              .map((div, i) => {
                const pct = totalRevenue > 0 ? (div.revenue / totalRevenue) * 100 : 0;
                return (
                  <div key={div.id} onMouseEnter={() => setHoveredDiv(div.id)} onMouseLeave={() => setHoveredDiv(null)}
                    className={`rounded-xl p-2.5 cursor-pointer transition-all ${hoveredDiv === div.id ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {i === 0 && div.revenue > 0 && <span className="text-[10px] font-black text-amber-500">🏆</span>}
                        <span className={`text-xs font-semibold ${hoveredDiv === div.id ? 'text-indigo-700' : 'text-gray-700'}`}>{div.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-900">৳{(div.revenue/1000).toFixed(1)}k</span>
                        <span className="ml-1.5 text-[10px] text-gray-400">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width:`${pct}%`, background: hoveredDiv === div.id ? 'linear-gradient(90deg,#4f46e5,#818cf8)' : 'linear-gradient(90deg,#6366f1,#a5b4fc)' }} />
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="mt-4">
            <div className="h-2 w-full rounded-full" style={{ background:'linear-gradient(90deg,#f1f5f9,#c7d2fe,#6366f1,#3730a3)' }} />
            <div className="mt-1 flex w-full justify-between text-[9px] text-gray-400"><span>Low</span><span>High</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Customer Growth Chart ─────────────────────────────────
const CustomerGrowthChart = ({ data = [] }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h3 className="flex items-center gap-1.5 font-bold text-gray-900"><MdTimeline size={16} className="text-emerald-500" />Customer Growth</h3>
        <p className="mt-0.5 text-xs text-gray-400">New vs returning customers</p>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />New</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-400" />Returning</span>
      </div>
    </div>
    {data.length === 0 ? (
      <div className="flex h-44 items-center justify-center text-sm text-gray-300">No data available</div>
    ) : (
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top:5, right:5, left:-20, bottom:0 }}>
          <defs>
            <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradReturn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius:10, fontSize:12, border:'1px solid #e5e7eb' }} />
          <Area type="monotone" dataKey="newCustomers" name="New" stroke="#10b981" strokeWidth={2.5} fill="url(#gradNew)" dot={false} activeDot={{ r:5, strokeWidth:0 }} />
          <Area type="monotone" dataKey="returning"    name="Returning" stroke="#60a5fa" strokeWidth={2} fill="url(#gradReturn)" dot={false} activeDot={{ r:4, strokeWidth:0 }} />
        </AreaChart>
      </ResponsiveContainer>
    )}
  </div>
);

// ── Category Revenue Bar Chart ────────────────────────────
const CategoryRevenueChart = ({ data = [] }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h3 className="flex items-center gap-1.5 font-bold text-gray-900"><MdCategory size={16} className="text-blue-500" />Category Revenue</h3>
        <p className="mt-0.5 text-xs text-gray-400">Revenue breakdown by product category</p>
      </div>
    </div>
    {data.length === 0 ? (
      <div className="flex h-44 items-center justify-center text-sm text-gray-300">No data available</div>
    ) : (
      <>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top:5, right:5, left:-20, bottom:0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="category" tick={{ fontSize:10, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill:'#f8fafc' }}
              contentStyle={{ borderRadius:10, fontSize:12, border:'1px solid #e5e7eb' }}
              formatter={(v) => [`৳${v.toLocaleString()}`, 'Revenue']}
            />
            <Bar dataKey="revenue" radius={[6,6,0,0]}>
              {data.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.map((d, i) => (
            <span key={d.category} className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background:`${CATEGORY_COLORS[i%CATEGORY_COLORS.length]}18`, color:CATEGORY_COLORS[i%CATEGORY_COLORS.length] }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background:CATEGORY_COLORS[i%CATEGORY_COLORS.length] }} />
              {d.category}
            </span>
          ))}
        </div>
      </>
    )}
  </div>
);

// ── Payment Method Breakdown ──────────────────────────────
const PaymentBreakdown = ({ data = [] }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="flex items-center gap-1.5 font-bold text-gray-900"><MdPayment size={16} className="text-violet-500" />Payment Methods</h3>
        <p className="mt-0.5 text-xs text-gray-400">{total} total transactions</p>
      </div>
      {data.length === 0 ? (
        <div className="flex h-44 items-center justify-center text-sm text-gray-300">No data available</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                {data.map((_, i) => <Cell key={i} fill={PAYMENT_COLORS[i % PAYMENT_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v} orders`, n]} contentStyle={{ borderRadius:10, fontSize:12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-2">
            {data.map((d, i) => {
              const pct = total ? Math.round((d.value / total) * 100) : 0;
              return (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background:PAYMENT_COLORS[i%PAYMENT_COLORS.length] }} />
                  <span className="flex-1 text-xs text-gray-600">{d.name}</span>
                  <span className="text-xs font-bold text-gray-800">{d.value}</span>
                  <span className="w-8 text-right text-xs text-gray-400">{pct}%</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ── Hourly Sales Heatmap ──────────────────────────────────
const HourlySalesHeatmap = ({ data = {} }) => {
  const DAYS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const HOURS = Array.from({ length:24 }, (_,i) => i);
  const allVals = Object.values(data).flatMap(d => Object.values(d));
  const maxVal  = Math.max(...allVals, 1);

  const getOpacity = (day, hour) => {
    const val = data[day]?.[hour] || 0;
    return val / maxVal;
  };

  const getLabel = (hour) => {
    if (hour === 0)  return '12a';
    if (hour === 12) return '12p';
    if (hour < 12)  return `${hour}a`;
    return `${hour-12}p`;
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-1.5 font-bold text-gray-900"><MdSchedule size={16} className="text-orange-500" />Hourly Sales Heatmap</h3>
          <p className="mt-0.5 text-xs text-gray-400">Orders by day & hour</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-16 rounded-full" style={{ background:'linear-gradient(90deg,#fff7ed,#f97316)' }} />
          <div className="flex w-16 justify-between text-[9px] text-gray-400"><span>Low</span><span>High</span></div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div style={{ minWidth:480 }}>
          {/* Hour labels */}
          <div className="mb-1 flex">
            <div className="w-8 flex-shrink-0" />
            {HOURS.filter(h => h % 3 === 0).map(h => (
              <div key={h} className="text-center text-[9px] text-gray-400" style={{ width: `${100/8}%` }}>{getLabel(h)}</div>
            ))}
          </div>
          {/* Grid */}
          {DAYS.map(day => (
            <div key={day} className="mb-0.5 flex items-center gap-1">
              <div className="w-7 flex-shrink-0 text-[10px] font-semibold text-gray-500">{day}</div>
              <div className="flex flex-1 gap-0.5">
                {HOURS.map(hour => {
                  const opacity = getOpacity(day, hour);
                  const val     = data[day]?.[hour] || 0;
                  return (
                    <div key={hour} title={`${day} ${getLabel(hour)}: ${val} orders`}
                      className="group relative flex-1 cursor-pointer rounded-sm transition-transform hover:scale-125"
                      style={{ height:14, background: opacity === 0 ? '#f8fafc' : `rgba(249,115,22,${0.12 + opacity * 0.88})`, border:'1px solid rgba(249,115,22,0.1)' }}>
                      {val > 0 && (
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-1.5 py-0.5 text-[9px] text-white group-hover:block">
                          {val}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Return / Refund Stats ─────────────────────────────────
const ReturnRefundStats = ({ stats = {} }) => {
  const items = [
    { label:'Total Returns',    value: stats.totalReturns   || 0, icon: MdAssignmentReturn, color:'text-red-500',    bg:'bg-red-50' },
    { label:'Refund Amount',    value:`৳${(stats.refundAmount||0).toLocaleString()}`, icon: MdAttachMoney, color:'text-orange-600', bg:'bg-orange-50' },
    { label:'Return Rate',      value:`${(stats.returnRate  || 0).toFixed(1)}%`, icon: MdTrendingDown, color:'text-amber-600', bg:'bg-amber-50' },
    { label:'Avg Resolve Time', value:`${stats.avgResolveHours||0}h`, icon: MdSchedule, color:'text-blue-600', bg:'bg-blue-50' },
  ];
  const reasons = stats.reasons || [];
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="flex items-center gap-1.5 font-bold text-gray-900"><MdAssignmentReturn size={16} className="text-red-500" />Returns & Refunds</h3>
        <p className="mt-0.5 text-xs text-gray-400">Return requests & refund overview</p>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3">
        {items.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} flex items-center gap-3 rounded-xl p-3`}>
            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ${color}`}>
              <Icon size={17} />
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-500">{label}</p>
              <p className={`text-sm font-black ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>
      {reasons.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Top Return Reasons</p>
          <div className="space-y-2">
            {reasons.map((r, i) => {
              const maxCount = reasons[0]?.count || 1;
              const pct = Math.round((r.count / maxCount) * 100);
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-28 truncate text-xs text-gray-600">{r.reason}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-red-400 transition-all duration-500" style={{ width:`${pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-xs font-bold text-gray-700">{r.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Coupon & Promo Analytics ──────────────────────────────
const CouponAnalytics = ({ data = {} }) => {
  const coupons = data.topCoupons || [];
  const summary = [
    { label:'Active Coupons',   value: data.activeCoupons || 0,  color:'text-emerald-600', bg:'bg-emerald-50' },
    { label:'Total Redeemed',   value: data.totalRedeemed || 0,  color:'text-blue-600',    bg:'bg-blue-50' },
    { label:'Discount Given',   value:`৳${(data.totalDiscount||0).toLocaleString()}`, color:'text-purple-600', bg:'bg-purple-50' },
    { label:'Avg Discount',     value:`${(data.avgDiscount||0).toFixed(0)}%`, color:'text-amber-600', bg:'bg-amber-50' },
  ];
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-1.5 font-bold text-gray-900"><MdLocalOffer size={16} className="text-emerald-500" />Coupons & Promos</h3>
          <p className="mt-0.5 text-xs text-gray-400">Coupon performance overview</p>
        </div>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {summary.map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-2.5`}>
            <p className="text-[10px] text-gray-500">{label}</p>
            <p className={`text-base font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>
      {coupons.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Top Coupons</p>
          <div className="space-y-2">
            {coupons.slice(0, 5).map((c, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 font-mono text-[10px] font-black text-emerald-700">{c.code}</span>
                <span className="flex-1 text-xs text-gray-600">{c.used} used</span>
                <span className="text-xs font-bold text-emerald-600">৳{(c.discount||0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Customer Satisfaction Widget ──────────────────────────
const SatisfactionWidget = ({ data = {} }) => {
  const score     = data.avgRating || 0;
  const totalRevs = data.totalReviews || 0;
  const dist      = data.distribution || [0,0,0,0,0];
  const maxDist   = Math.max(...dist, 1);

  const renderStars = (rating) => {
    return [1,2,3,4,5].map(s => {
      const full = s <= Math.floor(rating);
      const half = !full && s <= rating + 0.5;
      const Icon = full ? MdStar : half ? MdStarHalf : MdStarOutline;
      return <Icon key={s} size={16} className={full || half ? 'text-amber-400' : 'text-gray-300'} />;
    });
  };

  const sentimentItems = [
    { label:'Positive', value: data.positive||0, icon: MdThumbUp,   color:'text-emerald-600', bg:'bg-emerald-50' },
    { label:'Negative', value: data.negative||0, icon: MdThumbDown, color:'text-red-500',     bg:'bg-red-50' },
  ];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="flex items-center gap-1.5 font-bold text-gray-900"><MdStar size={16} className="text-amber-400" />Customer Satisfaction</h3>
        <p className="mt-0.5 text-xs text-gray-400">{totalRevs.toLocaleString()} total reviews</p>
      </div>
      {/* Big score */}
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-50">
          <span className="text-3xl font-black text-amber-500">{score.toFixed(1)}</span>
        </div>
        <div>
          <div className="flex">{renderStars(score)}</div>
          <p className="mt-1 text-xs text-gray-500">{score >= 4.5 ? 'Excellent' : score >= 4 ? 'Very Good' : score >= 3 ? 'Good' : 'Needs Improvement'}</p>
          <div className="mt-2 flex gap-2">
            {sentimentItems.map(({ label, value, icon: Icon, color, bg }) => (
              <span key={label} className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${bg} ${color}`}>
                <Icon size={11} />{value}
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* Rating distribution */}
      <div className="space-y-1.5">
        {[5,4,3,2,1].map((star, i) => {
          const count = dist[5 - star] || 0;
          const pct   = Math.round((count / maxDist) * 100);
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="flex w-4 items-center gap-0.5 text-[10px] font-semibold text-gray-600">{star}</span>
              <MdStar size={10} className="flex-shrink-0 text-amber-400" />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-amber-400 transition-all duration-700" style={{ width:`${pct}%` }} />
              </div>
              <span className="w-6 text-right text-[10px] text-gray-400">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Live Activity Feed ────────────────────────────────────
const LiveActivityFeed = ({ activities = [] }) => {
  const [items, setItems] = useState(activities);

  useEffect(() => { setItems(activities); }, [activities]);

  const getIcon = (type) => {
    const map = {
      order:    { Icon: MdShoppingBag, color:'text-blue-500',   bg:'bg-blue-50' },
      payment:  { Icon: MdAttachMoney, color:'text-green-500',  bg:'bg-green-50' },
      user:     { Icon: MdPerson,      color:'text-purple-500', bg:'bg-purple-50' },
      refund:   { Icon: MdAssignmentReturn, color:'text-red-500', bg:'bg-red-50' },
      coupon:   { Icon: MdLocalOffer,  color:'text-amber-500',  bg:'bg-amber-50' },
      shipped:  { Icon: MdLocalShipping, color:'text-cyan-500', bg:'bg-cyan-50' },
    };
    return map[type] || { Icon: MdNotifications, color:'text-gray-500', bg:'bg-gray-100' };
  };

  const getTimeAgo = (ts) => {
    if (!ts) return '';
    const secs = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (secs < 60)  return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs/60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs/3600)}h ago`;
    return `${Math.floor(secs/86400)}d ago`;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </div>
          <h3 className="font-bold text-gray-900">Live Activity</h3>
        </div>
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-600">LIVE</span>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-gray-300">No recent activity</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {items.map((activity, i) => {
              const { Icon, color, bg } = getIcon(activity.type);
              return (
                <div key={i} className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-gray-50/50">
                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}>
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold leading-snug text-gray-800">{activity.message}</p>
                    {activity.detail && <p className="mt-0.5 truncate text-[10px] text-gray-400">{activity.detail}</p>}
                  </div>
                  <span className="mt-0.5 flex-shrink-0 text-[10px] text-gray-400">{getTimeAgo(activity.timestamp)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Custom Tooltip ────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm shadow-lg">
      <p className="mb-1 font-semibold text-gray-700">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color:p.color }} className="font-bold">
          {p.name === 'revenue' ? `৳${p.value?.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

// ── TrendBadge ────────────────────────────────────────────
const TrendBadge = ({ value }) => {
  if (value === undefined || value === null) return null;
  const up = value >= 0;
  return (
    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
      {up ? <MdTrendingUp size={13} /> : <MdTrendingDown size={13} />}
      {Math.abs(value)}%
    </div>
  );
};

// ── Quick Action Button ───────────────────────────────────
const QuickAction = ({ icon:Icon, label, color, onClick }) => (
  <button onClick={onClick}
    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed transition-all hover:border-solid hover:shadow-sm ${color} cursor-pointer`}>
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
      <Icon size={20} />
    </div>
    <span className="text-center text-xs font-semibold leading-tight text-gray-700">{label}</span>
  </button>
);

// ── MAIN DASHBOARD ────────────────────────────────────────
export default function Dashboard() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { stats, salesChart, recentOrders, loading } = useSelector((s) => s.dashboard);
  const [period, setPeriod]       = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = () => {
    dispatch(fetchDashboardStats());
    dispatch(fetchRecentOrders());
    dispatch(fetchSalesChart(period));
  };

  useEffect(() => { loadAll(); }, [dispatch]);
  useEffect(() => { dispatch(fetchSalesChart(period)); }, [dispatch, period]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchDashboardStats()),
      dispatch(fetchRecentOrders()),
      dispatch(fetchSalesChart(period)),
    ]);
    setRefreshing(false);
  };

  // Pie data
  const pieData = [
    { name:'Pending',    value: stats?.ordersByStatus?.pending    || 0 },
    { name:'Processing', value: stats?.ordersByStatus?.processing || 0 },
    { name:'Shipped',    value: stats?.ordersByStatus?.shipped    || 0 },
    { name:'Delivered',  value: stats?.ordersByStatus?.delivered  || 0 },
    { name:'Cancelled',  value: stats?.ordersByStatus?.cancelled  || 0 },
  ].filter(d => d.value > 0);
  const totalOrders = pieData.reduce((s, d) => s + d.value, 0);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Derived section data (from stats, with empty fallbacks)
  const paymentData      = stats?.paymentMethods  || [];
  const categoryData     = stats?.categoryRevenue || [];
  const customerGrowth   = stats?.customerGrowth  || [];
  const heatmapData      = stats?.hourlyHeatmap   || {};
  const returnStats      = stats?.returnStats     || {};
  const couponData       = stats?.couponStats     || {};
  const satisfactionData = stats?.satisfaction    || {};
  const activityFeed     = stats?.recentActivity  || [];

  return (
    <div className="space-y-6">

      {/* ── Top Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">{greeting} 👋</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {new Date().toLocaleDateString('en-BD', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="btn-outline gap-2">
          <MdRefresh size={16} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Primary Stat Cards ── */}
      {loading && !stats ? <Spinner /> : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard title="Total Revenue"   value={`৳${(stats?.totalRevenue||0).toLocaleString()}`} icon={MdAttachMoney} color="green"  trend={stats?.revenueTrend} subtitle="vs last month" />
          <StatCard title="Total Orders"    value={(stats?.totalOrders||0).toLocaleString()} icon={MdShoppingBag} color="blue"  trend={stats?.orderTrend}   subtitle="vs last month" />
          <StatCard title="Total Products"  value={stats?.totalProducts||0} icon={MdInventory} color="purple"
            subtitle={stats?.lowStock > 0 ? `⚠️ ${stats.lowStock} low stock` : 'All stocked'} />
          <StatCard title="Total Customers" value={stats?.totalUsers||0} icon={MdPeople} color="amber" trend={stats?.userTrend} subtitle="Registered users" />
        </div>
      )}

      {/* ── Secondary Stats (expanded) ── */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {[
            { label:"Today's Orders",   value: stats.todayOrders||0,                                  color:'text-blue-600',    bg:'bg-blue-50' },
            { label:"Today's Revenue",  value:`৳${(stats.todayRevenue||0).toLocaleString()}`,          color:'text-green-600',   bg:'bg-green-50' },
            { label:'Pending Orders',   value: stats.ordersByStatus?.pending||0,                       color:'text-amber-600',   bg:'bg-amber-50' },
            { label:'Avg Order Value',  value:`৳${(stats.avgOrderValue||0).toLocaleString()}`,         color:'text-purple-600',  bg:'bg-purple-50' },
            { label:'Return Rate',      value:`${(stats.returnStats?.returnRate||0).toFixed(1)}%`,     color:'text-red-500',     bg:'bg-red-50' },
            { label:'Active Coupons',   value: stats.couponStats?.activeCoupons||0,                    color:'text-emerald-600', bg:'bg-emerald-50' },
            { label:'Avg Rating',       value:`${(stats.satisfaction?.avgRating||0).toFixed(1)}★`,    color:'text-amber-500',   bg:'bg-amber-50' },
            { label:'Gross Margin',     value:`${(stats.grossMargin||0).toFixed(0)}%`,                 color:'text-indigo-600',  bg:'bg-indigo-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl px-3 py-3 flex flex-col gap-1`}>
              <span className="text-[10px] font-semibold leading-tight text-gray-500">{label}</span>
              <span className={`text-base font-extrabold ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales Area Chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-gray-900">Sales Overview</h3>
              <p className="mt-0.5 text-sm text-gray-500">
                Total: <span className="font-bold text-gray-800">৳{salesChart.reduce((s,d) => s+(d.revenue||0), 0).toLocaleString()}</span>
              </p>
            </div>
            <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
              {PERIODS.map(({ key, label }) => (
                <button key={key} onClick={() => setPeriod(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={salesChart} margin={{ top:5, right:5, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b5bdb" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#3b5bdb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#3b5bdb" strokeWidth={2.5} fill="url(#gradRevenue)" dot={false} activeDot={{ r:5, strokeWidth:0 }} />
              {salesChart[0]?.orders !== undefined && (
                <Area type="monotone" dataKey="orders" name="orders" stroke="#10b981" strokeWidth={2} fill="url(#gradOrders)" dot={false} activeDot={{ r:4, strokeWidth:0 }} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-1 font-bold text-gray-900">Order Status</h3>
          <p className="mb-4 text-sm text-gray-500">{totalOrders} total orders</p>
          {totalOrders === 0 ? (
            <div className="flex h-44 items-center justify-center text-sm text-gray-300">No data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v} orders`, n]} contentStyle={{ borderRadius:10, fontSize:12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {pieData.map((d, i) => {
                  const StatusIcon = STATUS_ICONS[d.name.toLowerCase()] || MdShoppingBag;
                  const pct = totalOrders ? Math.round((d.value/totalOrders)*100) : 0;
                  return (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background:PIE_COLORS[i%PIE_COLORS.length] }} />
                      <span className="flex-1 text-xs capitalize text-gray-600">{d.name}</span>
                      <span className="text-xs font-bold text-gray-800">{d.value}</span>
                      <span className="w-8 text-right text-xs text-gray-400">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Customer Growth + Category Revenue ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CustomerGrowthChart data={customerGrowth} />
        <CategoryRevenueChart data={categoryData} />
      </div>

      {/* ── Hourly Sales Heatmap ── */}
      <HourlySalesHeatmap data={heatmapData} />

      {/* ── MAP SECTION ── */}
      <MapSection divisionStats={stats?.divisionStats || {}} />

      {/* ── Payment + Satisfaction + Coupon ── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <PaymentBreakdown    data={paymentData} />
        <SatisfactionWidget  data={satisfactionData} />
        <CouponAnalytics     data={couponData} />
      </div>

      {/* ── Returns + Live Activity ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReturnRefundStats stats={returnStats} />
        <LiveActivityFeed  activities={activityFeed} />
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Recent Orders */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <button onClick={() => navigate('/orders')} className="flex items-center gap-1 text-sm font-semibold text-primary-500 hover:underline">
              View all <MdArrowForward size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/60 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3 text-left">Order</th>
                  <th className="px-5 py-3 text-left">Customer</th>
                  <th className="px-5 py-3 text-left">Amount</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading && recentOrders.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-gray-400">
                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary-500/20 border-t-primary-500" />
                  </td></tr>
                ) : recentOrders.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400">No recent orders</td></tr>
                ) : recentOrders.map((o) => {
                  const StatusIcon = STATUS_ICONS[o.status] || MdShoppingBag;
                  return (
                    <tr key={o._id} className="group transition-colors hover:bg-gray-50/50">
                      <td className="px-5 py-3">
                        <span className="rounded-lg bg-gray-100 px-2 py-1 font-mono text-xs font-bold text-gray-600">
                          #{o._id?.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold uppercase text-primary-600">
                            {o.user?.name?.[0] || '?'}
                          </div>
                          <span className="text-xs font-medium text-gray-800">{o.user?.name || 'Guest'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-bold text-gray-900">৳{o.totalPrice?.toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <StatusIcon size={13} className={`
                            ${o.status === 'delivered'                      ? 'text-green-500' : ''}
                            ${o.status === 'cancelled'                      ? 'text-red-500'   : ''}
                            ${o.status === 'pending'                        ? 'text-amber-500' : ''}
                            ${['processing','shipped'].includes(o.status)   ? 'text-blue-500'  : ''}
                          `} />
                          <Badge type={ORDER_STATUS_BADGE[o.status] || 'gray'}>{o.status}</Badge>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400">
                        {new Date(o.createdAt).toLocaleDateString('en-BD', { day:'2-digit', month:'short' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Top Products */}
          {stats?.topProducts?.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Top Products</h3>
                <button onClick={() => navigate('/products')} className="flex items-center gap-1 text-xs font-semibold text-primary-500 hover:underline">
                  All <MdArrowForward size={12} />
                </button>
              </div>
              <div className="space-y-3">
                {stats.topProducts.slice(0, 5).map((p, i) => (
                  <div key={p._id || i} className="flex items-center gap-3">
                    <span className={`text-xs font-black w-5 flex-shrink-0 ${i === 0 ? 'text-amber-500' : 'text-gray-400'}`}>#{i+1}</span>
                    <div className="h-10 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-gray-800">{p.title}</p>
                      <p className="text-xs text-gray-400">{p.sold||0} sold</p>
                    </div>
                    <span className="flex-shrink-0 text-xs font-bold text-gray-900">৳{(p.revenue||p.price||0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low Stock Alert */}
          {stats?.lowStockProducts?.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <MdWarning size={16} className="text-amber-500" />
                <h3 className="text-sm font-bold text-amber-800">Low Stock Alert</h3>
              </div>
              <div className="space-y-2">
                {stats.lowStockProducts.slice(0, 4).map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="flex-1 truncate text-xs text-amber-700">{p.title}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                      {p.stock === 0 ? 'Out' : `${p.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/products')} className="mt-3 flex items-center gap-1 text-xs font-semibold text-amber-700 hover:underline">
                Manage Stock <MdArrowForward size={12} />
              </button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-gray-900">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <QuickAction icon={MdAdd}         label="Add Product"  color="border-blue-200 hover:bg-blue-50"   onClick={() => navigate('/products')} />
              <QuickAction icon={MdShoppingBag} label="View Orders"  color="border-green-200 hover:bg-green-50"  onClick={() => navigate('/orders')} />
              <QuickAction icon={MdPeople}      label="Customers"    color="border-purple-200 hover:bg-purple-50" onClick={() => navigate('/users')} />
              <QuickAction icon={MdVisibility}  label="Flash Deals"  color="border-amber-200 hover:bg-amber-50"  onClick={() => navigate('/flash-deals')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}// ── Bangladesh Division Data ───────────────────────────────
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

// ── Bangladesh SVG Map ────────────────────────────────────
const BangladeshMap = ({ divisionData, onHover, hoveredDiv, onLeave }) => {
  const maxVal = Math.max(...Object.values(divisionData).map(d => d.revenue || 0), 1);
  const getColor = (divId) => {
    const val = divisionData[divId]?.revenue || 0;
    if (val === 0) return '#f1f5f9';
    const intensity = val / maxVal;
    const r = Math.round(199 - intensity * (199 - 67));
    const g = Math.round(210 - intensity * (210 - 56));
    const b = Math.round(254 - intensity * (254 - 202));
    return `rgb(${r},${g},${b})`;
  };
  return (
    <svg viewBox="0 30 320 290" className="h-full w-full" style={{ filter: 'drop-shadow(0 4px 24px rgba(79,70,229,0.10))' }}>
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e7ff" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="320" height="350" fill="url(#grid)" rx="16" />
      {BD_DIVISIONS.map((div) => {
        const isHovered = hoveredDiv === div.id;
        const data = divisionData[div.id];
        return (
          <g key={div.id} onMouseEnter={() => onHover(div.id)} onMouseLeave={onLeave} style={{ cursor:'pointer' }}>
            <path d={div.path} fill={getColor(div.id)}
              stroke={isHovered ? '#4f46e5' : '#c7d2fe'}
              strokeWidth={isHovered ? 2.5 : 1.5}
              style={{ transition:'all 0.2s ease', filter: isHovered ? 'drop-shadow(0 4px 12px rgba(79,70,229,0.35))' : 'none', transform: isHovered ? 'scale(1.03)' : 'scale(1)', transformOrigin:`${div.cx}px ${div.cy}px` }}
            />
            <text x={div.cx} y={div.cy - 3} textAnchor="middle" fontSize={isHovered ? '8.5' : '7.5'} fontWeight={isHovered ? '800' : '600'} fill={isHovered ? '#3730a3' : '#4f46e5'} style={{ pointerEvents:'none', transition:'all 0.2s' }}>{div.name}</text>
            {data?.revenue > 0 && (
              <text x={div.cx} y={div.cy + 9} textAnchor="middle" fontSize="6.5" fontWeight="700" fill={isHovered ? '#1e1b4b' : '#6366f1'} style={{ pointerEvents:'none', transition:'all 0.2s' }}>
                ৳{(data.revenue / 1000).toFixed(1)}k
              </text>
            )}
          </g>
        );
      })}
      <text x="148" y="318" textAnchor="middle" fontSize="8" fill="#94a3b8" fontStyle="italic" fontWeight="500">Bay of Bengal</text>
      <g transform="translate(285, 48)">
        <circle cx="0" cy="0" r="12" fill="white" stroke="#e0e7ff" strokeWidth="1.5" />
        <text x="0" y="-5" textAnchor="middle" fontSize="7" fontWeight="800" fill="#4f46e5">N</text>
        <line x1="0" y1="-3" x2="0" y2="3" stroke="#4f46e5" strokeWidth="1.5" />
        <line x1="-3" y1="0" x2="3" y2="0" stroke="#c7d2fe" strokeWidth="1" />
      </g>
    </svg>
  );
};