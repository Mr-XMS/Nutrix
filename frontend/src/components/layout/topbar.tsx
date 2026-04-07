'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function Topbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <header className="h-14 border-b border-ink-100 bg-white px-6 flex items-center justify-end">
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-ink-50 transition-colors"
        >
          <div className="size-7 rounded-full bg-accent-100 text-accent-700 text-xs font-medium flex items-center justify-center">
            {initials}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-medium text-ink-900 leading-tight">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-[11px] text-ink-400 leading-tight capitalize">
              {user.role.replace('_', ' ').toLowerCase()}
            </div>
          </div>
          <ChevronDown className="size-3.5 text-ink-400" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-ink-100 rounded-md shadow-subtle py-1 z-50">
            <div className="px-3 py-2 border-b border-ink-100">
              <div className="text-xs font-medium text-ink-900 truncate">{user.email}</div>
              <div className="text-[11px] text-ink-400 truncate" title={user.organisationName}>
                {user.organisationName}
              </div>
            </div>
            <button
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-ink-600 hover:bg-ink-50 hover:text-ink-900 transition-colors"
              onClick={() => setOpen(false)}
            >
              <UserIcon className="size-3.5" />
              Profile settings
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-ink-600 hover:bg-ink-50 hover:text-danger transition-colors"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
