import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import ReactDOM from 'react-dom/client'
import './index.css'
import { signInWithGoogleWeb, subscribeToAuthChangesWeb, logoutWeb } from './services/firebase-web'
import type { User } from 'firebase/auth'
import { Check, Menu, X, Zap, Sparkles, Layers, Globe, Shield, Share2, ArrowRight } from 'lucide-react'
import { legalContent } from './LegalContent'
import logo from './assets/logo.png'

// --- Utility Components ---

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

const GlowButton = ({ children, className, onClick }: any) => (
    <button
        onClick={onClick}
        className={cn(
            "relative group cursor-pointer overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-white",
            className
        )}
    >
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#cbd5e1_0%,#0f172a_50%,#cbd5e1_100%)]" />
        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-medium text-slate-900 backdrop-blur-3xl transition-all group-hover:bg-slate-50 gap-2 border border-slate-200">
            {children}
        </span>
    </button>
);

// --- 3D Hero Components ---

const FloatingCard = ({ children, className, delay = 0, x = 0, y = 0, rotate = 0 }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 100, rotateX: 10, rotateY: 10 }}
        animate={{
            opacity: 1,
            y: [y, y - 10, y],
            rotateX: 0,
            rotateY: 0
        }}
        transition={{
            opacity: { duration: 0.8, delay },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: delay * 2 },
            rotateX: { duration: 0.8, delay },
            rotateY: { duration: 0.8, delay }
        }}
        style={{ x, rotate }}
        className={cn("absolute shadow-2xl rounded-2xl border border-slate-200 backdrop-blur-md bg-white/80 overflow-hidden", className)}
    >
        {children}
    </motion.div>
);

