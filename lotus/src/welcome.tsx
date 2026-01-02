import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster, toast } from 'react-hot-toast';
import { signInWithGoogle, logout, subscribeToAuthChanges, type ChromeUser } from './services/chrome-auth';
import { trackUserSignup } from './services/userTracking';
import { LogOut, Layout, ExternalLink, Check, Pin, PanelRight } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import logo from './assets/logo.png';
import './index.css';

function WelcomePage() {
    const [user, setUser] = useState<ChromeUser | null>(null);
    const [loading, setLoading] = useState(false);
    const { resolvedTheme } = useTheme(); // Initialize theme logic

    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges((u) => {
            setUser(u);
            if (u) {
                trackUserSignup(u);
            }
        });
        return () => unsubscribe();
    }, []);

    const [currentPhrase, setCurrentPhrase] = useState(0);
    const phrases = [
        "building faster",
        "building better",
        "surfing faster",
        "surfing better",
        "vibe faster",
        "vibe better",
        "build faster",
        "build better"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentPhrase((prev) => (prev + 1) % phrases.length);
        }, 2000); // Change every 2 seconds
        return () => clearInterval(interval);
    }, []);

    const handleLogin = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
            toast.success("Signed in successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Sign in failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logout();
            toast.success("Signed out.");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openSidePanel = async () => {
        try {
            // @ts-ignore
            if (chrome.sidePanel && chrome.sidePanel.open) {
                const window = await chrome.windows.getCurrent();
                if (window.id) {
                    // @ts-ignore
                    await chrome.sidePanel.open({ windowId: window.id });
                }
            } else {
                toast.error("Please click the SummarAI icon in your toolbar.");
            }
        } catch (error) {
            console.error("Failed to open side panel", error);
            toast.error("Please click the SummarAI icon in your toolbar.");
        }
    };

    return (
        <div className="h-screen bg-white dark:bg-black font-sans text-gray-900 dark:text-white flex flex-col relative overflow-hidden selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300">
            <Toaster position="bottom-center"
                toastOptions={{
                    style: {
                        background: resolvedTheme === 'dark' ? '#333' : '#fff',
                        color: resolvedTheme === 'dark' ? '#fff' : '#333',
                    }
                }}
            />



            {/* Top Navigation */}
            <nav className="relative z-10 px-8 py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <a href="https://www.superextension.in/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
                        <img src={logo} alt="SummarAI" className="w-9 h-9 brightness-0 dark:invert transition-all duration-300" />
                        <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">SummarAI</span>
                    </a>
                    <a
                        href="https://docs.google.com/document/d/1L1BC8IQIQW72Rdpqi1L7TPmeQyc2e9mQAxzExC5un_A/edit?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Documentation</span>
                    </a>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex items-center justify-center px-8">
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">



                    {/* Right Column: Auth Card */}
                    <div className="flex justify-center lg:justify-end animate-slide-up-fade" style={{ animationDelay: '0.1s' }}>
                        <div className="w-full max-w-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-zinc-800 p-8 relative overflow-hidden transition-all duration-300">

                            {/* Decorative gradient blob */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gray-50 dark:bg-zinc-800 rounded-full blur-3xl opacity-50 pointer-events-none transition-colors duration-300"></div>

                            {!user ? (
                                <div className="space-y-8 relative z-10">
                                    <div className="text-center space-y-2">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Get Started</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Sign in to unlock your free daily summaries</p>
                                    </div>

                                    <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-2 border-green-100 dark:border-green-800/50 flex items-start gap-4 transition-colors duration-300">
                                        <div className="mt-0.5 p-2 bg-green-600 dark:bg-green-500 rounded-full text-white shrink-0 shadow-lg">
                                            <Check className="w-4 h-4" strokeWidth={3} />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm font-bold text-green-900 dark:text-green-100">Free Forever Plan</div>
                                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                                Sign in and start{' '}
                                                <span
                                                    key={currentPhrase}
                                                    className="inline-block animate-zoom-fade"
                                                >
                                                    {phrases[currentPhrase]}
                                                </span>
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                No credit card required
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleLogin}
                                        disabled={loading}
                                        className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-semibold text-base hover:bg-gray-800 dark:hover:bg-gray-200 hover:scale-[1.02] transition-all active:scale-[0.98] shadow-lg shadow-black/10 dark:shadow-white/5 flex items-center justify-center gap-3 group"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                                                <span>Accessing your Chrome account...</span>
                                            </>
                                        ) : (
                                            <>
                                                <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5 bg-white rounded-full p-0.5 group-hover:scale-110 transition-transform" />
                                                <span>Continue with Google</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={openSidePanel}
                                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline transition-colors cursor-pointer bg-transparent border-none mx-auto block"
                                    >
                                        Continue without login
                                    </button>

                                    <p className="text-[10px] text-center text-gray-400 dark:text-gray-500">
                                        By continuing, you agree to our <a href="#" className="underline hover:text-gray-900 dark:hover:text-white">Terms</a> & <a href="#" className="underline hover:text-gray-900 dark:hover:text-white">Privacy</a>
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-8 relative z-10 text-center">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-700 p-1 mx-auto shadow-inner transition-colors duration-300">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-zinc-900">
                                            {user.picture ? (
                                                <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-300 dark:text-gray-600">
                                                    {user.name[0]}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user.name.split(' ')[0]}!</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">You're all set to go</p>
                                    </div>

                                    <div className="grid gap-3">
                                        <button
                                            onClick={openSidePanel}
                                            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-semibold text-base hover:bg-gray-800 dark:hover:bg-gray-200 hover:scale-[1.02] transition-all active:scale-[0.98] shadow-lg shadow-black/10 dark:shadow-white/5 flex items-center justify-center gap-2"
                                        >
                                            <Layout className="w-5 h-5" />
                                            <span>Open Side Panel</span>
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            disabled={loading}
                                            className="w-full py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 rounded-2xl font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span className="text-sm">Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 px-8 py-6">
                <div className="max-w-7xl mx-auto flex flex-wrap gap-4 items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                    <div className="flex gap-6 items-center">
                        <span>&copy; 2025 CURSOR LAYOUT LLP</span>
                        <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <WelcomePage />
    </React.StrictMode>
);
