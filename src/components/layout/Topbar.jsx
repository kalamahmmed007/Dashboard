import React from 'react';
import { useDispatch } from 'react-redux';
import { toggleSidebar, toggleMobileSidebar } from '../../redux/slices/uiSlice';
import { MdMenu, MdNotifications, MdSearch } from 'react-icons/md';

export default function Topbar({ title }) {
  const dispatch = useDispatch();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button onClick={() => dispatch(toggleMobileSidebar())}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 md:hidden">
          <MdMenu size={20} />
        </button>
        <button onClick={() => dispatch(toggleSidebar())}
          className="hidden rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 md:flex">
          <MdMenu size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden w-64 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 md:flex">
          <MdSearch size={16} className="text-gray-400" />
          <input className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none" placeholder="Quick search..." />
        </div>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100">
          <MdNotifications size={20} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
      </div>
    </header>
  );
}