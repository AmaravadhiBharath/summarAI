import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { ThumbsUp, ThumbsDown, RefreshCw, Copy, Check, MoreVertical, Volume2 } from 'lucide-react';
import { Tooltip, cn } from './ui/Tooltip';
import { Button } from './ui/Button';
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
    isGuest
}) => {
    const [feedback, setFeedback] = useState<'idle' | 'good' | 'bad' | 'copied' | 'doc'>('idle');
    const [goodActive, setGoodActive] = useState(false);
    const [badActive, setBadActive] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    const handleGood = () => {
        if (goodActive) {
            setGoodActive(false);
            return;
        }
        setGoodActive(true);
        setBadActive(false);
        setFeedback('good');
        trackEvent('summary_rated', { rating: 'positive', summary_length: summary.length });
        setTimeout(() => setFeedback('idle'), 2000);
    };

    const handleBad = () => {
        if (badActive) {
            setBadActive(false);
            return;
        }
        setBadActive(true);
        setGoodActive(false);
        setFeedback('bad');
        // Open report modal instead of directly tracking
        onReportIssue();
        setTimeout(() => setFeedback('idle'), 2000);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(summary);
        setFeedback('copied');
        setTimeout(() => setFeedback('idle'), 2000);
    };

    return (
        <div className="relative">
            <div className="flex items-center gap-1 p-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-lg min-h-[40px]">

                {/* Good Button */}
                <Tooltip content="Good Response">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleGood}
                        className={cn(
                            "h-8 w-8 rounded-lg transition-colors shrink-0 focus:outline-none focus:ring-0",
                            goodActive ? "text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                    >
                        <ThumbsUp className={cn("w-4 h-4", goodActive && "fill-current")} />
                    </Button>
                </Tooltip>

                {/* Good Feedback Message */}
                {feedback === 'good' && (
                    <div className="overflow-hidden whitespace-nowrap text-[10px] font-medium text-green-600 px-1 animate-fade-in">
                        Thanks for feedback
                    </div>
                )}

                {/* Bad Button */}
                <Tooltip content="Bad Response">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBad}
                        className={cn(
                            "h-8 w-8 rounded-lg transition-colors shrink-0 focus:outline-none focus:ring-0",
                            badActive ? "text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                    >
                        <ThumbsDown className={cn("w-4 h-4", badActive && "fill-current")} />
                    </Button>
                </Tooltip>

                {/* Bad Feedback Message */}
                {feedback === 'bad' && (
                    <div className="overflow-hidden whitespace-nowrap text-[10px] font-medium text-black dark:text-white px-1 animate-fade-in">
                        Thanks for feedback
                    </div>
                )}

                <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5 shrink-0" />

                {/* Consolidate Button - Only if provided */}


                {/* Regenerate */}
                <Tooltip content="Regenerate">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRegenerate}
                        disabled={isRegenerating}
                        className="h-8 w-8 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 shrink-0 focus:outline-none focus:ring-0"
                    >
                        <RefreshCw className={cn("w-4 h-4", isRegenerating && "animate-spin text-black dark:text-white")} />
                    </Button>
                </Tooltip>

                {/* Regenerating Feedback Message */}
                {isRegenerating && (
                    <div className="overflow-hidden whitespace-nowrap text-[10px] font-medium text-gray-500 dark:text-gray-400 px-1 animate-fade-in">
                        Regenerating...
                    </div>
                )}

                {/* Copy */}
                <Tooltip content="Copy">
                    <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 shrink-0 focus:outline-none focus:ring-0">
                        <Copy className="w-4 h-4" />
                    </Button>
                </Tooltip>

                {/* Copy Feedback Message */}
                {feedback === 'copied' && (
                    <div className="overflow-hidden whitespace-nowrap text-[10px] font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 px-1 animate-fade-in">
                        <Check className="w-3 h-3" />
                        Copied
                    </div>
                )}

                {/* Doc Feedback Message */}
                {feedback === 'doc' && (
                    <div className="overflow-hidden whitespace-nowrap text-[10px] font-medium text-blue-600 flex items-center gap-1 px-1 animate-fade-in">
                        <Check className="w-3 h-3" />
                        Copied! Paste in Doc
                    </div>
                )}

                {/* More Menu - Only for logged-in users */}
                {!isGuest && (
                    <div className="relative">
                        <Tooltip content="More" disabled={showMoreMenu}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 shrink-0 focus:outline-none focus:ring-0"
                                onClick={() => setShowMoreMenu(!showMoreMenu)}
                            >
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                        {showMoreMenu && (
                            <>
                                <div className="fixed inset-0 z-[90]" onClick={() => setShowMoreMenu(false)} />
                                <div className="absolute bottom-full right-0 mb-2 z-[100] w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-1 origin-bottom-right overflow-hidden">
                                    {/* Listen */}
                                    <button
                                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
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
                                        <Volume2 className="w-4 h-4 text-gray-500" />
                                        Listen
                                    </button>

                                    {/* PDF */}
                                    <button
                                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
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
                                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        PDF
                                    </button>

                                    {/* Download JSON */}
                                    <button
                                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
                                        onClick={() => {
                                            const blob = new Blob([JSON.stringify({ summary, date: new Date().toISOString() }, null, 2)], { type: 'application/json' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `summary-${Date.now()}.json`;
                                            a.click();
                                            URL.revokeObjectURL(url);
                                            setShowMoreMenu(false);
                                        }}
                                    >
                                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download JSON
                                    </button>

                                    {/* Download Markdown */}
                                    <button
                                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
                                        onClick={() => {
                                            const md = `# Summary\n\n${summary}\n\nGenerated by SummarAI on ${new Date().toLocaleString()}`;
                                            const blob = new Blob([md], { type: 'text/markdown' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `summary-${Date.now()}.md`;
                                            a.click();
                                            URL.revokeObjectURL(url);
                                            setShowMoreMenu(false);
                                        }}
                                    >
                                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download Markdown
                                    </button>

                                    {/* Mail */}
                                    <button
                                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
                                        onClick={() => {
                                            const subject = encodeURIComponent("Summary from SummarAI");
                                            const body = encodeURIComponent(summary);
                                            window.open(`mailto:?subject=${subject}&body=${body}`);
                                            setShowMoreMenu(false);
                                        }}
                                    >
                                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Mail
                                    </button>

                                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />

                                    {/* Report Issue */}
                                    <button
                                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                                        onClick={() => {
                                            onReportIssue();
                                            setShowMoreMenu(false);
                                        }}
                                    >
                                        <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8M3 21h18M5 21v-8a2 2 0 012-2h14a2 2 0 012 2v8M9 9h.01M9 17h.01M15 17h.01" />
                                        </svg>
                                        Report Issue
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
