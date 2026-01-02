import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster, toast } from 'react-hot-toast';
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import {
    Mail,
    LogOut,
    ChevronLeft,
    Share2,
    User as UserIcon,
    Star,
    Search,
    Menu,
    X,
    Archive,
    Trash2,
    Inbox
} from 'lucide-react';
import {
    signInWithGoogleWeb,
    logoutWeb,
    subscribeToAuthChangesWeb,
    getHistoryFromFirestoreWeb,
    subscribeToHistoryWeb,
    checkUserProStatusWeb
} from './services/firebase-web';
import './index.css';

// --- Types ---
type SummaryStatus = 'inbox' | 'archived' | 'deleted';

interface Summary {
    id: string;
    summary: string;
    url?: string;
    timestamp?: string;
    platform?: string;
    type?: string;
    status?: SummaryStatus; // New field
    starred?: boolean;      // New field
}

// --- Components ---

const LoginView = ({ onLogin }: { onLogin: () => void }) => (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to SummarAI</h1>
            <p className="text-gray-600 mb-8">Access your AI summaries anywhere.</p>

            <button
                onClick={onLogin}
                className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Sign in with Google
            </button>
        </div>
    </div>
);

const SummaryListItem = ({
    summary,
    onClick,
    onArchive,
    onDelete,
    onStar
}: {
    summary: Summary,
    onClick: () => void,
    onArchive: () => void,
    onDelete: () => void,
    onStar: () => void
}) => {
    const x = useMotionValue(0);
    const date = summary.timestamp ? new Date(summary.timestamp).toLocaleDateString() : 'Unknown Date';
    const platform = summary.platform || 'Web';
    const preview = summary.summary.slice(0, 100).replace(/\n/g, ' ') + '...';

    // Background colors based on drag
    const bgLeft = useTransform(x, [0, 100], ['rgba(255,255,255,0)', 'rgba(239, 68, 68, 1)']); // Red for Delete (Right Drag)
    const bgRight = useTransform(x, [-100, 0], ['rgba(16, 185, 129, 1)', 'rgba(255,255,255,0)']); // Green for Archive (Left Drag)

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.x > 100) {
            onDelete();
        } else if (info.offset.x < -100) {
            onArchive();
        }
    };

    return (
        <div className="relative overflow-hidden bg-white border-b border-gray-100">
            {/* Delete Background (Left Side - visible when dragging right) */}
            <motion.div
                style={{ backgroundColor: bgLeft }}
                className="absolute inset-y-0 left-0 w-full flex items-center justify-start pl-6"
            >
                <Trash2 className="text-white w-6 h-6" />
            </motion.div>

            {/* Archive Background (Right Side - visible when dragging left) */}
            <motion.div
                style={{ backgroundColor: bgRight }}
                className="absolute inset-y-0 right-0 w-full flex items-center justify-end pr-6"
            >
                <Archive className="text-white w-6 h-6" />
            </motion.div>

            {/* Main Content Card */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                style={{ x, backgroundColor: '#fff' }}
                className="relative z-10 p-4 active:cursor-grabbing cursor-pointer flex gap-3"
                onClick={onClick}
            >
                {/* Star Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onStar(); }}
                    className="mt-1 focus:outline-none"
                >
                    <Star
                        className={`w-5 h-5 transition-colors ${summary.starred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-gray-900 truncate capitalize">{platform} Summary</h3>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{date}</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{preview}</p>
                </div>
            </motion.div>
        </div>
    );
};

const SummaryDetail = ({ summary, onBack }: { summary: Summary, onBack: () => void }) => {
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'AI Summary',
                    text: summary.summary,
                    url: summary.url || window.location.href
                });
            } catch (err) {
                console.error('Share failed', err);
            }
        } else {
            navigator.clipboard.writeText(summary.summary);
            toast.success('Copied to clipboard');
        }
    };

    const platformIcon = (platform: string) => {
        const p = platform.toLowerCase();
        if (p.includes('chatgpt')) return 'https://chatgpt.com/favicon.ico';
        if (p.includes('claude')) return 'https://claude.ai/favicon.ico';
        if (p.includes('gemini')) return 'https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559d160350722.png';
        return null;
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-2">
                    {summary.platform && platformIcon(summary.platform) && (
                        <img src={platformIcon(summary.platform)!} alt={summary.platform} className="w-5 h-5 rounded-full" />
                    )}
                    <span className="font-semibold text-gray-900 text-sm">
                        {summary.platform || 'Summary'}
                    </span>
                </div>

                <button
                    onClick={handleShare}
                    className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors text-blue-600"
                >
                    <Share2 className="w-5 h-5" />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto p-6">
                    {/* Meta Card */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                            {summary.summary.split('\n')[0].length < 50
                                ? summary.summary.split('\n')[0]
                                : "Conversation Summary"}
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium uppercase tracking-wider">
                            <span>{summary.timestamp ? new Date(summary.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date'}</span>
                            <span>•</span>
                            <span>{summary.platform || 'AI'}</span>
                            {summary.status === 'archived' && <span className="text-orange-500">• Archived</span>}
                            {summary.status === 'deleted' && <span className="text-red-500">• Deleted</span>}
                        </div>
                    </div>

                    {/* Main Summary Text */}
                    <div className="prose prose-lg prose-gray max-w-none">
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap font-sans text-base">
                            {summary.summary}
                        </div>
                    </div>

                    {/* Source Link Button */}
                    {summary.url && (
                        <div className="mt-10 pt-6 border-t border-gray-100">
                            <a
                                href={summary.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-medium transition-colors border border-gray-200"
                            >
                                <span>Open Original Chat</span>
                                <Share2 className="w-4 h-4 opacity-50" />
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

function MobileApp() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPro, setIsPro] = useState(false);
    const [summaries, setSummaries] = useState<Summary[]>([]);
    const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [currentView, setCurrentView] = useState<'inbox' | 'starred' | 'archived' | 'deleted'>('inbox');

    useEffect(() => {
        let unsubscribeHistory: (() => void) | undefined;

        const unsubscribeAuth = subscribeToAuthChangesWeb(async (u) => {
            setUser(u);

            if (u) {
                // 1. Check PRO status
                if (u.email === 'amaravadhibharath@gmail.com') {
                    setIsPro(true);
                } else if (u.email) {
                    try {
                        const proStatus = await checkUserProStatusWeb(u.email);
                        setIsPro(proStatus);
                    } catch (e) {
                        console.error("Pro check failed", e);
                    }
                }

                // 2. REAL-TIME SUBSCRIPTION
                try {
                    unsubscribeHistory = subscribeToHistoryWeb(u.uid, (data) => {
                        if (data && data.length > 0) {
                            const processedHistory = data.map((h: any) => ({
                                ...h,
                                status: h.status || 'inbox',
                                starred: h.starred || false
                            }));

                            // Check for new items to show notification
                            setSummaries(prevSummaries => {
                                // Only notify if we already had data (not initial load)
                                if (prevSummaries.length > 0 && data.length > prevSummaries.length) {
                                    const newCount = data.length - prevSummaries.length;
                                    if (newCount === 1) {
                                        toast.success("New Summary Received!", { icon: '✨' });
                                    } else {
                                        toast.success(`${newCount} New Summaries!`, { icon: '✨' });
                                    }
                                }
                                return processedHistory as Summary[];
                            });

                            setLoading(false);
                        } else {
                            setSummaries([]);
                            setLoading(false);
                        }
                    });
                } catch (e) {
                    console.log("Subscription failed", e);
                    setLoading(false);
                }
            } else {
                // User logged out
                setSummaries([]);
                setLoading(false);
                if (unsubscribeHistory) {
                    unsubscribeHistory();
                    unsubscribeHistory = undefined;
                }
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeHistory) unsubscribeHistory();
        };
    }, []);

    const handleLogin = async () => {
        try {
            await signInWithGoogleWeb();
        } catch (e) {
            console.error(e);
        }
    };

    const handleLogout = async () => {
        await logoutWeb();
        setShowMenu(false);
    };

    // --- Actions ---

    const handleArchive = (id: string) => {
        setSummaries(prev => prev.map(s =>
            s.id === id ? { ...s, status: 'archived' } : s
        ));
        toast('Archived', { icon: '📦' });
    };

    const handleDelete = (id: string) => {
        setSummaries(prev => prev.map(s =>
            s.id === id ? { ...s, status: 'deleted' } : s
        ));
        toast('Moved to Trash', { icon: '🗑️' });
    };

    const handleStar = (id: string) => {
        setSummaries(prev => prev.map(s =>
            s.id === id ? { ...s, starred: !s.starred } : s
        ));
    };

    const handleRestore = (id: string) => {
        setSummaries(prev => prev.map(s =>
            s.id === id ? { ...s, status: 'inbox' } : s
        ));
        toast('Restored to Inbox', { icon: '📥' });
    };

    // --- Filtering ---

    const filteredSummaries = summaries.filter(s => {
        const matchesSearch = s.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.platform && s.platform.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!matchesSearch) return false;

        switch (currentView) {
            case 'inbox': return s.status === 'inbox' || !s.status;
            case 'starred': return s.starred && s.status !== 'deleted';
            case 'archived': return s.status === 'archived';
            case 'deleted': return s.status === 'deleted';
            default: return true;
        }
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!user) {
        return <LoginView onLogin={handleLogin} />;
    }

    if (selectedSummary) {
        return <SummaryDetail summary={selectedSummary} onBack={() => setSelectedSummary(null)} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Toaster />

            {/* App Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowMenu(!showMenu)} className="p-1 hover:bg-gray-100 rounded-md">
                        <Menu className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight capitalize">{currentView}</h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${isPro
                        ? "bg-yellow-50 text-yellow-600 border-yellow-100"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}>
                        {isPro ? 'PRO' : 'FREE'}
                    </div>
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <UserIcon className="w-4 h-4 text-gray-400" />
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {showMenu && (
                <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowMenu(false)}>
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Menu Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-xl text-gray-900">SummarAI</h2>
                                <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                            </div>
                            <button onClick={() => setShowMenu(false)} className="p-1 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Menu Items */}
                        <div className="flex-1 py-4 px-3 space-y-1">
                            <button
                                onClick={() => { setCurrentView('inbox'); setShowMenu(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentView === 'inbox' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Inbox className="w-5 h-5" /> Inbox
                            </button>
                            <button
                                onClick={() => { setCurrentView('starred'); setShowMenu(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentView === 'starred' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Star className="w-5 h-5" /> Starred
                            </button>
                            <button
                                onClick={() => { setCurrentView('archived'); setShowMenu(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentView === 'archived' ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Archive className="w-5 h-5" /> Archived
                            </button>
                            <button
                                onClick={() => { setCurrentView('deleted'); setShowMenu(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentView === 'deleted' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Trash2 className="w-5 h-5" /> Trash
                            </button>
                        </div>

                        {/* Menu Footer */}
                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
                            >
                                <LogOut className="w-5 h-5" /> Sign Out
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Search Bar */}
            <div className="px-4 py-2 bg-white border-b border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={`Search ${currentView}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-100 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
            </div>

            {/* Summary List */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
                {filteredSummaries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        {currentView === 'inbox' && <Inbox className="w-12 h-12 mb-2 opacity-20" />}
                        {currentView === 'starred' && <Star className="w-12 h-12 mb-2 opacity-20" />}
                        {currentView === 'archived' && <Archive className="w-12 h-12 mb-2 opacity-20" />}
                        {currentView === 'deleted' && <Trash2 className="w-12 h-12 mb-2 opacity-20" />}
                        <p>No items in {currentView}</p>
                    </div>
                ) : (
                    filteredSummaries.map(summary => (
                        <SummaryListItem
                            key={summary.id}
                            summary={summary}
                            onClick={() => setSelectedSummary(summary)}
                            onArchive={() => currentView === 'deleted' ? handleRestore(summary.id) : handleArchive(summary.id)}
                            onDelete={() => handleDelete(summary.id)}
                            onStar={() => handleStar(summary.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <MobileApp />
    </React.StrictMode>
);
