import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { ExternalLink, Puzzle, Pin, PanelRight, CheckCircle2, Loader2 } from 'lucide-react';
import { signInWithGoogle } from './services/chrome-auth';
import toast, { Toaster } from 'react-hot-toast';
import logo from './assets/logo-black.png';

const Welcome = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
            toast.success("Successfully signed in!");
            // Optional: Close tab after successful login or redirect
            setTimeout(() => {
                // window.close(); // Can't close tab opened by script unless script opened it, but extensions can sometimes.
            }, 1500);
        } catch (error: any) {
            console.error("Login failed:", error);
            toast.error("Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col relative overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#f5f5f5_1px,transparent_1px),linear-gradient(to_bottom,#f5f5f5_1px,transparent_1px)] bg-[size:4rem_4rem] -z-10" />

            {/* Navbar */}
            <nav className="w-full px-8 py-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="SummarAI Logo" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-xl tracking-tight">SummarAI</span>
                </div>
                <a
                    href="https://superextension.in/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-black transition-colors"
                >
                    <ExternalLink size={16} />
                    Documentation
                </a>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left Column: Instructions */}
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
                                Thank you for <br />
                                installing SummarAI
                            </h1>
                            <p className="text-lg text-slate-500 max-w-md leading-relaxed">
                                You're just a few clicks away from AI-powered reading. Follow these steps to get started.
                            </p>
                        </div>

                        <div className="space-y-8">
                            {/* Step 1 */}
                            <div className="flex gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                                    <Puzzle className="w-6 h-6 text-slate-700" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg">Click Extensions Icon</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Look for the puzzle piece (<Puzzle className="w-3 h-3 inline mx-0.5" />) in your browser toolbar.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                                    <Pin className="w-6 h-6 text-slate-700" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg">Pin to Toolbar</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Find SummarAI in the list and click the pin icon.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                                    <PanelRight className="w-6 h-6 text-slate-700" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg">Open Side Panel</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Click the SummarAI icon to start summarizing.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Login Card */}
                    <div className="flex justify-center lg:justify-end">
                        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10 w-full max-w-md relative overflow-hidden">
                            {/* Card Content */}
                            <div className="text-center space-y-2 mb-8">
                                <h2 className="text-2xl font-bold">Get Started</h2>
                                <p className="text-slate-500 text-sm">Sign in to unlock your free daily summaries</p>
                            </div>

                            {/* Free Plan Box */}
                            <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex gap-4 mb-8">
                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-green-900 text-sm mb-1">Free Forever Plan</h3>
                                    <p className="text-green-700 text-xs leading-relaxed">
                                        Sign in and start surfing better<br />
                                        No credit card required
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-4">
                                <button
                                    onClick={handleLogin}
                                    disabled={isLoading}
                                    className="w-full bg-[#1A1D21] text-white h-12 rounded-xl font-medium hover:bg-black transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-900/10 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                    fill="#4285F4"
                                                />
                                                <path
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                    fill="#34A853"
                                                />
                                                <path
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                    fill="#FBBC05"
                                                />
                                                <path
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                    fill="#EA4335"
                                                />
                                            </svg>
                                            <span>Continue with Google</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => {
                                        toast.success("You're all set!");
                                        // window.close();
                                    }}
                                    className="w-full text-sm text-slate-500 hover:text-slate-800 underline decoration-slate-300 underline-offset-4 transition-colors"
                                >
                                    Continue without login
                                </button>
                            </div>

                            {/* Footer Terms */}
                            <div className="mt-8 text-center">
                                <p className="text-[10px] text-slate-400">
                                    By continuing, you agree to our{' '}
                                    <a href="#" className="underline hover:text-slate-600">Terms</a> &{' '}
                                    <a href="#" className="underline hover:text-slate-600">Privacy</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Supported Sites Marquee */}
            <div className="w-full py-12 overflow-hidden space-y-8 opacity-60 hover:opacity-100 transition-opacity duration-500 bg-white/50 backdrop-blur-sm border-y border-slate-50">
                {/* Row 1: Left to Right */}
                <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
                    {[...["Gemini", "Figma", "ChatGPT", "Lovable", "Bolt", "Claude"], ...["Gemini", "Figma", "ChatGPT", "Lovable", "Bolt", "Claude"], ...["Gemini", "Figma", "ChatGPT", "Lovable", "Bolt", "Claude"], ...["Gemini", "Figma", "ChatGPT", "Lovable", "Bolt", "Claude"]].map((site, i) => (
                        <div key={i} className="px-12 text-2xl font-bold text-slate-300 whitespace-nowrap hover:text-slate-900 transition-colors cursor-default">
                            {site}
                        </div>
                    ))}
                </div>

                {/* Row 2: Right to Left */}
                <div className="flex w-max animate-marquee-reverse hover:[animation-play-state:paused]">
                    {[...["Perplexity", "Cursor", "Base44", "Rocket", "Emergent"], ...["Perplexity", "Cursor", "Base44", "Rocket", "Emergent"], ...["Perplexity", "Cursor", "Base44", "Rocket", "Emergent"], ...["Perplexity", "Cursor", "Base44", "Rocket", "Emergent"]].map((site, i) => (
                        <div key={i} className="px-12 text-2xl font-bold text-slate-300 whitespace-nowrap hover:text-slate-900 transition-colors cursor-default">
                            {site}
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="w-full px-8 py-6 flex flex-col md:flex-row gap-6 text-[10px] text-slate-400 font-medium">
                <span>© 2025 CURSOR LAYOUT LLP</span>
                <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
            </footer>

            <Toaster position="bottom-center" />
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Welcome />
    </React.StrictMode>,
);
