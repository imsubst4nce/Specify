import { LogOut, Settings } from 'lucide-react';

interface NavigationProps {
  userName: string;
  userEmail: string;
  onLogout: () => void;
  onEditProfile: () => void;
  onHomeClick?: () => void;
}

export default function Navigation({ userName, userEmail, onLogout, onEditProfile, onHomeClick }: NavigationProps) {
  return (
    <nav className="select-none bg-wood-900 text-stone-100 border-b border-wood-850 px-6 py-4.5 flex items-center justify-between" id="app-navigation">
      <button 
        onClick={onHomeClick}
        className="flex items-center gap-3.5 text-left rounded-lg p-1 -m-1 transition-all cursor-pointer hover:opacity-95"
        title=""
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-ivy-500 to-indigo-600 text-sm font-extrabold text-white tracking-widest shadow-2xs select-none">
          S
        </div>
        <div>
          <h1 className="text-xl font-serif font-black tracking-tight text-white leading-none">Specify</h1>
          <p className="text-[10px] text-stone-400 mt-1 font-mono uppercase tracking-widest leading-none">Software Design & Analysis Workspace</p>
        </div>
      </button>

      <div className="flex items-center gap-4">
        <div className="bg-ivy-600/10 border border-ivy-505/20 text-ivy-700 font-extrabold select-none h-8 w-8 rounded-full flex items-center justify-center text-xs uppercase cursor-pointer hover:bg-ivy-700/80 hover:scale-105 active:scale-95 transition-all shadow-sm">
          {userName ? userName[0] : 'U'}
        </div>
        
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="text-xs font-bold text-stone-100">{userName}</span>
          <span className="text-xs text-stone-400 font-mono">{userEmail}</span>
        </div>

        <button onClick={onEditProfile} className="p-2 border border-wood-750 text-stone-300 hover:text-white hover:bg-wood-800 rounded-lg cursor-pointer transition-colors" title="Profile settings" id="btn-nav-profile">
          <Settings className="h-4 w-4" />
        </button>

        <button onClick={onLogout} className="flex items-center gap-1.5 text-xs font-semibold bg-wood-800 hover:bg-wood-750 text-stone-200 hover:text-white px-3 py-2 rounded-lg border border-wood-700 transition-colors cursor-pointer" id="btn-nav-logout">
          <LogOut className="h-4 w-4 text-stone-400 shrink-0" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}
