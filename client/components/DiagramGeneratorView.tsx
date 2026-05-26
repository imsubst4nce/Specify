import { useState, useEffect } from 'react';
import { Copy, Code, CheckCircle, RefreshCw, Sparkles, Server, ArrowRight } from 'lucide-react';
import { UseCase, CRCCard } from '../types/index.js';

interface DiagramGeneratorViewProps {
  projectId: string;
}

export default function DiagramGeneratorView({ projectId }: DiagramGeneratorViewProps) {
  const [diagramType, setDiagramType] = useState<'usecase' | 'class'>('usecase');
  const [selectedTool, setSelectedTool] = useState<'plantuml' | 'nomnoml'>('plantuml');
  const [script, setScript] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [crcCards, setCrcCards] = useState<CRCCard[]>([]);

  const token = localStorage.getItem('token');

  const generateDiagramScript = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const endpoint = diagramType === 'usecase' ? 'usecases' : 'classes';
      const res = await fetch(`/api/projects/${projectId}/diagrams/${endpoint}?tool=${selectedTool}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setScript(data.script);
      } else {
        const err = await res.json();
        setError(err.error || 'Syntax engine error generating script');
      }
    } catch {
      setError('Connection failure communicating with diagram generator microservice');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocalDependencies = async () => {
    if (!token) return;
    try {
      const ucRes = await fetch(`/api/projects/${projectId}/usecases`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (ucRes.ok) {
        const ucData = await ucRes.json();
        setUseCases(ucData);
      }

      const crcRes = await fetch(`/api/projects/${projectId}/crccards`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (crcRes.ok) {
        const crcData = await crcRes.json();
        setCrcCards(crcData);
      }
    } catch {
      console.error('Failed to load diagram interactive layouts');
    }
  };

  useEffect(() => {
    generateDiagramScript();
  }, [projectId, diagramType, selectedTool]);

  useEffect(() => {
    fetchLocalDependencies();
  }, [projectId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getUniqueActors = () => {
    const actorsSet = new Set<string>();
    useCases.forEach(uc => {
      if (Array.isArray(uc.actors)) {
        uc.actors.forEach(actor => {
          if (actor.trim()) actorsSet.add(actor.trim());
        });
      }
    });
    return Array.from(actorsSet);
  };

  return (
    <div className="space-y-6" id="diagram-generator-view-root">
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-2xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-sm font-serif font-bold text-ivy-950 mt-0.5">UML Diagram Script Generator</h3>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-ivy-50 p-0.5 rounded-lg flex text-xs border border-ivy-100">
              <button 
                onClick={() => setDiagramType('usecase')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  diagramType === 'usecase'
                    ? 'bg-ivy-700 text-white shadow-xs'
                    : 'text-ivy-800 hover:text-ivy-700'
                }`}
              >
                Use Case Diagram
              </button>
              <button 
                onClick={() => setDiagramType('class')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  diagramType === 'class'
                    ? 'bg-ivy-700 text-white shadow-xs'
                    : 'text-ivy-800 hover:text-ivy-700'
                }`}
              >
                Class (CRC) Diagram
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-ivy-50 p-0.5 rounded-lg text-xs border border-ivy-100">
              <button 
                onClick={() => setSelectedTool('plantuml')}
                className={`px-3 py-1.5 rounded-md font-semibold font-mono transition-all cursor-pointer ${
                  selectedTool === 'plantuml'
                    ? 'bg-ivy-700 text-white shadow-xs'
                    : 'text-ivy-800 hover:text-ivy-700'
                }`}
              >
                PlantUML
              </button>
              <button 
                onClick={() => setSelectedTool('nomnoml')}
                className={`px-3 py-1.5 rounded-md font-semibold font-mono transition-all cursor-pointer ${
                  selectedTool === 'nomnoml'
                    ? 'bg-ivy-700 text-white shadow-xs'
                    : 'text-ivy-800 hover:text-ivy-700'
                }`}
              >
                Nomnoml
              </button>
            </div>

            <button 
              onClick={generateDiagramScript} 
              disabled={loading} 
              className="p-2 border border-ivy-200 hover:border-ivy-300 text-ivy-700 hover:text-ivy-900 bg-white hover:bg-ivy-50/50 rounded-lg cursor-pointer transition-colors" 
              title="Refresh scripts"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        <div className="xl:col-span-7 bg-white p-5 rounded-xl border border-slate-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Diagram Preview
              </h4>
            </div>
          </div>

          <div className="bg-slate-50/50 rounded-xl border border-slate-200 min-h-[380px] p-6 flex flex-col justify-between overflow-hidden relative" id="visual-uml-sandbox">
            
            {diagramType === 'usecase' ? (
              useCases.length === 0 ? (
                <div className="m-auto text-center space-y-1">
                  <span className="text-xs text-slate-400 italic">No Use Cases specified yet</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block text-center mb-1">Row-by-Row Actor Interaction Boundaries</span>
                  <div className="w-full max-h-[360px] overflow-y-auto pr-1 space-y-3" id="usecase-rows-container">
                    {useCases.map((uc) => {
                      const validActors = Array.isArray(uc.actors) ? uc.actors.filter(actor => actor && actor.trim()) : [];
                      return (
                        <div 
                          key={uc.id} 
                          className="bg-white rounded-lg border border-ivy-200 p-3.5 shadow-3xs flex items-center justify-between gap-4 transition-all hover:border-ivy-350 hover:shadow-xs"
                        >
                          <div className="w-1/3 flex items-center gap-2">
                            {validActors.length === 0 ? (
                              <div className="flex items-center gap-2 bg-ivy-50 border border-ivy-200 rounded px-2.5 py-1.5 min-w-[100px] border-dashed">
                                <svg className="h-4 w-4 text-ivy-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                  <circle cx={12} cy={12} r={3} />
                                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                                </svg>
                                <span className="font-semibold text-[10px] text-ivy-600 italic">System Event</span>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1.5 items-center">
                                {validActors.map((actor, idx) => (
                                  <div 
                                    key={idx} 
                                    className="flex items-center gap-1.5 bg-ivy-50 border border-ivy-100 rounded px-2 py-1 min-w-[90px] max-w-[130px]"
                                  >
                                    <svg className="h-4 w-4 text-ivy-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                      <circle cx={12} cy={7} r={4} />
                                      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                                    </svg>
                                    <span className="font-bold text-[10px] text-ivy-400 truncate" title={actor}>
                                      {actor}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="w-1/6 flex justify-center text-center">
                            <div className="flex flex-col items-center select-none">
                              <ArrowRight className="h-4 w-4 text-ivy-700" />
                              <span className="text-[8px] font-mono font-bold text-ivy-700 mt-0.5 uppercase tracking-widest bg-ivy-50 px-1.5 py-0.5 rounded">
                                Invokes
                              </span>
                            </div>
                          </div>

                          <div className="w-1/2 flex justify-end">
                            <div className="w-full max-w-[210px] bg-ivy-50 hover:bg-ivy-100/50 border-2 border-ivy-150 rounded-full px-4 py-2 text-center transition-all hover:scale-[1.01] hover:border-ivy-300 cursor-default flex items-center justify-center min-h-[42px] shadow-3xs">
                              <span className="font-serif font-bold text-[10.5px] text-ivy-950 leading-tight">
                                {uc.title}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            ) : (
              crcCards.length === 0 ? (
                <div className="m-auto text-center space-y-1">
                  <span className="text-xs text-slate-400 italic">No CRC Cards specified yet</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center block">Object Domain Collaboration Model</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {crcCards.map(card => {
                      const safetyVal = Array.isArray(card.collaborators) ? card.collaborators.filter(Boolean) : [];
                      return (
                        <div key={card.id} className="bg-white rounded-lg border border-ivy-200 shadow-3xs p-3 space-y-2">
                          <div className="border-b border-ivy-100 pb-1 flex justify-between items-center bg-ivy-50 p-1.5 rounded">
                            <span className="font-bold font-mono text-xs text-ivy-400">{card.className}</span>
                            <span className="text-[8px] uppercase font-bold text-ivy-700 tracking-wide">Class</span>
                          </div>
                          
                          <div className="text-[9px] text-ivy-700">
                            <strong>Responsibilities:</strong>
                            <div className="mt-1 space-y-0.5 pl-1.5 border-l border-ivy-150">
                              {(card.responsibilities || []).slice(0, 3).map((r, i) => (
                                <div key={i} className="truncate">• {r}</div>
                              ))}
                            </div>
                          </div>

                          {safetyVal.length > 0 && (
                            <div className="text-[9px] text-ivy-850 bg-ivy-50 p-1 rounded font-bold mt-1">
                              <strong>Collaborates with:</strong>
                              <div className="truncate font-mono font-medium text-[8.5px] mt-0.5 text-ivy-700">
                                {safetyVal.join(', ')}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        <div className="xl:col-span-5 bg-white rounded-xl border border-slate-100 shadow-2xs overflow-hidden flex flex-col justify-between">
          
          <div className="bg-slate-900 px-5 py-4 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-slate-400" />
              <div>
                <span className="text-[9px] font-bold text-ivy-300 font-mono block">
                  {selectedTool === 'plantuml' ? 'PlantUML' : 'Nomnoml'}
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  UML Script Output
                </span>
              </div>
            </div>

            <button 
              onClick={handleCopy} 
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md cursor-pointer transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy code</span>
                </>
              )}
            </button>
          </div>

          <div className="relative flex-grow">
            {error ? (
              <div className="p-5 text-rose-500 text-xs italic bg-rose-50/40 h-full border-b border-slate-100">
                {error}
              </div>
            ) : (
              <pre className="p-4 bg-slate-950 text-slate-300 font-mono text-[11px] leading-relaxed overflow-auto max-h-[380px] h-full whitespace-pre select-all">
                {script || `// Load dynamic script definitions...`}
              </pre>
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
            <p>
              This code snippet follows the <strong>{selectedTool.toUpperCase()}</strong> format. Copy it to any compatible tool or visit <strong>{selectedTool === 'plantuml' ? 'plantuml.com' : 'nomnoml.com'}</strong> to generate the diagram.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
