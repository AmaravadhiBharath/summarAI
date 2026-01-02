import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
    header?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children, header }) => {
    return (
        <div className="h-screen w-full bg-white text-gray-900 font-sans flex flex-col overflow-hidden">
            {header && (
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                    {header}
                </header>
            )}
            <main className="flex-1 flex flex-col p-4 relative overflow-hidden">
                {children}
            </main>
        </div>
    );
};
