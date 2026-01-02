import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Settings, History, HelpCircle, Info, Check, ExternalLink, ArrowLeft, Copy, ThumbsUp, ThumbsDown, RefreshCw, MoreVertical, Mail, FileText, Flag, Volume2, LogOut, Users, Book, Sparkles, Edit2, MessageSquare } from 'lucide-react';
import { PulseCheck } from '../components/PulseCheck';
import { Layout } from '../components/Layout';
import { GenerateButton } from '../components/GenerateButton';
import { Tooltip } from '../components/ui/Tooltip';
import { Button } from '../components/ui/Button';
import { cn } from '../components/ui/Tooltip';
import { generateSummary } from '../services/openai';
import { signInWithGoogle, logout, subscribeToAuthChanges, clearCachedToken as clearChromeIdentityToken, type ChromeUser } from '../services/chrome-auth';
import { saveHistoryToFirestore, getHistoryFromFirestore, clearHistoryFromFirestore, saveUserProfile } from '../services/firebase-extension';

import { identifyUser, trackEvent, resetAnalytics, initAnalytics } from '../services/analytics';
import { isUrlSupported } from '../constants/supportedSites';
import { ReportIssueModal } from '../components/ReportIssueModal';
import { jsPDF } from 'jspdf';

interface HomeViewProps {
    onGenerateComplete?: (summary: string) => void;
}




const CheckboxRow = ({
    label,
    subtext,
    checked,
    onChange
}: {
    label: string;
    subtext: string;
    checked: boolean;
    onChange: () => void;
}) => (
    <div className="flex items-center gap-4 p-2 cursor-pointer group hover:bg-gray-50 rounded-xl transition-colors" onClick={onChange}>
        <div className={cn(
            "w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 shrink-0",
            checked ? "bg-black border-black" : "bg-white border-gray-300 group-hover:border-gray-400"
        )}>
            {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </div>
        <div className="flex flex-col select-none">
            <span className="text-sm font-medium text-gray-900">{label}</span>
            <span className="text-xs text-gray-500">{subtext}</span>
        </div>
    </div>
);

// Quota Counter Component
const QuotaCounter = ({ user }: { user: ChromeUser | null }) => {
    const [quotaUsed, setQuotaUsed] = useState<number>(0);
    const [quotaLimit, setQuotaLimit] = useState<number>(user ? 14 : 3);

    useEffect(() => {
        // Load quota from storage
        chrome.storage.local.get(['quotaUsed', 'quotaLimit'], (result) => {
            if (result.quotaUsed !== undefined) setQuotaUsed(result.quotaUsed as number);
            if (result.quotaLimit !== undefined) setQuotaLimit(result.quotaLimit as number);
        });

        // Listen for quota updates
        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes.quotaUsed) setQuotaUsed(changes.quotaUsed.newValue as number);
            if (changes.quotaLimit) setQuotaLimit(changes.quotaLimit.newValue as number);
        };

        chrome.storage.onChanged.addListener(handleStorageChange);
        return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }, []);

    // Update limit when user changes
    useEffect(() => {
        setQuotaLimit(user ? 14 : 3);
    }, [user]);

    return (
        <Tooltip content={`Daily quota: ${quotaUsed}/${quotaLimit} used`} side="bottom">
            <span className="px-2 py-0.5 rounded-md bg-gray-50 text-gray-600 text-[10px] font-semibold border border-gray-200 shadow-sm">
                {quotaUsed}/{quotaLimit}
            </span>
        </Tooltip>
    );
};

type PopupType = 'none' | 'more' | 'profile' | 'metadata' | 'history' | 'settings' | 'help' | 'feedback';

