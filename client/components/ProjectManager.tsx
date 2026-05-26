import React, { useState, useEffect } from 'react';
import { Trash, FolderClosed, Users, Share2, Plus, LogIn, Calendar, Mail, CheckCircle2 } from 'lucide-react';
import { Project } from '../types/index.js';

interface ProjectManagerProps {
  onSelectProject: (project: Project) => void;
}

/**
 * Component to manage dossier directories including creation, deletion,
 * listing, and collaborative sharing with team members.
 */
export default function ProjectManager({ onSelectProject }: ProjectManagerProps) {
  // list of requirements projects retrieved from system
  const [projects, setProjects] = useState<Project[]>([]);
  // indicates whether the project creation card form is visible
  const [showCreateForm, setShowCreateForm] = useState(false);
  // input field attributes for constructing new projects
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  // holds reference to project targeted for deletion dialog
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  
  // collaborate/share states
  const [sharingProjectId, setSharingProjectId] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [teammates, setTeammates] = useState<any[]>([]);
  
  // operations/notifications state managers
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  /**
   * Fetches all registered users who can be teammates
   */
  const fetchTeammates = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTeammates(data);
      }
    } catch {
      // Slidely ignore
    }
  };

  /**
   * Fetches the array of software requirements projects/dossiers from the backend API
   */
  const fetchProjects = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      } else {
        setError('Failed to fetch projects database.');
      }
    } catch {
      setError('Connection failure loading project lists.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTeammates();
  }, []);

  /**
   * Dispatches request to API layer to create a new requirements dossier with basic specifications
   */
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !token) return;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: name.trim(), description: description.trim() })
      });

      if (res.ok) {
        const newProj = await res.json();
        setName('');
        setDescription('');
        setShowCreateForm(false);
        setError('');
        setSuccess('Project specified successfully!');
        await fetchProjects();
        // Give option to open automatically
        onSelectProject(newProj);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to create project');
      }
    } catch {
      setError('Failed to connect to creation service');
    }
  };

  /**
   * Opens the confirmation dialog modal to perform dangerous delete action
   */
  const handleDeleteProject = (p: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(p);
  };

  /**
   * Resolves the delete process by calling the backend to scrap all data linked to the given project
   */
  const confirmDeleteProject = async () => {
    if (!projectToDelete || !token) return;
    const id = projectToDelete.id;
    setProjectToDelete(null);

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setError('');
        setSuccess('Project deleted successfully');
        await fetchProjects();
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to delete project');
      }
    } catch {
      setError('Connection error deleting project');
    }
  };

  /**
   * Dispatches email sharing request to enable collaborative specifications in real-time
   */
  const handleShareProject = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail.trim() || !token) return;

    try {
      const res = await fetch(`/api/projects/${id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: shareEmail.trim() })
      });

      if (res.ok) {
        setShareEmail('');
        setSharingProjectId(null);
        setError('');
        setSuccess(`Project is shared successfully!`);
        await fetchProjects();
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to share project');
      }
    } catch {
      setError('Network error sharing project');
    }
  };

  /**
   * Directly shares project with a specific selected teammate from lookup
   */
  const shareWithDirectEmail = async (id: string, email: string) => {
    if (!email.trim() || !token) return;

    try {
      const res = await fetch(`/api/projects/${id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: email.trim() })
      });

      if (res.ok) {
        setShareEmail('');
        setSharingProjectId(null);
        setError('');
        setSuccess(`Project is shared successfully with ${email}!`);
        await fetchProjects();
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to share project');
      }
    } catch {
      setError('Network error sharing project');
    }
  };

  return (
    <div className="space-y-6" id="project-workspace-manager">
      
      {/* Dynamic Notifications toast alert info banner */}
      {(error || success) && (
        <div className="flex gap-4 items-center">
          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100 flex-grow">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex-grow flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{success}</span>
            </p>
          )}
        </div>
      )}

      {/* Top dashboard directory toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-stone-900 tracking-tight">Your Projects</h2>
          <p className="text-xs text-stone-500 mt-0.5 font-medium">Create and manage your software design projects</p>
        </div>

        <button
          onClick={() => {
            setShowCreateForm(prev => !prev);
            setError('');
            setSuccess('');
          }}
          className="flex items-center gap-1.5 text-xs font-semibold bg-ivy-600 hover:bg-ivy-700 text-white px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          id="btn-trigger-project-form"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Slide-out or Drop-down embedded Project instantiation Card form (US5) */}
      {showCreateForm && (
        <form onSubmit={handleCreateProject} className="bg-white p-6 rounded-xl border border-stone-100 shadow-2xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 font-sans">Create New Project</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider font-extrabold text-stone-500 block mb-1">
                Project Name <span className="text-rose-600 font-extrabold ml-1" title="Required">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Online Bookstore or Note Keeping Web app"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-xs bg-stone-50 text-stone-800 border border-stone-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-ivy-600 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-extrabold text-stone-500 block mb-1">Project Description</label>
              <input
                type="text"
                placeholder="e.g. A modern lightweight Spring Boot-based note keeping app"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full text-xs bg-stone-50 text-stone-800 border border-stone-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-ivy-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-50">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="cursor-pointer px-3.5 py-1.5 rounded-lg border border-stone-250 text-stone-600 hover:bg-stone-50 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer px-4 py-1.5 bg-ivy-600 hover:bg-ivy-700 text-white rounded-lg text-xs font-semibold"
            >
              Create Project
            </button>
          </div>
        </form>
      )}

      {/* Grid displaying folders (US4) */}
      {projects.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <FolderClosed className="h-10 w-10 text-stone-350 mb-3" />
          <h3 className="text-base font-bold text-stone-700">No projects yet</h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="text-xs text-ivy-600 hover:underline font-bold mt-4 cursor-pointer"
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => {
            const isSharingThis = sharingProjectId === p.id;
            return (
              <div
                key={p.id}
                onClick={() => onSelectProject(p)}
                className="bg-white rounded-xl border border-stone-150 hover:border-ivy-200 p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer relative"
              >
                {/* Folder Icon badge */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="bg-ivy-50 text-ivy-600 p-2.5 rounded-lg group-hover:bg-ivy-900 group-hover:text-white transition-all">
                      <FolderClosed className="h-4 w-4" />
                    </div>
                    
                    {/* Delete action US6 (Only show or validate for owners) */}
                    <button
                      onClick={(e) => handleDeleteProject(p, e)}
                      className="p-1.5 text-ivy-50 hover:bg-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  </div>
 
                  <div>
                    <h3 className="text-xs font-bold text-stone-800 group-hover:text-ivy-600 transition-colors truncate">
                      {p.name}
                    </h3>
                    <p className="text-[10px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                      {p.description || 'Project details and design.'}
                    </p>
                  </div>
                </div>
 
                {/* Footer specs - details and invite sharing trigger */}
                <div className="border-t border-stone-50 mt-4 pt-3 space-y-3">
                  
                  {/* Stats metadata */}
                  <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-stone-600">
                      <Users className="h-3.5 w-3.5 text-stone-400" />
                      {(p.sharedWith || []).length} teammates
                    </span>
                  </div>
 
                  {/* Share button or Form US18 (Share project with teammates) */}
                  {isSharingThis ? (
                    <div className="relative mt-2" onClick={(e) => e.stopPropagation()}>
                      <form
                        onSubmit={(e) => handleShareProject(p.id, e)}
                        className="flex items-center gap-1 bg-stone-50 p-1.5 rounded-lg border border-stone-200"
                      >
                        <Mail className="h-3 w-3 text-stone-400 shrink-0 ml-1" />
                        <input
                          type="text"
                          placeholder="Teammate's email or name..."
                          value={shareEmail}
                          onChange={e => setShareEmail(e.target.value)}
                          className="w-full text-[10px] bg-transparent focus:outline-none border-none text-stone-700 pl-1 py-0.5"
                          required
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="cursor-pointer bg-ivy-600 hover:bg-ivy-700 text-white rounded px-2 py-0.5 text-[9px] font-bold shrink-0"
                        >
                          Share
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSharingProjectId(null);
                            setShareEmail('');
                          }}
                          className="text-[9px] hover:text-rose-600 text-stone-400 font-bold px-1 shrink-0"
                        >
                          X
                        </button>
                      </form>

                      {/* Dropdown Suggestions */}
                      {shareEmail.trim().length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-stone-150 rounded-lg shadow-lg z-50 mt-1 max-h-40 overflow-y-auto font-sans leading-normal">
                          {teammates.filter(t => 
                            t.name.toLowerCase().includes(shareEmail.toLowerCase()) || 
                            t.email.toLowerCase().includes(shareEmail.toLowerCase())
                          ).length === 0 ? (
                            <p className="p-2 text-[9px] text-stone-400 italic text-center">
                              No matching registered user found. You can still type their email to invite them.
                            </p>
                          ) : (
                            teammates.filter(t => 
                              t.name.toLowerCase().includes(shareEmail.toLowerCase()) || 
                              t.email.toLowerCase().includes(shareEmail.toLowerCase())
                            ).map(t => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => {
                                  shareWithDirectEmail(p.id, t.email);
                                }}
                                className="w-full text-left px-2 py-1.5 hover:bg-stone-50 flex items-center justify-between transition-colors border-b border-stone-50 last:border-0 cursor-pointer text-[10px]"
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {t.avatarUrl ? (
                                    <img 
                                      src={t.avatarUrl} 
                                      alt={t.name}
                                      referrerPolicy="no-referrer"
                                      className="h-4 w-4 rounded-full object-cover border border-stone-200 shrink-0"
                                    />
                                  ) : (
                                    <div className="h-4 w-4 rounded-full bg-ivy-100 text-ivy-700 flex items-center justify-center text-[8px] font-bold font-mono shrink-0">
                                      {t.name[0]}
                                    </div>
                                  )}
                                  <div className="flex flex-col min-w-0 leading-tight">
                                    <span className="font-semibold text-stone-700 truncate">{t.name}</span>
                                    <span className="text-[8px] text-stone-450 truncate">{t.email}</span>
                                  </div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 mt-2 pt-1">
                      {/* Trigger share widget */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSharingProjectId(p.id);
                          setError('');
                          setSuccess('');
                        }}
                        className="flex items-center gap-1 text-[10px] font-bold text-ivy-600 hover:text-ivy-800 bg-ivy-50 hover:bg-ivy-100/60 p-1.5 rounded-md cursor-pointer transition-colors"
                        title="Invite teammates to project"
                      >
                        <Share2 className="h-3 w-3 shrink-0" />
                      </button>
 
                      {/* Open dossier button */}
                      <span className="text-[10px] font-bold text-stone-400 group-hover:text-stone-800 flex items-center gap-0.5 transition-colors">
                        <span>Open</span>
                        <LogIn className="h-3.5 w-3.5 shrink-0" />
                      </span>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom safer dialog for deleting project */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-xl border border-slate-100 shadow-xl max-w-sm w-full p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-rose-600 block text-serif">Delete Project?</h3>
            <p className="text-[11px] text-slate-500 leading-normal">
              Are you sure you want to delete <strong className="text-slate-700">"{projectToDelete.name}"</strong>? This will permanently delete all enclosed Use Cases, CRC class cards, and collaborator discussions.
            </p>
            <div className="flex justify-end gap-2 text-[11px] font-semibold pt-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDeleteProject();
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}