import React, { useState } from 'react';
import { X, Check, User } from 'lucide-react';
import { signInWithGoogle } from '../services/chrome-auth';
import toast from 'react-hot-toast';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    const [isSigningIn, setIsSigningIn] = useState(false);

    if (!isOpen) return null;

    const handleLogin = async () => {
        setIsSigningIn(true);
        try {
            await signInWithGoogle();
            toast.success('Successfully signed in!');
            onLoginSuccess();
            onClose();
        } catch (e: any) {
            console.error("Login Error:", e);
            toast.error(`Login failed: ${e.message}`);
        } finally {
            setIsSigningIn(false);
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
                    <div className="mx-auto w-16 h-16 mb-6">
                        <img
                            src={chrome.runtime.getURL("assets/logo.png")}
                            alt="SummarAI"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "/src/assets/logo.png";
                            }}
                        />
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Sign in to Continue
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Unlock your full potential with SummarAI
                    </p>

                    {/* Features */}
                    <div className="space-y-3 mb-8 text-left bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                        {[
                            "10 summaries per day (Beta)",
                            "Sync history across devices",
                            "Standard support"
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleLogin}
                        disabled={isSigningIn}
                        className="w-full py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-gray-200 dark:shadow-none"
                    >
                        {isSigningIn ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <User className="w-4 h-4" />
                                Sign in with Google
                            </>
                        )}
                    </button>

                    <p className="mt-4 text-[11px] text-gray-400 dark:text-gray-500">
                        We respect your privacy. No spam, ever.
                    </p>
                </div>
            </div>
        </div>
    );
};
