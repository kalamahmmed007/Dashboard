import React, { useState, useEffect, useRef } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';
import {
  MdLock, MdStore, MdNotifications,
  MdSearch, MdLocalShipping, MdPayment,
  MdLocalOffer, MdShare, MdImage, MdAdd, MdDelete,
  MdEdit, MdSave, MdContentCopy, MdCheck, MdRefresh,
} from 'react-icons/md';
import {
  FaFacebook, FaInstagram, FaYoutube, FaTiktok, FaWhatsapp,
} from 'react-icons/fa';
import { SiGoogleanalytics } from 'react-icons/si';

// ─── Section Card ─────────────────────────────────────────
const Section = ({ title, subtitle, children, onSave, saving }) => (
  <div className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {onSave && (
        <button onClick={onSave} disabled={saving}
          className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-60">
          {saving
            ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            : <MdSave size={14} />}
          {saving ? 'Saving...' : 'Save'}
        </button>
      )}
    </div>
    {children}
  </div>
);

// ─── Toggle Switch ────────────────────────────────────────
const Toggle = ({ checked, onChange, label, desc }) => (
  <div className="flex items-center justify-between border-b border-gray-50 py-3 last:border-0">
    <div>
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      {desc && <p className="mt-0.5 text-xs text-gray-400">{desc}</p>}
    </div>
    <label className="relative ml-4 inline-flex flex-shrink-0 cursor-pointer items-center">
      <input type="checkbox" className="peer sr-only" checked={!!checked} onChange={onChange} />
      <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-500 peer-checked:after:translate-x-full peer-checked:after:border-white" />
    </label>
  </div>
);

// ─── Copy Button ──────────────────────────────────────────
const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600" title="Copy">
      {copied ? <MdCheck size={14} className="text-green-500" /> : <MdContentCopy size={14} />}
    </button>
  );
};

// ─── Skeleton loader ──────────────────────────────────────
const SkeletonField = () => (
  <div className="animate-pulse">
    <div className="mb-1.5 h-3 w-24 rounded bg-gray-200" />
    <div className="h-10 w-full rounded-lg bg-gray-100" />
  </div>
);

// ─── Tab definitions ──────────────────────────────────────
const TABS = [
  { key: 'store',         label: 'Store',        icon: MdStore },
  { key: 'security',      label: 'Security',      icon: MdLock },
  { key: 'shipping',      label: 'Shipping',      icon: MdLocalShipping },
  { key: 'payment',       label: 'Payment',       icon: MdPayment },
  { key: 'seo',           label: 'SEO',           icon: MdSearch },
  { key: 'pixel',         label: 'FB Pixel',      icon: FaFacebook },
  { key: 'analytics',     label: 'Analytics',     icon: SiGoogleanalytics },
  { key: 'social',        label: 'Social',        icon: MdShare },
  { key: 'coupons',       label: 'Coupons',       icon: MdLocalOffer },
  { key: 'banners',       label: 'Banners',       icon: MdImage },
  { key: 'notifications', label: 'Notifications', icon: MdNotifications },
];

