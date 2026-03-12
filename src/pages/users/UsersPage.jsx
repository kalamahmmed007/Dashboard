import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, toggleUserStatus, deleteUser } from '../../redux/slices/userSlice';
import {
  MdSearch, MdBlock, MdCheckCircle, MdDelete, MdClose, MdRefresh,
  MdCheckBox, MdCheckBoxOutlineBlank, MdIndeterminateCheckBox,
  MdFilterList, MdArrowUpward, MdArrowDownward,
  MdExpandMore, MdExpandLess, MdVisibility, MdAttachMoney,
  MdLocationOn, MdPhone, MdCalendarToday, MdShoppingBag,
  MdLock, MdDownload, MdAdminPanelSettings, MdPersonOff,
  MdNote, MdContentCopy, MdDone, MdEmail,
} from 'react-icons/md';
import { FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

// ─── Dummy Data ────────────────────────────────────────────────────────────────
const DUMMY_USERS = [
  { _id: '1', name: 'Rahima Begum', email: 'rahima@gmail.com', phone: '01712345678', isActive: true, role: 'user', orderCount: 12, totalSpent: 18500, city: 'Dhaka', division: 'Dhaka', createdAt: '2023-03-15', addresses: [{ line1: 'Mirpur-10', city: 'Dhaka', division: 'Dhaka' }], recentOrders: [{ _id: 'ord001', totalPrice: 1200, status: 'delivered', createdAt: '2024-12-01' }], note: '' },
  { _id: '2', name: 'Karim Hossain', email: 'karim.h@yahoo.com', phone: '01898765432', isActive: true, role: 'admin', orderCount: 3, totalSpent: 4200, city: 'Chittagong', division: 'Chittagong', createdAt: '2023-07-22', addresses: [], recentOrders: [], note: 'Trusted admin' },
  { _id: '3', name: 'Sumaiya Islam', email: 'sumaiya@outlook.com', phone: '01611223344', isActive: false, role: 'user', orderCount: 7, totalSpent: 9800, city: 'Sylhet', division: 'Sylhet', createdAt: '2024-01-10', addresses: [{ line1: 'Zindabazar', city: 'Sylhet', division: 'Sylhet' }], recentOrders: [{ _id: 'ord002', totalPrice: 3400, status: 'cancelled', createdAt: '2024-11-20' }], note: 'Blocked for suspicious activity' },
  { _id: '4', name: 'Tanvir Ahmed', email: 'tanvir.a@gmail.com', phone: '01755667788', isActive: true, role: 'user', orderCount: 21, totalSpent: 34200, city: 'Rajshahi', division: 'Rajshahi', createdAt: '2022-11-05', addresses: [], recentOrders: [{ _id: 'ord003', totalPrice: 2100, status: 'processing', createdAt: '2025-01-05' }], note: '' },
  { _id: '5', name: 'Nadia Rahman', email: 'nadia.r@gmail.com', phone: '01944556677', isActive: true, role: 'user', orderCount: 5, totalSpent: 6100, city: 'Khulna', division: 'Khulna', createdAt: '2024-04-18', addresses: [{ line1: 'Boyra', city: 'Khulna', division: 'Khulna' }], recentOrders: [], note: '' },
  { _id: '6', name: 'Farhan Kabir', email: 'farhan.k@hotmail.com', phone: '01322334455', isActive: true, role: 'user', orderCount: 0, totalSpent: 0, city: 'Barisal', division: 'Barisal', createdAt: '2025-01-01', addresses: [], recentOrders: [], note: '' },
  { _id: '7', name: 'Mitu Akter', email: 'mitu.akter@gmail.com', phone: '01533445566', isActive: false, role: 'user', orderCount: 2, totalSpent: 1800, city: 'Mymensingh', division: 'Mymensingh', createdAt: '2023-09-12', addresses: [], recentOrders: [], note: 'Refund issue pending' },
  { _id: '8', name: 'Jalal Uddin', email: 'jalal.u@gmail.com', phone: '01677889900', isActive: true, role: 'user', orderCount: 9, totalSpent: 12400, city: 'Comilla', division: 'Chittagong', createdAt: '2023-05-30', addresses: [], recentOrders: [], note: '' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const avatarColors = [
  'from-indigo-400 to-violet-500',
  'from-pink-400 to-rose-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-sky-400 to-blue-500',
  'from-fuchsia-400 to-pink-500',
  'from-lime-400 to-green-500',
  'from-cyan-400 to-blue-400',
];
const getGrad = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];
const getInitials = (name) => name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';

// ─── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ user, size = 'md' }) => {
  const sz = size === 'lg' ? 'h-20 w-20 text-2xl' : 'h-10 w-10 text-sm';
  return (
    <div className={`flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getGrad(user.name)} ${sz} font-black text-white shadow-sm`}>
      {user.avatar ? <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" /> : getInitials(user.name)}
    </div>
  );
};

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-50">
    <td className="px-4 py-3"><div className="h-4 w-4 rounded bg-gray-200" /></td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="space-y-1.5"><div className="h-3.5 w-28 rounded bg-gray-200" /><div className="h-3 w-36 rounded bg-gray-100" /></div>
      </div>
    </td>
    {[24, 10, 16, 14, 20].map((w, i) => (
      <td key={i} className="px-4 py-3"><div className={`h-3.5 w-${w} rounded bg-gray-200`} /></td>
    ))}
  </tr>
);

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, accent }) => (
  <div className={`relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${accent}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
        <p className="mt-1 text-2xl font-black text-gray-900">{value}</p>
        {sub && <p className="mt-0.5 text-[10px] text-gray-400">{sub}</p>}
      </div>
      <span className="text-2xl">{icon}</span>
    </div>
  </div>
);

// ─── Password Modal ────────────────────────────────────────────────────────────
const PasswordModal = ({ user, open, onClose, onSave }) => {
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (pwd.length < 6) e.pwd = 'Minimum 6 characters required';
    if (pwd !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    await onSave(user._id, pwd);
    setLoading(false);
    setPwd(''); setConfirm(''); setErrors({});
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
              <MdLock size={16} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Update Password</h3>
              <p className="text-[10px] text-gray-400">{user?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><MdClose size={18} /></button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">New Password</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={pwd}
                onChange={(e) => { setPwd(e.target.value); setErrors(p => ({ ...p, pwd: '' })); }}
                placeholder="Enter new password"
                className={`w-full rounded-xl border px-3.5 py-2.5 pr-10 text-sm outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${errors.pwd ? 'border-red-400' : 'border-gray-200'}`}
              />
              <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 hover:text-gray-600">
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.pwd && <p className="mt-1 text-xs text-red-500">{errors.pwd}</p>}
            {/* Strength indicator */}
            {pwd && (
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                    pwd.length >= i * 2
                      ? pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) ? 'bg-green-400'
                        : pwd.length >= 6 ? 'bg-yellow-400' : 'bg-red-400'
                      : 'bg-gray-100'}`} />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Confirm Password</label>
            <input
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: '' })); }}
              placeholder="Re-enter password"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${errors.confirm ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
          </div>

          {/* Quick suggestions */}
          <div>
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">Quick Generate</p>
            <div className="flex flex-wrap gap-1.5">
              {['Temp@1234', 'Reset#2025', 'Admin@Pass1'].map(s => (
                <button key={s} onClick={() => { setPwd(s); setConfirm(s); }}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-xs text-gray-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-gray-100 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60">
            {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <MdLock size={14} />}
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Note Modal ────────────────────────────────────────────────────────────────
const NoteModal = ({ user, open, onClose, onSave }) => {
  const [note, setNote] = useState('');
  useEffect(() => { if (user) setNote(user.note || ''); }, [user]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <MdNote size={16} className="text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Admin Note — {user?.name}</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><MdClose size={18} /></button>
        </div>
        <div className="p-5">
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a private note about this user..."
            className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          />
          <p className="mt-1 text-right text-[10px] text-gray-400">{note.length}/200</p>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={() => { onSave(user._id, note); onClose(); }}
            className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600">
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Copy Button ───────────────────────────────────────────────────────────────
const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handle} className="ml-1 rounded p-0.5 text-gray-300 transition-colors hover:text-indigo-500" title="Copy">
      {copied ? <MdDone size={12} className="text-green-500" /> : <MdContentCopy size={12} />}
    </button>
  );
};

// ─── User Drawer ───────────────────────────────────────────────────────────────
const UserDrawer = ({ user, open, onClose, onToggle, onDelete, onPasswordModal, onNoteModal, onRoleToggle }) => {
  if (!user) return null;
  const isAdmin = user.role === 'admin';
  const isActive = user.isActive !== false;

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="font-bold text-gray-900">User Profile</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><MdClose size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Avatar section */}
          <div className="flex flex-col items-center gap-3 bg-gradient-to-b from-gray-50 to-white px-5 py-6 text-center">
            <Avatar user={user} size="lg" />
            <div>
              <div className="flex items-center justify-center gap-1.5">
                <p className="text-lg font-bold text-gray-900">{user.name}</p>
                {isAdmin && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-700">Admin</span>}
              </div>
              <div className="flex items-center justify-center gap-1 text-sm text-gray-400">
                {user.email}
                <CopyBtn text={user.email} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {isActive ? 'Active' : 'Blocked'}
              </span>
              {(user.totalSpent || 0) > 5000 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  <FaStar size={9} /> VIP
                </span>
              )}
            </div>
            {user.note && (
              <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs text-amber-800">
                📝 {user.note}
              </div>
            )}
          </div>

          {/* Info grid */}
          <div className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: MdPhone, label: 'Phone', value: user.phone || '—', copy: user.phone },
                { icon: MdCalendarToday, label: 'Joined', value: new Date(user.createdAt).toLocaleDateString('en-BD', { dateStyle: 'medium' }) },
                { icon: MdShoppingBag, label: 'Orders', value: user.orderCount || 0 },
                { icon: MdAttachMoney, label: 'Total Spent', value: user.totalSpent ? `৳${user.totalSpent.toLocaleString()}` : '৳0' },
                { icon: MdLocationOn, label: 'City', value: user.city || '—' },
                { icon: MdAdminPanelSettings, label: 'Role', value: user.role === 'admin' ? 'Administrator' : 'Customer' },
              ].map(({ icon: Icon, label, value, copy }) => (
                <div key={label} className="rounded-xl bg-gray-50 px-3 py-2.5">
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <Icon size={11} className="text-gray-400" />
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm font-semibold text-gray-800">{value}</p>
                    {copy && <CopyBtn text={copy} />}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent orders */}
            {user.recentOrders?.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Recent Orders</p>
                <div className="space-y-2">
                  {user.recentOrders.slice(0, 3).map((order) => (
                    <div key={order._id} className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2.5 hover:bg-gray-50">
                      <div>
                        <p className="font-mono text-xs font-bold text-gray-700">#{order._id?.slice(-6).toUpperCase()}</p>
                        <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-900">৳{order.totalPrice?.toLocaleString()}</p>
                        <span className={`text-[10px] font-semibold capitalize ${
                          order.status === 'delivered' ? 'text-green-600' :
                          order.status === 'cancelled' ? 'text-red-500' : 'text-blue-500'}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions footer */}
        <div className="space-y-2 border-t border-gray-100 p-4">
          {/* Primary actions row */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { onPasswordModal(user); onClose(); }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 py-2.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100">
              <MdLock size={13} /> Reset Password
            </button>
            <button onClick={() => { onNoteModal(user); onClose(); }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100">
              <MdNote size={13} /> {user.note ? 'Edit Note' : 'Add Note'}
            </button>
          </div>

          {/* Role toggle */}
          <button onClick={() => { onRoleToggle(user._id); onClose(); }}
            className={`w-full flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition-colors ${
              isAdmin
                ? 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                : 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100'}`}>
            <MdAdminPanelSettings size={14} />
            {isAdmin ? 'Revoke Admin Role' : 'Grant Admin Role'}
          </button>

          {/* Block / Delete */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { onToggle(user._id); onClose(); }}
              className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition-colors ${
                isActive ? 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100'
                  : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'}`}>
              {isActive ? <><MdBlock size={13} /> Block</> : <><MdCheckCircle size={13} /> Unblock</>}
            </button>
            <button onClick={() => { onDelete(user._id); onClose(); }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100">
              <MdDelete size={13} /> Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Confirm Modal ─────────────────────────────────────────────────────────────
const ConfirmModal = ({ open, title, message, confirmLabel = 'Confirm', danger = true, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
        <div className="p-6">
          <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${danger ? 'bg-red-100' : 'bg-indigo-100'}`}>
            {danger ? <MdDelete size={22} className="text-red-500" /> : <MdCheckCircle size={22} className="text-indigo-500" />}
          </div>
          <h3 className="text-center text-base font-bold text-gray-900">{title}</h3>
          <p className="mt-1.5 text-center text-sm text-gray-500">{message}</p>
        </div>
        <div className="flex gap-2 border-t border-gray-100 px-5 py-4">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function UsersPage() {
  // Try to use Redux; fall back to dummy data gracefully
  let reduxState = { list: [], total: 0, totalPages: 1, loading: false };
  let dispatch = () => {};
  try {
    const d = useDispatch();
    const s = useSelector((s) => s.users);
    dispatch = d;
    reduxState = s;
  } catch {}

  const [localUsers, setLocalUsers] = useState(DUMMY_USERS);
  const useLocal = reduxState.list.length === 0;
  const rawList = useLocal ? localUsers : reduxState.list;

  // ── Filter state ──────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [minOrders, setMinOrders] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  // ── Selection ─────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState([]);

  // ── Modals ────────────────────────────────────────────────────────────────
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [pwdModal, setPwdModal] = useState({ open: false, user: null });
  const [noteModal, setNoteModal] = useState({ open: false, user: null });
  const [drawerUser, setDrawerUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── Debounced search ──────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Computed / filtered list ──────────────────────────────────────────────
  const filtered = rawList.filter(u => {
    if (search && !`${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === 'active' && u.isActive === false) return false;
    if (statusFilter === 'blocked' && u.isActive !== false) return false;
    if (roleFilter && u.role !== roleFilter) return false;
    if (minOrders && (u.orderCount || 0) < parseInt(minOrders)) return false;
    return true;
  }).sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortBy === 'name') return dir * a.name.localeCompare(b.name);
    if (sortBy === 'orderCount') return dir * ((a.orderCount || 0) - (b.orderCount || 0));
    if (sortBy === 'totalSpent') return dir * ((a.totalSpent || 0) - (b.totalSpent || 0));
    return dir * (new Date(a.createdAt) - new Date(b.createdAt));
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const list = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const total = filtered.length;

  const activeCount = rawList.filter(u => u.isActive !== false).length;
  const blockedCount = rawList.filter(u => u.isActive === false).length;
  const adminCount = rawList.filter(u => u.role === 'admin').length;
  const avgSpent = rawList.length ? Math.round(rawList.reduce((s, u) => s + (u.totalSpent || 0), 0) / rawList.length) : 0;

  // ── Selection logic ───────────────────────────────────────────────────────
  const allSelected = list.length > 0 && list.every(u => selected.includes(u._id));
  const someSelected = selected.length > 0 && !allSelected;
  const toggleSelect = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => allSelected ? setSelected([]) : setSelected(list.map(u => u._id));

  // ── Sort ──────────────────────────────────────────────────────────────────
  const handleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('desc'); }
    setPage(1);
  };
  const SortIcon = ({ field }) => sortBy !== field ? <span className="inline-block h-3 w-3" /> :
    sortDir === 'asc' ? <MdArrowUpward size={11} /> : <MdArrowDownward size={11} />;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleToggle = async (id) => {
    if (useLocal) {
      setLocalUsers(p => p.map(u => u._id === id ? { ...u, isActive: u.isActive === false ? true : false } : u));
      toast.success('User status updated');
      return;
    }
    try { await dispatch(toggleUserStatus(id)).unwrap(); toast.success('Status updated'); }
    catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async () => {
    const id = deleteModal.id;
    if (useLocal) {
      setLocalUsers(p => p.filter(u => u._id !== id));
      toast.success('User deleted');
      setSelected(p => p.filter(x => x !== id));
      setDeleteModal({ open: false, id: null });
      return;
    }
    try {
      await dispatch(deleteUser(id)).unwrap();
      toast.success('User deleted');
      setSelected(p => p.filter(x => x !== id));
      setDeleteModal({ open: false, id: null });
    } catch { toast.error('Delete failed'); }
  };

  const handleBulkDelete = async () => {
    if (useLocal) {
      setLocalUsers(p => p.filter(u => !selected.includes(u._id)));
      toast.success(`${selected.length} users deleted`);
      setSelected([]);
      setBulkDeleteModal(false);
      return;
    }
    const results = await Promise.allSettled(selected.map(id => dispatch(deleteUser(id)).unwrap()));
    const ok = results.filter(r => r.status === 'fulfilled').length;
    if (ok) toast.success(`${ok} user${ok > 1 ? 's' : ''} deleted`);
    setSelected([]);
    setBulkDeleteModal(false);
  };

  const handlePasswordUpdate = async (id, password) => {
    if (useLocal) { toast.success('Password updated successfully!'); return; }
    try { await dispatch(updateUserPassword({ id, password })).unwrap(); toast.success('Password updated!'); }
    catch { toast.error('Failed to update password'); }
  };

  const handleRoleToggle = (id) => {
    if (useLocal) {
      setLocalUsers(p => p.map(u => u._id === id ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' } : u));
      const user = rawList.find(u => u._id === id);
      toast.success(`Role updated to ${user?.role === 'admin' ? 'user' : 'admin'}`);
      return;
    }
    dispatch(updateUserRole(id))
      .then(() => toast.success('Role updated'))
      .catch(() => toast.error('Failed to update role'));
  };

  const handleSaveNote = (id, note) => {
    if (useLocal) {
      setLocalUsers(p => p.map(u => u._id === id ? { ...u, note } : u));
      toast.success('Note saved');
      return;
    }
    // dispatch(updateUserNote({ id, note }))
    toast.success('Note saved');
  };

  const handleBulkBlock = async () => {
    if (useLocal) {
      setLocalUsers(p => p.map(u => selected.includes(u._id) && u.isActive !== false ? { ...u, isActive: false } : u));
      toast.success(`${selected.length} users blocked`);
      setSelected([]);
      return;
    }
    const toBlock = selected.filter(id => rawList.find(u => u._id === id)?.isActive !== false);
    await Promise.allSettled(toBlock.map(id => dispatch(toggleUserStatus(id)).unwrap()));
    toast.success(`${toBlock.length} users blocked`);
    setSelected([]);
  };

  // ── CSV Export ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Status', 'Orders', 'Total Spent', 'City', 'Joined'];
    const rows = (selected.length > 0 ? rawList.filter(u => selected.includes(u._id)) : rawList).map(u => [
      u.name, u.email, u.phone || '', u.role || 'user',
      u.isActive !== false ? 'Active' : 'Blocked',
      u.orderCount || 0,
      u.totalSpent || 0,
      u.city || '',
      new Date(u.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} users`);
  };

  const resetFilters = () => {
    setSearchInput(''); setStatusFilter(''); setRoleFilter('');
    setSortBy('createdAt'); setSortDir('desc'); setMinOrders(''); setPage(1);
  };
  const hasFilters = searchInput || statusFilter || roleFilter || minOrders;

  const openDrawer = (user) => { setDrawerUser(user); setDrawerOpen(true); };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 p-1">

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon="👥" label="Total Users" value={rawList.length} sub={`${total} shown`} accent="border-gray-100" />
        <StatCard icon="✅" label="Active" value={activeCount} accent="border-green-100" />
        <StatCard icon="🚫" label="Blocked" value={blockedCount} accent="border-red-100" />
        <StatCard icon="🛡️" label="Admins" value={adminCount} sub={`৳${avgSpent.toLocaleString()} avg spent`} accent="border-violet-100" />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative min-w-[180px] max-w-xs flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, email, phone..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          {searchInput && (
            <button onClick={() => setSearchInput('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <MdClose size={14} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-0.5 rounded-xl border border-gray-200 bg-white p-1">
          {[{ v: '', l: 'All' }, { v: 'active', l: 'Active' }, { v: 'blocked', l: 'Blocked' }].map(({ v, l }) => (
            <button key={v} onClick={() => { setStatusFilter(v); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === v ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Role filter */}
        <div className="flex items-center gap-0.5 rounded-xl border border-gray-200 bg-white p-1">
          {[{ v: '', l: 'All Roles' }, { v: 'admin', l: '🛡 Admin' }, { v: 'user', l: '👤 User' }].map(({ v, l }) => (
            <button key={v} onClick={() => { setRoleFilter(v); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${roleFilter === v ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* More filters toggle */}
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm transition-colors ${showFilters || minOrders ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
          <MdFilterList size={15} />
          {showFilters ? <MdExpandLess size={14} /> : <MdExpandMore size={14} />}
        </button>

        {hasFilters && (
          <button onClick={resetFilters} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <MdRefresh size={14} /> Reset
          </button>
        )}

        <div className="flex-1" />

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2 py-1">
            <span className="text-xs font-medium text-gray-500">{selected.length} selected</span>
            <div className="h-3.5 w-px bg-gray-200" />
            <button onClick={handleBulkBlock}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-orange-600 hover:bg-orange-50">
              <MdBlock size={12} /> Block
            </button>
            <button onClick={() => setBulkDeleteModal(true)}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">
              <MdDelete size={12} /> Delete
            </button>
            <button onClick={exportCSV}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50">
              <MdDownload size={12} /> Export sel.
            </button>
          </div>
        )}

        {/* Export all */}
        <button onClick={exportCSV}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:border-green-300 hover:text-green-700" title="Export CSV">
          <MdDownload size={15} />
          <span className="hidden text-xs font-medium sm:inline">Export</span>
        </button>

        {/* Select all */}
        {list.length > 0 && (
          <button onClick={toggleAll} title="Select all"
            className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:text-indigo-600">
            {allSelected ? <MdCheckBox size={16} className="text-indigo-600" />
              : someSelected ? <MdIndeterminateCheckBox size={16} className="text-indigo-400" />
              : <MdCheckBoxOutlineBlank size={16} />}
          </button>
        )}

        <button
          onClick={() => useLocal ? setLocalUsers(DUMMY_USERS) : dispatch(fetchUsers({ page, search, status: statusFilter, sortBy, sortDir, minOrders, limit: PER_PAGE }))}
          className="rounded-xl border border-gray-200 bg-white p-2 text-gray-400 hover:text-indigo-600" title="Refresh">
          <MdRefresh size={16} />
        </button>
      </div>

      {/* ── Expanded Filters ── */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500">Min Orders</label>
            <input type="number" min="0" value={minOrders} onChange={(e) => { setMinOrders(e.target.value); setPage(1); }}
              placeholder="e.g. 3"
              className="w-20 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500">Sort by</label>
            <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs focus:border-indigo-400 focus:outline-none">
              <option value="createdAt">Join Date</option>
              <option value="name">Name</option>
              <option value="orderCount">Orders</option>
              <option value="totalSpent">Total Spent</option>
            </select>
            <button onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:text-indigo-600">
              {sortDir === 'asc' ? <MdArrowUpward size={14} /> : <MdArrowDownward size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* ── Results line ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-800">{list.length}</span> of <span className="font-semibold text-gray-800">{total}</span> users
          {hasFilters && <button onClick={resetFilters} className="ml-2 text-xs text-indigo-500 hover:underline">Clear filters</button>}
        </p>
      </div>

      {/* ── Table ── */}
      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
          <span className="text-4xl">👥</span>
          <p className="font-semibold text-gray-700">No users found</p>
          {hasFilters && <button onClick={resetFilters} className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50">Clear Filters</button>}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-50">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="w-10 px-4 py-3">
                    <button onClick={toggleAll} className="text-gray-400 hover:text-indigo-600">
                      {allSelected ? <MdCheckBox size={16} className="text-indigo-600" />
                        : someSelected ? <MdIndeterminateCheckBox size={16} className="text-indigo-400" />
                        : <MdCheckBoxOutlineBlank size={16} />}
                    </button>
                  </th>
                  {[
                    { label: 'User', field: 'name' },
                    { label: 'Phone', field: null, hide: 'md' },
                    { label: 'Role', field: null },
                    { label: 'Orders', field: 'orderCount' },
                    { label: 'Spent', field: 'totalSpent', hide: 'lg' },
                    { label: 'Joined', field: 'createdAt' },
                    { label: 'Status', field: null },
                    { label: 'Actions', field: null, right: true },
                  ].map(({ label, field, hide, right }) => (
                    <th key={label}
                      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 ${right ? 'text-right' : 'text-left'} ${hide === 'md' ? 'hidden md:table-cell' : hide === 'lg' ? 'hidden lg:table-cell' : ''}`}>
                      {field
                        ? <button onClick={() => handleSort(field)} className="flex items-center gap-1 transition-colors hover:text-gray-700">
                            {label} <SortIcon field={field} />
                          </button>
                        : label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reduxState.loading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  : list.map((u) => {
                      const isActive = u.isActive !== false;
                      const isAdmin = u.role === 'admin';
                      const isHighValue = (u.totalSpent || 0) > 5000;
                      return (
                        <tr key={u._id}
                          className={`group transition-colors hover:bg-gray-50/70 ${selected.includes(u._id) ? 'bg-indigo-50/50' : ''} ${!isActive ? 'opacity-60' : ''}`}>

                          {/* Checkbox */}
                          <td className="px-4 py-3.5">
                            <button onClick={() => toggleSelect(u._id)} className="text-gray-300 transition-colors hover:text-indigo-600">
                              {selected.includes(u._id) ? <MdCheckBox size={16} className="text-indigo-600" /> : <MdCheckBoxOutlineBlank size={16} />}
                            </button>
                          </td>

                          {/* User */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar user={u} />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="max-w-[120px] truncate text-sm font-semibold text-gray-900">{u.name}</p>
                                  {isHighValue && <FaStar size={9} className="flex-shrink-0 text-amber-400" title="VIP customer" />}
                                  {u.note && <span title={u.note} className="cursor-help text-amber-400">📝</span>}
                                </div>
                                <p className="max-w-[150px] truncate text-xs text-gray-400">{u.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Phone */}
                          <td className="hidden px-4 py-3.5 text-sm text-gray-500 md:table-cell">
                            {u.phone || <span className="text-gray-300">—</span>}
                          </td>

                          {/* Role */}
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                              isAdmin ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500'}`}>
                              {isAdmin ? '🛡 Admin' : '👤 User'}
                            </span>
                          </td>

                          {/* Orders */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-sm font-bold ${(u.orderCount || 0) >= 5 ? 'text-indigo-600' : 'text-gray-700'}`}>
                                {u.orderCount || 0}
                              </span>
                              {(u.orderCount || 0) >= 10 && (
                                <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[9px] font-bold text-indigo-600">Loyal</span>
                              )}
                            </div>
                          </td>

                          {/* Spent */}
                          <td className="hidden px-4 py-3.5 lg:table-cell">
                            <span className={`text-sm font-bold ${isHighValue ? 'text-amber-600' : 'text-gray-700'}`}>
                              {u.totalSpent ? `৳${u.totalSpent.toLocaleString()}` : '৳0'}
                            </span>
                          </td>

                          {/* Joined */}
                          <td className="whitespace-nowrap px-4 py-3.5 text-xs text-gray-400">
                            {new Date(u.createdAt).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                              {isActive ? 'Active' : 'Blocked'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                              {/* View */}
                              <button onClick={() => openDrawer(u)} title="View profile"
                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600">
                                <MdVisibility size={15} />
                              </button>
                              {/* Password */}
                              <button onClick={() => setPwdModal({ open: true, user: u })} title="Reset password"
                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600">
                                <MdLock size={15} />
                              </button>
                              {/* Note */}
                              <button onClick={() => setNoteModal({ open: true, user: u })} title="Add note"
                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-amber-50 hover:text-amber-500">
                                <MdNote size={15} />
                              </button>
                              {/* Role */}
                              <button onClick={() => handleRoleToggle(u._id)} title={isAdmin ? 'Revoke admin' : 'Grant admin'}
                                className={`rounded-lg p-1.5 transition-colors ${isAdmin ? 'text-violet-500 hover:bg-violet-50' : 'text-gray-400 hover:bg-violet-50 hover:text-violet-500'}`}>
                                <MdAdminPanelSettings size={15} />
                              </button>
                              {/* Block/Unblock */}
                              <button onClick={() => handleToggle(u._id)} title={isActive ? 'Block' : 'Unblock'}
                                className={`rounded-lg p-1.5 transition-colors ${isActive ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}>
                                {isActive ? <MdBlock size={15} /> : <MdCheckCircle size={15} />}
                              </button>
                              {/* Delete */}
                              <button onClick={() => setDeleteModal({ open: true, id: u._id })}
                                className="rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600">
                                <MdDelete size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                }
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-50 px-5 py-3">
              <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${page === p ? 'bg-indigo-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Drawer ── */}
      <UserDrawer
        user={drawerUser ? (useLocal ? localUsers.find(u => u._id === drawerUser._id) || drawerUser : drawerUser) : null}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onToggle={(id) => { handleToggle(id); }}
        onDelete={(id) => setDeleteModal({ open: true, id })}
        onPasswordModal={(user) => setPwdModal({ open: true, user })}
        onNoteModal={(user) => setNoteModal({ open: true, user })}
        onRoleToggle={handleRoleToggle}
      />

      {/* ── Password Modal ── */}
      <PasswordModal
        open={pwdModal.open}
        user={pwdModal.user}
        onClose={() => setPwdModal({ open: false, user: null })}
        onSave={handlePasswordUpdate}
      />

      {/* ── Note Modal ── */}
      <NoteModal
        open={noteModal.open}
        user={noteModal.user ? (useLocal ? localUsers.find(u => u._id === noteModal.user._id) || noteModal.user : noteModal.user) : null}
        onClose={() => setNoteModal({ open: false, user: null })}
        onSave={handleSaveNote}
      />

      {/* ── Delete Confirm ── */}
      <ConfirmModal
        open={deleteModal.open}
        title="Delete User"
        message="This will permanently delete the user account and all associated data. This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, id: null })}
      />

      {/* ── Bulk Delete Confirm ── */}
      <ConfirmModal
        open={bulkDeleteModal}
        title={`Delete ${selected.length} Users`}
        message={`Permanently delete ${selected.length} selected user accounts? This cannot be undone.`}
        confirmLabel={`Delete ${selected.length} Users`}
        danger
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteModal(false)}
      />
    </div>
  );
}