const Hero3D = () => {
    const [activeCard, setActiveCard] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveCard((prev) => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const cards = [
        {
            title: "Smart Actions",
            badge: "Actionable",
            badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
            content: (
                <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                        <div className="w-3 h-3 rounded-sm border border-slate-300"></div>
                        <span>Draft email to team</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                        <div className="w-3 h-3 rounded-sm border border-slate-300"></div>
                        <span>Add to Q4 Strategy Deck</span>
                    </div>
                </div>
            )
        },
        {
            title: "Time Saved",
            badge: "Efficiency",
            badgeColor: "bg-green-100 text-green-700 border-green-200",
            content: (
                <div className="flex flex-col items-center justify-center pt-2">
                    <span className="text-4xl font-bold text-slate-900">15m</span>
                    <span className="text-xs text-slate-500 mt-1">saved reading this article</span>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-green-500 w-[85%] h-full rounded-full"></div>
                    </div>
                </div>
            )
        },
        {
            title: "Connected Context",
            badge: "Knowledge",
            badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
            content: (
                <div className="space-y-3 pt-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-purple-50 rounded-md text-purple-600"><Layers className="w-3 h-3" /></div>
                        <div className="text-xs">
                            <p className="text-slate-900 font-medium">Project Alpha</p>
                            <p className="text-slate-500">Mentioned in 3 other docs</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-purple-50 rounded-md text-purple-600"><Globe className="w-3 h-3" /></div>
                        <div className="text-xs">
                            <p className="text-slate-900 font-medium">Competitor Analysis</p>
                            <p className="text-slate-500">Directly referenced</p>
                        </div>
                    </div>
                </div>
            )
        }
    ];
    return (
        <section className="relative min-h-[100vh] flex flex-col items-center pt-32 overflow-hidden bg-white">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-slate-200/40 rounded-full blur-[120px] mix-blend-multiply animate-blob"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-slate-300/40 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-2000"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay"></div>
            </div>

            {/* Text Content */}
            <div className="relative z-10 text-center max-w-4xl mx-auto px-6 mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 backdrop-blur-sm text-xs font-medium text-slate-600 mb-8"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
                    </span>
                    v2.0 is now live
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]"
                >
                    Turn messy AI conversations into <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 via-slate-900 to-slate-700">clear, usable summaries.</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto"
                >
                    SummarAI turns scattered tabs into a single, actionable and structured workflow. Built for focus.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <GlowButton onClick={() => window.open('https://chromewebstore.google.com/detail/opdaaehibnkaabelcjhoefnfmebciekj', '_blank')}>
                        Add to Chrome - It's Free
                    </GlowButton>
                </motion.div>
            </div>

            {/* 3D Visuals Container */}
            <div className="relative w-full max-w-7xl mx-auto h-[600px] perspective-1000">
                <motion.div
                    initial={{ rotateX: 20, opacity: 0 }}
                    animate={{ rotateX: 20, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="relative w-full h-full transform-style-3d"
                >
                    {/* Center Main Card (ChatGPT + Sidebar Mockup) */}
                    <FloatingCard className="w-[900px] h-[550px] left-1/2 -translate-x-1/2 top-0 z-20 bg-white" delay={0.2}>
                        <div className="h-full flex flex-col">
                            {/* Fake Browser Header */}
                            <div className="h-10 border-b border-slate-200 flex items-center px-4 gap-2 bg-slate-50">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                                    <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                                    <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                                </div>
                                <div className="ml-4 h-6 w-64 bg-white border border-slate-200 rounded-md flex items-center px-2 text-[10px] text-slate-500 shadow-sm">chatgpt.com</div>
                            </div>

                            {/* Browser Content */}
                            <div className="flex-1 flex overflow-hidden">
                                {/* ChatGPT Area (Left) */}
                                <div className="flex-1 flex flex-col border-r border-slate-200 relative bg-white">
                                    {/* ChatGPT Header */}
                                    <div className="h-12 border-b border-slate-100 flex items-center px-4 justify-between">
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                            <span>ChatGPT 4.0</span>
                                            <span className="text-xs text-slate-400">▼</span>
                                        </div>
                                        <Share2 className="w-4 h-4 text-slate-400" />
                                    </div>

                                    {/* Chat Messages */}
                                    <div className="flex-1 p-8 space-y-8">
                                        {/* User Message */}
                                        <div className="flex gap-4 justify-end">
                                            <div className="bg-slate-100 text-slate-800 px-4 py-3 rounded-2xl rounded-tr-sm max-w-[80%] text-sm leading-relaxed border border-slate-200">
                                                Analyze the key themes in this article about AI adoption.
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600 font-bold border border-slate-300">U</div>
                                        </div>

                                        {/* AI Response */}
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 border border-green-200">
                                                <Sparkles className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div className="space-y-3 text-sm text-slate-700 max-w-[90%]">
                                                <p>Based on the text, here are the primary themes:</p>
                                                <ul className="list-disc pl-4 space-y-2 text-slate-600">
                                                    <li><strong className="text-slate-900">Rapid Acceleration:</strong> AI tools are being integrated faster than predicted.</li>
                                                    <li><strong className="text-slate-900">Privacy Concerns:</strong> Data security remains a top barrier for enterprise adoption.</li>
                                                    <li><strong className="text-slate-900">Workforce Shift:</strong> Focus is shifting from replacement to augmentation.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Input Area */}
                                    <div className="p-4 mt-auto">
                                        <div className="h-12 bg-white border border-slate-200 rounded-full flex items-center px-4 gap-3 shadow-sm">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><span className="text-xs">+</span></div>
                                            <div className="flex-1 text-sm text-slate-400">Message ChatGPT...</div>
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><ArrowRight className="w-4 h-4 text-slate-400" /></div>
                                        </div>
                                    </div>
                                </div>

                                {/* SummarAI Sidebar (Right) */}
                                <div className="w-[300px] flex flex-col bg-slate-50 border-l border-slate-200">
                                    {/* Sidebar Header */}
                                    <div className="h-12 border-b border-slate-200 flex items-center justify-between px-4 bg-white">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-black rounded flex items-center justify-center">
                                                <img src={logo} className="w-3 h-3 invert" alt="logo" />
                                            </div>
                                            <span className="font-semibold text-sm text-slate-900">SummarAI</span>
                                        </div>
                                        <X className="w-4 h-4 text-slate-400" />
                                    </div>

                                    {/* Sidebar Content */}
                                    <div className="flex-1 p-4 flex flex-col gap-4">
                                        {/* Main Action Area */}
                                        <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center p-4 gap-3 group hover:border-slate-400 transition-colors cursor-pointer bg-white">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Zap className="w-6 h-6 text-slate-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">Ready to generate</p>
                                                <p className="text-xs text-slate-500 mt-1">Click to summarize this chat</p>
                                            </div>
                                        </div>

                                        {/* Settings / Toggles */}
                                        <div className="space-y-3 mt-auto">
                                            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-3 shadow-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-slate-500">Alignment</span>
                                                    <div className="flex gap-1">
                                                        <div className="p-1 rounded bg-slate-100 text-slate-900 border border-slate-200"><Layers className="w-3 h-3" /></div>
                                                        <div className="p-1 rounded hover:bg-slate-50 text-slate-400"><Globe className="w-3 h-3" /></div>
                                                    </div>
                                                </div>
                                                <div className="h-px bg-slate-100"></div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded border border-slate-300"></div>
                                                    <span className="text-xs text-slate-500">Include AI responses</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FloatingCard>

                    {/* Right Floating Card (Intent) */}
                    {/* Right Floating Card (Dynamic Carousel) */}
                    <FloatingCard className="w-[320px] h-[200px] right-[5%] top-[20%] z-30" delay={0.6} rotate={5}>
                        <div className="p-5 h-full relative">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeCard}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="h-full"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-slate-900">{cards[activeCard].title}</span>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${cards[activeCard].badgeColor}`}>
                                            {cards[activeCard].badge}
                                        </span>
                                    </div>
                                    {cards[activeCard].content}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </FloatingCard>

                </motion.div>
            </div>

            {/* Gradient Fade at bottom to blend with next section */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-50"></div>
        </section>
    );
};

// --- Light Feature Components ---

const FeatureCard = ({ title, description, icon: Icon, className }: any) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={cn(
            "relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-lg transition-all hover:shadow-xl group",
            className
        )}
    >
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-transparent to-slate-50 opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-900 border border-slate-200">
            <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-3 text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
    </motion.div>
);

