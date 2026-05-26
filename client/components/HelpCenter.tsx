import { BookOpen, CheckCircle, AlertTriangle, Shield, Layers, HelpCircle } from 'lucide-react';

export default function HelpCenter() {
  return (
    <div className="bg-white rounded-xl border border-stone-150 shadow-sm overflow-hidden" id="help-center-root">
      <div className="bg-gradient-to-r from-wood-900 via-ivy-850 to-wood-950 p-6 text-white border-b border-wood-850">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-ivy-200" id="help-title-icon" />
          <div>
            <h2 className="text-lg font-serif font-bold tracking-tight">Guidelines & Quick Start</h2>
            <p className="text-xs text-stone-350 mt-1">
              Write use cases, create CRC cards, and generate diagram scripts.
            </p>
          </div>
        </div>
      </div>


      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b border-stone-150 pb-2 mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-ivy-600" />
            Basic Design Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3 bg-stone-50/50 p-4 rounded-lg border border-stone-150/50">
              <h4 className="font-bold text-stone-800 text-xs border-b border-stone-150 pb-1 uppercase tracking-wide">
                Classes
              </h4>
              <ul className="space-y-2 text-xs text-stone-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>One responsibility:</strong> Each class should have one main role.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Clear names:</strong> Use descriptive nouns such as <code>User</code> or <code>Project</code>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-700 mt-0.5 shrink-0" />
                  <span><strong>Keep data private:</strong> Do not expose internal data directly.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 bg-stone-50/50 p-4 rounded-lg border border-stone-150/50">
              <h4 className="font-bold text-stone-800 text-xs border-b border-stone-150 pb-1 uppercase tracking-wide">
                Methods
              </h4>
              <ul className="space-y-2 text-xs text-stone-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Keep them small:</strong> A method should do one thing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Use verbs:</strong> Name methods with action words such as <code>saveProject</code> or <code>generateDiagram</code>.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 bg-stone-50/50 p-4 rounded-lg border border-stone-150/50">
              <h4 className="font-bold text-stone-800 text-xs border-b border-stone-150 pb-1 uppercase tracking-wide">
                Fields
              </h4>
              <ul className="space-y-2 text-xs text-stone-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Keep them private:</strong> Limit direct access to fields.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Use clear names:</strong> Choose simple names such as <code>name</code> or <code>email</code>.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="border border-stone-150 rounded-lg p-5">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wide flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-ivy-600" />
              1. Use Cases
            </h4>
            <p className="text-xs text-stone-600 mb-3 leading-relaxed">
              Use cases describe how users interact with the system. Each use case includes:
            </p>
            <div className="space-y-2 text-xs text-stone-600 pl-2 border-l-2 border-stone-200">
              <p>• <strong>Actors:</strong> The users or external systems involved.</p>
              <p>• <strong>Preconditions:</strong> What must be true before the use case starts.</p>
              <p>• <strong>Main Flow:</strong> The normal sequence of steps.</p>
              <p>• <strong>Postconditions:</strong> The final result after completion.</p>
            </div>
          </div>

          <div className="border border-stone-150 rounded-lg p-5">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wide flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-ivy-600" />
              2. CRC Cards
            </h4>
            <p className="text-xs text-stone-600 mb-3 leading-relaxed">
              CRC cards help you describe the structure of the system.
            </p>
            <div className="space-y-2 text-xs text-stone-600 pl-2 border-l-2 border-stone-200">
              <p>• <strong>Class:</strong> The name of the class.</p>
              <p>• <strong>Responsibilities:</strong> What the class does.</p>
              <p>• <strong>Collaborators:</strong> Other classes it works with.</p>
              <p>• <strong>Use Case Links:</strong> The use cases supported by the class.</p>
            </div>
          </div>
        </div>

        <div className="bg-stone-50/50 rounded-xl p-5 border border-stone-150">
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Layers className="h-4 w-4 text-ivy-600" />
            Diagram Generation
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed mb-4">
            Specify features a built-in generator that converts created use cases and CRC cards into scripts for supported diagram tools.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3.5 rounded-lg border border-stone-150/60 shadow-3xs">
              <span className="text-xs font-bold text-ivy-600 uppercase tracking-widest block mb-1">Tool Selection</span>
              <h5 className="font-bold text-stone-800 text-xs mb-1">Diagram Tool</h5>
              <p className="text-xs text-stone-500 leading-normal">
                Support for PlantUML and Nomnoml.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-stone-150/60 shadow-3xs">
              <span className="text-xs font-bold text-ivy-600 uppercase tracking-widest block mb-1">Script Generator</span>
              <h5 className="font-bold text-stone-800 text-xs mb-1">Script Building Steps</h5>
              <p className="text-xs text-stone-500 leading-normal">
                Builds the script step by step, including headers, elements, relations, and footer.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-stone-150/60 shadow-3xs">
              <span className="text-xs font-bold text-ivy-600 uppercase tracking-widest block mb-1">Data Integrity</span>
              <h5 className="font-bold text-stone-800 text-xs mb-1">Output Format</h5>
              <p className="text-xs text-stone-500 leading-normal">
                Generates the script in the selected format without changing the input data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}