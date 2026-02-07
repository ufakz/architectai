import React, { useState } from 'react';
import { X, Github, Loader2, Lock, Globe } from 'lucide-react';
import { Card, Button } from '../../components/ui';

interface NewProjectDialogProps {
    isOpen: boolean;
    isLoading: boolean;
    onClose: () => void;
    onCreate: (name: string, description: string, isPrivate: boolean) => void;
}

export default function NewProjectDialog({
    isOpen,
    isLoading,
    onClose,
    onCreate,
}: NewProjectDialogProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(true);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate name
        const trimmedName = name.trim();
        if (!trimmedName) {
            setError('Project name is required');
            return;
        }

        if (trimmedName.length < 3) {
            setError('Project name must be at least 3 characters');
            return;
        }

        if (!/^[a-zA-Z0-9-_\s]+$/.test(trimmedName)) {
            setError('Project name can only contain letters, numbers, spaces, hyphens, and underscores');
            return;
        }

        onCreate(trimmedName, description.trim(), isPrivate);
    };

    const handleClose = () => {
        if (!isLoading) {
            setName('');
            setDescription('');
            setError(null);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={handleClose}
            />

            {/* Dialog */}
            <Card className="relative w-full max-w-lg bg-white shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Github className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">New Project</h2>
                            <p className="text-sm text-slate-500">Create a new architecture project</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Project Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Project Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Architecture Project"
                            disabled={isLoading}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:bg-slate-50 disabled:opacity-70"
                        />
                        <p className="mt-1.5 text-xs text-slate-400">
                            Repository: {name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-').replace(/^-|-$/g, '') || 'project-name'}
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of your project..."
                            rows={3}
                            disabled={isLoading}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none disabled:bg-slate-50 disabled:opacity-70"
                        />
                    </div>

                    {/* Visibility */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">
                            Repository Visibility
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setIsPrivate(true)}
                                disabled={isLoading}
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${isPrivate
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                    } disabled:opacity-70`}
                            >
                                <Lock size={18} />
                                <div className="text-left">
                                    <div className="font-medium text-sm">Private</div>
                                    <div className="text-xs opacity-70">Only you can see</div>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsPrivate(false)}
                                disabled={isLoading}
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${!isPrivate
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                    } disabled:opacity-70`}
                            >
                                <Globe size={18} />
                                <div className="text-left">
                                    <div className="font-medium text-sm">Public</div>
                                    <div className="text-xs opacity-70">Anyone can see</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            disabled={isLoading || !name.trim()}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Project'
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
