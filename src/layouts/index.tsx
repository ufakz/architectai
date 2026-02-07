import React, { ReactNode } from 'react';

export const Header: React.FC = () => {
    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/60">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Aichitect" className="w-9 h-9 rounded-xl" />
                    <h1 className="text-lg font-bold tracking-tight text-slate-900">
                        Aichitect
                    </h1>
                </div>
            </div>
        </header>
    );
};

interface MainLayoutProps {
    children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
            <Header />
            <main className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full">
                {children}
            </main>
        </div>
    );
};
