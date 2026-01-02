import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import '../src/index.css'
import { ChevronDown, ChevronUp, Shield, Zap, Layout, X } from 'lucide-react'
import { legalContent } from './LegalContent'

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

const LegalModal = ({ isOpen, onClose, type }: { isOpen: boolean, onClose: () => void, type: keyof typeof legalContent | null }) => {
    if (!isOpen || !type) return null;
    const content = legalContent[type];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">{content.title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {content.content}
                </div>
            </div>
        </div>
    );
};

const Welcome = () => {
    const [activeModal, setActiveModal] = useState<keyof typeof legalContent | null>(null);

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white">
            <LegalModal isOpen={!!activeModal} onClose={() => setActiveModal(null)} type={activeModal} />

            {/* Navbar */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
                <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/assets/logo-KdpuiT9U.png" alt="Logo" className="w-8 h-8 object-contain" />
                        <span className="font-bold tracking-tight">SummarAI</span>
                    </div>
                    <a
                        href="https://chromewebstore.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
                    >
                        Add to Chrome
                    </a>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-6 pt-32 pb-20 space-y-20">

                {/* Hero Section */}
                <div className="text-center space-y-6 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium mb-4">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Version 1.0 Available
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-bold tracking-tighter text-gray-900">
                        Your AI Companion <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">for the Web</span>
                    </h1>

                    <p className="text-xl text-gray-500 max-w-lg mx-auto leading-relaxed">
                        Generate summaries for lengthy conversations with AI in a click.
                    </p>

                    {/* CTA Card */}
                    <div className="max-w-sm mx-auto mt-10 p-6 bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50">
                        <div className="space-y-4">
                            <div className="text-center space-y-1">
                                <p className="text-2xl font-bold">Get Started</p>
                                <p className="text-sm text-gray-500">Install the Chrome extension to begin</p>
                            </div>
                            <div className="pt-4 space-y-3">
                                <button
                                    className="w-full px-6 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-lg shadow-lg shadow-black/20 transition-colors"
                                    onClick={() => {
                                        window.open('https://chromewebstore.google.com/detail/opdaaehibnkaabelcjhoefnfmebciekj', '_blank');
                                    }}
                                >
                                    Add to Chrome - It's Free
                                </button>
                                <p className="text-xs text-gray-400 text-center">
                                    Works with ChatGPT, Claude, Gemini & 20+ platforms
                                </p>
                            </div>
                        </div>
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
                            question="Is SummarAI free?"
                            answer="Yes! The core summarization features are free to use. We also offer a Pro plan for power users who need advanced features like image analysis and creative tones."
                        />
                        <FAQItem
                            question="How do I use it?"
                            answer="Simply install the Chrome extension, pin it to your toolbar, open the Side Panel, and click 'Generate Summary' on any webpage."
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
                <div className="text-center pt-10 border-t border-gray-100 space-y-4">
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
                        <button onClick={() => setActiveModal('contact')} className="hover:text-gray-900 transition-colors">Contact Us</button>
                        <button onClick={() => setActiveModal('terms')} className="hover:text-gray-900 transition-colors">Terms & Conditions</button>
                        <button onClick={() => setActiveModal('privacy')} className="hover:text-gray-900 transition-colors">Privacy Policy</button>
                        <button onClick={() => setActiveModal('refund')} className="hover:text-gray-900 transition-colors">Refund Policy</button>
                        <button onClick={() => setActiveModal('shipping')} className="hover:text-gray-900 transition-colors">Shipping Policy</button>
                    </div>
                    <p className="text-sm text-gray-400">&copy; 2025 Cursor Layout LLP. All rights reserved.</p>
                </div>

            </main>
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Welcome />
    </React.StrictMode>,
)
