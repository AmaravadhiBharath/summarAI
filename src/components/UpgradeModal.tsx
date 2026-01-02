import React, { useState } from 'react';
import { X, Check, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail?: string | null;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, userEmail }) => {
    const [isActivating, setIsActivating] = useState(false);

    if (!isOpen) return null;

    const handleActivate = async () => {
        setIsActivating(true);

        try {
            // Call Backend to Activate Pro
            if (userEmail) {
                await fetch('https://tai-backend.amaravadhibharath.workers.dev/activate-pro-beta', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: userEmail })
                });
            }

            // Simulate activation delay (visual feedback)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Set Pro status locally
            chrome.storage.local.set({ isPro: true });

            toast.success("Welcome to Pro! (Beta Access Active)", {
                icon: '🚀',
                duration: 5000
            });

            setIsActivating(false);
            onClose();

            // Reload to reflect changes
            window.location.reload();

        } catch (e) {
            console.error("Activation failed:", e);
            toast.error("Activation failed. Please try again.");
            setIsActivating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-scale-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors z-10"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="p-8 text-center">
                    {/* Logo */}
                    <div className="mx-auto w-16 h-16 mb-6 relative">
                        <div className="absolute inset-0 bg-yellow-100 rounded-full animate-pulse opacity-50"></div>
                        <img
                            src={chrome.runtime.getURL("assets/logo.png")}
                            alt="SummarAI"
                            className="w-full h-full object-contain relative z-10 dark:invert"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "/src/assets/logo.png";
                            }}
                        />
                        <div className="absolute -bottom-1 -right-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-1.5 py-0.5 rounded border border-white dark:border-gray-900">
                            PRO
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Unlock Pro Features
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Experience the full power of SummarAI
                    </p>

                    {/* Features */}
                    <div className="space-y-3 mb-8 text-left bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                        {[
                            "Everything in Free",
                            "100 daily summaries",
                            "Priority processing speed",
                            "Advanced AI models (GPT-4o)",
                            "Premium email support"
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                </div>
                                <span className="font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleActivate}
                        disabled={isActivating}
                        className="w-full py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-gray-200 dark:shadow-none"
                    >
                        {isActivating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Activating Beta Access...
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                Activate Pro (Free in Beta)
                            </>
                        )}
                    </button>

                    <p className="mt-4 text-[11px] text-gray-400 dark:text-gray-500">
                        No credit card required during beta period.
                    </p>
                </div>
            </div>
        </div>
    );
};
