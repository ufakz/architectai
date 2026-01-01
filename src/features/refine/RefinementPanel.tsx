import React, { useState } from 'react';
import { CheckCircle, RefreshCcw, ArrowLeft, Layout, Layers } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import { Diagram } from '../../types';

interface RefinementPanelProps {
    diagrams: Diagram[];
    refinedImage: string;
    onAccept: () => void;
    onRetry: () => void;
    onBack: () => void;
    isLoading: boolean;
    activeDiagramId: string;
}

const RefinementPanel: React.FC<RefinementPanelProps> = ({
    diagrams,
    refinedImage,
    onAccept,
    onRetry,
    onBack,
    isLoading,
    activeDiagramId
}) => {
    // Default to the active diagram from previous step
    const [selectedDiagramId, setSelectedDiagramId] = useState<string>(activeDiagramId);

    const selectedDiagram = diagrams.find(d => d.id === selectedDiagramId) || diagrams[0];

    return (
        <div className="flex flex-col h-full gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
                {/* Original Sketches Column */}
                <div className="flex flex-col gap-3 min-h-0">
                    <h3 className="text-slate-900 text-sm font-semibold tracking-wide flex justify-between items-center">
                        <span>Original Sketches ({diagrams.length})</span>
                    </h3>

                    <div className="flex gap-4 h-full min-h-0">
                        {/* Selector Sidebar */}
                        <div className="w-48 flex flex-col gap-2 overflow-y-auto pr-2 min-h-0">
                            {diagrams.map(diagram => (
                                <button
                                    key={diagram.id}
                                    onClick={() => setSelectedDiagramId(diagram.id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg text-sm text-left transition-all border ${selectedDiagramId === diagram.id
                                        ? 'bg-white border-primary shadow-sm ring-1 ring-primary/20'
                                        : 'bg-white border-slate-200 hover:border-primary/50 text-slate-600'
                                        }`}
                                >
                                    <div className={`p-1.5 rounded-md ${selectedDiagramId === diagram.id ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {diagram.type === 'main' ? <Layout size={14} /> : <Layers size={14} />}
                                    </div>
                                    <span className={`font-medium truncate ${selectedDiagramId === diagram.id ? 'text-slate-900' : ''
                                        }`}>
                                        {diagram.name}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Selected Diagram View */}
                        <Card className="flex-1 p-0 overflow-hidden bg-white shadow-sm border-slate-200">
                            <div className="w-full h-full flex items-center justify-center p-4 bg-slate-50/50">
                                {selectedDiagram?.dataUrl ? (
                                    <img
                                        src={selectedDiagram.dataUrl}
                                        alt={selectedDiagram.name}
                                        className="max-w-full max-h-full object-contain mix-blend-multiply opacity-80"
                                    />
                                ) : (
                                    <div className="text-slate-400 text-sm">No sketch data</div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* AI Refined */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-primary text-sm font-semibold tracking-wide flex items-center gap-2">
                        Ai Refined Version
                        {isLoading && <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />}
                    </h3>
                    <Card className="flex-1 p-0 overflow-hidden bg-white shadow-md border-primary/20 relative ring-4 ring-primary/5">
                        <div className="w-full h-full flex items-center justify-center p-4 bg-white">
                            {isLoading ? (
                                <div className="flex flex-col items-center gap-4 text-slate-400">
                                    <div className="p-4 bg-primary/5 rounded-full">
                                        <RefreshCcw className="animate-spin text-primary" size={24} />
                                    </div>
                                    <p className="font-medium text-slate-500">Processing architecture...</p>
                                </div>
                            ) : refinedImage ? (
                                <img src={refinedImage} alt="Refined Diagram" className="max-w-full max-h-full object-contain" />
                            ) : (
                                <div className="text-red-500 font-medium text-sm">Failed to load image</div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <Button
                    onClick={onBack}
                    variant="ghost"
                    disabled={isLoading}
                    size="sm"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                </Button>

                <div className="flex gap-3">
                    <Button
                        onClick={onRetry}
                        variant="secondary"
                        disabled={isLoading}
                    >
                        <RefreshCcw size={18} className="mr-2" />
                        Regenerate
                    </Button>
                    <Button
                        onClick={onAccept}
                        variant="primary"
                        disabled={isLoading || !refinedImage}
                    >
                        <CheckCircle size={18} className="mr-2" />
                        Analyze Components
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RefinementPanel;
