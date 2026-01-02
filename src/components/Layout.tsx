import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
    header?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children, header }) => {
    return (
        <div className="h-screen w-full bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans flex flex-col overflow-hidden transition-colors duration-200">
            {header && (
                <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between transition-colors duration-200">
                    {header}
                </header>
            )}
            <main className="flex-1 flex flex-col p-4 relative overflow-hidden min-h-0">
                {children}
            </main>
        </div>
    );
};
