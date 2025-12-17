import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { signInWithGoogleWeb, subscribeToAuthChangesWeb, logoutWeb } from './services/firebase-web'
import { type User } from 'firebase/auth'
import { ChevronDown, ChevronUp, Shield, Zap, Layout } from 'lucide-react'

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                className="w-full py-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors px-2 rounded-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-medium text-gray-900 text-sm">{question}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {isOpen && (
                <div className="pb-4 px-2 text-sm text-gray-600 leading-relaxed animate-fade-in">
                    {answer}
                </div>
            )}
        </div>
    );
};

const TextCycler = () => {
    return (
        <span className="animate-text-cycle"></span>
    );
};

const Landing = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToAuthChangesWeb((u) => {
            setUser(u);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        try {
            await signInWithGoogleWeb();
        } catch (e) {
            console.error(e);
            alert("Login failed. Check console.");
        }
    };

    const handleLogout = async () => {
        await logoutWeb();
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white">
            {/* Navbar */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
                <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/src/assets/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                        <span className="font-bold tracking-tight">Summarai</span>
                    </div>
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <img src={user.photoURL || ''} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200" />
                                <span className="text-sm font-medium hidden sm:block">{user.displayName}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-red-50 hover:border-red-100"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleLogin}
                            className="text-xs font-medium bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-6 pt-32 pb-20 space-y-20">

                {/* Hero Section */}
                <div className="text-center space-y-6 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium mb-4">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Live on Chrome Store
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-bold tracking-tighter text-gray-900">
                        Your AI Companion <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">for the Web</span>
                    </h1>

                    {/* Animated Text */}
                    <div className="h-12 flex items-center justify-center">
                        <h4 className="text-2xl font-bold text-gray-800 animate-fade-in">
                            <span className="inline-block min-w-[140px] text-center transition-all duration-500">
                                <TextCycler />
                            </span>
                        </h4>
                    </div>

                    <p className="text-xl text-gray-500 max-w-lg mx-auto leading-relaxed">
                        Generate summaries for lengthy conversations with AI in a click.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                        <a href="https://chrome.google.com/webstore/detail/YOUR-EXTENSION-ID" target="_blank" className="w-full sm:w-auto px-8 py-3 bg-black text-white rounded-xl font-medium shadow-lg shadow-black/20 hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2">
                            <img src="/src/assets/logo.png" className="w-5 h-5 invert" />
                            Add to Chrome
                        </a>
                        <a href="/app" className="w-full sm:w-auto px-8 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all active:scale-95">
                            Open Mobile App
                        </a>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                            <Zap className="w-5 h-5 text-gray-900" />
                        </div>
                        <h3 className="font-semibold">One Prompt to Rule Them All</h3>
                        <p className="text-sm text-gray-500">Unified interface for summarizing content from any AI platform.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                            <Layout className="w-5 h-5 text-gray-900" />
                        </div>
                        <h3 className="font-semibold">Side Panel</h3>
                        <p className="text-sm text-gray-500">Works alongside your content, never blocking it.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                            <Shield className="w-5 h-5 text-gray-900" />
                        </div>
                        <h3 className="font-semibold">Private & Secure</h3>
                        <p className="text-sm text-gray-500">Your data stays yours. We only process what you ask.</p>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-2xl mx-auto space-y-6">
                    <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                        <FAQItem
                            question="Is Summarai free?"
                            answer="Yes! The core summarization features are free to use. We also offer a Pro plan for power users who need advanced features like image analysis and creative tones."
                        />
                        <FAQItem
                            question="How do I use it?"
                            answer="Simply pin the extension to your Chrome toolbar, open the Side Panel, and click 'Generate Summary' on any webpage."
                        />
                        <FAQItem
                            question="Which sites are supported?"
                            answer="We support summarization on any website! We also have optimized extractors for ChatGPT, Claude, Gemini, and 20+ other platforms."
                        />
                        <FAQItem
                            question="Do I need to sign in?"
                            answer="No, you can use the basic features (3/day) without signing in. Sign in to unlock a higher limit (14/day) and save history."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-400 pt-10 border-t border-gray-100">
                    <p>&copy; 2025 Cursor Layout LLP. All rights reserved.</p>
                </div>

            </main>
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Landing />
    </React.StrictMode>,
)
