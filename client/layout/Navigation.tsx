/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LogOut, Sun, Moon, Settings } from 'lucide-react';

interface NavigationProps {
  userName: string;
  userEmail: string;
  avatarUrl?: string;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  onLogout: () => void;
  onEditProfile: () => void;
  onHomeClick?: () => void;
}

/**
 * Component for top navigation bar displaying the authenticated user identity,
 * application name, settings access, and sign out control buttons.
 */
export default function Navigation({ userName, userEmail, avatarUrl, isDarkMode, onThemeToggle, onLogout, onEditProfile, onHomeClick }: NavigationProps) {
  return (
    <nav className="bg-wood-900 text-stone-100 border-b border-wood-850 px-6 py-4.5 flex items-center justify-between" id="app-navigation">
      <button 
        onClick={onHomeClick}
        className="flex items-center gap-3.5 text-left focus:outline-none focus:ring-1 focus:ring-ivy-500 rounded-lg p-1 -m-1 transition-all cursor-pointer hover:opacity-95"
        title="Go to Dashboard"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-ivy-500 to-indigo-600 text-sm font-extrabold text-white tracking-widest shadow-2xs select-none">
          S
        </div>
        <div>
          <h1 className="text-xl font-serif font-black tracking-tight text-white leading-none">Specify</h1>
          <p className="text-[10px] text-stone-400 mt-1 font-mono uppercase tracking-widest leading-none">Design & Analysis Workspace</p>
        </div>
      </button>

      <div className="flex items-center gap-4">
        {/* Dynamic Theme Color Mode Selector Switch */}
        <button 
          onClick={onThemeToggle}
          className="p-2 border border-wood-750 text-stone-300 hover:text-white hover:bg-wood-800 rounded-lg cursor-pointer transition-all flex items-center justify-center select-none"
          title={isDarkMode ? "Switch to Light theme" : "Switch to Dark theme"}
          id="btn-nav-theme-toggle"
        >
          {isDarkMode ? (
            <Sun className="h-4 w-4 text-amber-500 hover:scale-110 active:scale-95 transition-all" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-400 hover:scale-110 active:scale-95 transition-all" />
          )}
        </button>

        {/* Dynamic User Avatar Preview Toggle */}
        <button 
          onClick={onEditProfile} 
          className="focus:outline-none select-none"
          title="Account profile management"
        >
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={userName} 
              referrerPolicy="no-referrer"
              className="h-8 w-8 rounded-full border border-ivy-400/40 object-cover cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-sm" 
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-ivy-700/50 text-ivy-100 font-extrabold border border-ivy-500/20 flex items-center justify-center text-xs uppercase cursor-pointer hover:bg-ivy-700/80 hover:scale-105 active:scale-95 transition-all shadow-sm">
              {userName ? userName[0] : 'U'}
            </div>
          )}
        </button>

        {/* User Info & Settings Action */}
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="text-xs font-bold text-stone-100">{userName}</span>
          <span className="text-xs text-stone-400 font-mono">{userEmail}</span>
        </div>

        <button onClick={onEditProfile} className="p-2 border border-wood-750 text-stone-300 hover:text-white hover:bg-wood-800 rounded-lg cursor-pointer transition-colors" title="Account profile management" id="btn-nav-profile">
          <Settings className="h-4 w-4" />
        </button>

        <button onClick={onLogout} className="flex items-center gap-1.5 text-xs font-semibold bg-wood-800 hover:bg-wood-750 text-stone-200 hover:text-white px-3 py-2 rounded-lg border border-wood-700 transition-colors cursor-pointer" title="Logout account session" id="btn-nav-logout">
          <LogOut className="h-4 w-4 text-stone-400 shrink-0" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}
