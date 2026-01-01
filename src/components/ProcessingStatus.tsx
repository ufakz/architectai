import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { VersionStatus } from '../types';

interface ProcessingStatusProps {
    status: VersionStatus | null;
    versionNumber?: number;
    pendingCount?: number;
    onViewHistory?: () => void;
}

/**
 * Floating status indicator for background processing.
 * Shows current processing stage and provides quick actions.
 */
const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
    status,
    versionNumber,
    pendingCount = 0,
    onViewHistory
}) => {
    if (!status || status === 'complete') {
        // Show success briefly or nothing
        return null;
    }

    const getStatusContent = () => {
        switch (status) {
            case 'pending':
                return {
                    icon: <Loader2 className="animate-spin text-amber-500" size={18} />,
                    text: 'Queued for processing...',
                    bgColor: 'bg-amber-50 border-amber-200',
                    textColor: 'text-amber-700',
                };
            case 'refining':
                return {
                    icon: <Sparkles className="animate-pulse text-primary" size={18} />,
                    text: 'AI is refining your diagram...',
                    bgColor: 'bg-primary/5 border-primary/20',
                    textColor: 'text-primary',
                };
            case 'specifying':
                return {
                    icon: <Loader2 className="animate-spin text-blue-500" size={18} />,
                    text: 'Analyzing components...',
                    bgColor: 'bg-blue-50 border-blue-200',
                    textColor: 'text-blue-700',
                };
            case 'error':
                return {
                    icon: <AlertCircle className="text-red-500" size={18} />,
                    text: 'Processing failed',
                    bgColor: 'bg-red-50 border-red-200',
                    textColor: 'text-red-700',
                };
            default:
                return null;
        }
    };

    const content = getStatusContent();
    if (!content) return null;

    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${content.bgColor} animate-in slide-in-from-bottom-4 fade-in duration-300`}>
            {content.icon}
            <div className="flex flex-col">
                <span className={`text-sm font-medium ${content.textColor}`}>
                    {content.text}
                </span>
                {versionNumber && (
                    <span className="text-xs text-slate-500">
                        Version {versionNumber}
                        {pendingCount > 1 && ` (+${pendingCount - 1} in queue)`}
                    </span>
                )}
            </div>
            {onViewHistory && (
                <button
                    onClick={onViewHistory}
                    className="ml-2 text-xs font-medium text-primary hover:text-primary/80 hover:underline"
                >
                    View History
                </button>
            )}
        </div>
    );
};

export default ProcessingStatus;
