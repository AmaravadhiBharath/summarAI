import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import ReactDOM from 'react-dom/client'
import './index.css'
import {
    Check, CheckCircle2, ChevronDown,
    Zap, Star, X, Globe, Code2,
    Layout, GitMerge
} from 'lucide-react'
import { legalContent } from './LegalContent'
import logo from './assets/logo-black.png'

// --- Utility Components ---

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

const Button = ({ children, className, variant = 'primary', onClick, icon: Icon }: { children: React.ReactNode, className?: string, variant?: 'primary' | 'secondary' | 'outline' | 'ghost', onClick?: () => void, icon?: any }) => {
    const baseStyles = "inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
    const variants = {
        primary: "bg-gray-950 text-white hover:bg-gray-800 shadow-sm hover:shadow-md",
        secondary: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm",
        outline: "bg-transparent text-gray-600 border border-gray-200 hover:text-gray-900 hover:bg-gray-50",
        ghost: "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    };

    return (
        <button onClick={onClick} className={cn(baseStyles, variants[variant], className)}>
            {children}
            {Icon && <Icon className="w-4 h-4 ml-2" />}
        </button>
    );
};

// --- Visual Components ---

const HeroVisual = () => {
    return (
        <div className="relative w-full max-w-5xl mx-auto mt-16 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden shadow-xl">
            <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-50 pointer-events-none" />

                {/* Left: Chaos */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 bg-white rounded-xl p-6 shadow-sm border border-gray-100 transform -rotate-2"
                >
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-xs text-gray-400 ml-2">chat_history.txt</span>
                    </div>
                    <div className="space-y-3 opacity-60">
                        <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex-shrink-0" />
                            <div className="space-y-2 w-full">
                                <div className="h-2 w-3/4 bg-gray-100 rounded" />
                                <div className="h-2 w-1/2 bg-gray-100 rounded" />
                            </div>
                        </div>
                        <div className="flex gap-3 flex-row-reverse">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0" />
                            <div className="space-y-2 w-full flex flex-col items-end">
                                <div className="h-2 w-2/3 bg-gray-100 rounded" />
                                <div className="h-2 w-full bg-gray-100 rounded" />
                                <div className="h-2 w-1/2 bg-gray-100 rounded" />
                            </div>
                        </div>
                        <div className="text-center text-xs text-gray-400 py-2 italic">(300+ messages hidden)</div>
                        <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex-shrink-0" />
                            <div className="space-y-2 w-full">
                                <div className="h-2 w-5/6 bg-gray-100 rounded" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right: Order */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative z-10 bg-white rounded-xl p-6 shadow-lg border border-gray-200"
                >
                    <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-black text-white p-1 rounded">
                                <Zap className="w-3 h-3" />
                            </div>
                            <span className="text-sm font-bold text-gray-900">SummarAI Output</span>
                        </div>
                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">Ready</span>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Executive Summary</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                The team decided to migrate to <strong>PostgreSQL</strong> for better relational data handling.
                                Auth will be handled via <strong>OAuth 2.0</strong> exclusively.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Action Items</h4>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-gray-600">
                                    <CheckCircle2 className="w-4 h-4 text-gray-900 mt-0.5" />
                                    <span>Update schema migration scripts</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-gray-600">
                                    <CheckCircle2 className="w-4 h-4 text-gray-900 mt-0.5" />
                                    <span>Deprecate legacy auth endpoints</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// --- Main Landing Component ---

const Landing = () => {
    const [activeModal, setActiveModal] = useState<keyof typeof legalContent | null>(null);
    const [activeFeature, setActiveFeature] = useState(0);

    const LegalModal = ({ isOpen, onClose, type }: { isOpen: boolean, onClose: () => void, type: keyof typeof legalContent | null }) => {
        if (!isOpen || !type) return null;
        const content = legalContent[type];
        return (
            <AnimatePresence>
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">{content.title}</h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="p-8 overflow-y-auto text-gray-600 leading-relaxed">{content.content}</div>
                    </motion.div>
                </div>
            </AnimatePresence>
        );
    };

    const features = [
        {
            title: 'Clear Instructions',
            desc: 'Turn entire conversations into single-step tasks. We parse the noise to find the signal.',
            icon: Layout
        },
        {
            title: 'Conflict Resolution',
            desc: 'Automatically resolves overrides. If you said "actually, use Python" halfway through, we know.',
            icon: GitMerge
        },
        {
            title: 'Integrated Everywhere',
            desc: 'Works across ChatGPT, Claude, Gemini, and Perplexity. One brain for all your tools.',
            icon: Globe
        }
    ];

    // @ts-ignore
    // @ts-ignore
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200 selection:text-black antialiased">
            <Toaster position="bottom-center" toastOptions={{ style: { background: '#111', color: '#fff' } }} />
            <LegalModal isOpen={!!activeModal} onClose={() => setActiveModal(null)} type={activeModal} />

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="SummarAI" className="h-9 w-auto" />
                        <span className="text-lg font-bold tracking-tight text-gray-900">SummarAI</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                        <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
                        <a href="#solutions" className="hover:text-gray-900 transition-colors">Solutions</a>
                        <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
                        <a href="#blog" className="hover:text-gray-900 transition-colors">Blog</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="primary"
                            className="px-5 py-2 text-sm rounded-lg font-medium"
                            onClick={() => window.open('https://chromewebstore.google.com/detail/opdaaehibnkaabelcjhoefnfmebciekj', '_blank')}
                        >
                            Install Now
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="pt-32">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-6 text-center pb-20">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]"
                    >
                        Your Data, Your Context, <br />
                        <span className="relative inline-block">
                            <span className="relative z-10">Your AI.</span>
                            <span className="absolute bottom-2 left-0 w-full h-6 bg-yellow-300 -z-0 -rotate-1"></span>
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-500 max-w-3xl mx-auto mb-10 leading-relaxed font-light"
                    >
                        SummarAI transforms long, messy AI conversations into clear summaries, resolved instructions, and actionable prompts — instantly.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                    >
                        <Button
                            variant="primary"
                            className="h-12 px-8 text-base"
                            onClick={() => window.open('https://chromewebstore.google.com/detail/opdaaehibnkaabelcjhoefnfmebciekj', '_blank')}
                        >
                            Get Started
                        </Button>
                        <Button
                            variant="secondary"
                            className="h-12 px-8 text-base"
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Book a Demo
                        </Button>
                    </motion.div>

                    <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 mb-16">
                        {[
                            { name: 'ChatGPT', logo: 'https://cdn.brandfetch.io/chatgpt.com/w/100/h/100' },
                            { name: 'Claude', logo: 'https://cdn.brandfetch.io/claude.ai/w/100/h/100' },
                            { name: 'Gemini', logo: 'https://cdn.brandfetch.io/google.com/w/100/h/100' },
                            { name: 'Perplexity', logo: 'https://cdn.brandfetch.io/perplexity.ai/w/100/h/100' },
                            { name: 'Meta AI', logo: 'https://cdn.brandfetch.io/meta.ai/w/100/h/100' },
                            { name: 'OpenAI', logo: 'https://cdn.brandfetch.io/openai.com/w/100/h/100' },
                            { name: 'Figma', logo: 'https://cdn.brandfetch.io/figma.com/w/100/h/100' },
                            { name: 'Bolt', logo: 'https://cdn.brandfetch.io/bolt.new/w/100/h/100' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 font-semibold text-lg text-gray-800">
                                <img src={item.logo} alt={item.name} className="w-6 h-6 object-contain" /> {item.name}
                            </div>
                        ))}
                    </div>

                    <HeroVisual />
                </section>

                {/* Metrics Strip */}
                <section className="bg-gray-950 text-white py-16">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                            {[
                                { val: "8x", label: "Faster Decisions" },
                                { val: "1.2K", label: "Summaries Generated" },
                                { val: "98%", label: "User Satisfaction" },
                                { val: "74%", label: "Less Rework" }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <div className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">{stat.val}</div>
                                    <div className="text-gray-400 font-medium">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-start">
                        <div>
                            <div className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Feature</div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Introducing SummarAI</h2>
                            <p className="text-lg text-gray-500 mb-10 leading-relaxed">
                                SummarAI reconciles conversation fragments, removes contradictions, and creates a live, searchable knowledge graph you can act on.
                            </p>

                            <div className="space-y-4">
                                {features.map((f, i) => (
                                    <div
                                        key={i}
                                        className={`p-6 rounded-xl border transition-all cursor-pointer ${activeFeature === i ? 'bg-gray-50 border-gray-200 shadow-sm' : 'bg-white border-transparent hover:bg-gray-50'}`}
                                        onClick={() => setActiveFeature(i)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900">{f.title}</h3>
                                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${activeFeature === i ? 'rotate-180' : ''}`} />
                                        </div>
                                        <AnimatePresence>
                                            {activeFeature === i && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <p className="text-gray-600 text-sm leading-relaxed pt-2">{f.desc}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10">
                                <Button variant="primary" onClick={() => window.open('https://chromewebstore.google.com/detail/opdaaehibnkaabelcjhoefnfmebciekj', '_blank')}>
                                    Try Our AI
                                </Button>
                            </div>
                        </div>

                        <div className="relative h-full min-h-[500px] bg-gray-50 rounded-2xl border border-gray-200 p-8 flex items-center justify-center">
                            {/* Dynamic Visual based on active feature */}
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={activeFeature}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 w-full max-w-md"
                                >
                                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                                        <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-white">
                                            {React.createElement(features[activeFeature].icon, { className: "w-5 h-5" })}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{features[activeFeature].title}</div>
                                            <div className="text-xs text-gray-500">Live Processing</div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-2 w-full bg-gray-100 rounded-full" />
                                        <div className="h-2 w-5/6 bg-gray-100 rounded-full" />
                                        <div className="h-2 w-4/6 bg-gray-100 rounded-full" />
                                    </div>
                                    <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <div className="text-xs font-mono text-gray-600">
                                            &gt; Analyzing context...<br />
                                            &gt; Found 3 conflicting intents.<br />
                                            &gt; <span className="text-green-600 font-bold">Resolved.</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </section>

                {/* Value Section */}
                <section className="py-24 bg-gray-50 border-y border-gray-200">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Rapid Prototyping</h3>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Build Faster, Smarter</h2>
                                <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                                    From idea to final output — in minutes, not hours. SummarAI captures intent across iterations so you never lose what you built.
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        "Extract intent from long conversations",
                                        "Remove duplicates and outdated instructions",
                                        "Ship with clarity and confidence"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                                                <Check className="w-3.5 h-3.5 text-gray-900" />
                                            </div>
                                            <span className="text-gray-700 font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-2 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                <div className="bg-gray-50 rounded-xl h-80 flex items-center justify-center">
                                    <div className="text-center">
                                        <Code2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <div className="text-sm text-gray-400 font-medium">Code Generated & Verified</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Integrations Grid */}
                <section id="solutions" className="py-24 max-w-7xl mx-auto px-6 text-center">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Supported Platforms</h3>
                    <h2 className="text-3xl font-bold text-gray-900 mb-16">Works Where You Work</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        {[
                            { name: 'ChatGPT', logo: 'https://cdn.brandfetch.io/chatgpt.com/w/100/h/100' },
                            { name: 'Claude', logo: 'https://cdn.brandfetch.io/claude.ai/w/100/h/100' },
                            { name: 'Gemini', logo: 'https://cdn.brandfetch.io/google.com/w/100/h/100' },
                            { name: 'Perplexity', logo: 'https://cdn.brandfetch.io/perplexity.ai/w/100/h/100' },
                            { name: 'Meta AI', logo: 'https://cdn.brandfetch.io/meta.ai/w/100/h/100' },
                            { name: 'OpenAI', logo: 'https://cdn.brandfetch.io/openai.com/w/100/h/100' },
                            { name: 'Figma', logo: 'https://cdn.brandfetch.io/figma.com/w/100/h/100' },
                            { name: 'Bolt', logo: 'https://cdn.brandfetch.io/bolt.new/w/100/h/100' }
                        ].map((platform, i) => (
                            <div key={i} className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-3">
                                <img src={platform.logo} alt={platform.name} className="w-10 h-10 object-contain" />
                                <span className="font-medium text-gray-700">{platform.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-24 bg-gray-50 border-t border-gray-200">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple Pricing, No Surprises</h2>
                            <p className="text-gray-500">Start for free, upgrade for power.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {/* Beginner */}
                            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Beginner</h3>
                                <div className="text-4xl font-bold text-gray-900 mb-2">$10<span className="text-base font-normal text-gray-500">/mo</span></div>
                                <p className="text-sm text-gray-500 mb-8">For individuals and students.</p>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center gap-3 text-sm text-gray-600"><Check className="w-4 h-4" /> AI Summarization</li>
                                    <li className="flex items-center gap-3 text-sm text-gray-600"><Check className="w-4 h-4" /> Basic History</li>
                                </ul>
                                <Button variant="outline" className="w-full">Get Started</Button>
                            </div>

                            {/* Pro */}
                            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-900 shadow-xl relative transform md:-translate-y-4">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-gray-900 text-xs font-bold px-3 py-1 rounded-full border border-gray-200 shadow-sm uppercase tracking-wide">Most Popular</div>
                                <h3 className="text-lg font-bold text-white mb-2">Pro</h3>
                                <div className="text-4xl font-bold text-white mb-2">$45<span className="text-base font-normal text-gray-400">/mo</span></div>
                                <p className="text-sm text-gray-400 mb-8">For creators and solo builders.</p>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4" /> Everything in Beginner</li>
                                    <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4" /> Context Resolution</li>
                                    <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4" /> Priority Support</li>
                                </ul>
                                <Button variant="primary" className="w-full bg-white text-gray-900 hover:bg-gray-100">Start Free Trial</Button>
                            </div>

                            {/* Team */}
                            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Team</h3>
                                <div className="text-4xl font-bold text-gray-900 mb-2">$120<span className="text-base font-normal text-gray-500">/mo</span></div>
                                <p className="text-sm text-gray-500 mb-8">For teams and startups.</p>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center gap-3 text-sm text-gray-600"><Check className="w-4 h-4" /> Everything in Pro</li>
                                    <li className="flex items-center gap-3 text-sm text-gray-600"><Check className="w-4 h-4" /> Team Collaboration</li>
                                    <li className="flex items-center gap-3 text-sm text-gray-600"><Check className="w-4 h-4" /> API Access</li>
                                </ul>
                                <Button variant="outline" className="w-full">Contact Sales</Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-24 max-w-5xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Testimonials</h3>
                        <h2 className="text-3xl font-bold text-gray-900">Trusted by Experts</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                quote: "SummarAI replaced hours of manual review. We now ship faster and with confidence.",
                                author: "Alex J.",
                                role: "Product Lead"
                            },
                            {
                                quote: "It feels like having a dedicated product manager who reads every conversation.",
                                author: "Maya T.",
                                role: "Engineering Manager"
                            }
                        ].map((t, i) => (
                            <div key={i} className="p-8 bg-white border border-gray-200 rounded-xl shadow-sm">
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-current text-gray-900" />)}
                                </div>
                                <p className="text-lg text-gray-800 font-medium mb-6 leading-relaxed">“{t.quote}”</p>
                                <div>
                                    <div className="font-bold text-gray-900">{t.author}</div>
                                    <div className="text-sm text-gray-500">{t.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Final CTA */}
                <section className="bg-gray-950 text-white py-24 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Work Smarter with AI?</h2>
                        <p className="text-xl text-gray-400 mb-10 font-light">
                            Let SummarAI handle the repetitive context so you can focus on shipping value.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button variant="primary" className="bg-white text-gray-900 hover:bg-gray-100 h-14 px-8 text-lg" onClick={() => window.open('https://chromewebstore.google.com/detail/opdaaehibnkaabelcjhoefnfmebciekj', '_blank')}>
                                Start for Free
                            </Button>
                            <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-900 h-14 px-8 text-lg">
                                Book a Meeting
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 py-16">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                            <div className="col-span-2 md:col-span-1">
                                <div className="flex items-center gap-2 mb-4">
                                    <img src={logo} alt="SummarAI" className="h-7 w-auto" />
                                    <span className="font-bold text-gray-900">SummarAI</span>
                                </div>
                                <p className="text-sm text-gray-500">© {new Date().getFullYear()} SummarAI. All rights reserved.<br />Cursor Layout LLP</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-4">Company</h4>
                                <ul className="space-y-2 text-sm text-gray-500">
                                    <li><a href="#" className="hover:text-gray-900">About</a></li>
                                    <li><a href="#" className="hover:text-gray-900">Careers</a></li>
                                    <li><a href="#" className="hover:text-gray-900">Blog</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-4">Resources</h4>
                                <ul className="space-y-2 text-sm text-gray-500">
                                    <li><a href="#" className="hover:text-gray-900">Docs</a></li>
                                    <li><a href="#" className="hover:text-gray-900">API</a></li>
                                    <li><a href="#" className="hover:text-gray-900">Tutorials</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-4">Community</h4>
                                <ul className="space-y-2 text-sm text-gray-500">
                                    <li><a href="#" className="hover:text-gray-900">Support</a></li>
                                    <li><button onClick={() => setActiveModal('privacy')} className="hover:text-gray-900">Privacy</button></li>
                                    <li><button onClick={() => setActiveModal('terms')} className="hover:text-gray-900">Terms</button></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Landing />
    </React.StrictMode>,
)