const SummaryToolbar = ({ summary, onEdit, activePopup, onTogglePopup, onRegenerate, user, onReportIssue }: {
    summary: string;
    onEdit: () => void;
    activePopup: PopupType;
    onTogglePopup: (type: PopupType) => void;
    onRegenerate: () => void;
    user: ChromeUser | null;
    onReportIssue: () => void;
}) => {
    const [feedback, setFeedback] = useState<'idle' | 'good' | 'bad' | 'copied' | 'doc'>('idle');
    const [goodActive, setGoodActive] = useState(false);
    const [badActive, setBadActive] = useState(false);

    const [isSpeaking, setIsSpeaking] = useState(false);

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

    const handleListen = () => {
        if ('speechSynthesis' in window) {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
            } else {
                const utterance = new SpeechSynthesisUtterance(summary);
                utterance.onend = () => setIsSpeaking(false);
                window.speechSynthesis.speak(utterance);
                setIsSpeaking(true);
            }
        }
    };

    const handleDoc = async () => {
        onTogglePopup('none');
        if (!summary) return;

        try {
            // Create HTML for the doc (preserves formatting)
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5;">
                    ${summary.replace(/\n/g, '<br>')}
                    <br><br>
                    <hr style="border: 0; border-top: 1px solid #ccc;">
                    <p style="color: #666; font-size: 9pt;">Generated by Summarai</p>
                </div>
            `;

            const blob = new Blob([htmlContent], { type: 'text/html' });
            const textBlob = new Blob([summary], { type: 'text/plain' });

            // Try writing HTML to clipboard
            if (typeof ClipboardItem !== 'undefined') {
                try {
                    // @ts-ignore
                    const data = [new ClipboardItem({
                        'text/html': blob,
                        'text/plain': textBlob,
                    })];
                    await navigator.clipboard.write(data);
                } catch (err) {
                    // Fallback to text only if HTML fails
                    await navigator.clipboard.writeText(summary);
                }
            } else {
                await navigator.clipboard.writeText(summary);
            }

            setFeedback('doc');
            setTimeout(() => setFeedback('idle'), 4000);

            // Set flag for the content script to show the "Paste" guide
            await chrome.storage.local.set({ 'pendingSummaryPaste': true });

            // Open new Google Doc
            window.open('https://docs.google.com/document/create', '_blank');

        } catch (e) {
            console.error("Export failed", e);
            // Ultimate fallback
            window.open('https://docs.google.com/document/create', '_blank');
        }
    };

    const handlePDF = async () => {
        onTogglePopup('none');
        if (!summary) return;

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const title = tab?.title || "SummarAI Report";


            const doc = new jsPDF();

            // Title
            doc.setFontSize(16);
            const splitTitle = doc.splitTextToSize(title, 170);
            doc.text(splitTitle, 20, 20);

            const titleHeight = doc.getTextDimensions(splitTitle).h;
            let currentY = 20 + titleHeight + 5;

            // Date
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, currentY);
            currentY += 10;

            // Content
            doc.setFontSize(12);
            doc.setTextColor(0);

            const splitText = doc.splitTextToSize(summary, 170);
            doc.text(splitText, 20, currentY);

            // Footer
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.setTextColor(150);
                doc.text('Generated by Summarai', 20, 285);
            }

            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = String(now.getFullYear()).slice(-2); // YY
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');

            const filename = `summarai_${day}.${month}.${year}_${hours}.${minutes}.pdf`;

            doc.save(filename);

            setFeedback('doc'); // Reuse doc feedback for simplicity or add 'pdf'
            setTimeout(() => setFeedback('idle'), 3000);

        } catch (e) {
            console.error("PDF Generation failed", e);
            toast.error("Failed to generate PDF. Please try again.");
        }
    };


    return (
        <div className="relative">
            <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-gray-100 shadow-lg min-h-[40px]">

                {/* Good Button */}
                <Tooltip content="Good Response">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleGood}
                        className={cn(
                            "h-8 w-8 rounded-lg transition-colors shrink-0 focus:outline-none focus:ring-0",
                            goodActive ? "text-black hover:bg-gray-100" : "text-gray-500 hover:bg-gray-50"
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
                            badActive ? "text-black hover:bg-gray-100" : "text-gray-500 hover:bg-gray-50"
                        )}
                    >
                        <ThumbsDown className={cn("w-4 h-4", badActive && "fill-current")} />
                    </Button>
                </Tooltip>

                {/* Bad Feedback Message */}
                {feedback === 'bad' && (
                    <div className="overflow-hidden whitespace-nowrap text-[10px] font-medium text-black px-1 animate-fade-in">
                        Thanks for feedback
                    </div>
                )}

                <div className="w-px h-4 bg-gray-200 mx-0.5 shrink-0" />

                {/* Regenerate */}
                <Tooltip content="Regenerate">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRegenerate}
                        className="h-8 w-8 hover:bg-gray-50 rounded-lg text-gray-500 shrink-0 focus:outline-none focus:ring-0"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </Tooltip>

                {/* Copy */}
                <Tooltip content="Copy">
                    <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 hover:bg-gray-50 rounded-lg text-gray-500 shrink-0 focus:outline-none focus:ring-0">
                        <Copy className="w-4 h-4" />
                    </Button>
                </Tooltip>

                {/* Copy Feedback Message */}
                {feedback === 'copied' && (
                    <div className="overflow-hidden whitespace-nowrap text-[10px] font-medium text-gray-700 flex items-center gap-1 px-1 animate-fade-in">
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

                {/* More */}
                <div className="relative shrink-0">
                    <Tooltip content="More">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onTogglePopup(activePopup === 'more' ? 'none' : 'more')}
                            className={cn(
                                "h-8 w-8 rounded-lg text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-0",
                                activePopup === 'more' && "bg-gray-100 text-gray-900"
                            )}
                        >
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </Tooltip>
                    {activePopup === 'more' && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => onTogglePopup('none')} />
                            <div className="absolute bottom-full right-0 mb-2 w-auto min-w-[200px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50 flex flex-col py-2 animate-slide-up-fade">
                                <button
                                    onClick={() => {
                                        onEdit();
                                        onTogglePopup('none');
                                    }}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-200/50 w-full text-left transition-colors font-medium"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit summary
                                </button>
                                <button
                                    onClick={handleListen}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-200/50 w-full text-left transition-colors font-medium",
                                        isSpeaking ? "text-blue-600" : "text-gray-700"
                                    )}
                                >
                                    <Volume2 className={cn("w-4 h-4", isSpeaking && "animate-pulse")} />
                                    {isSpeaking ? 'Stop speaking' : 'Listen'}
                                </button>
                                <button
                                    onClick={handleDoc}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-200/50 w-full text-left transition-colors font-medium"
                                >
                                    <FileText className="w-4 h-4" />
                                    Export to Docs
                                </button>
                                <button
                                    onClick={handlePDF}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-200/50 w-full text-left transition-colors font-medium"
                                >
                                    <FileText className="w-4 h-4" />
                                    Download PDF Report
                                </button>
                                <button
                                    onClick={() => {
                                        const greeting = user?.name ? `Hi ${user.name.split(' ')[0]},\n\n` : '';
                                        window.open(`https://mail.google.com/mail/?view=cm&fs=1&body=${encodeURIComponent(greeting + summary)}`, '_blank');
                                    }}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-200/50 w-full text-left transition-colors font-medium"
                                >
                                    <Mail className="w-4 h-4" />
                                    Draft in Gmail
                                </button>
                                <button
                                    onClick={() => window.open('https://superextension.in/report', '_blank')}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-200/50 w-full text-left transition-colors font-medium"
                                >
                                    <Flag className="w-4 h-4" />
                                    Report legal issue
                                </button>
                                <button
                                    onClick={() => onTogglePopup('settings')}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-200/50 w-full text-left transition-colors font-medium"
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </button>

                                <div className="my-1 border-t border-gray-200" />

                                <div className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 w-full text-left font-medium select-none">
                                    <Sparkles className="w-4 h-4" />
                                    Model: GPT-4o-mini
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export const HomeView: React.FC<HomeViewProps> = () => {
    const [genState, setGenState] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
    const [includeAI, setIncludeAI] = useState(false);
    const [analyzeImages, setAnalyzeImages] = useState(false);
    const [activePopup, setActivePopup] = useState<PopupType>('none');
    const [summary, setSummary] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [summaryType, setSummaryType] = useState<'TXT' | 'JSON' | 'XML'>('TXT');
    const [provider, setProvider] = useState<'openai' | 'google' | 'auto'>('auto');
    const [user, setUser] = useState<ChromeUser | null>(null);
    const [isPro, setIsPro] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [isSupported, setIsSupported] = useState<boolean>(false);
    const [isContentScriptReady, setIsContentScriptReady] = useState<boolean>(false);
    const [hasConversation, setHasConversation] = useState<boolean>(true); // Assume true initially, check later
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [containerHeight, setContainerHeight] = useState(window.innerHeight || 800);
    const [lastPrompts, setLastPrompts] = useState<string>("");
    const [showReportModal, setShowReportModal] = useState(false);
    const [betaClickCount, setBetaClickCount] = useState(0);

    useEffect(() => {
        console.log("Summarai Version 1.0.5 Loaded");
        const handleResize = () => setContainerHeight(window.innerHeight || 800);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isCompact = containerHeight < 250;
    const isTiny = containerHeight < 150;

    const checkCurrentTab = async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const url = tab?.url;

            if (url) {
                const supported = isUrlSupported(url);
                setIsSupported(supported);

                // Test if content script is loaded
                if (tab.id && supported) {
                    try {
                        await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
                        setIsContentScriptReady(true);
                    } catch (e) {
                        // Content script not loaded - need to reload page
                        setIsContentScriptReady(false);
                    }
                } else {
                    setIsContentScriptReady(false);
                }
            } else {
                setIsSupported(false);
                setIsContentScriptReady(false);
            }
        } catch (error) {
            console.error("Tab check failed:", error);
            setIsSupported(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Check if there's actual conversation content on the page
    const checkConversationContent = async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab?.id) {
                setHasConversation(false);
                return;
            }

            // Only check for chat platforms (ChatGPT, Gemini, Claude)
            const url = tab.url || '';
            const isChatPlatform = url.includes('chatgpt.com') ||
                url.includes('gemini.google.com') ||
                url.includes('claude.ai');

            if (!isChatPlatform) {
                setHasConversation(true); // Non-chat platforms always have "content"
                return;
            }

            // Try to scrape content to check if conversation exists
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'getPageContent',
                includeImages: false
            });

            if (response && !response.error) {
                // Check if there's meaningful conversation
                // FORCE TRUE: We trust the user. If they click generate, we try.
                setHasConversation(true);
            } else {
                // Even if check fails, let them try.
                setHasConversation(true);
            }
        } catch (error) {
            // If we can't check, assume there's content (fail-safe)
            setHasConversation(true);
        }
    };

    useEffect(() => {
        initAnalytics();

        // Wait for PostHog to initialize before tracking
        setTimeout(() => {
            trackEvent('extension_opened');
        }, 100);

        chrome.storage.local.get(['isPro'], (result) => {
            setIsPro(!!result.isPro);
        });

        // Initial check
        checkCurrentTab();
        checkConversationContent();

        // Listen for tab switches
        const handleTabActivated = () => {
            setIsLoading(true);
            checkCurrentTab();
            checkConversationContent();
        };

        // Listen for URL updates
        const handleTabUpdated = (_tabId: number, _changeInfo: any, tab: chrome.tabs.Tab) => {
            // Check if it's the active tab
            if (tab.active) {
                // Only show loading if URL changed significantly or status is loading
                // But for now, let's just check without full loading state reset to avoid flickering on minor updates
                checkCurrentTab();
                checkConversationContent();
            }
        };

        chrome.tabs.onActivated.addListener(handleTabActivated);
        chrome.tabs.onUpdated.addListener(handleTabUpdated);

        return () => {
            chrome.tabs.onActivated.removeListener(handleTabActivated);
            chrome.tabs.onUpdated.removeListener(handleTabUpdated);
        };
    }, []);

    // Reset button state when options change (disable auto-regenerate)
    useEffect(() => {
        if (summary && genState === 'completed') {
            setGenState('idle');
        }
    }, [includeAI, analyzeImages]);



    // ... (inside useEffect)

    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges(async (u: ChromeUser | null) => {
            setUser(u);
            if (u) {
                identifyUser(u.id, u.email || undefined);
                saveUserProfile(u); // Save user profile to Firestore

                // Load Cloud History
                const cloudHistory = await getHistoryFromFirestore(u.id);
                if (cloudHistory && cloudHistory.length > 0) {
                    setHistory(cloudHistory);
                    chrome.storage.local.set({ history: cloudHistory });
                }
            } else {
                resetAnalytics();
            }
        });
        return () => unsubscribe();
    }, []);

    // Load API Key, Provider, and History from storage on mount
    React.useEffect(() => {
        chrome.storage.local.get(['summaryType', 'provider', 'history'], (result) => {
            if (result.summaryType) {
                setSummaryType(result.summaryType as 'TXT' | 'JSON' | 'XML');
            }
            if (result.provider) {
                setProvider(result.provider as 'openai' | 'google' | 'auto');
            }
            if (result.history && Array.isArray(result.history)) {
                setHistory(result.history);
            }
        });
    }, []);

    const handleProviderChange = (newProvider: 'openai' | 'google' | 'auto') => {
        setProvider(newProvider);
        chrome.storage.local.set({ provider: newProvider });
        trackEvent('provider_changed', { provider: newProvider });
    };

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
            setActivePopup('none');
        } catch (e: any) {
            console.error("Login Error:", e);
            toast.error(`Login failed: ${e.message}`);
        }
    };

    const handleLogout = async () => {
        await logout();
        setActivePopup('none');
    };

    const handleSwitchAccount = async () => {
        await clearChromeIdentityToken();
        handleLogin();
    };

    const handleViewHistoryItem = (item: any) => {
        setSummary(item.summary);
        setGenState('completed');
        setActivePopup('none');
        trackEvent('history_item_viewed', { item_id: item.id });
    };

    const handleHelpAction = (action: string) => {
        window.open(`https://superextension.in/help?topic=${action}`, '_blank');
        setActivePopup('none');
        trackEvent('help_action_clicked', { action });
    };

    const handleGenerate = async (additionalInfo?: string, format?: 'paragraph' | 'points', tone?: 'normal' | 'professional' | 'creative') => {

        setGenState('generating');

        try {
            // 1. Get Active Tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab.id) throw new Error("No active tab found");

            // 2. Scrape Content
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageContent', includeImages: analyzeImages });

            if (!response) {
                throw new Error("Failed to scrape content. Refresh the page and try again.");
            }

            // Prepare content
            let textToAnalyze = "";

            if (response.conversation && response.conversation.length > 0) {
                if (includeAI) {
                    // Include BOTH User and AI
                    textToAnalyze = response.conversation
                        .map((turn: any) => `${turn.role === 'user' ? 'User' : 'AI'}: ${turn.text}`)
                        .join('\n\n');
                } else {
                    // Filter for USER prompts only
                    const userPrompts = response.conversation
                        .filter((turn: any) => turn.role === 'user')
                        .map((turn: any) => `User: ${turn.text}`)
                        .join('\n\n');

                    textToAnalyze = userPrompts;
                }
            }

            // Fallback: If conversation filtering yielded nothing (e.g. Desperate Mode returned 'assistant' role but includeAI is false),
            // OR if there was no conversation structure to begin with, use rawText.
            if (!textToAnalyze || textToAnalyze.trim().length === 0) {
                textToAnalyze = response.rawText || "";
            }

            setLastPrompts(textToAnalyze);

            // 3. Generate Summary
            console.log("Calling generateSummary with:", { includeAI, format: format || summaryType, provider, images: response.images?.length, tone });

            // Create a promise for the minimum animation time (e.g., 2.5 seconds)
            const animationPromise = new Promise(resolve => setTimeout(resolve, 2500));

            // Generate or retrieve device ID
            let deviceId = '';
            try {
                const stored = await chrome.storage.local.get(['deviceId']);
                if (stored.deviceId) {
                    deviceId = stored.deviceId as string;
                } else {
                    // Generate new device ID
                    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    await chrome.storage.local.set({ deviceId });
                }
            } catch (e) {
                console.error("Device ID Error:", e);
                deviceId = `temp_${Date.now()}`;
            }

            // Get auth token if user is logged in
            let authToken: string | undefined = undefined;
            if (user) {
                try {
                    // Get access token first
                    const accessToken = await new Promise<string | undefined>((resolve) => {
                        chrome.identity.getAuthToken({ interactive: false }, (token) => {
                            resolve((token as string) || undefined);
                        });
                    });

                    if (accessToken) {
                        // Verify the access token is valid
                        const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`);
                        if (response.ok) {
                            // Token is valid, use it for backend auth
                            authToken = accessToken;
                            console.log("Auth token obtained for user:", user.email);
                        }
                    }
                } catch (e) {
                    console.error("Auth token error:", e);
                }
            }

            // Run generation and animation timer in parallel
            const [generatedSummary] = await Promise.all([
                generateSummary(textToAnalyze, {
                    includeAI,
                    format: format || summaryType, // Use passed format or default
                    length: 'medium',
                    apiKey: '',
                    provider,
                    images: analyzeImages ? response.images : undefined,
                    tone: tone // Pass tone
                }, provider, additionalInfo, authToken, deviceId),
                animationPromise
            ]);

            setSummary(generatedSummary);
            setGenState('completed');
            setIsRegenerating(false);

            // Save to History
            const newHistoryItem = {
                id: Date.now(),
                summary: generatedSummary,
                date: new Date().toISOString(),
                preview: generatedSummary.slice(0, 100) + "...",
                platform: response.platform || 'generic',
                type: analyzeImages ? 'prompt+response+image' : (includeAI ? 'prompt+response' : 'prompt')
            };

            // 1. Save Local
            chrome.storage.local.get(['history'], (result) => {
                const currentHistory = (result.history as any[]) || [];
                const updatedHistory = [newHistoryItem, ...currentHistory].slice(0, 50);
                chrome.storage.local.set({ history: updatedHistory });
                setHistory(updatedHistory);
            });

            // Increment Summarize Count for Pulse Check
            chrome.storage.local.get(['summarizeCount'], (res) => {
                const currentCount = (res.summarizeCount as number) || 0;
                chrome.storage.local.set({ summarizeCount: currentCount + 1 });
            });

            // 2. Save Cloud (if logged in)
            if (user && tab.url && generatedSummary) {
                saveHistoryToFirestore(user.id, generatedSummary, tab.url);
            }

            trackEvent('summary_generated', {
                type: summaryType,
                length: summary ? summary.length : 0,
                is_pro: isPro,
                include_ai: includeAI,
                analyze_images: analyzeImages,
                format: format || summaryType,
                tone: tone || 'normal',
                provider: provider
            });
        } catch (error: any) {
            console.error("Generation failed:", error);
            const msg = error.message || "Failed to generate summary";

            if (msg.includes("Guest Quota Exceeded")) {
                toast.error("You've used your 3 free summaries today! Sign in with Google to get 14 daily summaries.", { duration: 5000 });
                setActivePopup('profile'); // Open profile to help them sign in
                setGenState('error');
            } else if (msg.includes("Could not establish connection") || msg.includes("Receiving end does not exist") || msg.includes("Extension context invalidated")) {
                try {
                    // Attempt to re-inject content script
                    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                    if (tab?.id) {
                        await chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            files: ['src/content.ts']
                        });
                        // Retry generation once
                        // We can't easily recurse here without passing args, so we'll just ask user to click again or reload if they prefer
                        // But let's try to just alert them that we fixed it
                        toast.success("Connection restored! Please click 'Generate' again.");
                    }
                } catch (e) {
                    if (confirm("Connection lost. Please reload the page to fix it.")) {
                        chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
                            if (tab.id) chrome.tabs.reload(tab.id);
                        });
                    }
                }
                setGenState('idle');
            } else {
                // Display error in summary box instead of alert
                setSummary(msg);
                setGenState('error');
            }

            trackEvent('generation_failed', { error: msg });
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleClearHistory = () => {
        if (confirm("Are you sure you want to clear your history?")) {
            chrome.storage.local.set({ history: [] });
            setHistory([]);

            if (user) {
                clearHistoryFromFirestore(user.id);
            }
        }
    };

    const handleRegenerate = () => {
        setIsRegenerating(true);
        trackEvent('regenerate_clicked');
        handleGenerate();
    };

    const handleBack = () => {
        setSummary(null);
        setGenState('idle');
    };


    // Close popup on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activePopup !== 'none') {
                // Check if the click is inside a popup or a trigger button
                const target = event.target as HTMLElement;
                if (!target.closest('.popup-content') && !target.closest('button')) {
                    setActivePopup('none');
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activePopup]);

    return (
        <Layout>
            <div className="flex flex-col h-full relative">
                {/* Summary Box - Takes up remaining space */}
                <div className="flex-1 min-h-[300px] mb-4">
                    <div className="w-full h-full flex flex-col overflow-hidden relative border border-gray-200 rounded-2xl">
                        {/* Top Right: Beta, Quota & Profile - Always Visible */}
                        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                            <span
                                className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider border border-blue-100 shadow-sm cursor-pointer hover:bg-blue-100 transition-colors"
                                onClick={() => {
                                    const newCount = betaClickCount + 1;
                                    setBetaClickCount(newCount);
                                    if (newCount === 6) {
                                        setActivePopup('feedback');
                                        setBetaClickCount(0); // Reset
                                    }
                                }}
                            >
                                Beta
                            </span>

                            {/* Quota Counter */}
                            <QuotaCounter user={user} />

                            <Tooltip content="Profile" side="bottom" disabled={activePopup === 'profile'}>
                                <div
                                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-300 transition-colors overflow-hidden"
                                    onClick={() => setActivePopup(activePopup === 'profile' ? 'none' : 'profile')}
                                >
                                    {user && user.picture ? (
                                        <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        user && user.name ? user.name[0].toUpperCase() : "BA"
                                    )}
                                </div>
                            </Tooltip>

                            {/* Profile Popup */}
                            {activePopup === 'profile' && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setActivePopup('none')} />
                                    <div className="popup-content absolute top-full right-0 mt-2 w-auto min-w-[200px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-40 flex flex-col py-1 animate-slide-up-fade" onClick={(e) => e.stopPropagation()}>
                                        {user ? (
                                            <>
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="text-xs font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-[10px] text-gray-500 truncate">{user.email}</p>

                                                </div>

                                                <button
                                                    onClick={handleSwitchAccount}
                                                    className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                                                >
                                                    <Users className="w-3.5 h-3.5" />
                                                    Switch Account
                                                </button>
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                                                >
                                                    <LogOut className="w-3.5 h-3.5" />
                                                    Logout
                                                </button>
                                            </>
                                        ) : (
                                            <div className="p-4 flex flex-col gap-3">
                                                <p className="text-xs text-gray-600 text-center">Sign in to sync history and upgrade.</p>
                                                <button
                                                    onClick={handleLogin}
                                                    className="flex items-center justify-center gap-2 w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-xs font-medium"
                                                >
                                                    <Users className="w-3.5 h-3.5" />
                                                    Sign in with Google
                                                </button>
                                                <button
                                                    onClick={() => window.open('https://accounts.google.com/signin/recovery', '_blank')}
                                                    className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors text-center w-full"
                                                >
                                                    Forgot Password?
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        {summary ? (
                            <div
                                key="summary-content"
                                className="flex flex-col h-full relative animate-fade-in"
                            >
                                {/* Floating Back Button */}
                                <div className="absolute top-4 left-4 z-30">
                                    <Tooltip content="Back" side="bottom">
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            onClick={handleBack}
                                            className="rounded-full w-8 h-8 shadow-sm border-gray-200 bg-white/80 backdrop-blur-sm"
                                        >
                                            <ArrowLeft className="w-4 h-4 text-gray-600" />
                                        </Button>
                                    </Tooltip>
                                </div>

                                {/* Top Solid Header Mask */}
                                <div className="absolute top-0 left-0 right-0 h-16 bg-white z-20 border-b border-gray-50" />


                                {/* Content */}
                                {isEditing ? (
                                    <textarea
                                        value={summary}
                                        onChange={(e) => setSummary(e.target.value)}
                                        onBlur={() => setIsEditing(false)}
                                        autoFocus
                                        className="flex-1 w-full resize-none no-scrollbar p-6 pt-20 pb-4 text-sm leading-relaxed text-gray-700 text-justify font-sans border-none focus:ring-0 outline-none"
                                    />
                                ) : (
                                    <div className="flex-1 overflow-y-auto no-scrollbar text-sm leading-relaxed text-gray-700 text-justify font-sans p-6 pt-20 pb-4 space-y-2">
                                        {summary.split('\n').map((line, i) => {
                                            const trimmed = line.trim();
                                            if (trimmed.startsWith('-')) {
                                                return (
                                                    <div key={i} className="flex gap-2 items-start">
                                                        <span className="shrink-0 text-black font-bold">•</span>
                                                        <span>{trimmed.substring(1).trim()}</span>
                                                    </div>
                                                );
                                            }
                                            return <p key={i}>{line}</p>;
                                        })}
                                    </div>
                                )}

                                {/* Bottom Section (inside card overlay) */}
                                <div className="w-full shrink-0 flex flex-col items-end gap-3 bg-white border-t border-gray-50 pt-4 pb-4 px-4">

                                    {/* Disclaimer */}
                                    <div className="w-full text-center">
                                        <span className="text-[10px] text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 opacity-80">
                                            {provider === 'google' ? 'Gemini' : provider === 'openai' ? 'ChatGPT' : 'AI'} can make mistakes. Regenerate if needed.
                                        </span>
                                    </div>

                                    {/* Floating Toolbar */}
                                    <SummaryToolbar
                                        summary={summary}
                                        onEdit={() => setIsEditing(true)}
                                        activePopup={activePopup}
                                        onTogglePopup={setActivePopup}
                                        onRegenerate={handleRegenerate}
                                        user={user}
                                        onReportIssue={() => setShowReportModal(true)}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div
                                key="empty-state"
                                className="w-full h-full animate-fade-in p-6 pt-16 flex flex-col items-center justify-center gap-4"
                            >
                                {isLoading ? (
                                    <div className="flex flex-col items-center gap-3 text-center max-w-sm">
                                        <div className="w-6 h-6 border-2 border-gray-100 border-t-gray-400 rounded-full animate-spin" />
                                    </div>
                                ) : !isSupported ? (
                                    <>
                                        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
                                            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                                                <Info className="w-6 h-6 text-amber-600" />
                                            </div>
                                            <h3 className="text-base font-semibold text-gray-900">
                                                Page not supported
                                            </h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                Works on ChatGPT, Gemini, and 20+ AI platforms.
                                            </p>
                                            <button
                                                onClick={() => window.open('https://superextension.in/supported-sites.pdf', '_blank')}
                                                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium mt-2"
                                            >
                                                <Book className="w-4 h-4" />
                                                View All Supported Sites
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </button>
                                            <p className="text-xs text-gray-400 mt-2">
                                                Made to tailor your conversation with AI apps
                                            </p>
                                        </div>
                                    </>
                                ) : !hasConversation ? (
                                    <div className="flex flex-col items-center gap-3 text-center max-w-sm">
                                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                                            <Info className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-900">
                                            No conversation found
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Start a chat first, then generate a summary.
                                        </p>
                                    </div>
                                ) : (
                                    <span className="text-gray-400 text-sm">
                                        {isContentScriptReady ? "Ready to generate summary" : "Ready when you reload the page ↻"}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Floating Button for Compact Mode */}
                    {isCompact && (
                        <div className="absolute bottom-4 right-4 z-[60]">
                            <GenerateButton
                                onGenerate={handleGenerate}
                                state={genState}
                                isRegenerating={isRegenerating}
                                disabled={!isSupported}
                                compact={true}
                                includeAI={includeAI}
                                analyzeImages={analyzeImages}
                            />
                        </div>
                    )}
                </div>

                {/* Fixed Bottom Section */}
                <div className={cn("shrink-0 flex flex-col gap-4 pb-2 relative z-50", isCompact && "gap-0 pb-0")}>
                    {!isCompact && (
                        <GenerateButton
                            onGenerate={handleGenerate}
                            state={genState}
                            isRegenerating={isRegenerating}
                            disabled={!isSupported || !hasConversation}
                            includeAI={includeAI}
                            analyzeImages={analyzeImages}
                        />
                    )}

                    {!isTiny && (
                        <div className="space-y-3 px-1">
                            <CheckboxRow
                                label="Include AI responses"
                                subtext="Summarize the full conversation"
                                checked={includeAI}
                                onChange={() => {
                                    setIncludeAI(prev => !prev);
                                }}
                            />
                            <CheckboxRow
                                label="Read images"
                                subtext="Include visual context"
                                checked={analyzeImages}
                                onChange={() => {
                                    setAnalyzeImages(prev => !prev);
                                }}
                            />
                        </div>
                    )}

                    {/* Bottom Buttons Row */}
                    <div className="relative flex items-center justify-between pt-2 px-1">
                        <div className="relative z-[110]">
                            <Tooltip content="Metadata">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className={cn(
                                        "relative z-[110] rounded-full w-8 h-8 shadow-sm border-gray-200 text-gray-500 transition-colors hover:bg-gray-50",
                                        activePopup === 'metadata' && "bg-gray-100 text-gray-900 border-gray-300"
                                    )}
                                    onClick={() => setActivePopup(activePopup === 'metadata' ? 'none' : 'metadata')}
                                >
                                    <Info className="w-4 h-4" />
                                </Button>
                            </Tooltip>
                            {activePopup === 'metadata' && (
                                <>
                                    <div className="fixed inset-0 z-[90]" onClick={() => setActivePopup('none')} />
                                    <div className="popup-content absolute bottom-full left-0 mb-2 z-[100] w-[280px] bg-white rounded-2xl shadow-xl border border-gray-200 p-5 text-sm origin-bottom-left" onClick={(e) => e.stopPropagation()}>
                                        <h3 className="font-semibold text-gray-900 mb-4">Metadata</h3>
                                        <div className="space-y-3 text-gray-600">
                                            <div className="flex justify-between items-center">
                                                <span>Version</span>
                                                <span className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">Tiger v1.0</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span>Engine</span>
                                                <span className="font-medium text-gray-900">GPT-4o-mini</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span>Status</span>
                                                <span className="flex items-center gap-1.5 font-medium text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                                                    Active
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span>Developer</span>
                                                <span className="font-medium text-gray-900">Bharath Amaravadi</span>
                                            </div>
                                            <div className="pt-3 mt-1 border-t border-gray-100">
                                                <button
                                                    onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') })}
                                                    className="flex items-center justify-center gap-2 w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-xs"
                                                >
                                                    Visit Website
                                                    <ExternalLink className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="hidden flex flex-nowrap items-center gap-1 z-[110]">
                            <div className="relative">
                                <Tooltip content="Feedback" disabled={activePopup === 'feedback'}>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="relative z-20 rounded-full w-8 h-8 shadow-sm border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
                                        onClick={() => setActivePopup(activePopup === 'feedback' ? 'none' : 'feedback')}
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                    </Button>
                                </Tooltip>
                                {activePopup === 'feedback' && (
                                    <div className="fixed inset-0 z-[90]" onClick={() => setActivePopup('none')} />
                                )}
                                <PulseCheck
                                    open={activePopup === 'feedback'}
                                    onOpenChange={(open) => setActivePopup(open ? 'feedback' : 'none')}
                                    userEmail={user?.email}
                                />
                            </div>
                            <div className="relative">
                                <Tooltip content="History" disabled={activePopup === 'history'}>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className={cn(
                                            "relative z-20 rounded-full w-8 h-8 shadow-sm border-gray-200 text-gray-500 transition-colors hover:bg-gray-50",
                                            activePopup === 'history' && "bg-gray-100 text-gray-900 border-gray-300"
                                        )}
                                        onClick={() => setActivePopup(activePopup === 'history' ? 'none' : 'history')}
                                    >
                                        <History className="w-4 h-4" />
                                    </Button>
                                </Tooltip>
                                {activePopup === 'history' && (
                                    <>
                                        <div className="fixed inset-0 z-[90]" onClick={() => setActivePopup('none')} />
                                        <div className="absolute bottom-full left-0 right-0 mb-2 z-[100] flex justify-center">
                                            <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-5 text-sm origin-bottom">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="font-semibold text-gray-900">History</h3>
                                                    <button
                                                        onClick={handleClearHistory}
                                                        className="text-[10px] font-medium text-red-500 hover:text-red-600 transition-colors"
                                                    >
                                                        Clear all
                                                    </button>
                                                </div>
                                                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                                                    {history.length === 0 ? (
                                                        <div className="text-center text-gray-400 py-8">
                                                            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                            <p>No history yet</p>
                                                        </div>
                                                    ) : (
                                                        history.map((item) => (
                                                            <div
                                                                key={item.id}
                                                                onClick={() => handleViewHistoryItem(item)}
                                                                className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer shrink-0"
                                                            >
                                                                <div className="flex justify-between items-start">
                                                                    <span className="font-medium text-xs text-gray-900 line-clamp-1">Summary</span>
                                                                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                                                        {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                                                                    {item.preview}
                                                                </p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="relative">
                                    <Tooltip content="Settings" disabled={activePopup === 'settings'}>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className={cn(
                                                "relative z-20 rounded-full w-8 h-8 shadow-sm border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
                                            )}
                                            onClick={() => setActivePopup(activePopup === 'settings' ? 'none' : 'settings')}
                                        >
                                            <Settings className="w-4 h-4" />
                                        </Button>
                                    </Tooltip>
                                    {activePopup === 'settings' && (
                                        <>
                                            <div className="fixed inset-0 z-[90]" onClick={() => setActivePopup('none')} />
                                            <div className="absolute bottom-full right-0 mb-2 z-[100] w-[200px] bg-white rounded-2xl shadow-xl border border-gray-200 p-5 text-sm origin-bottom-right max-h-[400px] overflow-y-auto custom-scrollbar">
                                                <h3 className="font-semibold text-gray-900 mb-4">Settings</h3>
                                                <div className="space-y-4">
                                                    {/* Summary Type */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Summary Type</label>
                                                        <div className="flex flex-col gap-2">
                                                            {(['TXT', 'JSON', 'XML'] as const).map((type) => (
                                                                <label
                                                                    key={type}
                                                                    className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                                                >
                                                                    <div className={cn(
                                                                        "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                                                                        summaryType === type ? "border-black bg-black" : "border-gray-300 bg-white"
                                                                    )}>
                                                                        {summaryType === type && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                                    </div>
                                                                    <input
                                                                        type="radio"
                                                                        name="summaryType"
                                                                        value={type}
                                                                        checked={summaryType === type}
                                                                        onChange={() => setSummaryType(type)}
                                                                        className="hidden"
                                                                    />
                                                                    <span className="text-xs font-medium text-gray-700">{type}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="h-px bg-gray-100" />

                                                    {/* Debug / Test */}
                                                    <div className="space-y-2">
                                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Debug</h3>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="w-full justify-start text-gray-600"
                                                            onClick={() => {
                                                                toast.success("Success: Summary generated!");
                                                                setTimeout(() => toast.error("Error: Something went wrong"), 1000);
                                                                setTimeout(() => toast.loading("Loading: Analyzing..."), 2000);
                                                                setTimeout(() => toast.dismiss(), 4000);
                                                            }}
                                                        >
                                                            <Sparkles className="w-4 h-4 mr-2" />
                                                            Test Notifications
                                                        </Button>
                                                    </div>

                                                    <div className="text-center pt-2">
                                                        <span className="text-[10px] text-gray-400">v1.0.5 (Tiger)</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="relative">
                                    <Tooltip content="Help" disabled={activePopup === 'help'}>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className={cn(
                                                "relative z-20 rounded-full w-8 h-8 shadow-sm border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
                                            )}
                                            onClick={() => setActivePopup(activePopup === 'help' ? 'none' : 'help')}
                                        >
                                            <HelpCircle className="w-4 h-4" />
                                        </Button>
                                    </Tooltip>
                                    {activePopup === 'help' && (
                                        <>
                                            <div className="fixed inset-0 z-[90]" onClick={() => setActivePopup('none')} />
                                            <div className="absolute bottom-full right-0 mb-2 z-[100] w-max bg-white rounded-2xl shadow-xl border border-gray-200 p-5 text-sm origin-bottom-right">
                                                <h3 className="font-semibold text-gray-900 mb-4">Help & Support</h3>
                                                <div className="space-y-3">
                                                    <button
                                                        onClick={() => handleHelpAction('docs')}
                                                        className="flex items-center gap-3 w-full text-left text-gray-600 hover:text-gray-900 transition-colors"
                                                    >
                                                        <Book className="w-4 h-4" />
                                                        Documentation
                                                    </button>
                                                    <button
                                                        onClick={() => handleHelpAction('faqs')}
                                                        className="flex items-center gap-3 w-full text-left text-gray-600 hover:text-gray-900 transition-colors"
                                                    >
                                                        <HelpCircle className="w-4 h-4" />
                                                        FAQs
                                                    </button>
                                                    <button
                                                        onClick={() => handleHelpAction('support')}
                                                        className="flex items-center gap-3 w-full text-left text-gray-600 hover:text-gray-900 transition-colors"
                                                    >
                                                        <Mail className="w-4 h-4" />
                                                        Contact Support
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Side Buttons: Feedback, History, Settings & Help */}
                        <div className="flex items-center gap-2">
                            {/* Feedback Button */}
                            <div className="relative">
                                <Tooltip content="Feedback" disabled={activePopup === 'feedback'}>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="relative z-[110] rounded-full w-8 h-8 shadow-sm border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
                                        onClick={() => setActivePopup(activePopup === 'feedback' ? 'none' : 'feedback')}
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                    </Button>
                                </Tooltip>

                            </div>

                            {/* History Button */}
                            <div className="relative">
                                <Tooltip content="History" disabled={activePopup === 'history'}>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className={cn(
                                            "relative z-[110] rounded-full w-8 h-8 shadow-sm border-gray-200 text-gray-500 transition-colors hover:bg-gray-50",
                                            activePopup === 'history' && "bg-gray-100 text-gray-900 border-gray-300"
                                        )}
                                        onClick={() => setActivePopup(activePopup === 'history' ? 'none' : 'history')}
                                    >
                                        <History className="w-4 h-4" />
                                    </Button>
                                </Tooltip>

                            </div>

                            {/* Settings Button */}
                            <div className="relative">
                                <Tooltip content="Settings" disabled={activePopup === 'settings'}>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="relative z-[110] rounded-full w-8 h-8 shadow-sm border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
                                        onClick={() => setActivePopup(activePopup === 'settings' ? 'none' : 'settings')}
                                    >
                                        <Settings className="w-4 h-4" />
                                    </Button>
                                </Tooltip>
                                {activePopup === 'settings' && (
                                    <>
                                        <div className="fixed inset-0 z-[90]" onClick={() => setActivePopup('none')} />
                                        <div className="popup-content absolute bottom-full right-0 mb-2 z-[100] w-[200px] bg-white rounded-2xl shadow-xl border border-gray-200 p-5 text-sm origin-bottom-right max-h-[400px] overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
                                            <h3 className="font-semibold text-gray-900 mb-4">Settings</h3>
                                            <div className="space-y-4">
                                                {/* Summary Type */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Summary Type</label>
                                                    <div className="flex flex-col gap-2">
                                                        {(['TXT', 'JSON', 'XML'] as const).map((type) => (
                                                            <label
                                                                key={type}
                                                                className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                                            >
                                                                <div className={cn(
                                                                    "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                                                                    summaryType === type ? "border-black bg-black" : "border-gray-300 bg-white"
                                                                )}>
                                                                    {summaryType === type && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                                </div>
                                                                <input
                                                                    type="radio"
                                                                    name="summaryType"
                                                                    value={type}
                                                                    checked={summaryType === type}
                                                                    onChange={() => setSummaryType(type)}
                                                                    className="hidden"
                                                                />
                                                                <span className="text-xs font-medium text-gray-700">{type}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="h-px bg-gray-100" />

                                                {/* Debug / Test */}
                                                <div className="space-y-2">
                                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Debug</h3>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="w-full justify-start text-gray-600"
                                                        onClick={() => {
                                                            toast.success("Success: Summary generated!");
                                                            setTimeout(() => toast.error("Error: Something went wrong"), 1000);
                                                            setTimeout(() => toast.loading("Loading: Analyzing..."), 2000);
                                                            setTimeout(() => toast.dismiss(), 4000);
                                                        }}
                                                    >
                                                        <Sparkles className="w-4 h-4 mr-2" />
                                                        Test Notifications
                                                    </Button>
                                                </div>

                                                <div className="text-center pt-2">
                                                    <span className="text-[10px] text-gray-400">v1.0.5 (Tiger)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Help Button */}
                            <div className="relative">
                                <Tooltip content="Help" disabled={activePopup === 'help'}>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="relative z-[110] rounded-full w-8 h-8 shadow-sm border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
                                        onClick={() => setActivePopup(activePopup === 'help' ? 'none' : 'help')}
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                    </Button>
                                </Tooltip>
                                {activePopup === 'help' && (
                                    <>
                                        <div className="fixed inset-0 z-[90]" onClick={() => setActivePopup('none')} />
                                        <div className="popup-content absolute bottom-full right-0 mb-2 z-[100] w-max bg-white rounded-2xl shadow-xl border border-gray-200 p-5 text-sm origin-bottom-right" onClick={(e) => e.stopPropagation()}>
                                            <h3 className="font-semibold text-gray-900 mb-4">Help & Support</h3>
                                            <div className="space-y-3">
                                                <button
                                                    onClick={() => handleHelpAction('docs')}
                                                    className="flex items-center gap-3 w-full text-left text-gray-600 hover:text-gray-900 transition-colors"
                                                >
                                                    <Book className="w-4 h-4" />
                                                    Documentation
                                                </button>
                                                <button
                                                    onClick={() => handleHelpAction('faqs')}
                                                    className="flex items-center gap-3 w-full text-left text-gray-600 hover:text-gray-900 transition-colors"
                                                >
                                                    <HelpCircle className="w-4 h-4" />
                                                    FAQs
                                                </button>
                                                <button
                                                    onClick={() => handleHelpAction('support')}
                                                    className="flex items-center gap-3 w-full text-left text-gray-600 hover:text-gray-900 transition-colors"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                    Contact Support
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Moved Popups for Full Width */}
                        {activePopup === 'feedback' && (
                            <div className="fixed inset-0 z-[90]" onClick={() => setActivePopup('none')} />
                        )}
                        <PulseCheck
                            open={activePopup === 'feedback'}
                            onOpenChange={(open) => setActivePopup(open ? 'feedback' : 'none')}
                            userEmail={user?.email}
                        />

                        {activePopup === 'history' && (
                            <>
                                <div className="fixed inset-0 z-[90]" onClick={() => setActivePopup('none')} />

                                <div className="popup-content absolute bottom-full left-0 right-0 mb-2 z-[100] w-auto" onClick={(e) => e.stopPropagation()}>
                                    <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-5 text-sm origin-bottom-right">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-semibold text-gray-900">History</h3>
                                            <button
                                                onClick={handleClearHistory}
                                                className="text-[10px] font-medium text-red-500 hover:text-red-600 transition-colors"
                                            >
                                                Clear all
                                            </button>
                                        </div>
                                        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                                            {history.length === 0 ? (
                                                <div className="text-center text-gray-400 py-8">
                                                    <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                    <p>No history yet</p>
                                                </div>
                                            ) : (
                                                history.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => handleViewHistoryItem(item)}
                                                        className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer shrink-0"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <span className="font-medium text-xs text-gray-900 line-clamp-1 capitalize">
                                                                {item.platform ? `${item.platform} | ${item.type} summary` : 'Summary'}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                                                {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                                                            {item.preview}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Report Issue Modal */}
            <ReportIssueModal
                open={showReportModal}
                onClose={() => setShowReportModal(false)}
                summary={summary || ''}
                prompts={lastPrompts}
            />
        </Layout>
    );
};
