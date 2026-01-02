import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import { signInWithGoogle, subscribeToAuthChanges, logout, type ChromeUser } from './services/chrome-auth'
import { getHistoryFromFirestore } from './services/firebase-extension'
import { Mail, ArrowLeft, RefreshCw, Calendar } from 'lucide-react'

// --- COMPONENTS ---

const InboxItem = ({ item, onClick }: { item: any, onClick: () => void }) => {
    const date = new Date(item.date);
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isToday = date.toDateString() === new Date().toDateString();
    const dateStr = isToday ? time : date.toLocaleDateString([], { month: 'short', day: 'numeric' });

    return (
        <div onClick={onClick} className="bg-white p-4 border-b border-gray-100 active:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-semibold text-gray-900 truncate pr-2 flex-1">
                    {item.summary.slice(0, 30)}...
                </h3>
                <span className="text-xs text-gray-400 whitespace-nowrap">{dateStr}</span>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                {item.summary}
            </p>
        </div>
    );
};

const DetailView = ({ item, onBack }: { item: any, onBack: () => void }) => {
    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="h-14 border-b border-gray-100 flex items-center px-4 gap-4 sticky top-0 bg-white/80 backdrop-blur-md">
                <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1 truncate font-semibold">Summary Details</div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.date).toLocaleString()}
                </div>
                <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {item.summary}
                </div>
            </div>
        </div>
    );
};

const MobileApp = () => {
    const [user, setUser] = useState<ChromeUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges(async (u) => {
            setUser(u);
            if (u) {
                await loadHistory(u.id);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const loadHistory = async (uid: string) => {
        setRefreshing(true);
        const data = await getHistoryFromFirestore(uid);
        setHistory(data || []);
        setRefreshing(false);
    };

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (e) {
            toast.error("Login failed. Please try again.");
        }
    };

    if (loading) {
        return <div className="h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div></div>;
    }

    if (!user) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-8 bg-white text-center space-y-6">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <img src="/src/assets/logo.png" alt="Logo" className="w-10 h-10 opacity-80 dark:invert" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Summarai Mobile</h1>
                <p className="text-gray-500">Access your extension history on the go.</p>
                <button
                    onClick={handleLogin}
                    className="w-full py-3 bg-black text-white rounded-xl font-medium shadow-lg shadow-black/20 active:scale-95 transition-transform"
                >
                    Sign in with Google
                </button>
                <p className="text-xs text-gray-400 mt-8">
                    Add to Home Screen for the best experience.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 h-14 flex items-center justify-between z-10">
                <div className="font-bold text-lg tracking-tight">Inbox</div>
                <div className="flex items-center gap-3">
                    <button onClick={() => loadHistory(user.id)} className={`p-2 hover:bg-gray-100 rounded-full ${refreshing ? 'animate-spin' : ''}`}>
                        <RefreshCw className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300" onClick={() => { if (confirm('Logout?')) logout(); }}>
                        {user.picture ? <img src={user.picture} className="w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-xs">{user.name?.[0]}</div>}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-100">
                {history.length === 0 ? (
                    <div className="py-20 text-center text-gray-400">
                        <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No summaries yet</p>
                    </div>
                ) : (
                    history.map(item => (
                        <InboxItem key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                    ))
                )}
            </div>

            {/* Detail View Overlay */}
            {selectedItem && (
                <DetailView item={selectedItem} onBack={() => setSelectedItem(null)} />
            )}
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <MobileApp />
        <Toaster position="bottom-center" />
    </React.StrictMode>,
)
