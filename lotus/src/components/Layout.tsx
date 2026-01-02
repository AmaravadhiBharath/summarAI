import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
    header?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children, header }) => {
    return (
        <div className="flex flex-col h-screen w-full font-sans overflow-hidden" style={{
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)'
        }}>
            {header && (
                <header className="flex items-center justify-between px-4 py-3 backdrop-blur-md sticky top-0 z-40" style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border-primary)'
                }}>
                    {header}
                </header>
            )}
            <main className="flex-1 flex flex-col p-4 relative overflow-hidden min-h-0">
                {children}
            </main>
        </div>
    );
};
