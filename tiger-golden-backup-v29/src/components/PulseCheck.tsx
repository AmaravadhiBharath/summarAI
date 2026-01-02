import React, { useState, useEffect } from 'react';
import { X, Send, ThumbsUp } from 'lucide-react';
import { cn } from '../components/ui/Tooltip';

// Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxrlK_jHWJguJ1sCHYEwmpllj8nR8uuVoiWYe2JF8RiPpvLy_vmGJTUMpoX2ZWKPwTMLA/exec';

interface PulseCheckProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userEmail?: string | null;
}

export const PulseCheck: React.FC<PulseCheckProps> = ({ open, onOpenChange, userEmail }) => {
    const [step, setStep] = useState<number>(1); // Default to 1 so it shows content immediately when opened
    const [rating, setRating] = useState<string | null>(null);
    const [answers, setAnswers] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [summaryCount, setSummaryCount] = useState<number>(0);

    const isAutoTriggered = React.useRef(false);

    useEffect(() => {
        if (open) {
            if (step === 0) setStep(1);
            // Reset form state to allow re-submission
            setRating(null);
            setAnswers({});
            setIsSubmitting(false);
        } else {
            // When closed, reset auto-trigger flag
            isAutoTriggered.current = false;
        }
    }, [open]);

    useEffect(() => {
        // Auto-trigger disabled for admin testing
        // Check if we should show the form
        const checkVisibility = async () => {
            const result = await chrome.storage.local.get(['summarizeCount', 'pulseCheckDismissed', 'pulseCheckDismissedFinal']);
            const count = (result.summarizeCount as number) || 0;
            setSummaryCount(count);
            // Auto-trigger commented out
            // const dismissed = result.pulseCheckDismissed || false;
            // const dismissedFinal = result.pulseCheckDismissedFinal || false;

            // if ((count >= 4 && !dismissedFinal) || (count >= 2 && !dismissed)) {
            //     isAutoTriggered.current = true;
            //     onOpenChange(true);
            //     setStep(1);
            // }
        };

        checkVisibility();

        // Listen for storage changes to trigger in real-time
        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes.summarizeCount) {
                const newCount = changes.summarizeCount.newValue as number;
                setSummaryCount(newCount);
                // Auto-trigger commented out
                // chrome.storage.local.get(['pulseCheckDismissed', 'pulseCheckDismissedFinal'], (res) => {
                //     const dismissed = res.pulseCheckDismissed || false;
                //     const dismissedFinal = res.pulseCheckDismissedFinal || false;

                //     if ((newCount >= 4 && !dismissedFinal) || (newCount >= 2 && !dismissed)) {
                //         isAutoTriggered.current = true;
                //         onOpenChange(true);
                //         setStep(1);
                //     }
                // });
            }
        };

        chrome.storage.onChanged.addListener(handleStorageChange);
        return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }, []);

    const handleDismiss = () => {
        onOpenChange(false);

        // Only mark as dismissed if it was auto-triggered
        if (isAutoTriggered.current) {
            if (summaryCount >= 4) {
                chrome.storage.local.set({ pulseCheckDismissed: true, pulseCheckDismissedFinal: true });
            } else {
                chrome.storage.local.set({ pulseCheckDismissed: true });
            }
        }
        isAutoTriggered.current = false;
    };

    const handleRating = (selectedRating: string) => {
        setRating(selectedRating);
        setStep(2);
    };

    const handleAnswerChange = (key: string, value: any) => {
        setAnswers((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        // Prepare data
        const payload = {
            timestamp: new Date().toISOString(),
            rating,
            email: userEmail || 'anonymous',
            ...answers
        };

        try {
            // Send to Google Sheets (fire and forget for UI speed)
            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error("Failed to submit feedback", error);
        }

        // Show thank you immediately
        setStep(3);
        // Removed auto-dismiss to allow user to choose
    };

    const handleReset = () => {
        setStep(1);
        setRating(null);
        setAnswers({});
        setIsSubmitting(false);
    };

    if (!open) return null;

    const isHappyPath = rating === 'Game Changer' || rating === 'Useful';

    return (
        <div className="popup-content absolute bottom-full left-0 right-0 mb-2 z-[200] w-auto" onClick={(e) => e.stopPropagation()}>
            <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                {/* Header / Close */}
                <div className="flex justify-between items-center px-4 pt-3 pb-1">
                    <span className="text-[10px] font-bold text-black uppercase tracking-wider">Pulse Check</span>
                    <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-5 pb-5 pt-1">
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 text-center">What is your initial feeling?</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => handleRating('Game Changer')} className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl border border-gray-100 hover:border-black hover:bg-gray-50 transition-all group">
                                    <span className="text-xl group-hover:scale-110 transition-transform">🤩</span>
                                    <span className="text-xs font-medium text-gray-600 group-hover:text-black">Game Changer</span>
                                </button>
                                <button onClick={() => handleRating('Useful')} className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl border border-gray-100 hover:border-black hover:bg-gray-50 transition-all group">
                                    <span className="text-xl group-hover:scale-110 transition-transform">🙂</span>
                                    <span className="text-xs font-medium text-gray-600 group-hover:text-black">Useful</span>
                                </button>
                                <button onClick={() => handleRating('Okay')} className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group">
                                    <span className="text-xl group-hover:scale-110 transition-transform">😐</span>
                                    <span className="text-xs font-medium text-gray-600">Okay</span>
                                </button>
                                <button onClick={() => handleRating('Not helpful')} className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group">
                                    <span className="text-xl group-hover:scale-110 transition-transform">🙁</span>
                                    <span className="text-xs font-medium text-gray-600">Not helpful</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-fade-in">
                            {isHappyPath ? (
                                // Happy Path
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-gray-700">Should I invest more time into this?</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAnswerChange('investTime', true)}
                                                className={cn("flex-1 py-1.5 text-xs rounded-lg border transition-colors", answers.investTime === true ? "bg-black text-white border-black" : "border-gray-200 text-gray-600 hover:bg-gray-50")}
                                            >Yes</button>
                                            <button
                                                onClick={() => handleAnswerChange('investTime', false)}
                                                className={cn("flex-1 py-1.5 text-xs rounded-lg border transition-colors", answers.investTime === false ? "bg-gray-800 text-white border-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50")}
                                            >No</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-gray-700">Did you wish for this tool before?</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAnswerChange('wishedBefore', true)}
                                                className={cn("flex-1 py-1.5 text-xs rounded-lg border transition-colors", answers.wishedBefore === true ? "bg-black text-white border-black" : "border-gray-200 text-gray-600 hover:bg-gray-50")}
                                            >Yes</button>
                                            <button
                                                onClick={() => handleAnswerChange('wishedBefore', false)}
                                                className={cn("flex-1 py-1.5 text-xs rounded-lg border transition-colors", answers.wishedBefore === false ? "bg-gray-800 text-white border-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50")}
                                            >No</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-gray-700">Would you refer this to others?</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAnswerChange('refer', true)}
                                                className={cn("flex-1 py-1.5 text-xs rounded-lg border transition-colors", answers.refer === true ? "bg-black text-white border-black" : "border-gray-200 text-gray-600 hover:bg-gray-50")}
                                            >Yes</button>
                                            <button
                                                onClick={() => handleAnswerChange('refer', false)}
                                                className={cn("flex-1 py-1.5 text-xs rounded-lg border transition-colors", answers.refer === false ? "bg-gray-800 text-white border-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50")}
                                            >No</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-gray-700">Share more thoughts? <span className="text-gray-400 font-normal">(Optional)</span></p>
                                        <textarea
                                            className="w-full text-xs p-2 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none resize-none bg-gray-50"
                                            rows={2}
                                            placeholder="What was your impression?"
                                            onChange={(e) => handleAnswerChange('feedbackText', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ) : (
                                // Critical Path
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-gray-700">What went wrong?</p>
                                        <div className="flex flex-col gap-1.5">
                                            {['Buggy', 'Confusing', "Didn't solve problem"].map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => handleAnswerChange('whatWentWrong', opt)}
                                                    className={cn(
                                                        "w-full text-left px-3 py-2 text-xs rounded-lg border transition-colors",
                                                        answers.whatWentWrong === opt ? "bg-gray-50 border-gray-300 text-black font-medium" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                                    )}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-gray-700">One thing to fix?</p>
                                        <textarea
                                            className="w-full text-xs p-2 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none resize-none bg-gray-50"
                                            rows={2}
                                            placeholder="Tell us what to improve..."
                                            onChange={(e) => handleAnswerChange('feedbackText', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        Submit Feedback
                                        <Send className="w-3 h-3" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="py-6 text-center animate-fade-in">
                            <div className="w-12 h-12 bg-gray-100 text-black rounded-full flex items-center justify-center mx-auto mb-3">
                                <ThumbsUp className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900">Thank You!</h3>
                            <p className="text-xs text-gray-500 mt-1 mb-6">Your feedback helps us build better.</p>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={handleReset}
                                    className="w-full py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-95"
                                >
                                    Submit Another Response
                                </button>
                                <button
                                    onClick={handleDismiss}
                                    className="w-full py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl transition-all active:scale-95"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
