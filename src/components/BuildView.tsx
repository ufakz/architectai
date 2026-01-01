import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, Copy, Check } from 'lucide-react';

interface BuildViewProps {
  markdownContent: string;
  onRestart: () => void;
}

const BuildView: React.FC<BuildViewProps> = ({ markdownContent, onRestart }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown', });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'architecture-plan.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto w-full gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Implementation Plan
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors text-sm font-medium"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy MD'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors text-sm font-medium"
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="flex-1 overflow-y-auto p-8 custom-markdown">
          <article className="prose prose-invert prose-slate max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-white mb-6 pb-2 border-b border-slate-800" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold text-blue-300 mt-8 mb-4" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-xl font-medium text-indigo-300 mt-6 mb-3" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-6 space-y-1 text-slate-300" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-6 space-y-1 text-slate-300" {...props} />,
                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                p: ({ node, ...props }) => <p className="text-slate-300 leading-relaxed mb-4" {...props} />,
                code: ({ node, ...props }) => <code className="bg-slate-800 text-orange-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />,
                pre: ({ node, ...props }) => <pre className="bg-slate-950 border border-slate-800 p-4 rounded-lg overflow-x-auto my-6 text-sm" {...props} />,
                strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />,
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </article>
        </div>
      </div>

      <div className="flex justify-center pb-8">
        <button
          onClick={onRestart}
          className="text-slate-500 hover:text-white transition-colors text-sm font-medium"
        >
          Start New Project
        </button>
      </div>
    </div>
  );
};

export default BuildView;
