import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Layers, ShieldAlert, Sun, Moon } from 'lucide-react';
import Navigation from './layout/Navigation.js';
import AuthPage from './components/AuthPage.js';
import HelpCenter from './components/HelpCenter.js';
import ProjectManager from './components/ProjectManager.js';
import UseCaseManager from './components/UseCaseManager.js';
import CRCCardManager from './components/CRCCardManager.js';
import DiagramGeneratorView from './components/DiagramGeneratorView.js';
import { Project } from './types/index.js';

/**
 * Main application component for SpecFlow, managing authentication state,
 * routing tabs, active dossier/project workspaces, and global error notices.
 */
export default function App() {
  // state for holding authenticated user info (ID, name, email)
  const [user, setUser] = useState<{ id: string; name: string; email: string; avatarUrl?: string } | null>(null);
  // authorization bearer token
  const [token, setToken] = useState<string | null>(null);
  // currently selected dossier/project for requirements specification
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  // currently active navigation tab in a project workspace
  const [activeTab, setActiveTab] = useState<'usecases' | 'crccards' | 'diagrams' | 'help'>('usecases');
  // state checking if user has profile edit mode active
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Dashboard view toggle if user is on the main landing page (projects vs general compliance guidelines)
  const [homeTab, setHomeTab] = useState<'projects' | 'guidelines'>('projects');

  // Dark Mode Configuration (Locked to Dark Theme - UI theme defaults permanently to dark)
  const isDarkMode = true;

  // Effect to synchronize the HTML document root element to always ensure dark theme
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  // indicates if application is checking for saved authentication state
  const [loading, setLoading] = useState(true);
  // global error notification banner state
  const [error, setError] = useState('');

  /**
   * Effect to auto load active session token from local storage when application boots
   */
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchProfile(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  /**
   * Fetches user profile using the active JWT token from backend to restore session
   */
  const fetchProfile = async (tk: string) => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${tk}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setError('');
      } else {
        // Log out user if session validation fails
        handleLogout();
      }
    } catch {
      setError('Connection parameters stale. Operating in client mode.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Callback invoked upon successful authentication to initialize session
   */
  const handleAuthSuccess = (u: any, tk: string) => {
    setUser(u);
    setToken(tk);
    setIsEditingProfile(false);
    setError('');
  };

  /**
   * Clears tokens and project context when logging out
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setCurrentProject(null);
    setIsEditingProfile(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen dark bg-wood-955 text-stone-200 flex flex-col justify-center items-center font-sans">
        <div className="animate-spin h-6 w-6 border-2 border-ivy-600 border-t-transparent rounded-full mb-2 font-semibold"></div>
        <p className="text-xs text-stone-400 font-semibold font-mono">Preparing Specify Planning Board...</p>
      </div>
    );
  }

  // Not Authenticated -> Show beautiful auth portals (US1)
  if (!token || !user) {
    return (
      <div className="min-h-screen relative transition-colors duration-300 dark bg-wood-955 text-stone-200 flex flex-col justify-between py-12 px-6 font-sans">
        {/* Top-left Minimal Branding Logo */}
        <div className="absolute top-4 left-4 z-50 flex items-center gap-3.5 select-none animate-fade-in">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-ivy-500 to-indigo-600 text-sm font-extrabold text-white tracking-widest shadow-2xs">
            S
          </div>
          <div>
            <span className="text-sm font-serif font-black tracking-tight text-white block leading-none">Specify</span>
            <span className="text-[9px] text-stone-400 mt-1.5 font-mono uppercase tracking-widest block leading-none">Software Design & Analysis Workspace</span>
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center">
          <AuthPage onAuthSuccess={handleAuthSuccess} />
        </div>
        <div className="text-center text-[10px] text-stone-400 font-medium max-w-sm mx-auto my-auto font-mono">
          Specify • 2026
        </div>
      </div>
    );
  }

  // Authenticated Workspace
  return (
    <div className="min-h-screen transition-colors duration-300 dark bg-wood-955 text-stone-200 flex flex-col font-sans" id="app-workspace-root">
      
      {/* Top Main Navbar */}
      <Navigation
        userName={user.name}
        userEmail={user.email}
        avatarUrl={user.avatarUrl}
        onLogout={handleLogout}
        onEditProfile={() => setIsEditingProfile(true)}
        onHomeClick={() => {
          setCurrentProject(null);
          setIsEditingProfile(false);
        }}
      />

      <main className="flex-grow p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Error notification fallback banners */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-start gap-2 text-rose-600 text-[11px]">
            <ShieldAlert className="h-4.5 w-4.5 text-rose-505 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isEditingProfile ? (
          /* PROFILE SCREEN (US2) */
          <div className="py-6">
            <AuthPage
              editMode={true}
              currentUser={user}
              onAuthSuccess={(updatedUser) => {
                setUser(updatedUser);
                setIsEditingProfile(false);
              }}
              onProfileUpdateCancel={() => setIsEditingProfile(false)}
            />
          </div>
        ) : !currentProject ? (
          /* DIRECTORY HOMEPAGE WORKSPACE (US4) */
          <div className="space-y-6">
            {/* Elegant Dashboard Welcome profile card (Shows User Avatar & Profile details) */}
            <div className="bg-white p-6 rounded-2xl border border-stone-150/80 shadow-md hover:shadow-lg transition-all flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden" id="dashboard-welcome-banner">
              {/* Decorative premium accent vectors */}
              <div className="absolute top-0 right-0 h-40 w-40 bg-ivy-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              
              <div className="flex items-center gap-4.5 z-10">
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    referrerPolicy="no-referrer"
                    className="h-16 w-16 rounded-full object-cover border-2 border-ivy-600 shadow-sm"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-ivy-600/10 border border-ivy-505/20 text-ivy-700 font-extrabold flex items-center justify-center text-3xl uppercase shadow-xs">
                    {user.name ? user.name[0] : 'U'}
                  </div>
                )}
                
                <div>
                  <h2 className="text-2xl font-serif font-extrabold text-stone-900 tracking-tight flex items-center gap-1.5 dark:text-white">
                    Welcome back, {user.name}!
                  </h2>
                  <p className="text-sm text-stone-600 leading-normal mt-1.5 max-w-xl dark:text-stone-300">
                    Manage your project requirements, CRC cards, and system diagrams.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 z-10 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setHomeTab(homeTab === 'projects' ? 'guidelines' : 'projects')}
                  className="px-4 py-2 bg-ivy-700 hover:bg-ivy-800 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-3xs hover:shadow-2xs border border-ivy-800"
                >
                  {homeTab === 'projects' ? 'View Guidelines' : 'View Projects'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Projects lists & Create widget */}
            <div className="xl:col-span-8 space-y-5">
              {/* Home toggleable view tabs for quick layout navigation */}
              <div className="pb-2 flex justify-between items-center bg-white p-2 rounded-xl border border-stone-150 shadow-3xs">
                <div className="bg-stone-100 p-0.5 rounded-lg flex text-xs font-semibold">
                  <button
                    onClick={() => setHomeTab('projects')}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      homeTab === 'projects'
                        ? 'bg-ivy-700 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Your Projects
                  </button>
                  <button
                    onClick={() => setHomeTab('guidelines')}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      homeTab === 'guidelines'
                        ? 'bg-ivy-700 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Guidelines & Quick Start
                  </button>
                </div>
              </div>

              {homeTab === 'projects' ? (
                <ProjectManager
                  onSelectProject={(p) => {
                    setCurrentProject(p);
                    setActiveTab('usecases');
                  }}
                />
              ) : (
                <HelpCenter />
              )}
            </div>

            {/* Right Column: Concept Overview & Quick Steps */}
            <div className="xl:col-span-4 space-y-5">
              {homeTab === 'projects' && (
                <>
                  {/* Elegant Quick Concepts & Workflow Checklist */}
                  <div className="bg-white p-5 rounded-xl border border-stone-150 shadow-2xs space-y-4">
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-stone-100 font-sans">
                      <BookOpen className="h-4 w-4 text-ivy-600" /> Getting Started
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex gap-2.5 items-start">
                        <span className="h-5 w-5 rounded-full bg-ivy-50 text-ivy-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                        <div>
                          <h5 className="text-xs font-bold text-stone-800 dark:text-white">Create Use Cases</h5>
                          <p className="text-xs text-stone-500 dark:text-stone-400 leading-normal mt-0.5">Define actors and system behavior.</p>
                        </div>
                      </div>

                      <div className="flex gap-2.5 items-start">
                        <span className="h-5 w-5 rounded-full bg-ivy-50 text-ivy-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                        <div>
                          <h5 className="text-xs font-bold text-stone-800 dark:text-white">Create CRC Cards</h5>
                          <p className="text-xs text-stone-500 dark:text-stone-400 leading-normal mt-0.5">Define classes, responsibilities, and collaborations.</p>
                        </div>
                      </div>

                      <div className="flex gap-2.5 items-start">
                        <span className="h-5 w-5 rounded-full bg-ivy-50 text-ivy-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                        <div>
                          <h5 className="text-xs font-bold text-stone-800 dark:text-white">Generate Diagrams</h5>
                          <p className="text-xs text-stone-500 dark:text-stone-400 leading-normal mt-0.5">Produce PlantUML or Nomnoml scripts.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
          </div>
        ) : (
          /* INDIVIDUAL PRODUCT DRILL-DOWN CONTAINER WORKSPACE (US7 - US19) */
          <div className="space-y-6">
            
            {/* Folder Header Breadcrumb banner with back actions */}
            <div className="bg-white p-6 rounded-xl border border-stone-150/80 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentProject(null)}
                  className="p-2 border border-stone-200 hover:border-stone-300 text-stone-500 hover:text-stone-800 bg-white hover:bg-stone-50 rounded-lg cursor-pointer transition-colors"
                  title="Return to folders list"
                  id="btn-back-home"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                </button>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-ivy-600 uppercase tracking-wider block">
                      Active Workspace
                    </span>
                  </div>
                  <h2 className="text-xl font-serif font-bold text-stone-900 mt-0.5 dark:text-white">{currentProject.name}</h2>
                  <p className="text-xs text-stone-500 truncate max-w-sm mt-0.5 dark:text-stone-400">{currentProject.description}</p>
                </div>
              </div>

              {/* Workspaces secondary horizontal tab navigators */}
              <div className="bg-stone-100 p-0.5 rounded-lg flex text-xs font-semibold overflow-x-auto max-w-full">
                <button
                  onClick={() => setActiveTab('usecases')}
                  className={`px-3 py-2 rounded-md transition-all shrink-0 cursor-pointer ${
                    activeTab === 'usecases'
                      ? 'bg-ivy-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-ivy-700'
                  }`}
                >
                  Use Cases
                </button>
                <button
                  onClick={() => setActiveTab('crccards')}
                  className={`px-3 py-2 rounded-md transition-all shrink-0 cursor-pointer ${
                    activeTab === 'crccards'
                      ? 'bg-ivy-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-ivy-700'
                  }`}
                >
                  CRC Cards
                </button>
                <button
                  onClick={() => setActiveTab('diagrams')}
                  className={`px-3 py-2 rounded-md transition-all shrink-0 cursor-pointer ${
                    activeTab === 'diagrams'
                      ? 'bg-ivy-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-ivy-700'
                  }`}
                >
                  Diagrams Generator
                </button>
                <button
                  onClick={() => setActiveTab('help')}
                  className={`px-3 py-2 rounded-md transition-all shrink-0 cursor-pointer ${
                    activeTab === 'help'
                      ? 'bg-ivy-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-ivy-700'
                  }`}
                >
                  Guidelines & Quick Start
                </button>
              </div>
            </div>

            {/* Active Workspace View Mapper */}
            <div className="min-h-[480px]">
              {activeTab === 'usecases' && (
                <UseCaseManager projectId={currentProject.id} currentUserId={user.id} />
              )}
              {activeTab === 'crccards' && (
                <CRCCardManager projectId={currentProject.id} currentUserId={user.id} />
              )}
              {activeTab === 'diagrams' && (
                <DiagramGeneratorView projectId={currentProject.id} />
              )}
              {activeTab === 'help' && (
                <HelpCenter />
              )}
            </div>

          </div>
        )}

      </main>

      {/* Unified footer credits info banner */}
      <footer className="bg-white border-t border-slate-150 py-5 text-center text-[10px] text-slate-400 font-mono mt-12 shrink-0">
        <div>Specify • Software Design & Analysis Workspace</div>
        <div className="mt-1">Copyrights • 2026</div>
      </footer>
    </div>
  );
}