// --- Main Landing Component ---

const Landing = () => {
    const [user, setUser] = useState<User | null>(null);
    const [activeModal, setActiveModal] = useState<keyof typeof legalContent | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeToAuthChangesWeb((u) => setUser(u));
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        try { await signInWithGoogleWeb(); }
        catch (e) { console.error(e); }
    };

    const handleLogout = async () => {
        await logoutWeb();
    };

    const LegalModal = ({ isOpen, onClose, type }: { isOpen: boolean, onClose: () => void, type: keyof typeof legalContent | null }) => {
        if (!isOpen || !type) return null;
        const content = legalContent[type];
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="flex items-center justify-between p-6 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900">{content.title}</h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                    </div>
                    <div className="p-8 overflow-y-auto text-slate-600 leading-relaxed">{content.content}</div>
                </motion.div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-200 selection:text-slate-900 overflow-x-hidden">
            <Toaster position="bottom-center" toastOptions={{ style: { background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0' } }} />
            <LegalModal isOpen={!!activeModal} onClose={() => setActiveModal(null)} type={activeModal} />

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="SummarAI" className="w-8 h-8" />
                        <span className="font-bold text-lg tracking-tight text-slate-900">SummarAI</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                        <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>


                        <button
                            onClick={() => window.open('https://chromewebstore.google.com/detail/opdaaehibnkaabelcjhoefnfmebciekj', '_blank')}
                            className="bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-slate-800 transition-colors font-medium"
                        >
                            Add to Chrome
                        </button>
                    </div>
                    <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}><Menu className="w-6 h-6" /></button>
                </div>
            </nav>

            <main className="relative">

                <Hero3D />

                {/* Infinite Marquee */}
                <section className="py-12 border-y border-slate-100 bg-slate-50/50 backdrop-blur-sm overflow-hidden mb-32">
                    <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Powering people at</p>
                    </div>
                    <div className="relative flex overflow-x-hidden group">
                        <div className="animate-marquee whitespace-nowrap flex gap-16 items-center opacity-40 grayscale transition-all duration-500">
                            {['Purdue', 'UMBC', 'Amazon', 'VIT', 'Nvidia', 'EY', 'Wipro', 'Deloitte', 'Purdue', 'UMBC', 'Amazon', 'VIT'].map((name, i) => (
                                <span key={i} className="text-2xl font-bold text-slate-900 mx-4">{name}</span>
                            ))}
                        </div>
                        <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex gap-16 items-center opacity-40 grayscale transition-all duration-500">
                            {['Purdue', 'UMBC', 'Amazon', 'VIT', 'Nvidia', 'EY', 'Wipro', 'Deloitte', 'Purdue', 'UMBC', 'Amazon', 'VIT'].map((name, i) => (
                                <span key={i} className="text-2xl font-bold text-slate-900 mx-4">{name}</span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="max-w-7xl mx-auto px-6 mb-32" id="features">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-4xl font-bold text-slate-900 mb-6">Everything you need to <br />conquer information overload.</h2>
                        <p className="text-lg text-slate-600">We've built the ultimate toolkit for knowledge workers. Fast, private, and incredibly powerful.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FeatureCard
                            title="Instant Distillation"
                            description="Our AI engine strips away the fluff, ads, and SEO spam, delivering just the core insights in milliseconds."
                            icon={Zap}
                            className="md:col-span-2"
                        />
                        <FeatureCard
                            title="Privacy First"
                            description="Your browsing history never leaves your device. All processing happens locally or via secure tunnels."
                            icon={Shield}
                        />
                        <FeatureCard
                            title="Universal Context"
                            description="Works on PDFs, YouTube videos, Notion docs, and even behind paywalls."
                            icon={Globe}
                        />
                        <FeatureCard
                            title="Knowledge Graph"
                            description="SummarAI connects the dots between different articles, building a personal knowledge graph that grows with you."
                            icon={Layers}
                            className="md:col-span-2"
                        />
                    </div>
                </section>

                {/* Stats Section */}
                <section className="relative py-24 mb-32 border-y border-slate-100 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { value: "28hrs", label: "Saved per month" },
                                { value: "30%", label: "Faster learning" },
                                { value: "92%", label: "User satisfaction" }
                            ].map((stat, i) => (
                                <div key={i} className="text-center p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
                                    <div className="text-5xl font-bold text-slate-900 mb-2">{stat.value}</div>
                                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="relative py-32 overflow-hidden bg-slate-50">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-200/50 rounded-full blur-[100px]"></div>
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                        <h2 className="text-5xl sm:text-6xl font-bold mb-8 tracking-tight text-slate-900">Ready to upgrade your workflow?</h2>
                        <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">Join 1,000+ researchers, developers, and founders who save 10+ hours a week with SummarAI.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button
                                onClick={() => window.open('https://chromewebstore.google.com/detail/opdaaehibnkaabelcjhoefnfmebciekj', '_blank')}
                                className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-slate-800 transition-colors shadow-xl shadow-slate-200"
                            >
                                Add to Chrome - It's Free
                            </button>
                            <p className="text-sm text-slate-500">No credit card required</p>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-white text-slate-500 py-12 px-6 border-t border-slate-200">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <img src={logo} alt="SummarAI" className="w-6 h-6 opacity-50" />
                            <span className="font-medium text-slate-500">Cursor Layout LLP © 2025</span>
                        </div>
                        <div className="flex gap-8 text-sm">
                            <button onClick={() => setActiveModal('privacy')} className="hover:text-slate-900 transition-colors">Privacy</button>
                            <button onClick={() => setActiveModal('terms')} className="hover:text-slate-900 transition-colors">Terms</button>
                            <a href="mailto:hello@superextension.in" className="hover:text-slate-900 transition-colors">Contact</a>
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

import { registerServiceWorker } from './register-sw';
registerServiceWorker();
