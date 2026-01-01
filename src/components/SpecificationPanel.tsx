import React from 'react';
import { ComponentSpec } from '../types';
import { Server, Database, Globe, Box, Cpu, ChevronRight, Edit3 } from 'lucide-react';

interface SpecificationPanelProps {
  specs: ComponentSpec[];
  setSpecs: React.Dispatch<React.SetStateAction<ComponentSpec[]>>;
  onConfirm: () => void;
  isLoading: boolean;
}

const SpecificationPanel: React.FC<SpecificationPanelProps> = ({
  specs,
  setSpecs,
  onConfirm,
  isLoading
}) => {

  const handleNoteChange = (id: string, note: string) => {
    setSpecs(prev => prev.map(s => s.id === id ? { ...s, userNotes: note } : s));
  };

  // Helper to guess icon based on name/desc
  const getIcon = (name: string, desc: string) => {
    const text = (name + desc).toLowerCase();
    if (text.includes('database') || text.includes('db') || text.includes('store')) return <Database className="text-emerald-400" size={24} />;
    if (text.includes('server') || text.includes('api') || text.includes('backend')) return <Server className="text-blue-400" size={24} />;
    if (text.includes('client') || text.includes('ui') || text.includes('frontend') || text.includes('web')) return <Globe className="text-purple-400" size={24} />;
    if (text.includes('service') || text.includes('worker')) return <Cpu className="text-orange-400" size={24} />;
    return <Box className="text-slate-400" size={24} />;
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full">
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden flex flex-col flex-1">
        <div className="p-6 border-b border-slate-700 bg-slate-900/50">
          <h2 className="text-xl font-bold text-white mb-2">Review Component Specifications</h2>
          <p className="text-slate-400 text-sm">
            Gemini identified these components from your diagram. Add specific requirements or tech preferences for each before we generate the plan.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {specs.map((spec) => (
            <div key={spec.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-5 hover:border-blue-500/50 transition-colors group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 shadow-sm">
                  {getIcon(spec.name, spec.description)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg text-slate-200">{spec.name}</h3>
                    <span className="text-xs font-mono text-slate-500 px-2 py-1 bg-slate-800 rounded border border-slate-700">
                      ID: {spec.id.split('-')[1]}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4 leading-relaxed">{spec.description}</p>
                  
                  <div className="mt-3">
                    <label className="flex items-center gap-2 text-xs font-medium text-blue-400 mb-2 uppercase tracking-wide">
                      <Edit3 size={12} />
                      Your Requirements / Tech Choice
                    </label>
                    <textarea
                      value={spec.userNotes}
                      onChange={(e) => handleNoteChange(spec.id, e.target.value)}
                      placeholder={`e.g., Use PostgreSQL, or React with Tailwind. Constraints for ${spec.name}...`}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {specs.length === 0 && !isLoading && (
            <div className="text-center py-20 text-slate-500">
              No components detected. Try refining the diagram again.
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-900 border-t border-slate-700 flex justify-end">
           <button
            onClick={onConfirm}
            disabled={isLoading || specs.length === 0}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
              isLoading 
              ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/30'
            }`}
          >
            {isLoading ? 'Generating Plan...' : 'Generate Implementation Plan'}
            {!isLoading && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpecificationPanel;
