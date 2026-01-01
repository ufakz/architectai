import React, { useState, useEffect, useRef } from 'react';
import { DiagramVersion, ComponentSpec } from '../../types';
import { Button, Card } from '../../components/ui';
import {
    ArrowLeft,
    Clock,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Play,
    Pause,
    ChevronRight,
    Image,
    FileText,
    Layers,
    Sparkles
} from 'lucide-react';

interface VersionHistoryPanelProps {
    versions: DiagramVersion[];
    onBack: () => void;
    onGenerateBuild: (version: DiagramVersion) => void;
    onUpdateVersion: (id: string, updates: Partial<DiagramVersion>) => void;
}

/**
 * Panel for viewing version history and timelapse of diagram evolution.
 */
const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
    versions,
    onBack,
    onGenerateBuild,
    onUpdateVersion
}) => {
    const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
        versions[versions.length - 1]?.id || null
    );
    const [isPlaying, setIsPlaying] = useState(false);
    const [viewType, setViewType] = useState<'refined' | 'original' | 'specs'>('refined');
    const playIntervalRef = useRef<number | null>(null);

    const selectedVersion = versions.find(v => v.id === selectedVersionId);

    // Timelapse playback
    useEffect(() => {
        if (isPlaying && versions.length > 1) {
            playIntervalRef.current = window.setInterval(() => {
                setSelectedVersionId(current => {
                    const currentIndex = versions.findIndex(v => v.id === current);
                    const nextIndex = (currentIndex + 1) % versions.length;
                    return versions[nextIndex].id;
                });
            }, 2000); // 2 seconds per version
        } else {
            if (playIntervalRef.current) {
                clearInterval(playIntervalRef.current);
            }
        }

        return () => {
            if (playIntervalRef.current) {
                clearInterval(playIntervalRef.current);
            }
        };
    }, [isPlaying, versions]);

    const getStatusIcon = (status: DiagramVersion['status']) => {
        switch (status) {
            case 'complete':
                return <CheckCircle2 className="text-emerald-500" size={14} />;
            case 'refining':
            case 'specifying':
            case 'pending':
                return <Loader2 className="animate-spin text-primary" size={14} />;
            case 'error':
                return <AlertCircle className="text-red-500" size={14} />;
        }
    };

    const getStatusText = (status: DiagramVersion['status']) => {
        switch (status) {
            case 'complete':
                return 'Complete';
            case 'refining':
                return 'Refining...';
            case 'specifying':
                return 'Analyzing...';
            case 'pending':
                return 'Pending';
            case 'error':
                return 'Failed';
        }
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSpecUpdate = (specId: string, field: keyof ComponentSpec, value: string) => {
        if (!selectedVersion) return;

        const newSpecs = selectedVersion.specs.map(s =>
            s.id === specId ? { ...s, [field]: value } : s
        );

        onUpdateVersion(selectedVersion.id, { specs: newSpecs });
    };

    if (versions.length === 0) {
        return (
            <div className="flex flex-col h-full items-center justify-center gap-6">
                <div className="p-6 bg-slate-100 rounded-full">
                    <Clock className="text-slate-400" size={48} />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Versions Yet</h3>
                    <p className="text-slate-500 max-w-md">
                        Start drawing on the canvas and click "Update" to create your first version.
                    </p>
                </div>
                <Button onClick={onBack} variant="primary">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Canvas
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button onClick={onBack} variant="ghost" size="sm">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Canvas
                    </Button>
                    <div className="h-6 w-px bg-slate-200" />
                    <h2 className="text-xl font-bold text-slate-900">
                        Version History
                        <span className="ml-2 text-sm font-normal text-slate-500">
                            ({versions.length} version{versions.length !== 1 ? 's' : ''})
                        </span>
                    </h2>
                </div>

                {/* Timelapse Controls */}
                {versions.length > 1 && (
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setIsPlaying(!isPlaying)}
                            variant={isPlaying ? 'primary' : 'secondary'}
                            size="sm"
                        >
                            {isPlaying ? <Pause size={16} className="mr-2" /> : <Play size={16} className="mr-2" />}
                            {isPlaying ? 'Pause' : 'Play Timelapse'}
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Version Timeline */}
                <div className="w-64 flex flex-col gap-2 overflow-y-auto pr-2">
                    {versions.map((version, index) => (
                        <button
                            key={version.id}
                            onClick={() => {
                                setIsPlaying(false);
                                setSelectedVersionId(version.id);
                            }}
                            className={`relative flex items-start gap-3 p-3 rounded-xl text-left transition-all border ${selectedVersionId === version.id
                                ? 'bg-white border-primary shadow-md ring-2 ring-primary/20'
                                : 'bg-white border-slate-200 hover:border-primary/40 hover:shadow-sm'
                                }`}
                        >
                            {/* Timeline connector */}
                            {index < versions.length - 1 && (
                                <div className="absolute left-[26px] top-12 w-0.5 h-[calc(100%-8px)] bg-slate-200" />
                            )}

                            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${selectedVersionId === version.id
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 text-slate-600'
                                }`}>
                                {version.versionNumber}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {getStatusIcon(version.status)}
                                    <span className="text-xs font-medium text-slate-500">
                                        {getStatusText(version.status)}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400">
                                    {formatTime(version.timestamp)}
                                </p>
                                {version.status === 'complete' && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        {version.specs.length} component{version.specs.length !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Version Detail */}
                <div className="flex-1 flex flex-col gap-4 min-h-0">
                    {selectedVersion && (
                        <>
                            {/* View Type Tabs */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewType('refined')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewType === 'refined'
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/40'
                                        }`}
                                >
                                    <Sparkles size={14} />
                                    AI Refined
                                </button>
                                <button
                                    onClick={() => setViewType('original')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewType === 'original'
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/40'
                                        }`}
                                >
                                    <Image size={14} />
                                    Original ({selectedVersion.diagrams.length})
                                </button>
                                <button
                                    onClick={() => setViewType('specs')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewType === 'specs'
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/40'
                                        }`}
                                >
                                    <FileText size={14} />
                                    Components ({selectedVersion.specs.length})
                                </button>
                            </div>

                            {/* Content Area */}
                            <Card className="flex-1 overflow-hidden bg-white border-slate-200">
                                {viewType === 'refined' && (
                                    <div className="w-full h-full flex items-center justify-center p-6 bg-slate-50">
                                        {selectedVersion.status === 'complete' && selectedVersion.refinedImage ? (
                                            <img
                                                src={selectedVersion.refinedImage}
                                                alt={`Refined Version ${selectedVersion.versionNumber}`}
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        ) : selectedVersion.status === 'error' ? (
                                            <div className="flex flex-col items-center gap-4 text-red-500">
                                                <AlertCircle size={48} />
                                                <p className="font-medium">{selectedVersion.error || 'Processing failed'}</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4 text-slate-400">
                                                <div className="p-4 bg-primary/5 rounded-full">
                                                    <Loader2 className="animate-spin text-primary" size={32} />
                                                </div>
                                                <p className="font-medium text-slate-500">
                                                    {getStatusText(selectedVersion.status)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {viewType === 'original' && (
                                    <div className="w-full h-full p-6 overflow-y-auto">
                                        <div className="grid grid-cols-2 gap-4">
                                            {selectedVersion.diagrams.map((diagram) => (
                                                <div
                                                    key={diagram.id}
                                                    className="aspect-video rounded-lg overflow-hidden border border-slate-200 bg-white"
                                                >
                                                    {diagram.dataUrl ? (
                                                        <img
                                                            src={diagram.dataUrl}
                                                            alt={diagram.name}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                                                            No image
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                                                        <p className="text-white text-xs font-medium flex items-center gap-1">
                                                            <Layers size={12} />
                                                            {diagram.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {viewType === 'specs' && (
                                    <div className="w-full h-full p-6 overflow-y-auto">
                                        {selectedVersion.specs.length > 0 ? (
                                            <div className="space-y-4">
                                                {selectedVersion.specs.map((spec) => (
                                                    <div
                                                        key={spec.id}
                                                        className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-primary/30 transition-colors group"
                                                    >
                                                        <div className="flex flex-col gap-3">
                                                            {/* Editable Header */}
                                                            <div className="flex items-start gap-2">
                                                                <input
                                                                    defaultValue={spec.name}
                                                                    onBlur={(e) => handleSpecUpdate(spec.id, 'name', e.target.value)}
                                                                    className="flex-1 bg-transparent font-bold text-slate-800 text-lg border-none p-0 focus:ring-0 placeholder:text-slate-400"
                                                                    placeholder="Component Name"
                                                                />
                                                            </div>

                                                            {/* Editable Description */}
                                                            <textarea
                                                                defaultValue={spec.description}
                                                                onBlur={(e) => handleSpecUpdate(spec.id, 'description', e.target.value)}
                                                                className="w-full bg-transparent text-sm text-slate-600 border-none p-0 focus:ring-0 resize-none placeholder:text-slate-400"
                                                                rows={2}
                                                                placeholder="Component role and description..."
                                                            />

                                                            {/* Tech Stack / Notes */}
                                                            <div className="bg-white p-3 rounded-lg border border-slate-100 focus-within:ring-1 focus-within:ring-primary/30 transition-all">
                                                                <label className="block text-xs font-bold text-primary mb-1 uppercase tracking-wide">
                                                                    Tech Stack & Preferences
                                                                </label>
                                                                <textarea
                                                                    defaultValue={spec.userNotes}
                                                                    onBlur={(e) => handleSpecUpdate(spec.id, 'userNotes', e.target.value)}
                                                                    placeholder="e.g. React, Node.js, PostgreSQL, specific constraints..."
                                                                    className="w-full bg-transparent border-0 p-0 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-0 resize-y"
                                                                    rows={2}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : selectedVersion.status === 'complete' ? (
                                            <div className="h-full flex items-center justify-center text-slate-400">
                                                No components detected
                                            </div>
                                        ) : (
                                            <div className="h-full flex items-center justify-center">
                                                <Loader2 className="animate-spin text-primary" size={24} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>

                            {/* Actions */}
                            {selectedVersion.status === 'complete' && (
                                <div className="flex justify-end">
                                    <Button
                                        onClick={() => onGenerateBuild(selectedVersion)}
                                        variant="primary"
                                        size="lg"
                                        className="shadow-lg shadow-primary/20"
                                    >
                                        Generate Build Plan
                                        <ChevronRight size={18} className="ml-2" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VersionHistoryPanel;
