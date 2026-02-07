import React from 'react';
import { Github, Folder, Plus, Sparkles, ArrowRight, LogOut } from 'lucide-react';
import { Card, Button } from '../../components/ui';
import { GitHubAuth, GitHubRepo } from '../../types/projectTypes';

interface ProjectSelectorProps {
    auth: GitHubAuth | null;
    onConnectGitHub: () => void;
    onDisconnect: () => void;
    onNewProject: () => void;
    onContinueProject: () => void;
}

export default function ProjectSelector({
    auth,
    onConnectGitHub,
    onDisconnect,
    onNewProject,
    onContinueProject,
}: ProjectSelectorProps) {
    return (
        <div className="min-h-[600px] flex flex-col items-center justify-center p-8">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl mb-6 shadow-lg shadow-primary/10">
                    <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                    ArchitectAI
                </h1>
                <p className="text-lg text-slate-500 max-w-md">
                    From hand-drawn sketches to code
                </p>
            </div>

            {/* Auth Status */}
            {auth ? (
                <div className="flex items-center gap-3 mb-8 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
                    <img
                        src={auth.user.avatarUrl}
                        alt={auth.user.login}
                        className="w-8 h-8 rounded-full border-2 border-emerald-300"
                    />
                    <span className="text-sm font-medium text-emerald-700">
                        Connected as <strong>@{auth.user.login}</strong>
                    </span>
                    <button
                        onClick={onDisconnect}
                        className="p-1.5 text-emerald-600 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Disconnect"
                    >
                        <LogOut size={14} />
                    </button>
                </div>
            ) : null}

            {/* Main Actions */}
            {auth ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
                    {/* New Project Card */}
                    <Card
                        className="group relative overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
                        onClick={onNewProject}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative p-8">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <Plus className="w-7 h-7 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">
                                New Project
                            </h2>
                            <p className="text-slate-500 text-sm mb-4">
                                Start fresh with a new architecture project. Creates a GitHub repository to store your diagrams and plans.
                            </p>
                            <div className="flex items-center text-primary font-medium text-sm group-hover:translate-x-1 transition-transform">
                                Create project <ArrowRight className="ml-2 w-4 h-4" />
                            </div>
                        </div>
                    </Card>

                    {/* Continue Project Card */}
                    <Card
                        className="group relative overflow-hidden cursor-pointer border-2 border-transparent hover:border-slate-300 transition-all duration-300 hover:shadow-xl"
                        onClick={onContinueProject}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative p-8">
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <Folder className="w-7 h-7 text-slate-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">
                                Continue Project
                            </h2>
                            <p className="text-slate-500 text-sm mb-4">
                                Resume working on an existing project. Load diagrams and progress from your GitHub repository.
                            </p>
                            <div className="flex items-center text-slate-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                                Open project <ArrowRight className="ml-2 w-4 h-4" />
                            </div>
                        </div>
                    </Card>
                </div>
            ) : (
                /* Connect GitHub Button */
                <Card className="max-w-md w-full p-8 text-center">
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Github className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">
                        Connect with GitHub
                    </h2>
                    <p className="text-slate-500 text-sm mb-6">
                        Sign in with GitHub to create projects and store your architecture diagrams in repositories.
                    </p>
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full bg-slate-900 hover:bg-slate-800"
                        onClick={onConnectGitHub}
                    >
                        <Github className="w-5 h-5 mr-2" />
                        Connect GitHub
                    </Button>
                </Card>
            )}

            {/* Footer */}
            <p className="mt-12 text-xs text-slate-400 text-center">
                Your projects are stored securely in your own GitHub repositories
            </p>
        </div>
    );
}
