/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Trash, Edit, ArrowLeft, CheckSquare, PlusCircle, Check, Layers } from 'lucide-react';
import { CRCCard, UseCase } from '../types/index.js';
import CommentsView from './CommentsView.js';

interface CRCCardManagerProps {
  projectId: string;
  currentUserId?: string;
}

/**
 * Component to manage Class Responsibility Collaborator (CRC) index cards,
 * allowing class description creation, collaborative class bindings, and system linkage.
 */
export default function CRCCardManager({ projectId, currentUserId }: CRCCardManagerProps) {
  // lists of CRC index cards and loaded use cases for relationship linking
  const [crcCards, setCrcCards] = useState<CRCCard[]>([]);
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  // holds currently active CRC card design node
  const [selectedCard, setSelectedCard] = useState<CRCCard | null>(null);

  // dialog status and notice handlers
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [cardToDelete, setCardToDelete] = useState<CRCCard | null>(null);

  // Input bindings matching CRC card properties
  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState<string[]>(['']);
  const [collaborators, setCollaborators] = useState<string[]>(['']);
  const [linkedUseCaseIds, setLinkedUseCaseIds] = useState<string[]>([]);

  const token = localStorage.getItem('token');

  /**
   * Fetches Class cards and Use cases in parallel to support direct cross-referencing
   */
  const fetchCRCDependencies = async () => {
    if (!token) return;
    try {
      // Fetch CRC Cards (US11)
      const crcRes = await fetch(`/api/projects/${projectId}/crccards`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (crcRes.ok) {
        const data = await crcRes.json();
        setCrcCards(data);
        if (data.length > 0 && !selectedCard) {
          setSelectedCard(data[0]);
        } else if (data.length > 0) {
          const current = data.find((c: CRCCard) => c.id === selectedCard?.id);
          setSelectedCard(current || data[0]);
        } else {
          setSelectedCard(null);
        }
      }

      // Fetch Use Cases (for US13 linking)
      const ucRes = await fetch(`/api/projects/${projectId}/usecases`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (ucRes.ok) {
        const data = await ucRes.json();
        setUseCases(data);
      }
    } catch {
      setError('Connection failure loading CRC definitions.');
    }
  };

  useEffect(() => {
    fetchCRCDependencies();
  }, [projectId]);

  /**
   * Opens forms and resets state keys to define a new Class Responsibility structural card
   */
  const startCreate = () => {
    setClassName('');
    setDescription('');
    setResponsibilities(['']);
    setCollaborators(['']);
    setLinkedUseCaseIds([]);
    setError('');
    setIsCreating(true);
    setIsEditing(false);
  };

  /**
   * Loads existing class specification data into form input fields to trigger edit mode
   */
  const startEdit = (card: CRCCard) => {
    setClassName(card.className);
    setDescription(card.description || '');
    setResponsibilities(card.responsibilities && card.responsibilities.length > 0 ? [...card.responsibilities] : ['']);
    setCollaborators(card.collaborators && card.collaborators.length > 0 ? [...card.collaborators] : ['']);
    setLinkedUseCaseIds(card.linkedUseCaseIds || []);
    setError('');
    setIsEditing(true);
    setIsCreating(false);
  };

  /**
   * Increments dynamically sized array fields within the creation forms
   */
  const handleAddField = (type: 'resp' | 'collab') => {
    if (type === 'resp') {
      setResponsibilities(prev => [...prev, '']);
    } else {
      setCollaborators(prev => [...prev, '']);
    }
  };

  /**
   * Removes item from the dynamic text array at a specific index
   */
  const handleRemoveField = (type: 'resp' | 'collab', index: number) => {
    if (type === 'resp') {
      if (responsibilities.length === 1) return;
      setResponsibilities(prev => prev.filter((_, i) => i !== index));
    } else {
      if (collaborators.length === 1) return;
      setCollaborators(prev => prev.filter((_, i) => i !== index));
    }
  };

  /**
   * Maps live input modifications into the correct index of text array collections
   */
  const handleFieldValueChange = (type: 'resp' | 'collab', index: number, val: string) => {
    if (type === 'resp') {
      const updated = [...responsibilities];
      updated[index] = val;
      setResponsibilities(updated);
    } else {
      const updated = [...collaborators];
      updated[index] = val;
      setCollaborators(updated);
    }
  };

  /**
   * Toggles use case binding identifiers to map behavioral specs on the class responsibility cards
   */
  const toggleUseCaseLink = (ucId: string) => {
    setLinkedUseCaseIds(prev => {
      if (prev.includes(ucId)) {
        return prev.filter(id => id !== ucId);
      } else {
        return [...prev, ucId];
      }
    });
  };

  /**
   * Submits newly specified or updated CRC structures to the database layer
   */
  const saveCRCCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      setError('Class name is required (use safe Noun phrases)');
      return;
    }

    const cleanResponsibilities = responsibilities
      .map(r => r.trim())
      .filter(Boolean);

    const cleanCollaborators = collaborators
      .map(c => c.trim())
      .filter(Boolean);

    const payload = {
      className: className.trim(),
      description: description.trim(),
      responsibilities: cleanResponsibilities,
      collaborators: cleanCollaborators,
      linkedUseCaseIds,
    };

    try {
      const url = isCreating
        ? `/api/projects/${projectId}/crccards`
        : `/api/projects/${projectId}/crccards/${selectedCard?.id}`;
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
        await fetchCRCDependencies();
        setSelectedCard(saved);
        setIsCreating(false);
        setIsEditing(false);
        setError('');
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to save CRC card');
      }
    } catch {
      setError('Connection failure saving CRC card details');
    }
  };

  const deleteCard = (card: CRCCard) => {
    setCardToDelete(card);
  };

  const confirmDeleteCard = async () => {
    if (!cardToDelete || !token) return;
    const id = cardToDelete.id;
    setCardToDelete(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/crccards/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSelectedCard(null);
        await fetchCRCDependencies();
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to delete CRC card');
      }
    } catch {
      setError('Connection failure deleting CRC Card');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="crc-card-manager-root">
      {/* Sidebar Listing */}
      <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-100 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-sans">CRC Cards</h3>
          <button
            onClick={startCreate}
            className="flex items-center gap-1.5 text-xs font-semibold bg-ivy-600 hover:bg-ivy-700 text-white rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
            id="btn-create-crc"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Create</span>
          </button>
        </div>

        {crcCards.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
            <p className="text-xs text-slate-400 italic">No CRC cards specified yet</p>
            <button
              onClick={startCreate}
              className="text-[11px] text-ivy-600 hover:underline font-semibold mt-2 block mx-auto cursor-pointer"
            >
              Analyze a new domain class
            </button>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
            {crcCards.map(card => {
              const isSelected = selectedCard?.id === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => {
                    setSelectedCard(card);
                    setIsCreating(false);
                    setIsEditing(false);
                    setError('');
                  }}
                  className={`flex justify-between items-center p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200/60 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold font-mono truncate">{card.className}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{card.description || 'No description provided'}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCard(card);
                    }}
                    className={`p-1 rounded-md transition-colors ${isSelected ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'}`}
                    title="Delete card classification"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Panel Detail Form & Interactive physical card view */}
      <div className="lg:col-span-8">
        {isCreating || isEditing ? (
          /* Create or Edit Form definitions */
          <form onSubmit={saveCRCCard} className="bg-white p-6 rounded-xl border border-slate-100 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <button
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
                {isCreating ? 'Define New Class Card' : 'Update Class Specifications'}
              </h3>
            </div>

            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-100">{error}</p>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Class Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Class Name (Noun Phrase) <span className="text-rose-600 font-extrabold ml-1" title="Required">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., AuthController or UseCaseTemplate"
                    value={className}
                    onChange={e => setClassName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Class Description */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Domain Responsibility Summary
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Decouples view interaction from database mapping model"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Grid of list forms (Responsibilities & Collaborators) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Responsibilities list */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Responsibilities obligations <span className="text-rose-600 font-extrabold ml-1" title="Required">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAddField('resp')}
                      className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {responsibilities.map((resp, idx) => (
                      <div key={idx} className="flex gap-1 items-center">
                        <input
                          type="text"
                          placeholder="e.g., Compiles templates into script directives"
                          value={resp}
                          onChange={e => handleFieldValueChange('resp', idx, e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveField('resp', idx)}
                          disabled={responsibilities.length <= 1}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded disabled:opacity-30 cursor-pointer"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Collaborators list */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Collaborator Classes
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAddField('collab')}
                      className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {collaborators.map((collab, idx) => (
                      <div key={idx} className="flex gap-1 items-center">
                        <input
                          type="text"
                          placeholder="e.g., dbStore or classDiagramGenerator"
                          value={collab}
                          onChange={e => handleFieldValueChange('collab', idx, e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveField('collab', idx)}
                          disabled={collaborators.length <= 1}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded disabled:opacity-30 cursor-pointer"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Link system Use Cases to CRC Card behavior */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <CheckSquare className="h-4 w-4 text-ivy-600" />
                  Supportive Use Cases Linking
                </h5>
                <p className="text-xs text-slate-500 mb-3 block leading-normal">
                  Select the use cases supported by this class:
                </p>

                {useCases.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No use cases exist to link to. Define them first!</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[120px] overflow-y-auto pr-1">
                    {useCases.map(uc => {
                      const isLinked = linkedUseCaseIds.includes(uc.id);
                      return (
                        <div
                          key={uc.id}
                          onClick={() => toggleUseCaseLink(uc.id)}
                          className={`flex items-center gap-2.5 p-2 rounded-md border text-xs cursor-pointer select-none transition-all ${
                            isLinked
                              ? 'bg-ivy-50/65 border-ivy-200 text-ivy-950 font-semibold'
                              : 'bg-white border-slate-150 text-slate-600 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${isLinked ? 'bg-ivy-600 border-ivy-600 text-white' : 'border-slate-300'}`}>
                            {isLinked && <Check className="h-3 w-3 inline-block" />}
                          </div>
                          <span className="truncate">{uc.title}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                Save Card Design
              </button>
            </div>
          </form>
        ) : selectedCard ? (
          /* Card View Display plus Comments and mappings (US11, US13, US19) */
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                CLASS RESPONSIBILITY SPECIFICATIONS
              </span>
              <button
                onClick={() => startEdit(selectedCard)}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit card details</span>
              </button>
            </div>

            {/* Structured Card Design mimicking actual paper indices */}
            <div className="bg-amber-50/60 rounded-xl border border-amber-200 shadow-sm p-6 space-y-4 font-sans relative overflow-hidden">
              {/* Lined paper visual elements */}
              <div className="absolute top-0 bottom-0 left-12 w-0.5 bg-red-200/50"></div>
              
              <div className="pl-8 border-b border-amber-200 pb-3 flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/75 px-1.5 py-0.5 rounded-sm">
                    CRC index Card Representation
                  </span>
                  <h3 className="text-xl font-bold font-mono text-amber-900 mt-1">{selectedCard.className}</h3>
                </div>
                <div className="text-[10px] text-amber-700/80 font-mono italic max-w-[240px] text-right">
                  {selectedCard.description || 'Holds core domain state.'}
                </div>
              </div>

              {/* physical layout grid */}
              <div className="pl-8 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[160px] divide-y md:divide-y-0 md:divide-x divide-amber-200">
                {/* Responsibilities list */}
                <div className="pr-2 pt-2 md:pt-0">
                  <h4 className="text-[11px] font-bold text-amber-850 uppercase tracking-widest border-b border-amber-200/60 pb-1.5 mb-2.5">
                    Responsibilities
                  </h4>
                  {selectedCard.responsibilities && selectedCard.responsibilities.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedCard.responsibilities.map((resp, idx) => (
                        <li key={idx} className="text-xs text-amber-900 flex items-start gap-1 p-0.5">
                          <span className="text-[10px] text-amber-600 mt-0.5">•</span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-amber-700/60 italic">No responsibility assigned</p>
                  )}
                </div>

                {/* Collaborators list */}
                <div className="md:pl-6 pt-4 md:pt-0">
                  <h4 className="text-[11px] font-bold text-amber-850 uppercase tracking-widest border-b border-amber-200/60 pb-1.5 mb-2.5">
                    Collaborators
                  </h4>
                  {selectedCard.collaborators && selectedCard.collaborators.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCard.collaborators.map((collab, idx) => (
                        <span
                          key={idx}
                          className="bg-amber-100 text-amber-900 border border-amber-200 font-mono px-2 py-0.5 rounded text-[10px] font-bold"
                        >
                          {collab}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-700/60 italic">No collaborator class relationships mapped</p>
                  )}
                </div>
              </div>

              {/* Supported linked Use Cases footer */}
              <div className="pl-8 pt-3 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-amber-850">
                <span className="font-semibold uppercase tracking-wider">Linked Use Cases:</span>
                <div className="flex flex-wrap gap-1 md:max-w-md justify-end">
                  {selectedCard.linkedUseCaseIds && selectedCard.linkedUseCaseIds.length > 0 ? (
                    selectedCard.linkedUseCaseIds.map(uid => {
                      const matched = useCases.find(u => u.id === uid);
                      return (
                        <span
                          key={uid}
                          className="bg-white/90 border border-amber-200 text-amber-900 rounded-lg px-2 py-0.5 text-[9px] font-bold max-w-[150px] truncate"
                          title={matched?.title || 'System Specification'}
                        >
                          {matched ? matched.title : 'Specification'}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-amber-700/60 italic text-[10px]">No linked use case mappings. Link Use Cases to CRC Cards to show behavioral support</span>
                  )}
                </div>
              </div>
            </div>

            {/* US19 User Comments widget */}
            <CommentsView
              projectId={projectId}
              targetType="crccard"
              targetId={selectedCard.id}
              targetTitle={selectedCard.className}
              currentUserId={currentUserId}
            />
          </div>
        ) : (
          <div className="bg-white p-12 rounded-xl border border-slate-100 shadow-2xs text-center flex flex-col items-center justify-center">
            <Layers className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-slate-500 text-xs font-semibold">Select an existing CRC Card class or click Create above</p>
            <p className="text-[10px] text-slate-400 mt-1 max-w-sm">
              CRC Index cards let you model the Object-Oriented responsibilities and direct collaborators of your database and domain classes.
            </p>
          </div>
        )}
      </div>

      {/* Custom dialog for deleting CRC card */}
      {cardToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-xl border border-slate-100 shadow-xl max-w-sm w-full p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-rose-600 block text-sans">Delete CRC Card?</h3>
            <p className="text-[11px] text-slate-500 leading-normal">
              Are you sure you want to delete <strong className="text-slate-700">"{cardToDelete.className}"</strong> CRC Card? This will permanently delete this CRC card definition.
            </p>
            <div className="flex justify-end gap-2 text-[11px] font-semibold pt-2">
              <button
                type="button"
                onClick={() => setCardToDelete(null)}
                className="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCard}
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
