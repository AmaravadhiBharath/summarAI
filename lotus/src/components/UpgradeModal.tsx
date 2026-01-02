import React, { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import toast from 'react-hot-toast';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpgrade = async () => {
        setLoading(true);
        setError(null);

        // Simulate upgrade for Beta
        setTimeout(() => {
            setLoading(false);
            onClose();
            toast.success("Welcome to Pro! (Beta Access Granted)", { icon: '🌟' });
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div onClick={onClose} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <button onClick={onClose} className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10">
                    <X className="w-4 h-4" />
                </button>

                <div className="p-6 text-center">
                    <div className="mx-auto w-14 h-14 mb-4">
                        <img src="/src/assets/logo.png" alt="SummarAI" className="w-full h-full object-contain" />
                    </div>

                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Upgrade to Pro</h2>
                    <p className="text-sm text-gray-500 mb-4">Get 100 summaries per day</p>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full mb-5">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        Free during Beta
                    </div>

                    <div className="space-y-2 mb-5 text-left">
                        {["100 daily summaries", "Priority processing", "Advanced AI models", "Premium support"].map((feature, i) => (
                            <div key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                                <Check className="w-4 h-4 text-gray-400" />
                                {feature}
                            </div>
                        ))}
                    </div>

                    {error && <div className="mb-4 p-2.5 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>}

                    <Button onClick={handleUpgrade} disabled={loading} className="w-full h-10 text-sm font-medium bg-black hover:bg-gray-800 text-white rounded-xl transition-colors">
                        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Activating...</> : "Claim Free Pro"}
                    </Button>

                    <p className="mt-3 text-[10px] text-gray-400"><span className="line-through">$0.99/mo</span> → Free in beta</p>
                </div>
            </div>
        </div>
    );
};
