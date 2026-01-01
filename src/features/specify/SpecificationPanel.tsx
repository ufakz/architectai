import React from 'react';
import { ComponentSpec } from '../../types';
import { Server, Database, Globe, Box, Cpu, ChevronRight, Edit3 } from 'lucide-react';
import { Button, Card } from '../../components/ui';

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

    const getIcon = (name: string, desc: string) => {
        const text = (name + desc).toLowerCase();
        if (text.includes('database') || text.includes('db') || text.includes('store')) return <Database className="text-emerald-600" size={20} />;
        if (text.includes('server') || text.includes('api') || text.includes('backend')) return <Server className="text-blue-600" size={20} />;
        if (text.includes('client') || text.includes('ui') || text.includes('frontend') || text.includes('web')) return <Globe className="text-indigo-600" size={20} />;
        if (text.includes('service') || text.includes('worker')) return <Cpu className="text-orange-600" size={20} />;
        return <Box className="text-slate-500" size={20} />;
    };

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto w-full">
            <Card className="flex flex-col flex-1 overflow-hidden shadow-lg shadow-slate-200/50 border-0">
                <div className="p-8 border-b border-slate-100 bg-white">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Component Specifications</h2>
                    <p className="text-slate-500">
                        Review the identified components and add any specific technical requirements or constraints.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
                    {specs.map((spec) => (
                        <div key={spec.id} className="bg-white border boundary border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group">
                            <div className="flex items-start gap-5">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    {getIcon(spec.name, spec.description)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-lg text-slate-800">{spec.name}</h3>
                                        <span className="text-xs font-medium text-slate-400 px-2 py-1 bg-slate-50 rounded-lg">
                                            {spec.id.split('-')[1]}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 text-sm mb-5 leading-relaxed">{spec.description}</p>

                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                        <label className="flex items-center gap-2 text-xs font-semibold text-primary mb-2 uppercase tracking-wide">
                                            <Edit3 size={12} />
                                            Requirements Note
                                        </label>
                                        <textarea
                                            value={spec.userNotes}
                                            onChange={(e) => handleNoteChange(spec.id, e.target.value)}
                                            placeholder={`Add constraints or tech choices for ${spec.name}...`}
                                            className="w-full bg-transparent border-0 p-0 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-0 resize-y"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {specs.length === 0 && !isLoading && (
                        <div className="text-center py-24 text-slate-400">
                            No components detected. Please ensure your sketch is clear.
                        </div>
                    )}
                </div>

                <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading || specs.length === 0}
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto shadow-lg shadow-primary/20"
                    >
                        {isLoading ? 'Generating Plan...' : 'Generate Implementation Plan'}
                        {!isLoading && <ChevronRight size={20} className="ml-2" />}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default SpecificationPanel;
