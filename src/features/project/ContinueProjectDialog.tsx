import React, { useEffect, useState } from 'react';
import { X, Folder, Loader2, RefreshCw, Calendar, Lock, Globe } from 'lucide-react';
import { Card, Button } from '../../components/ui';
import { GitHubAuth, GitHubRepo } from '../../types/projectTypes';
import { listAichitectRepos } from '../../services/githubService';

interface ContinueProjectDialogProps {
    isOpen: boolean;
    auth: GitHubAuth;
    onClose: () => void;
    onSelect: (repo: GitHubRepo) => void;
}

export default function ContinueProjectDialog({
    isOpen,
    auth,
    onClose,
    onSelect,
}: ContinueProjectDialogProps) {
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadRepos();
        }
    }, [isOpen]);

    const loadRepos = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const results = await listAichitectRepos(auth);
            setRepos(results);
        } catch (err: any) {
            setError(err.message || 'Failed to load projects');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = () => {
        if (selectedRepo) {
            onSelect(selectedRepo);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Dialog */}
            <Card className="relative w-full max-w-xl bg-white shadow-2xl animate-in zoom-in-95 fade-in duration-300 max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                            <Folder className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Continue Project</h2>
                            <p className="text-sm text-slate-500">Select a project to continue working on</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={loadRepos}
                            disabled={isLoading}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Refresh"
                        >
                            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-3" />
                            <p className="text-sm">Loading projects...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X className="w-6 h-6 text-red-500" />
                            </div>
                            <p className="text-red-600 mb-4">{error}</p>
                            <Button variant="secondary" size="sm" onClick={loadRepos}>
                                <RefreshCw size={14} className="mr-2" />
                                Try Again
                            </Button>
                        </div>
                    ) : repos.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Folder className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No projects yet</h3>
                            <p className="text-slate-500 text-sm max-w-xs mx-auto">
                                Create a new project to get started. Your projects will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {repos.map((repo) => (
                                <button
                                    key={repo.id}
                                    onClick={() => setSelectedRepo(repo)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedRepo?.id === repo.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-slate-900 truncate">
                                                    {repo.name.replace('aichitect-', '')}
                                                </h3>
                                                {repo.private ? (
                                                    <Lock size={12} className="text-slate-400 flex-shrink-0" />
                                                ) : (
                                                    <Globe size={12} className="text-slate-400 flex-shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 truncate">
                                                {repo.description || 'No description'}
                                            </p>
                                            <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                                                <Calendar size={12} />
                                                Updated {formatDate(repo.updatedAt)}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {repos.length > 0 && (
                    <div className="p-6 border-t border-slate-100 flex gap-3 flex-shrink-0">
                        <Button variant="secondary" className="flex-1" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-1"
                            onClick={handleSelect}
                            disabled={!selectedRepo}
                        >
                            Open Project
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}
