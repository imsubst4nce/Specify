/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, CheckCircle, AlertTriangle, Shield, Layers, HelpCircle } from 'lucide-react';

/**
 * Component displaying simplified guidelines, best practices for beginners,
 * and explanation of how Specify compiles diagrams under the hood.
 */
export default function HelpCenter() {
  return (
    <div className="bg-white rounded-xl border border-stone-150 shadow-sm overflow-hidden" id="help-center-root">
      {/* Brand Header */}
      <div className="bg-gradient-to-r from-wood-900 via-ivy-850 to-wood-950 p-6 text-white border-b border-wood-850">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-ivy-200" id="help-title-icon" />
          <div>
            <h2 className="text-lg font-serif font-bold tracking-tight">Specify Guidelines & Quick Start</h2>
            <p className="text-xs text-stone-350 mt-1">
              A simple workspace to write down your use cases, design cards, and generate automatic visual diagrams.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Do's and Don'ts Grid */}
        <div>
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b border-stone-150 pb-2 mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-ivy-600" />
            Best Practices for Clean Software Design
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Classes Column */}
            <div className="space-y-3 bg-stone-50/50 p-4 rounded-lg border border-stone-150/50">
              <h4 className="font-bold text-stone-800 text-xs border-b border-stone-150 pb-1 uppercase tracking-wide">
                Designing Objects & Classes
              </h4>
              <ul className="space-y-2 text-xs text-stone-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Keep it simple:</strong> Each component class should do only one main job.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Descriptive Names:</strong> Use clear nouns (like <code>UserAccount</code> or <code>ShoppingCart</code>).</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-700 mt-0.5 shrink-0" />
                  <span><strong>Hide the details:</strong> Keep raw data private inside the object to avoid accidental edits.</span>
                </li>
              </ul>
            </div>

            {/* Methods Column */}
            <div className="space-y-3 bg-stone-50/50 p-4 rounded-lg border border-stone-150/50">
              <h4 className="font-bold text-stone-800 text-xs border-b border-stone-150 pb-1 uppercase tracking-wide">
                Defining Actions & Methods
              </h4>
              <ul className="space-y-2 text-xs text-stone-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>One Task:</strong> Keep actions small and focused on executing a single specific task.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Action Words:</strong> Represent work using action verbs (like <code>saveFile</code> or <code>printChart</code>).</span>
                </li>
              </ul>
            </div>

            {/* Fields Column */}
            <div className="space-y-3 bg-stone-50/50 p-4 rounded-lg border border-stone-150/50">
              <h4 className="font-bold text-stone-800 text-xs border-b border-stone-150 pb-1 uppercase tracking-wide">
                Specifying Data Variables
              </h4>
              <ul className="space-y-2 text-xs text-stone-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Keep them safe:</strong> Restrict direct access to variables and use access points instead.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Simple Labels:</strong> State attributes as plain, humble words (like <code>userName</code> or <code>price</code>).</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Structural Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Use Cases block */}
          <div className="border border-stone-150 rounded-lg p-5">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wide flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-ivy-600" />
              1. Writing Use Cases
            </h4>
            <p className="text-xs text-stone-600 mb-3 leading-relaxed">
              Define what your portal needs to do by specifying step-by-step stories of human and system interactions. Every flow lists:
            </p>
            <div className="space-y-2 text-xs text-stone-600 pl-2 border-l-2 border-stone-200">
              <p>• <strong>Actors:</strong> The people or external machines interacting with your system.</p>
              <p>• <strong>Preconditions:</strong> What must already be true or prepared before this action begins.</p>
              <p>• <strong>Main Flow:</strong> The typical, successful sequence of user and system reactions step-by-step.</p>
              <p>• <strong>Postconditions:</strong> The final state or outcome the system is left in when done.</p>
            </div>
          </div>

          {/* CRC Cards block */}
          <div className="border border-stone-150 rounded-lg p-5">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wide flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-ivy-600" />
              2. Designing Class Cards (CRC)
            </h4>
            <p className="text-xs text-stone-600 mb-3 leading-relaxed">
              Organize your software structure using CRC (Class, Responsibility, Collaborator) cards. This bridges your simple descriptions with practical code design:
            </p>
            <div className="space-y-2 text-xs text-stone-600 pl-2 border-l-2 border-stone-200">
              <p>• <strong>Responsibilities:</strong> The core jobs and rules that this card or component class handles.</p>
              <p>• <strong>Collaborators:</strong> Other components that this card must work with to complete its tasks.</p>
              <p>• <strong>Work Linkages:</strong> Link each card directly to specific Use Cases to prove that your structure works.</p>
            </div>
          </div>
        </div>

        {/* Architecture Spotlight */}
        <div className="bg-stone-50/50 rounded-xl p-5 border border-stone-150">
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Layers className="h-4 w-4 text-ivy-600" />
            How the Automatic Diagram Generator Works
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed mb-4">
            Specify is built using clean and modular coding structures to guarantee that when you link your Use Cases and CRC Cards together, they translate smoothly into live scripts:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3.5 rounded-lg border border-stone-150/60 shadow-3xs">
              <span className="text-xs font-bold text-ivy-600 uppercase tracking-widest block mb-1">Component Lookup</span>
              <h5 className="font-bold text-stone-800 text-xs mb-1">Target Generators</h5>
              <p className="text-xs text-stone-500 leading-normal">
                Sets up the design layout depending on whether you choose PlantUML or Nomnoml.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-stone-150/60 shadow-3xs">
              <span className="text-xs font-bold text-ivy-600 uppercase tracking-widest block mb-1">Step-by-Step Build</span>
              <h5 className="font-bold text-stone-800 text-xs mb-1">Pipeline Pipeline</h5>
              <p className="text-xs text-stone-500 leading-normal">
                Assembles scripts in a clean sequence, building headers, actors, links, and footers.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-stone-150/60 shadow-3xs">
              <span className="text-xs font-bold text-ivy-600 uppercase tracking-widest block mb-1">Flexible Outlines</span>
              <h5 className="font-bold text-stone-800 text-xs mb-1">Format Styling</h5>
              <p className="text-xs text-stone-500 leading-normal">
                Bundles specific styles so you can switch layouts safely without losing any data.
              </p>
            </div>
          </div>
        </div>

        {/* Instructions footer widget */}
        <div className="bg-ivy-50 p-4 rounded-lg flex items-start gap-3 border border-ivy-100">
          <HelpCircle className="h-5 w-5 text-ivy-600 shrink-0 mt-0.5" id="help-footer-icon" />
          <div>
            <h5 className="font-bold text-ivy-800 text-xs mb-1">Quick Tip for Creating Diagrams</h5>
            <p className="text-xs text-ivy-700 leading-relaxed">
              To make system diagrams, visit a project and open the Diagrams Generator tab. You can copy the generated scripts instantly!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
