import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { ThumbsUp, ThumbsDown, RefreshCw, Copy, Check, MoreVertical, Flag } from 'lucide-react';
import { Tooltip } from './ui/Tooltip';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';
import { trackEvent } from '../services/analytics';

interface SummaryToolbarProps {
    summary: string;
    onRegenerate: () => void;
    onReportIssue: () => void;
    isRegenerating: boolean;
    isGuest?: boolean;
}

export const SummaryToolbar: React.FC<SummaryToolbarProps> = ({
    summary,
    onRegenerate,
    onReportIssue,
    isRegenerating,
    isGuest = false,
}) => {
    const [feedback, setFeedback] = useState<'idle' | 'good' | 'bad' | 'copied'>('idle');
    const [goodActive, setGoodActive] = useState(false);
    const [badActive, setBadActive] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    const handleFeedback = (type: 'good' | 'bad') => {
        if (type === 'good') {
            if (!goodActive) {
                setGoodActive(true);
                setBadActive(false);
                setFeedback('good');
                trackEvent('summary_rated', { rating: 'positive', summary_length: summary.length });
                setTimeout(() => setFeedback('idle'), 1000);
            } else {
                setGoodActive(false);
            }
        } else {
            setBadActive(!badActive);
            setGoodActive(false);
            if (!badActive) {
                setFeedback('bad');
                onReportIssue();
                setTimeout(() => setFeedback('idle'), 2000);
            }
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(summary);
        setFeedback('copied');
        toast.success('Copied to clipboard');
        setTimeout(() => setFeedback('idle'), 2000);
    };

    return (
        <div className="relative">
            <div className="flex items-center gap-1 p-1 rounded-xl shadow-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                {/* Good Button */}
                <Tooltip content="Good Response">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleFeedback('good')}
                        className={cn(
                            "h-8 w-8 rounded-lg transition-colors",
                            feedback === 'good' ? "text-green-600 bg-green-50" : (goodActive && "text-black")
                        )}
                    >
                        <ThumbsUp className={cn("w-4 h-4", (goodActive || feedback === 'good') && "fill-current")} />
                    </Button>
                </Tooltip>

                {/* Bad Button */}
                <Tooltip content="Bad Response">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleFeedback('bad')}
                        className={cn("h-8 w-8 rounded-lg", badActive && "text-black")}
                    >
                        <ThumbsDown className={cn("w-4 h-4", badActive && "fill-current")} />
                    </Button>
                </Tooltip>

                <div className="w-px h-4 bg-gray-200 mx-0.5 shrink-0" />

                {/* Regenerate - Hidden for guests */}
                {!isGuest && (
                    <Tooltip content={isRegenerating ? "Regenerating..." : "Regenerate"}>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onRegenerate}
                            disabled={isRegenerating}
                            className={cn(
                                "h-8 w-8 rounded-lg transition-colors",
                                isRegenerating && "bg-gray-100"
                            )}
                        >
                            <RefreshCw className={cn("w-4 h-4", isRegenerating && "animate-spin text-black")} />
                        </Button>
                    </Tooltip>
                )}

                {/* Copy */}
                <Tooltip content="Copy">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopy}
                        className="h-8 w-8 rounded-lg"
                    >
                        {feedback === 'copied' ? (
                            <Check className="w-4 h-4 text-green-600" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </Button>
                </Tooltip>

                {/* More Menu - Hidden for guests */}
                {!isGuest && (
                    <Tooltip content="More" disabled={showMoreMenu}>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                            className="h-8 w-8 rounded-lg"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </Tooltip>
                )}
            </div>

            {/* More Menu Dropdown */}
            {showMoreMenu && (
                <>
                    <div className="fixed inset-0 z-[90]" onClick={() => setShowMoreMenu(false)} />
                    <div className="absolute bottom-full right-0 mb-2 z-[100] w-40 bg-white rounded-xl shadow-xl border border-gray-200 py-1 overflow-hidden">
                        {/* Listen */}
                        <button
                            className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            onClick={() => {
                                if ('speechSynthesis' in window) {
                                    window.speechSynthesis.cancel();
                                    const utterance = new SpeechSynthesisUtterance(summary);
                                    window.speechSynthesis.speak(utterance);
                                    toast.success('Listening...');
                                } else {
                                    toast.error('Not supported');
                                }
                                setShowMoreMenu(false);
                            }}
                        >
                            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                            Listen
                        </button>

                        {/* PDF */}
                        <button
                            className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            onClick={() => {
                                const printWindow = window.open('', '_blank');
                                if (printWindow) {
                                    printWindow.document.write(`
                                        <html>
                                            <head>
                                                <title>Summary - SummarAI</title>
                                                <style>
                                                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; line-height: 1.6; color: #111; max-width: 800px; margin: 0 auto; }
                                                    .header { border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; items-align: center; }
                                                    .brand { font-weight: 700; font-size: 20px; display: flex; align-items: center; gap: 10px; }
                                                    .logo { width: 24px; height: 24px; background: #000; border-radius: 6px; }
                                                    .meta { font-size: 12px; color: #666; }
                                                    p { white-space: pre-wrap; margin-bottom: 16px; }
                                                    ul { margin-left: 20px; }
                                                    li { margin-bottom: 8px; }
                                                </style>
                                            </head>
                                            <body>
                                                <div class="header">
                                                    <div class="brand">
                                                        <div class="logo"></div>
                                                        SummarAI
                                                    </div>
                                                    <div class="meta">
                                                        Generated on ${new Date().toLocaleDateString()}
                                                    </div>
                                                </div>
                                                ${summary.replace(/\n/g, '<br>')}
                                            </body>
                                        </html>
                                    `);
                                    printWindow.document.close();
                                    printWindow.print();
                                }
                                setShowMoreMenu(false);
                            }}
                        >
                            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            PDF
                        </button>

                        {/* Mail */}
                        <button
                            className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            onClick={() => {
                                const subject = encodeURIComponent("Summary from SummarAI");
                                const body = encodeURIComponent(summary);
                                window.open(`mailto:?subject=${subject}&body=${body}`);
                                setShowMoreMenu(false);
                            }}
                        >
                            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Mail
                        </button>

                        <div className="h-px bg-gray-100 my-1" />

                        {/* Report Issue */}
                        <button
                            className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            onClick={() => {
                                onReportIssue();
                                setShowMoreMenu(false);
                            }}
                        >
                            <Flag className="w-3.5 h-3.5" />
                            Report Issue
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
