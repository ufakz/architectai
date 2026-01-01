import React from 'react';
import { CheckCircle, RefreshCcw, ArrowLeft } from 'lucide-react';

interface RefinementPanelProps {
  originalImage: string;
  refinedImage: string;
  onAccept: () => void;
  onRetry: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const RefinementPanel: React.FC<RefinementPanelProps> = ({
  originalImage,
  refinedImage,
  onAccept,
  onRetry,
  onBack,
  isLoading
}) => {
  return (
    <div className="flex flex-col h-full gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Original Sketch */}
        <div className="flex flex-col bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-lg">
          <h3 className="text-slate-400 text-sm font-medium mb-3 uppercase tracking-wider">Original Sketch</h3>
          <div className="flex-1 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-slate-700/50">
            <img src={originalImage} alt="Original Sketch" className="max-w-full max-h-full object-contain opacity-80" />
          </div>
        </div>

        {/* AI Refined */}
        <div className="flex flex-col bg-slate-800 rounded-xl p-4 border border-blue-900/30 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>
          <h3 className="text-blue-400 text-sm font-medium mb-3 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Gemini Refined Output
          </h3>
          <div className="flex-1 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-slate-700/50 relative">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 text-slate-400 animate-pulse">
                <RefreshCcw className="animate-spin" size={32} />
                <p>Refining architecture...</p>
              </div>
            ) : refinedImage ? (
              <img src={refinedImage} alt="Refined Diagram" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-red-400">Failed to load image</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white flex items-center gap-2 px-4 py-2 hover:bg-slate-700 rounded-lg transition-colors"
          disabled={isLoading}
        >
          <ArrowLeft size={18} />
          Back to Sketch
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors font-medium border border-slate-600"
            disabled={isLoading}
          >
            <RefreshCcw size={18} />
            Regenerate
          </button>
          <button
            onClick={onAccept}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors font-semibold shadow-lg shadow-green-900/20"
            disabled={isLoading || !refinedImage}
          >
            <CheckCircle size={18} />
            Analyze Components
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefinementPanel;
