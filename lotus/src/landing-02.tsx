import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import {
    ArrowRight,
    Check,
    Zap,
    Shield,
    Layout,
    FileText,
    Download,
    Globe,
    Cpu,
    MousePointer2,
    Sparkles,
    MessageSquare,
    Share2,
    Database,
    Lock,
    Search,
    Menu,
    X,
    BarChart3,
    PieChart,
    Activity,
    Clipboard,
    Clock
} from 'lucide-react'
import logo from './assets/logo.png'

const Landing02 = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const [wordIndex, setWordIndex] = useState(0);
    const words = ["Build", "Learn", "Surf", "Vibe"];

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % words.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-yellow-200 selection:text-black overflow-x-hidden">

            {/* Scroll Progress */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-[60]"
                style={{ scaleX }}
            />

            {/* Navbar (Reference Image 1) */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="font-bold text-2xl tracking-tight flex items-center gap-2">
                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-sm">S</div>
                            SummarAI
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                        <a href="#why" className="hover:text-black transition-colors">Why SummarAI</a>
                        <a href="#product" className="hover:text-black transition-colors">Product</a>
                        <a href="#solutions" className="hover:text-black transition-colors">Solutions</a>
                        <a href="#resources" className="hover:text-black transition-colors">Resources</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-slate-100 rounded-full">
                            <Search className="w-5 h-5 text-slate-500" />
                        </button>
                        <button
                            onClick={() => window.open('https://chromewebstore.google.com/detail/opdaaehibnkaabelcjhoefnfmebciekj', '_blank')}
                            className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all"
                        >
                            Try SummarAI
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section (Reference Image 1 & 3) */}
            <section className="pt-40 pb-20 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight leading-[1.1]">
                            Your context. Your <br />
                            data. <span className="relative inline-block">
                                <span className="relative z-10">Your AI.</span>
                                <span className="absolute bottom-2 left-0 w-full h-1/2 bg-yellow-400 -z-0 opacity-80"></span>
                            </span>
                        </h1>

                        <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
                            Take full control with the context intelligence layer where you can manage all your AI conversations with ease.
                        </p>

                        <div className="flex justify-center">
                            <button
                                onClick={() => window.open('https://chromewebstore.google.com/detail/opdaaehibnkaabelcjhoefnfmebciekj', '_blank')}
                                className="bg-blue-600 text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-2"
                            >
                                Explore Demo
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>

                    {/* Dashboard UI Composition (Reference Image Style) */}
                    {/* Dashboard UI Composition: ChatGPT + Extension Side Panel */}
                    <div className="mt-20 relative h-[550px] max-w-6xl mx-auto perspective-[2000px]">

                        {/* Main App Window (ChatGPT Style) */}
                        <motion.div
                            initial={{ opacity: 0, rotateX: 20, y: 50 }}
                            animate={{ opacity: 1, rotateX: 0, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[#0F1117] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden z-10 flex"
                        >
                            {/* Sidebar (Chat History) */}
                            <div className="w-64 bg-[#000000]/50 border-r border-slate-800 hidden md:flex flex-col p-4 gap-4">
                                <div className="h-8 w-24 bg-slate-800/50 rounded-md animate-pulse"></div>
                                <div className="space-y-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-4 w-full bg-slate-800/30 rounded-md"></div>
                                    ))}
                                </div>
                            </div>

                            {/* Main Chat Area */}
                            <div className="flex-1 flex flex-col relative bg-[#1A1D24]">
                                {/* Chat Header */}
                                <div className="h-14 border-b border-slate-800 flex items-center px-6 justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-200 font-medium">ChatGPT 4.0</span>
                                        <span className="text-slate-500 text-xs">▼</span>
                                    </div>
                                </div>

                                {/* Chat Messages */}
                                <div className="flex-1 p-8 space-y-8 overflow-hidden relative">
                                    {/* User Message */}
                                    <div className="flex gap-4 justify-end">
                                        <div className="bg-[#2A2D36] text-slate-200 p-4 rounded-2xl rounded-tr-sm max-w-[80%] text-sm leading-relaxed">
                                            Can you analyze these 40 customer feedback emails and tell me the top 3 recurring issues?
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white font-bold">U</div>
                                    </div>

                                    {/* AI Message (Simulated Loading/Typing) */}
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                                            <Sparkles size={14} />
                                        </div>
                                        <div className="space-y-2 w-full">
                                            <div className="h-4 w-3/4 bg-slate-700/50 rounded animate-pulse"></div>
                                            <div className="h-4 w-1/2 bg-slate-700/50 rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Input Area */}
                                <div className="p-6 border-t border-slate-800">
                                    <div className="h-12 bg-[#2A2D36] rounded-xl border border-slate-700 flex items-center px-4 text-slate-500 text-sm">
                                        Message ChatGPT...
                                    </div>
                                </div>

                                {/* Extension Side Panel Overlay */}
                                <motion.div
                                    initial={{ x: "100%" }}
                                    animate={{ x: 0 }}
                                    transition={{ delay: 1, duration: 0.6, ease: "circOut" }}
                                    className="absolute right-0 top-0 bottom-0 w-[320px] bg-[#0F1117]/95 backdrop-blur-xl border-l border-slate-700 shadow-[-20px_0_40px_rgba(0,0,0,0.5)] z-20 flex flex-col"
                                >
                                    {/* Extension Header */}
                                    <div className="h-14 border-b border-slate-800 flex items-center px-4 justify-between bg-gradient-to-r from-blue-600/10 to-transparent">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                                                <Zap size={14} className="text-white" />
                                            </div>
                                            <span className="text-white font-bold text-sm">SummarAI</span>
                                        </div>
                                        <div className="text-slate-500 hover:text-white cursor-pointer">×</div>
                                    </div>

                                    {/* Extension Content */}
                                    <div className="flex-1 p-5 space-y-6 overflow-y-auto">
                                        <div className="space-y-2">
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Summary</div>
                                            <div className="text-sm text-slate-200 leading-relaxed">
                                                Based on 40 emails, the top issues are:
                                            </div>
                                            <ul className="space-y-3 mt-2">
                                                {[
                                                    { title: "Login Failures", val: "45%" },
                                                    { title: "Slow Sync", val: "30%" },
                                                    { title: "Billing Errors", val: "25%" }
                                                ].map((item, i) => (
                                                    <li key={i} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="text-slate-300 font-medium">{item.title}</span>
                                                            <span className="text-blue-400">{item.val}</span>
                                                        </div>
                                                        <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-500" style={{ width: item.val }}></div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Extension Footer */}
                                    <div className="p-4 border-t border-slate-800">
                                        <button className="w-full bg-white text-black py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                                            <Clipboard size={16} />
                                            Copy to Clipboard
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Floating Stats (Left Side - Connected Line Style) */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-10 flex flex-col gap-6 z-0">
                            {/* Vertical Line */}
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "100%" }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-slate-700 to-transparent"
                            />

                            {[
                                { label: "40 prompts + 1 summary", icon: <Database size={14} />, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
                                { label: "22 mins saved", icon: <Clock size={14} />, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
                                { label: "Zero rework", icon: <Check size={14} />, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.2 + (i * 0.2) }}
                                    className={`relative ml-12 p-3 ${item.bg} backdrop-blur-md border ${item.border} rounded-xl shadow-lg flex items-center gap-3 w-48`}
                                >
                                    {/* Connector Dot */}
                                    <div className="absolute -left-[29px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#0F1117] border-2 border-slate-600"></div>

                                    <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center ${item.color}`}>
                                        {item.icon}
                                    </div>
                                    <span className="text-slate-300 text-xs font-bold">{item.label}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Copied Toast (Bottom Center) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2, duration: 0.5 }}
                            className="absolute left-1/2 bottom-0 -translate-x-1/2 bg-[#1A1D24] px-6 py-3 rounded-full border border-slate-700 shadow-2xl flex items-center gap-3 z-30"
                        >
                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                <Check size={14} />
                            </div>
                            <span className="text-white font-medium text-sm">Summary copied to clipboard</span>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stacked Cards Section: Dark Mode & Extension Vibe */}
            <section className="py-32 px-6 bg-[#0B0D13] overflow-hidden relative">
                {/* Ambient Background Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px] -z-10"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px] -z-10"></div>

                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <div className="flex justify-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center text-blue-400 shadow-lg shadow-blue-900/20"><Share2 size={20} /></div>
                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center text-purple-400 shadow-lg shadow-purple-900/20"><Activity size={20} /></div>
                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center text-green-400 shadow-lg shadow-green-900/20"><Zap size={20} /></div>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-bold mb-8 text-white tracking-tight">
                            <span className="inline-flex min-w-[140px] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={words[wordIndex]}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -20, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {words[wordIndex]}
                                    </motion.span>
                                </AnimatePresence>
                            </span>
                            your workflow <br />
                            <span className="text-slate-500">with intelligent context.</span>
                        </h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                            SummarAI seamlessly integrates into your browser, transforming overwhelming information into structured, actionable insights instantly.
                        </p>
                    </div>

                    {/* Dark Glass Stacked Visualization */}
                    <div className="relative h-[600px] w-full flex items-center justify-center perspective-[2000px]">

                        {/* Back Card: Raw Data (Dimmed) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, z: -100 }}
                            whileInView={{ opacity: 0.4, scale: 0.9, z: -50, y: -40 }}
                            transition={{ duration: 0.8 }}
                            className="absolute w-[400px] h-[500px] bg-[#1A1D24] rounded-3xl border border-slate-800 p-6 overflow-hidden"
                        >
                            <div className="space-y-4 opacity-50">
                                <div className="h-4 w-3/4 bg-slate-700 rounded animate-pulse"></div>
                                <div className="h-4 w-full bg-slate-700 rounded animate-pulse"></div>
                                <div className="h-4 w-5/6 bg-slate-700 rounded animate-pulse"></div>
                                <div className="h-4 w-full bg-slate-700 rounded animate-pulse"></div>
                                <div className="h-32 w-full bg-slate-800/50 rounded mt-4"></div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D13] to-transparent"></div>
                        </motion.div>

                        {/* Middle Card: Processing (Glow) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 0.7, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="absolute w-[400px] h-[500px] bg-[#15171E]/90 backdrop-blur-xl rounded-3xl border border-blue-500/30 p-6 overflow-hidden shadow-2xl shadow-blue-900/20"
                        >
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-20 h-20 rounded-full border-2 border-blue-500/20 flex items-center justify-center animate-[spin_3s_linear_infinite]">
                                    <div className="w-16 h-16 rounded-full border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent"></div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Front Card: The Extension UI (Hero) */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="relative z-30 w-[380px] bg-[#0F1117]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden flex flex-col"
                        >
                            {/* Extension Header */}
                            <div className="h-14 border-b border-slate-800 flex items-center px-5 justify-between bg-gradient-to-r from-blue-600/10 to-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                                        <Zap size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <span className="text-white font-bold text-sm block">SummarAI</span>
                                        <span className="text-slate-500 text-[10px] uppercase tracking-wider">Premium</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                    <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                </div>
                            </div>

                            {/* Extension Content */}
                            <div className="flex-1 p-6 space-y-6">
                                {/* Insight Block */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Core Insight</span>
                                        <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-1 rounded-full border border-blue-500/20">98% Confidence</span>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        The user retention rate has stabilized at <span className="text-white font-bold">45%</span>, indicating a successful onboarding optimization.
                                    </p>
                                </div>

                                {/* Action List */}
                                <div className="space-y-3">
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recommended Actions</div>
                                    {[
                                        { text: "Review churn metrics", icon: <Activity size={14} />, color: "text-purple-400" },
                                        { text: "Export weekly report", icon: <Download size={14} />, color: "text-green-400" },
                                        { text: "Schedule team sync", icon: <Clock size={14} />, color: "text-orange-400" }
                                    ].map((item, i) => (
                                        <div key={i} className="group flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                                            <div className={`w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center ${item.color}`}>
                                                {item.icon}
                                            </div>
                                            <span className="text-sm text-slate-400 group-hover:text-white transition-colors">{item.text}</span>
                                            <ArrowRight size={12} className="ml-auto text-slate-600 group-hover:text-slate-400" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Extension Footer */}
                            <div className="p-4 border-t border-slate-800 bg-[#0A0C10]/50">
                                <button className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/5">
                                    <Clipboard size={16} />
                                    Copy Summary
                                </button>
                            </div>
                        </motion.div>

                        {/* Floating Elements (Decorations) */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute right-[20%] top-[20%] bg-[#1A1D24] border border-slate-700 p-3 rounded-xl shadow-xl z-40 flex items-center gap-3"
                        >
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs text-slate-300 font-mono">Analysis Complete</span>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute left-[20%] bottom-[30%] bg-[#1A1D24] border border-slate-700 p-3 rounded-xl shadow-xl z-40 flex items-center gap-3"
                        >
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <Database size={14} />
                            </div>
                            <div className="text-xs">
                                <div className="text-slate-400">Sources Processed</div>
                                <div className="text-white font-bold">12 Documents</div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* Pipeline / Features Section (Reference Image 5) */}
            <section className="py-32 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <div className="inline-block px-6 py-2 rounded-full bg-yellow-400 text-black font-bold text-sm mb-8">
                            Features
                        </div>
                        <h2 className="text-5xl md:text-6xl font-bold mb-6">
                            Manage pipelines to <br />
                            business requirements
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left Card: Drive Down Costs */}
                        <div className="bg-slate-50 rounded-[2.5rem] p-12 flex flex-col items-center text-center hover:shadow-2xl transition-shadow duration-500">
                            <div className="w-full bg-white rounded-2xl shadow-lg p-6 mb-12 max-w-md transform hover:scale-105 transition-transform duration-300">
                                <div className="space-y-4 text-left">
                                    <div className="flex items-center gap-4 p-3 bg-pink-50 rounded-xl border border-pink-100">
                                        <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center text-white"><BarChart3 size={20} /></div>
                                        <div>
                                            <div className="font-bold text-sm">Automated Insights</div>
                                            <div className="text-xs text-slate-500">Surfaced in real-time...</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 opacity-50">
                                        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white"><Zap size={20} /></div>
                                        <div>
                                            <div className="font-bold text-sm">Real-Time Data</div>
                                            <div className="text-xs text-slate-500">Instant access...</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold mb-4">Drive Down Costs</h3>
                            <p className="text-slate-500 max-w-sm">
                                Gain efficiency and simplify complexity by unifying your approach to data, AI and governance.
                            </p>
                        </div>

                        {/* Right Card: Unlock Integrations */}
                        <div className="bg-slate-50 rounded-[2.5rem] p-12 flex flex-col items-center text-center hover:shadow-2xl transition-shadow duration-500">
                            <div className="w-full bg-white rounded-2xl shadow-lg p-6 mb-12 max-w-md transform hover:scale-105 transition-transform duration-300">
                                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                                    <span className="text-sm font-bold text-slate-400">+ Add new integration</span>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { name: "Hotjar", color: "bg-red-500", active: true },
                                        { name: "Power BI", color: "bg-yellow-500", active: false },
                                        { name: "Mixpanel", color: "bg-purple-500", active: false }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-8 ${item.color} rounded-full`} />
                                                <span className="font-bold text-sm">{item.name}</span>
                                            </div>
                                            <div className={`w-10 h-6 rounded-full relative ${item.active ? 'bg-green-500' : 'bg-slate-200'}`}>
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.active ? 'right-1' : 'left-1'}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold mb-4">Unlock Integrations</h3>
                            <p className="text-slate-500 max-w-sm">
                                Empower your entire organization to access and analyze data effortlessly through seamless integrations.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Community / Footer Section (Reference Image 4) */}
            <section className="bg-black text-white py-32 px-6 relative overflow-hidden">
                {/* Abstract Corner Shapes */}
                <div className="absolute top-0 left-0 w-64 h-64 opacity-20">
                    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 0C155.228 0 200 44.7715 200 100C200 155.228 155.228 200 100 200C44.7715 200 0 155.228 0 100C0 44.7715 44.7715 0 100 0Z" fill="#333" />
                        <circle cx="100" cy="150" r="10" fill="#FFD700" />
                    </svg>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 opacity-20 rotate-90">
                    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 0C155.228 0 200 44.7715 200 100C200 155.228 155.228 200 100 200C44.7715 200 0 155.228 0 100C0 44.7715 44.7715 0 100 0Z" fill="#333" />
                        <circle cx="100" cy="150" r="10" fill="#FFD700" />
                    </svg>
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-5xl md:text-7xl font-bold mb-12 tracking-tight">
                        Join our community <br />
                        of <span className="bg-yellow-400 text-black px-2">1,000+</span> members
                    </h2>

                    <div className="flex justify-center mb-20">
                        <button
                            onClick={() => window.open('https://chromewebstore.google.com/detail/opdaaehibnkaabelcjhoefnfmebciekj', '_blank')}
                            className="bg-yellow-400 text-black px-12 py-5 rounded-lg text-xl font-bold hover:bg-yellow-300 transition-colors"
                        >
                            Get free demo
                        </button>
                    </div>

                    {/* Footer Links */}
                    <div className="flex justify-center gap-6 mb-12">
                        <button className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors">
                            <span className="font-bold">in</span>
                        </button>
                        <button className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors">
                            <span className="font-bold">f</span>
                        </button>
                        <button className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors">
                            <span className="font-bold">▶</span>
                        </button>
                        <button className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors">
                            <span className="font-bold">📸</span>
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Landing02
