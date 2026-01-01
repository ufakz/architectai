import React, { ReactNode } from 'react';

interface HeaderProps {
    onSelectKey: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSelectKey }) => {
    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/60">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                        </svg>
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-slate-900">
                        Architect<span className="text-primary">AI</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500 font-medium hidden sm:block bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                        Gemini 2.5 & 3 Pro
                    </span>
                    <button
                        onClick={onSelectKey}
                        className="text-xs text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        Switch API Key
                    </button>
                </div>
            </div>
        </header>
    );
};

interface MainLayoutProps {
    children: ReactNode;
    onSelectKey: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, onSelectKey }) => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
            <Header onSelectKey={onSelectKey} />
            <main className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full">
                {children}
            </main>
        </div>
    );
};
