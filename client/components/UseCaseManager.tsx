import React, { useState, useEffect } from 'react';
import { Plus, Trash, Edit, PlusSquare, ArrowLeft, ArrowUpCircle, Users, Clipboard, ListOrdered, FileText, Check } from 'lucide-react';
import { UseCase } from '../types/index.js';
import CommentsView from './CommentsView.js';

interface UseCaseManagerProps {
  projectId: string;
  currentUserId?: string;
}

/**
 * Component to manage, model, edit, and link Use Case software requirements
 * for a selected project workspace context.
 */
export default function UseCaseManager({ projectId, currentUserId }: UseCaseManagerProps) {
  // list of requirements retrieved for this project dossier
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  // active use case selection displayed in details panel
  const [selectedUC, setSelectedUC] = useState<UseCase | null>(null);
  
  // panel flow and modal form switches
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  
  // input form fields mapped to Use Case model structures
  const [title, setTitle] = useState('');
  const [actorsString, setActorsString] = useState('');
  const [preconditions, setPreconditions] = useState('');
  const [postconditions, setPostconditions] = useState('');
  const [steps, setSteps] = useState<string[]>(['']);
  const [useCaseToDelete, setUseCaseToDelete] = useState<UseCase | null>(null);

  const token = localStorage.getItem('token');

  /**
   * Loads list of Use Cases for the active project dossier from the API
   */
  const fetchUseCases = async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/usecases`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUseCases(data);
        if (data.length > 0 && !selectedUC) {
          setSelectedUC(data[0]);
        } else if (data.length > 0) {
          // Keep current selection synced
          const current = data.find((u: UseCase) => u.id === selectedUC?.id);
          setSelectedUC(current || data[0]);
        } else {
          setSelectedUC(null);
        }
      }
    } catch {
      setError('Connection failure loading use cases.');
    }
  };

  useEffect(() => {
    fetchUseCases();
  }, [projectId]);

  /**
   * Initializes state variables to clear form and begin defining a new use case
   */
  const startCreate = () => {
    setTitle('');
    setActorsString('');
    setPreconditions('');
    setPostconditions('');
    setSteps(['']);
    setError('');
    setIsCreating(true);
    setIsEditing(false);
  };

  /**
   * Populates form fields with existing use case data to start edit mode
   */
  const startEdit = (uc: UseCase) => {
    setTitle(uc.title);
    setActorsString((uc.actors || []).join(', '));
    setPreconditions(uc.preconditions || '');
    setPostconditions(uc.postconditions || '');
    setSteps((uc.mainFlow && uc.mainFlow.length > 0) ? [...uc.mainFlow] : ['']);
    setError('');
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleAddStepField = () => {
    setSteps(prev => [...prev, '']);
  };

  const handleRemoveStepField = (index: number) => {
    if (steps.length === 1) return;
    setSteps(prev => prev.filter((_, i) => i !== index));
  };

  const handleStepValueChange = (index: number, val: string) => {
    const updated = [...steps];
    updated[index] = val;
    setSteps(updated);
  };

  /**
   * Dispatches create or update request to backend database endpoints
   */
  const saveUseCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Use Case Title is required');
      return;
    }

    const cleanedActors = actorsString
      .split(',')
      .map(a => a.trim())
      .filter(Boolean);

    const cleanedSteps = steps
      .map(s => s.trim())
      .filter(Boolean);

    if (cleanedSteps.length === 0) {
      setError('Please provide at least one step for the main flow');
      return;
    }

    const payload = {
      title: title.trim(),
      actors: cleanedActors,
      preconditions: preconditions.trim(),
      mainFlow: cleanedSteps,
      postconditions: postconditions.trim(),
    };

    try {
      const url = isCreating
        ? `/api/projects/${projectId}/usecases`
        : `/api/projects/${projectId}/usecases/${selectedUC?.id}`;
      const method = isCreating ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const saved = await res.json();
        await fetchUseCases();
        setSelectedUC(saved);
        setIsCreating(false);
        setIsEditing(false);
        setError('');
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to save use case');
      }
    } catch {
      setError('Network failure saving use case');
    }
  };

  const deleteUseCase = (uc: UseCase) => {
    setUseCaseToDelete(uc);
  };

  const confirmDeleteUseCase = async () => {
    if (!useCaseToDelete || !token) return;
    const id = useCaseToDelete.id;
    setUseCaseToDelete(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/usecases/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSelectedUC(null);
        await fetchUseCases();
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to delete use case');
      }
    } catch {
      setError('Network failure deleting use case');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="usecase-manager-root">
      {/* Sidebar - Use Case List */}
      <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-100 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-sans">Use Cases</h3>
          <button
            onClick={startCreate}
            className="flex items-center gap-1.5 text-xs font-semibold bg-ivy-600 hover:bg-ivy-700 text-white rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer animate-none"
            id="btn-define-usecase"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Define</span>
          </button>
        </div>

        {useCases.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
            <p className="text-xs text-slate-400 italic">No use cases defined yet</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
            {useCases.map(uc => {
              const isSelected = selectedUC?.id === uc.id;
              return (
                <div
                  key={uc.id}
                  onClick={() => {
                    setSelectedUC(uc);
                    setIsCreating(false);
                    setIsEditing(false);
                    setError('');
                  }}
                  className={`flex justify-between items-center p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-ivy-900 border-ivy-900 text-white shadow-xs'
                      : 'bg-ivy-50 border-ivy-200/60 text-ivy-100'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold truncate">{uc.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] px-1 rounded-sm font-medium ${isSelected ? 'bg-ivy-800 text-ivy-100' : 'text-ivy-100'}`}>
                        {(uc.actors || []).length} Actors
                      </span>
                      <span className={`text-[9px] px-1 rounded-sm font-medium ${isSelected ? 'bg-ivy-800 text-ivy-100' : 'text-ivy-100'}`}>
                        {(uc.mainFlow || []).length} Steps
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteUseCase(uc);
                    }}
                    className={`cursor-pointer p-1 rounded-md transition-colors ${isSelected ? 'text-slate-100 hover:bg-rose-600' : 'text-slate-100 hover:bg-rose-600'}`}
                    title="Delete specification"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Panel - Actions & Detail Form */}
      <div className="lg:col-span-8">
        {isCreating || isEditing ? (
          /* Form (US7, US8) */
          <form onSubmit={saveUseCase} className="bg-white p-6 rounded-xl border border-slate-100 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <button
                title='Go back to use case list'
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                  setError('');
                }}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                {isCreating ? 'Define New Use Case' : 'Edit Use Case Definition'}
              </h3>
            </div>

            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-100">{error}</p>
            )}

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Use Case Title <span className="text-rose-600 font-extrabold ml-1" title="Required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Secure login of user or Generate PlantUML report"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              {/* Actors */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Actors (Comma-separated list)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Developer, Database, System (At least one)"
                  value={actorsString}
                  onChange={e => setActorsString(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Preconditions */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Pre-conditions
                </label>
                <textarea
                  placeholder="e.g., User is securely logged in to account workspace."
                  value={preconditions}
                  onChange={e => setPreconditions(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 h-14 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              {/* Main Flow Steps (US7, US8) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Main Flow Events sequence <span className="text-rose-600 font-extrabold ml-1" title="Required">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddStepField}
                    className="flex items-center gap-1 text-xs font-bold text-ivy-600 hover:text-ivy-800 cursor-pointer"
                  >
                    <PlusSquare className="h-3.5 w-3.5" />
                    <span>Add Step</span>
                  </button>
                </div>
                
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-xs font-mono font-bold text-slate-400 w-5 text-right">{idx + 1}.</span>
                      <input
                        type="text"
                        placeholder={`e.g., User submits the requested credentials configuration...`}
                        value={step}
                        onChange={e => handleStepValueChange(idx, e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveStepField(idx)}
                        disabled={steps.length <= 1}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg disabled:opacity-30 cursor-pointer"
                        title="Remove step"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Postconditions */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Post-conditions
                </label>
                <textarea
                  placeholder="e.g., System saves updated project state details and redirects to home grid."
                  value={postconditions}
                  onChange={e => setPostconditions(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 h-14 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 font-sans">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                  setError('');
                }}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-ivy-600 hover:bg-ivy-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                Save Specification
              </button>
            </div>
          </form>
        ) : selectedUC ? (
          /* Detail Display Workspace (US9, US19) */
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-2xs space-y-6">
              <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-ivy-600 uppercase tracking-wider block">
                    USE CASE DEFINITION
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedUC.title}</h3>
                </div>
                <button
                  onClick={() => startEdit(selectedUC)}
                  className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Body */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left side: Actors & conditions */}
                <div className="space-y-4">
                  <div>
                    <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                      <Users className="h-3 w-3 text-ivy-600" /> Actors
                    </h5>
                    {selectedUC.actors && selectedUC.actors.length > 0 ? (
                       <div className="flex flex-wrap gap-1.5">
                        {selectedUC.actors.map((actor, idx) => (
                          <span
                            key={idx}
                            className="bg-ivy-50 text-ivy-700 px-2.5 py-1 rounded text-[10px] font-bold border border-ivy-150"
                          >
                            {actor}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No actors defined</p>
                    )}
                  </div>

                  <div>
                    <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                      <Clipboard className="h-3 w-3 text-emerald-505" /> Preconditions
                    </h5>
                    <div className="bg-slate-50 p-2.5 rounded-lg text-xs border border-slate-200/40 text-slate-700 font-medium leading-relaxed">
                      {selectedUC.preconditions || <span className="text-slate-400 italic">None specified</span>}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                      <Check className="h-3.5 w-3.5 text-blue-500" /> Postconditions
                    </h5>
                    <div className="bg-slate-50 p-2.5 rounded-lg text-xs border border-slate-200/40 text-slate-700 font-medium leading-relaxed">
                      {selectedUC.postconditions || <span className="text-slate-400 italic">None specified</span>}
                    </div>
                  </div>
                </div>

                {/* Right side: Steps Flow */}
                <div>
                  <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                    <ListOrdered className="h-3.5 w-3.5 text-ivy-600" /> Main Flow
                  </h5>
                  {selectedUC.mainFlow && selectedUC.mainFlow.length > 0 ? (
                    <div className="space-y-2">
                      {selectedUC.mainFlow.map((step, idx) => (
                        <div key={idx} className="flex gap-2 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 text-xs">
                          <span className="text-ivy-600 font-mono font-bold w-4 shrink-0 mt-0.5 text-right">{idx + 1}.</span>
                          <span className="text-slate-600 leading-normal">{step}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center py-4 border border-dashed rounded">
                      No flow steps declared. Edit to supply steps.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* US19 - Conversation comments */}
            <CommentsView
              projectId={projectId}
              targetType="usecase"
              targetId={selectedUC.id}
              targetTitle={selectedUC.title}
              currentUserId={currentUserId}
            />
          </div>
        ) : (
          <div className="bg-white p-12 rounded-xl border border-slate-100 shadow-2xs text-center flex flex-col items-center justify-center">
            <FileText className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-slate-500 text-xs font-semibold">Click Define to start</p>
            <p className="text-[10px] text-slate-400 mt-1 max-w-sm">
              Use cases describe how a user interacts with the system and how the system responds.
            </p>
          </div>
        )}
      </div>

      {/* Custom dialog for deleting usecase */}
      {useCaseToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-xl border border-slate-100 shadow-xl max-w-sm w-full p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-rose-600 block text-sans">Delete Use Case?</h3>
            <p className="text-[11px] text-slate-500 leading-normal">
              Are you sure you want to delete <strong className="text-slate-700">"{useCaseToDelete.title}"</strong>? This will permanently delete this Use Case definition and un-link it from any CRC cards.
            </p>
            <div className="flex justify-end gap-2 text-[11px] font-semibold pt-2">
              <button
                type="button"
                onClick={() => setUseCaseToDelete(null)}
                className="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUseCase}
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