// ─── Default state values ─────────────────────────────────
const DEFAULT_STORE = {
  name: '', email: '', phone: '', address: '',
  currency: 'BDT', currencySymbol: '৳', logo: null, favicon: null,
};
const DEFAULT_SHIPPING = {
  freeShippingThreshold: 2000, insideDhaka: 60, outsideDhaka: 120,
  expressCharge: 200, codAvailable: true, freeShippingEnabled: true,
  estimatedInsideDhaka: '1-2 days', estimatedOutsideDhaka: '3-5 days',
};
const DEFAULT_PAYMENT = {
  codEnabled: true, bkashEnabled: false, bkashNumber: '', bkashApiKey: '',
  nagadEnabled: false, nagadNumber: '', nagadApiKey: '',
  sslcommerzEnabled: false, sslcommerzStoreId: '', sslcommerzStorePass: '',
  stripeEnabled: false, stripePublicKey: '', testMode: true,
};
const DEFAULT_SEO = {
  metaTitle: '', metaDescription: '', metaKeywords: '',
  ogImage: '', robotsTxt: 'User-agent: *\nAllow: /', canonicalUrl: '',
};
const DEFAULT_PIXEL = {
  pixelId: '', accessToken: '', testEventCode: '',
  trackPageView: true, trackAddToCart: true, trackPurchase: true,
  trackSearch: true, trackViewContent: true, trackInitiateCheckout: true, enabled: false,
};
const DEFAULT_ANALYTICS = {
  gaEnabled: false, gaMeasurementId: '', gtmEnabled: false, gtmContainerId: '',
  clarityEnabled: false, clarityProjectId: '', hotjarEnabled: false, hotjarId: '',
};
const DEFAULT_SOCIAL = { facebook: '', instagram: '', youtube: '', tiktok: '', whatsapp: '', messenger: '' };
const DEFAULT_NOTIF = {
  newOrder: true, lowStock: true, newReview: true, newUser: false,
  orderDelivered: true, orderCancelled: true, emailEnabled: true, adminEmail: '',
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('store');
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving]         = useState(false);

  // Settings state
  const [store,     setStore]     = useState(DEFAULT_STORE);
  const [shipping,  setShipping]  = useState(DEFAULT_SHIPPING);
  const [payment,   setPayment]   = useState(DEFAULT_PAYMENT);
  const [seo,       setSeo]       = useState(DEFAULT_SEO);
  const [pixel,     setPixel]     = useState(DEFAULT_PIXEL);
  const [analytics, setAnalytics] = useState(DEFAULT_ANALYTICS);
  const [social,    setSocial]    = useState(DEFAULT_SOCIAL);
  const [notif,     setNotif]     = useState(DEFAULT_NOTIF);

  // Password
  const [pass, setPass] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // Coupons
  const [coupons,      setCoupons]      = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponForm,   setCouponForm]   = useState({ code: '', type: 'percent', value: '', minOrder: '', maxUses: '', expiry: '', isActive: true });
  const [couponModal,  setCouponModal]  = useState(false);
  const [editCoupon,   setEditCoupon]   = useState(null);
  const [couponSaving, setCouponSaving] = useState(false);

  // Banners
  const [banners,       setBanners]       = useState([]);
  const [bannersLoading, setBannersLoading] = useState(false);
  const [bannerForm,    setBannerForm]    = useState({ title: '', subtitle: '', link: '', position: 'hero', isActive: true });
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerModal,   setBannerModal]   = useState(false);
  const [editBanner,    setEditBanner]    = useState(null);
  const [bannerSaving,  setBannerSaving]  = useState(false);

  const inp = 'form-input w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all';

  // ── Load all settings on mount ────────────────────────
  useEffect(() => {
    loadSettings();
  }, []);

  // Load coupons/banners when switching to those tabs
  useEffect(() => {
    if (activeTab === 'coupons' && coupons.length === 0) loadCoupons();
    if (activeTab === 'banners' && banners.length === 0) loadBanners();
  }, [activeTab]);

  // ── GET /admin/settings ───────────────────────────────
  const loadSettings = async () => {
    setPageLoading(true);
    try {
      const { data } = await api.get('/admin/settings');
      if (data.store)         setStore(s => ({ ...DEFAULT_STORE,     ...s, ...data.store }));
      if (data.shipping)      setShipping(s => ({ ...DEFAULT_SHIPPING,  ...s, ...data.shipping }));
      if (data.payment)       setPayment(s => ({ ...DEFAULT_PAYMENT,   ...s, ...data.payment }));
      if (data.seo)           setSeo(s => ({ ...DEFAULT_SEO,       ...s, ...data.seo }));
      if (data.pixel)         setPixel(s => ({ ...DEFAULT_PIXEL,     ...s, ...data.pixel }));
      if (data.analytics)     setAnalytics(s => ({ ...DEFAULT_ANALYTICS, ...s, ...data.analytics }));
      if (data.social)        setSocial(s => ({ ...DEFAULT_SOCIAL,    ...s, ...data.social }));
      if (data.notifications) setNotif(s => ({ ...DEFAULT_NOTIF,     ...s, ...data.notifications }));
    } catch (err) {
      console.warn('Settings load failed — using defaults:', err?.response?.data?.message || err.message);
      // keep defaults, no toast to avoid noise on first load
    } finally {
      setPageLoading(false);
    }
  };

  // ── GET /admin/coupons ────────────────────────────────
  const loadCoupons = async () => {
    setCouponsLoading(true);
    try {
      const { data } = await api.get('/admin/coupons');
      setCoupons(Array.isArray(data) ? data : data.coupons || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load coupons');
    } finally {
      setCouponsLoading(false);
    }
  };

  // ── GET /admin/banners ────────────────────────────────
  const loadBanners = async () => {
    setBannersLoading(true);
    try {
      const { data } = await api.get('/admin/banners');
      setBanners(Array.isArray(data) ? data : data.banners || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load banners');
    } finally {
      setBannersLoading(false);
    }
  };

  // ── PUT /admin/settings — generic section save ────────
  // For store section, uses multipart/form-data (logo, favicon uploads)
  const saveSection = async (section, payload) => {
    setSaving(true);
    try {
      if (section === 'store') {
        // Build FormData to support logo/favicon file uploads
        const fd = new FormData();
        fd.append('section', 'store');
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== null && v !== undefined) fd.append(k, v);
        });
        await api.put('/admin/settings', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.put('/admin/settings', { section, data: payload });
      }
      toast.success('Saved successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ── PUT /admin/auth/change-password ───────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pass.newPassword !== pass.confirmPassword) return toast.error('Passwords do not match');
    if (pass.newPassword.length < 6) return toast.error('Minimum 6 characters required');
    setSaving(true);
    try {
      await api.put('/admin/auth/change-password', {
        currentPassword: pass.currentPassword,
        newPassword: pass.newPassword,
      });
      toast.success('Password changed successfully!');
      setPass({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Password change failed');
    } finally {
      setSaving(false);
    }
  };

  // ══════════════════════════════
  // COUPON CRUD
  // ══════════════════════════════

  const openCouponCreate = () => {
    setEditCoupon(null);
    setCouponForm({ code: '', type: 'percent', value: '', minOrder: '', maxUses: '', expiry: '', isActive: true });
    setCouponModal(true);
  };

  const openCouponEdit = (c) => {
    setEditCoupon(c);
    setCouponForm({
      code: c.code, type: c.type, value: c.value,
      minOrder: c.minOrder || '', maxUses: c.maxUses || '',
      expiry: c.expiry?.split('T')[0] || '', isActive: c.isActive,
    });
    setCouponModal(true);
  };

  // POST /admin/coupons  or  PUT /admin/coupons/:id
  const saveCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.value) return toast.error('Code and value are required');
    setCouponSaving(true);
    try {
      if (editCoupon) {
        const { data } = await api.put(`/admin/coupons/${editCoupon._id}`, couponForm);
        const updated = data.coupon || data;
        setCoupons(prev => prev.map(c => c._id === editCoupon._id ? updated : c));
        toast.success('Coupon updated!');
      } else {
        const { data } = await api.post('/admin/coupons', couponForm);
        const created = data.coupon || data;
        setCoupons(prev => [created, ...prev]);
        toast.success('Coupon created!');
      }
      setCouponModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save coupon');
    } finally {
      setCouponSaving(false);
    }
  };

  // DELETE /admin/coupons/:id
  const deleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      setCoupons(prev => prev.filter(c => c._id !== id));
      toast.success('Coupon deleted');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  // PATCH /admin/coupons/:id/toggle  — quick active toggle from table
  const toggleCouponActive = async (c) => {
    try {
      const { data } = await api.patch(`/admin/coupons/${c._id}/toggle`, { isActive: !c.isActive });
      const updated = data.coupon || data;
      setCoupons(prev => prev.map(x => x._id === c._id ? { ...x, isActive: updated.isActive ?? !c.isActive } : x));
      toast.success(`Coupon ${!c.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Toggle failed');
    }
  };

  const genCode = () => {
    const c = 'VOYAGE' + Math.random().toString(36).toUpperCase().slice(2, 7);
    setCouponForm(f => ({ ...f, code: c }));
  };

  // ══════════════════════════════
  // BANNER CRUD
  // ══════════════════════════════

  const openBannerCreate = () => {
    setEditBanner(null);
    setBannerForm({ title: '', subtitle: '', link: '', position: 'hero', isActive: true });
    setBannerImageFile(null);
    setBannerModal(true);
  };

  const openBannerEdit = (b) => {
    setEditBanner(b);
    setBannerForm({
      title: b.title, subtitle: b.subtitle || '', link: b.link || '',
      position: b.position, isActive: b.isActive,
    });
    setBannerImageFile(null);
    setBannerModal(true);
  };

  // POST /admin/banners  or  PUT /admin/banners/:id  (multipart/form-data)
  const saveBanner = async (e) => {
    e.preventDefault();
    if (!bannerForm.title) return toast.error('Title is required');
    setBannerSaving(true);
    const fd = new FormData();
    Object.entries(bannerForm).forEach(([k, v]) => fd.append(k, v));
    if (bannerImageFile) fd.append('image', bannerImageFile);
    try {
      if (editBanner) {
        const { data } = await api.put(`/admin/banners/${editBanner._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const updated = data.banner || data;
        setBanners(prev => prev.map(b => b._id === editBanner._id ? updated : b));
        toast.success('Banner updated!');
      } else {
        const { data } = await api.post('/admin/banners', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const created = data.banner || data;
        setBanners(prev => [created, ...prev]);
        toast.success('Banner created!');
      }
      setBannerModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save banner');
    } finally {
      setBannerSaving(false);
    }
  };

  // DELETE /admin/banners/:id
  const deleteBanner = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await api.delete(`/admin/banners/${id}`);
      setBanners(prev => prev.filter(b => b._id !== id));
      toast.success('Banner deleted');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  // PATCH /admin/banners/:id/toggle
  const toggleBannerActive = async (b) => {
    try {
      const { data } = await api.patch(`/admin/banners/${b._id}/toggle`, { isActive: !b.isActive });
      const updated = data.banner || data;
      setBanners(prev => prev.map(x => x._id === b._id ? { ...x, isActive: updated.isActive ?? !b.isActive } : x));
      toast.success(`Banner ${!b.isActive ? 'activated' : 'hidden'}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Toggle failed');
    }
  };

  // ── Render ────────────────────────────────────────────
  return (
    <div className="flex gap-6">
      {/* ── Sidebar Tabs ── */}
      <aside className="hidden w-52 flex-shrink-0 flex-col gap-0.5 lg:flex">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors
              ${activeTab === key ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </aside>

      {/* Mobile tab strip */}
      <div className="mb-2 flex w-full gap-1.5 overflow-x-auto pb-2 lg:hidden">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors
              ${activeTab === key ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="min-w-0 flex-1 space-y-5" key={activeTab}>

        {/* ═══ STORE ═══ */}
        {activeTab === 'store' && (
          <Section title="Store Information" subtitle="Basic store details shown to customers"
            onSave={() => saveSection('store', store)} saving={saving}>
            {pageLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonField key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Store Name</label>
                  <input className={inp} value={store.name} onChange={e => setStore({ ...store, name: e.target.value })} placeholder="My Store" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Contact Email</label>
                  <input type="email" className={inp} value={store.email} onChange={e => setStore({ ...store, email: e.target.value })} placeholder="support@store.com" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Phone</label>
                  <input className={inp} value={store.phone} onChange={e => setStore({ ...store, phone: e.target.value })} placeholder="+880 1XXXXXXXXX" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Currency Symbol</label>
                  <input className={inp} value={store.currencySymbol} onChange={e => setStore({ ...store, currencySymbol: e.target.value })} placeholder="৳" />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Address</label>
                  <textarea className={inp} rows={2} value={store.address} onChange={e => setStore({ ...store, address: e.target.value })} placeholder="Dhaka, Bangladesh" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Store Logo</label>
                  {store.logo && typeof store.logo === 'string' && (
                    <img src={store.logo} alt="logo" className="mb-2 h-10 w-auto rounded border border-gray-200 object-contain" />
                  )}
                  <input type="file" accept="image/*" onChange={e => setStore({ ...store, logo: e.target.files[0] })}
                    className="w-full cursor-pointer rounded-lg border border-dashed border-gray-300 p-3 text-sm text-gray-500 transition-colors hover:border-indigo-400" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Favicon</label>
                  {store.favicon && typeof store.favicon === 'string' && (
                    <img src={store.favicon} alt="favicon" className="mb-2 h-8 w-8 rounded border border-gray-200 object-contain" />
                  )}
                  <input type="file" accept="image/*" onChange={e => setStore({ ...store, favicon: e.target.files[0] })}
                    className="w-full cursor-pointer rounded-lg border border-dashed border-gray-300 p-3 text-sm text-gray-500 transition-colors hover:border-indigo-400" />
                </div>
              </div>
            )}
          </Section>
        )}

        {/* ═══ SECURITY ═══ */}
        {activeTab === 'security' && (
          <Section title="Change Password" subtitle="Update your admin account password">
            <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Current Password</label>
                <input type="password" className={inp} value={pass.currentPassword}
                  onChange={e => setPass({ ...pass, currentPassword: e.target.value })} placeholder="••••••••" required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">New Password</label>
                <input type="password" className={inp} value={pass.newPassword}
                  onChange={e => setPass({ ...pass, newPassword: e.target.value })} placeholder="••••••••" required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Confirm New Password</label>
                <input type="password" className={inp} value={pass.confirmPassword}
                  onChange={e => setPass({ ...pass, confirmPassword: e.target.value })} placeholder="••••••••" required />
                {pass.newPassword && pass.confirmPassword && pass.newPassword !== pass.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                )}
              </div>
              <button type="submit" disabled={saving}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60">
                {saving && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                Update Password
              </button>
            </form>
          </Section>
        )}

        {/* ═══ SHIPPING ═══ */}
        {activeTab === 'shipping' && (
          <Section title="Shipping & Delivery" subtitle="Configure delivery charges and options"
            onSave={() => saveSection('shipping', shipping)} saving={saving}>
            {pageLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 6 }).map((_, i) => <SkeletonField key={i} />)}</div>
            ) : (
              <>
                <div className="space-y-1">
                  <Toggle checked={shipping.freeShippingEnabled} onChange={e => setShipping({ ...shipping, freeShippingEnabled: e.target.checked })}
                    label="Enable Free Shipping" desc="Free shipping above a minimum order amount" />
                  <Toggle checked={shipping.codAvailable} onChange={e => setShipping({ ...shipping, codAvailable: e.target.checked })}
                    label="Cash on Delivery" desc="Allow customers to pay on delivery" />
                </div>
                <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    { label: 'Free Shipping Threshold (৳)', key: 'freeShippingThreshold' },
                    { label: 'Inside Dhaka Charge (৳)',      key: 'insideDhaka' },
                    { label: 'Outside Dhaka Charge (৳)',     key: 'outsideDhaka' },
                    { label: 'Express Delivery Charge (৳)',  key: 'expressCharge' },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="mb-1 block text-xs font-semibold text-gray-500">{label}</label>
                      <input type="number" className={inp} value={shipping[key]}
                        onChange={e => setShipping({ ...shipping, [key]: e.target.value })} />
                    </div>
                  ))}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Inside Dhaka ETA</label>
                    <input className={inp} value={shipping.estimatedInsideDhaka} placeholder="1-2 days"
                      onChange={e => setShipping({ ...shipping, estimatedInsideDhaka: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Outside Dhaka ETA</label>
                    <input className={inp} value={shipping.estimatedOutsideDhaka} placeholder="3-5 days"
                      onChange={e => setShipping({ ...shipping, estimatedOutsideDhaka: e.target.value })} />
                  </div>
                </div>
              </>
            )}
          </Section>
        )}

        {/* ═══ PAYMENT ═══ */}
        {activeTab === 'payment' && (
          <Section title="Payment Methods" subtitle="Enable or disable payment gateways"
            onSave={() => saveSection('payment', payment)} saving={saving}>
            {pageLoading ? (
              <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-gray-100 p-4">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                </div>
              ))}</div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-100 p-4">
                  <Toggle checked={payment.testMode} onChange={e => setPayment({ ...payment, testMode: e.target.checked })}
                    label="🧪 Test / Sandbox Mode" desc="All payments will be in test mode" />
                </div>

                {/* COD */}
                <div className="rounded-xl border border-gray-100 p-4">
                  <Toggle checked={payment.codEnabled} onChange={e => setPayment({ ...payment, codEnabled: e.target.checked })}
                    label="💵 Cash on Delivery (COD)" desc="Customer pays when order is delivered" />
                </div>

                {/* bKash */}
                <div className="space-y-3 rounded-xl border border-gray-100 p-4">
                  <Toggle checked={payment.bkashEnabled} onChange={e => setPayment({ ...payment, bkashEnabled: e.target.checked })}
                    label="🔴 bKash" desc="bKash mobile payment" />
                  {payment.bkashEnabled && (
                    <div className="grid gap-3 pt-2 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-500">bKash Number</label>
                        <input className={inp} value={payment.bkashNumber} placeholder="017XXXXXXXX"
                          onChange={e => setPayment({ ...payment, bkashNumber: e.target.value })} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-500">API Key</label>
                        <input className={inp} value={payment.bkashApiKey} placeholder="bKash App Key"
                          onChange={e => setPayment({ ...payment, bkashApiKey: e.target.value })} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Nagad */}
                <div className="space-y-3 rounded-xl border border-gray-100 p-4">
                  <Toggle checked={payment.nagadEnabled} onChange={e => setPayment({ ...payment, nagadEnabled: e.target.checked })}
                    label="🟠 Nagad" desc="Nagad mobile payment" />
                  {payment.nagadEnabled && (
                    <div className="grid gap-3 pt-2 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-500">Nagad Number</label>
                        <input className={inp} value={payment.nagadNumber} placeholder="017XXXXXXXX"
                          onChange={e => setPayment({ ...payment, nagadNumber: e.target.value })} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-500">API Key</label>
                        <input className={inp} value={payment.nagadApiKey} placeholder="Nagad API Key"
                          onChange={e => setPayment({ ...payment, nagadApiKey: e.target.value })} />
                      </div>
                    </div>
                  )}
                </div>

                {/* SSLCommerz */}
                <div className="space-y-3 rounded-xl border border-gray-100 p-4">
                  <Toggle checked={payment.sslcommerzEnabled} onChange={e => setPayment({ ...payment, sslcommerzEnabled: e.target.checked })}
                    label="💳 SSLCommerz" desc="Card, net banking & more" />
                  {payment.sslcommerzEnabled && (
                    <div className="grid gap-3 pt-2 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-500">Store ID</label>
                        <input className={inp} value={payment.sslcommerzStoreId} placeholder="SSL Store ID"
                          onChange={e => setPayment({ ...payment, sslcommerzStoreId: e.target.value })} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-500">Store Password</label>
                        <input type="password" className={inp} value={payment.sslcommerzStorePass} placeholder="SSL Store Password"
                          onChange={e => setPayment({ ...payment, sslcommerzStorePass: e.target.value })} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* ═══ SEO ═══ */}
        {activeTab === 'seo' && (
          <Section title="SEO Settings" subtitle="Optimize your store for search engines"
            onSave={() => saveSection('seo', seo)} saving={saving}>
            {pageLoading ? (
              <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <SkeletonField key={i} />)}</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Meta Title</label>
                  <input className={inp} value={seo.metaTitle} onChange={e => setSeo({ ...seo, metaTitle: e.target.value })} maxLength={60} />
                  <p className="mt-1 text-xs text-gray-400">{seo.metaTitle.length}/60 characters</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Meta Description</label>
                  <textarea className={inp} rows={3} value={seo.metaDescription}
                    onChange={e => setSeo({ ...seo, metaDescription: e.target.value })} maxLength={160} />
                  <p className="mt-1 text-xs text-gray-400">{seo.metaDescription.length}/160 characters</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Keywords (comma separated)</label>
                  <input className={inp} value={seo.metaKeywords} onChange={e => setSeo({ ...seo, metaKeywords: e.target.value })}
                    placeholder="fashion, clothing, shirt, bangladesh" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Canonical URL</label>
                  <input className={inp} value={seo.canonicalUrl} onChange={e => setSeo({ ...seo, canonicalUrl: e.target.value })}
                    placeholder="https://yourstore.com" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">OG Image URL</label>
                  <input className={inp} value={seo.ogImage} onChange={e => setSeo({ ...seo, ogImage: e.target.value })}
                    placeholder="https://yourstore.com/og-image.jpg" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">robots.txt</label>
                  <textarea className={`${inp} font-mono text-xs`} rows={4} value={seo.robotsTxt}
                    onChange={e => setSeo({ ...seo, robotsTxt: e.target.value })} />
                </div>
                {/* Google preview */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Google Preview</p>
                  <p className="line-clamp-1 text-base font-medium text-blue-600">{seo.metaTitle || 'Your Store Title'}</p>
                  <p className="mt-0.5 text-xs text-green-700">{seo.canonicalUrl || 'https://yourstore.com'}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">{seo.metaDescription || 'Your meta description will appear here...'}</p>
                </div>
              </div>
            )}
          </Section>
        )}

        {/* ═══ FB PIXEL ═══ */}
        {activeTab === 'pixel' && (
          <Section title="Facebook Pixel" subtitle="Track conversions and optimize Facebook ads"
            onSave={() => saveSection('pixel', pixel)} saving={saving}>
            {pageLoading ? (
              <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <SkeletonField key={i} />)}</div>
            ) : (
              <div className="space-y-4">
                <Toggle checked={pixel.enabled} onChange={e => setPixel({ ...pixel, enabled: e.target.checked })}
                  label="Enable Facebook Pixel" desc="Activate pixel tracking on your store" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Pixel ID</label>
                    <div className="relative">
                      <input className={inp} value={pixel.pixelId} onChange={e => setPixel({ ...pixel, pixelId: e.target.value })} placeholder="123456789012345" />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2"><CopyBtn text={pixel.pixelId} /></div>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">Facebook Events Manager → Pixel ID</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Conversions API Access Token</label>
                    <input type="password" className={inp} value={pixel.accessToken}
                      onChange={e => setPixel({ ...pixel, accessToken: e.target.value })} placeholder="EAAG..." />
                    <p className="mt-1 text-xs text-gray-400">Optional — server-side events</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Test Event Code</label>
                    <input className={inp} value={pixel.testEventCode}
                      onChange={e => setPixel({ ...pixel, testEventCode: e.target.value })} placeholder="TEST12345" />
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 p-4">
                  <p className="mb-3 text-sm font-semibold text-gray-700">Track Events</p>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {[
                      { key: 'trackPageView',         label: 'PageView',          desc: 'Every page visit' },
                      { key: 'trackViewContent',       label: 'ViewContent',       desc: 'Product page views' },
                      { key: 'trackAddToCart',         label: 'AddToCart',         desc: 'Add to cart events' },
                      { key: 'trackInitiateCheckout',  label: 'InitiateCheckout',  desc: 'Checkout started' },
                      { key: 'trackPurchase',          label: 'Purchase',          desc: 'Completed orders' },
                      { key: 'trackSearch',            label: 'Search',            desc: 'Search queries' },
                    ].map(({ key, label, desc }) => (
                      <Toggle key={key} checked={pixel[key]} onChange={e => setPixel({ ...pixel, [key]: e.target.checked })} label={label} desc={desc} />
                    ))}
                  </div>
                </div>
                {pixel.pixelId && (
                  <div className="rounded-xl bg-gray-900 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-mono text-xs text-gray-400">Auto-injected pixel code</p>
                      <CopyBtn text={`fbq('init', '${pixel.pixelId}');\nfbq('track', 'PageView');`} />
                    </div>
                    <code className="font-mono text-xs text-green-400">
                      fbq('init', '<span className="text-yellow-400">{pixel.pixelId}</span>');<br />
                      fbq('track', 'PageView');
                    </code>
                  </div>
                )}
              </div>
            )}
          </Section>
        )}

        {/* ═══ ANALYTICS ═══ */}
        {activeTab === 'analytics' && (
          <Section title="Analytics & Tracking" subtitle="Connect analytics tools to monitor your store"
            onSave={() => saveSection('analytics', analytics)} saving={saving}>
            {pageLoading ? (
              <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-gray-100 p-4"><div className="h-4 w-40 rounded bg-gray-200" /></div>
              ))}</div>
            ) : (
              <div className="space-y-4">
                {[
                  { enabledKey: 'gaEnabled',       idKey: 'gaMeasurementId', label: '📊 Google Analytics 4 (GA4)', desc: 'Track traffic and user behavior',   placeholder: 'G-XXXXXXXXXX',  hint: 'GA4 → Admin → Data Streams → Measurement ID' },
                  { enabledKey: 'gtmEnabled',       idKey: 'gtmContainerId',  label: '🏷️ Google Tag Manager (GTM)', desc: 'Manage all tags from one place',    placeholder: 'GTM-XXXXXXX',   hint: '' },
                  { enabledKey: 'clarityEnabled',   idKey: 'clarityProjectId', label: '🎯 Microsoft Clarity',       desc: 'Heatmaps and session recordings',  placeholder: 'xxxxxxxxxx',    hint: '' },
                  { enabledKey: 'hotjarEnabled',    idKey: 'hotjarId',         label: '🔥 Hotjar',                  desc: 'User behavior analytics',          placeholder: '1234567',       hint: '' },
                ].map(({ enabledKey, idKey, label, desc, placeholder, hint }) => (
                  <div key={enabledKey} className="space-y-3 rounded-xl border border-gray-100 p-4">
                    <Toggle checked={analytics[enabledKey]} onChange={e => setAnalytics({ ...analytics, [enabledKey]: e.target.checked })} label={label} desc={desc} />
                    {analytics[enabledKey] && (
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-500">ID / Key</label>
                        <input className={inp} value={analytics[idKey]} placeholder={placeholder}
                          onChange={e => setAnalytics({ ...analytics, [idKey]: e.target.value })} />
                        {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* ═══ SOCIAL ═══ */}
        {activeTab === 'social' && (
          <Section title="Social Media Links" subtitle="Connect your social profiles"
            onSave={() => saveSection('social', social)} saving={saving}>
            {pageLoading ? (
              <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <SkeletonField key={i} />)}</div>
            ) : (
              <div className="space-y-4">
                {[
                  { key: 'facebook',  label: 'Facebook Page URL',    icon: FaFacebook,  placeholder: 'https://facebook.com/yourpage',   color: 'text-blue-600' },
                  { key: 'instagram', label: 'Instagram Profile URL', icon: FaInstagram, placeholder: 'https://instagram.com/yourhandle', color: 'text-pink-500' },
                  { key: 'youtube',   label: 'YouTube Channel URL',   icon: FaYoutube,   placeholder: 'https://youtube.com/yourchannel',  color: 'text-red-500' },
                  { key: 'tiktok',    label: 'TikTok Profile URL',    icon: FaTiktok,    placeholder: 'https://tiktok.com/@yourhandle',   color: 'text-gray-900' },
                  { key: 'whatsapp',  label: 'WhatsApp Number',       icon: FaWhatsapp,  placeholder: '8801XXXXXXXXX',                    color: 'text-green-500' },
                  { key: 'messenger', label: 'Messenger Username',    icon: FaFacebook,  placeholder: 'yourbusiness',                     color: 'text-blue-500' },
                ].map(({ key, label, icon: Icon, placeholder, color }) => (
                  <div key={key}>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                      <Icon size={13} className={color} /> {label}
                    </label>
                    <input className={inp} value={social[key]} placeholder={placeholder}
                      onChange={e => setSocial({ ...social, [key]: e.target.value })} />
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* ═══ COUPONS ═══ */}
        {activeTab === 'coupons' && (
          <Section title="Promo & Coupon Codes" subtitle="Create discount codes for customers">
            <div className="mb-3 flex items-center justify-between">
              <button onClick={loadCoupons}
                className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-2 text-gray-400 transition-colors hover:text-indigo-600" title="Refresh">
                <MdRefresh size={15} className={couponsLoading ? 'animate-spin' : ''} />
              </button>
              <button onClick={openCouponCreate}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">
                <MdAdd size={16} /> Add Coupon
              </button>
            </div>

            {couponsLoading ? (
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />
              ))}</div>
            ) : coupons.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <MdLocalOffer size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No coupons yet</p>
                <p className="mt-1 text-sm">Create your first discount code</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Code', 'Type', 'Value', 'Min Order', 'Uses', 'Expiry', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {coupons.map(c => (
                      <tr key={c._id} className="transition-colors hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded bg-indigo-50 px-2 py-0.5 font-mono text-xs font-bold text-indigo-600">{c.code}</span>
                            <CopyBtn text={c.code} />
                          </div>
                        </td>
                        <td className="px-4 py-3 capitalize text-gray-600">{c.type}</td>
                        <td className="px-4 py-3 font-semibold">{c.type === 'percent' ? `${c.value}%` : `৳${c.value}`}</td>
                        <td className="px-4 py-3 text-gray-500">{c.minOrder ? `৳${c.minOrder}` : '—'}</td>
                        <td className="px-4 py-3 text-gray-500">{c.usedCount || 0}/{c.maxUses || '∞'}</td>
                        <td className="px-4 py-3 text-gray-500">{c.expiry ? new Date(c.expiry).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleCouponActive(c)}>
                            <span className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                              c.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${c.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                              {c.isActive ? 'Active' : 'Off'}
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => openCouponEdit(c)} className="rounded p-1.5 text-blue-500 hover:bg-blue-50"><MdEdit size={14} /></button>
                            <button onClick={() => deleteCoupon(c._id)} className="rounded p-1.5 text-red-500 hover:bg-red-50"><MdDelete size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Coupon Modal */}
            {couponModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">{editCoupon ? 'Edit Coupon' : 'Create Coupon'}</h3>
                    <button onClick={() => setCouponModal(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><MdDelete size={16} className="text-gray-400" /></button>
                  </div>
                  <form onSubmit={saveCoupon} className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-500">Coupon Code *</label>
                      <div className="flex gap-2">
                        <input className={`${inp} flex-1 uppercase`} value={couponForm.code}
                          onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} placeholder="SAVE20" required />
                        <button type="button" onClick={genCode}
                          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                          Auto
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-500">Type</label>
                        <select className={inp} value={couponForm.type} onChange={e => setCouponForm({ ...couponForm, type: e.target.value })}>
                          <option value="percent">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (৳)</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-500">Value *</label>
                        <input type="number" className={inp} value={couponForm.value}
                          onChange={e => setCouponForm({ ...couponForm, value: e.target.value })}
                          placeholder={couponForm.type === 'percent' ? '20' : '100'} required />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-500">Min Order (৳)</label>
                        <input type="number" className={inp} value={couponForm.minOrder}
                          onChange={e => setCouponForm({ ...couponForm, minOrder: e.target.value })} placeholder="500" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-500">Max Uses</label>
                        <input type="number" className={inp} value={couponForm.maxUses}
                          onChange={e => setCouponForm({ ...couponForm, maxUses: e.target.value })} placeholder="100" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-500">Expiry Date</label>
                      <input type="date" className={inp} value={couponForm.expiry}
                        onChange={e => setCouponForm({ ...couponForm, expiry: e.target.value })} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-500">Status</label>
                      <select className={inp} value={couponForm.isActive}
                        onChange={e => setCouponForm({ ...couponForm, isActive: e.target.value === 'true' })}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setCouponModal(false)}
                        className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                        Cancel
                      </button>
                      <button type="submit" disabled={couponSaving}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                        {couponSaving && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </Section>
        )}

        {/* ═══ BANNERS ═══ */}
        {activeTab === 'banners' && (
          <Section title="Homepage Banners & Sliders" subtitle="Manage hero banners, promotional sliders, and pop-ups">
            <div className="mb-3 flex items-center justify-between">
              <button onClick={loadBanners}
                className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-2 text-gray-400 transition-colors hover:text-indigo-600" title="Refresh">
                <MdRefresh size={15} className={bannersLoading ? 'animate-spin' : ''} />
              </button>
              <button onClick={openBannerCreate}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">
                <MdAdd size={16} /> Add Banner
              </button>
            </div>

            {bannersLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex animate-pulse items-center gap-4 rounded-xl border border-gray-100 p-3">
                  <div className="h-14 w-24 rounded-lg bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 rounded bg-gray-200" />
                    <div className="h-2.5 w-48 rounded bg-gray-100" />
                  </div>
                </div>
              ))}</div>
            ) : banners.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <MdImage size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No banners yet</p>
                <p className="mt-1 text-sm">Add your first homepage banner</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {banners.map(b => (
                  <div key={b._id} className="flex items-center gap-4 rounded-xl border border-gray-100 p-3 transition-colors hover:border-gray-200">
                    <div className="h-14 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {b.image
                        ? <img src={b.image} alt="" className="h-full w-full object-cover" />
                        : <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-indigo-200"><MdImage size={20} className="text-indigo-400" /></div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{b.title}</p>
                        {/* Click badge to toggle active */}
                        <button onClick={() => toggleBannerActive(b)}>
                          <span className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                            b.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${b.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                            {b.isActive ? 'Active' : 'Hidden'}
                          </span>
                        </button>
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold capitalize text-indigo-600">{b.position}</span>
                      </div>
                      {b.subtitle && <p className="mt-0.5 truncate text-xs text-gray-500">{b.subtitle}</p>}
                      {b.link && <p className="mt-0.5 truncate text-xs text-indigo-500">{b.link}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openBannerEdit(b)} className="rounded p-1.5 text-blue-500 hover:bg-blue-50"><MdEdit size={15} /></button>
                      <button onClick={() => deleteBanner(b._id)} className="rounded p-1.5 text-red-500 hover:bg-red-50"><MdDelete size={15} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Banner Modal */}
            {bannerModal && (
              <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 pb-8 pt-16">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">{editBanner ? 'Edit Banner' : 'Add Banner'}</h3>
                    <button onClick={() => setBannerModal(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">✕</button>
                  </div>
                  <form onSubmit={saveBanner} className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-500">Title *</label>
                      <input className={inp} value={bannerForm.title}
                        onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })} placeholder="Summer Sale" required />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-500">Subtitle</label>
                      <input className={inp} value={bannerForm.subtitle}
                        onChange={e => setBannerForm({ ...bannerForm, subtitle: e.target.value })} placeholder="Up to 50% off" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-500">Link URL</label>
                      <input className={inp} value={bannerForm.link}
                        onChange={e => setBannerForm({ ...bannerForm, link: e.target.value })} placeholder="/products or https://..." />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-500">Position</label>
                      <select className={inp} value={bannerForm.position}
                        onChange={e => setBannerForm({ ...bannerForm, position: e.target.value })}>
                        <option value="hero">Hero (Main Slider)</option>
                        <option value="promo">Promo Banner (Below Hero)</option>
                        <option value="sidebar">Sidebar</option>
                        <option value="popup">Popup</option>
                        <option value="footer">Footer Banner</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-500">Status</label>
                      <select className={inp} value={bannerForm.isActive}
                        onChange={e => setBannerForm({ ...bannerForm, isActive: e.target.value === 'true' })}>
                        <option value="true">Active</option>
                        <option value="false">Hidden</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-500">Banner Image</label>
                      <input type="file" accept="image/*" onChange={e => setBannerImageFile(e.target.files[0])}
                        className="w-full cursor-pointer rounded-lg border border-dashed border-gray-300 p-3 text-sm text-gray-500 transition-colors hover:border-indigo-400" />
                      {editBanner?.image && !bannerImageFile && (
                        <img src={editBanner.image} alt="" className="mt-2 h-24 w-full rounded-lg border border-gray-200 object-cover" />
                      )}
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setBannerModal(false)}
                        className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                        Cancel
                      </button>
                      <button type="submit" disabled={bannerSaving}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                        {bannerSaving && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </Section>
        )}

        {/* ═══ NOTIFICATIONS ═══ */}
        {activeTab === 'notifications' && (
          <Section title="Notification Preferences" subtitle="Control when and how you get notified"
            onSave={() => saveSection('notifications', notif)} saving={saving}>
            {pageLoading ? (
              <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex animate-pulse items-center justify-between border-b border-gray-50 py-3">
                  <div className="space-y-1.5">
                    <div className="h-3 w-32 rounded bg-gray-200" />
                    <div className="h-2.5 w-48 rounded bg-gray-100" />
                  </div>
                  <div className="h-6 w-11 rounded-full bg-gray-200" />
                </div>
              ))}</div>
            ) : (
              <>
                <div className="space-y-1">
                  <Toggle checked={notif.emailEnabled} onChange={e => setNotif({ ...notif, emailEnabled: e.target.checked })}
                    label="Enable Email Notifications" desc="Receive email alerts for important events" />
                </div>
                {notif.emailEnabled && (
                  <div className="mt-3">
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Admin Email for Notifications</label>
                    <input type="email" className={inp} value={notif.adminEmail}
                      onChange={e => setNotif({ ...notif, adminEmail: e.target.value })} placeholder="admin@store.com" />
                  </div>
                )}
                <div className="mt-4 space-y-1">
                  {[
                    { key: 'newOrder',       label: 'New Order Placed',     desc: 'Alert when a customer places a new order' },
                    { key: 'orderDelivered', label: 'Order Delivered',       desc: 'Alert when an order is marked delivered' },
                    { key: 'orderCancelled', label: 'Order Cancelled',       desc: 'Alert when an order is cancelled' },
                    { key: 'lowStock',       label: 'Low Stock Alert',        desc: 'When product stock falls below 10 units' },
                    { key: 'newReview',      label: 'New Review Submitted',  desc: 'Alert on new customer review pending approval' },
                    { key: 'newUser',        label: 'New User Registration', desc: 'Alert when a new customer signs up' },
                  ].map(({ key, label, desc }) => (
                    <Toggle key={key} checked={notif[key]} onChange={e => setNotif({ ...notif, [key]: e.target.checked })} label={label} desc={desc} />
                  ))}
                </div>
              </>
            )}
          </Section>
        )}

      </div>
    </div>
  );
}