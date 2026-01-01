import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Download, Copy, Check, History, ChevronDown, ArrowLeft, Loader2 } from 'lucide-react';
import { DiagramVersion } from '../../types';
import { Button, Card } from '../../components/ui';

interface BuildViewProps {
    markdownContent: string;
    onRestart: () => void;
    versions: DiagramVersion[];
    currentVersionId: string;
    onVersionSelect: (versionId: string) => void;
    onBack: () => void;
    isLoading: boolean;
}

const BuildView: React.FC<BuildViewProps> = ({
    markdownContent,
    onRestart,
    versions,
    currentVersionId,
    onVersionSelect,
    onBack,
    isLoading
}) => {
    const [copied, setCopied] = React.useState(false);

    // Filter to only show versions that likely have specs/plans or are complete
    // We strictly only care about 'complete' ones for now as per logic, 
    // but the user might be viewing a historical one.
    // For build view, mostly we want ones that are 'complete'
    const validVersions = versions.filter(v => v.status === 'complete');

    const handleCopy = () => {
        navigator.clipboard.writeText(markdownContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([markdownContent], { type: 'text/markdown' });
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
        <div className="flex flex-col h-full max-w-5xl mx-auto w-full gap-6">
            <div className="flex items-start gap-4">
                <Button variant="ghost" size="sm" onClick={onBack} className="mt-1">
                    <ArrowLeft size={20} />
                </Button>
                <div className="flex-1 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Implementation Plan
                        </h2>
                        {validVersions.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                                    <History size={14} className="text-slate-500" />
                                    <select
                                        value={currentVersionId}
                                        onChange={(e) => onVersionSelect(e.target.value)}
                                        className="bg-transparent border-none p-0 text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer outline-none pr-6"
                                        style={{ appearance: 'none' }}
                                    >
                                        {validVersions.map((v) => (
                                            <option key={v.id} value={v.id}>
                                                Version {v.versionNumber} • {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="text-slate-400 -ml-5 pointer-events-none" />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={handleCopy}
                            variant="secondary"
                            size="sm"
                            disabled={isLoading}
                        >
                            {copied ? <Check size={16} className="text-green-600 mr-2" /> : <Copy size={16} className="mr-2" />}
                            {copied ? 'Copied' : 'Copy'}
                        </Button>
                        <Button
                            onClick={handleDownload}
                            variant="outline"
                            size="sm"
                            disabled={isLoading}
                        >
                            <Download size={16} className="mr-2" />
                            Download MD
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="flex-1 overflow-hidden flex flex-col shadow-xl shadow-slate-200/60 border-0 relative">
                {isLoading ? (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-slate-500">
                        <Loader2 size={48} className="animate-spin text-primary mb-4" />
                        <p className="text-lg font-medium text-slate-700">Generating Implementation Plan...</p>
                        <p className="text-sm text-slate-400 mt-2">This may take a few moments</p>
                    </div>
                ) : null}
                <div className="flex-1 overflow-y-auto p-10 custom-markdown bg-white">
                    <article className="prose prose-slate max-w-none 
                        prose-headings:font-bold prose-h1:text-slate-900 prose-h2:text-slate-800 prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-2 prose-h2:mt-8 prose-h2:mb-4
                        prose-a:text-primary hover:prose-a:text-primary/80 
                        prose-code:bg-slate-100 prose-code:text-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none 
                        prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-pre:shadow-lg prose-pre:rounded-xl
                        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                        prose-li:marker:text-slate-400
                        prose-table:border-collapse prose-table:border prose-table:border-slate-200 prose-table:shadow-sm
                        prose-th:bg-slate-50 prose-th:p-3 prose-th:border prose-th:border-slate-200 prose-th:text-slate-700
                        prose-td:p-3 prose-td:border prose-td:border-slate-200">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {markdownContent}
                        </ReactMarkdown>
                    </article>
                </div>
            </Card>

            <div className="flex justify-center pb-10">
                <Button
                    onClick={onRestart}
                    variant="ghost"
                    className="text-slate-500 hover:text-slate-900"
                >
                    Start New Project
                </Button>
            </div>
        </div>
    );
};

export default BuildView;
