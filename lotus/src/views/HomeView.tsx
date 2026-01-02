/// <reference types="chrome"/>
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Settings, History, HelpCircle, Info, RefreshCw, Power, MessageSquare, User, Mail, Trash, ArrowLeft, ChevronDown } from 'lucide-react';
import { PulseCheck } from '../components/PulseCheck';
import { Layout } from '../components/Layout';
import { GenerateButton } from '../components/GenerateButton';
import { Tooltip } from '../components/ui/Tooltip';
import { Button } from '../components/ui/Button';
import { Marquee } from '../components/ui/Marquee';
import { cn } from '../utils/cn';
import { processContent } from '../core/pipeline/processor';
import { normalizeConversation } from '../core/pipeline/normalizer';
import { generateSummary } from '../services/openai';
import { signInWithGoogle, logout, subscribeToAuthChanges, type ChromeUser } from '../services/chrome-auth';
import { saveHistoryToFirestore, getHistoryFromFirestore, clearHistoryFromFirestore, saveUserProfile, subscribeToAdminFeatures, checkUserProStatus } from '../services/firebase-extension';
import { identifyUser, trackEvent, resetAnalytics, initAnalytics } from '../services/analytics';
import { isUrlSupported, SUPPORTED_SITES } from '../constants/supportedSites';
import { ReportIssueModal } from '../components/ReportIssueModal';
import { UpgradeModal } from '../components/UpgradeModal';
import { GuestLimitModal } from '../components/GuestLimitModal';
import { trackUserSignup } from '../services/userTracking';
import { CheckboxRow } from '../components/CheckboxRow';
import { QuotaCounter } from '../components/QuotaCounter';
import { SummaryToolbar } from '../components/SummaryToolbar';
import { ADMIN_EMAIL } from '../constants/config';

interface HomeViewProps {
    onGenerateComplete?: (summary: string) => void;
    autoGenerate?: boolean;
    onAutoGenerateHandled?: () => void;
}

type PopupType = 'none' | 'more' | 'profile' | 'metadata' | 'history' | 'settings' | 'help' | 'feedback';

export const HomeView: React.FC<HomeViewProps> = ({ onGenerateComplete, autoGenerate, onAutoGenerateHandled }) => {
    const [genState, setGenState] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
    const [includeAI, setIncludeAI] = useState(false);
    const [analyzeImages, setAnalyzeImages] = useState(false);
    const [activePopup, setActivePopup] = useState<PopupType>('none');
    const [summaryType, setSummaryType] = useState<'TXT' | 'JSON' | 'XML'>('TXT');
    const [provider, setProvider] = useState<'openai' | 'google' | 'auto'>('auto');
    const [user, setUser] = useState<ChromeUser | null>(null);
    const [isPro, setIsPro] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [isSupported, setIsSupported] = useState<boolean>(false);
    const [isContentScriptReady, setIsContentScriptReady] = useState<boolean>(false);
    const [hasConversation, setHasConversation] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [containerHeight, setContainerHeight] = useState(window.innerHeight || 800);
    const [lastPrompts, setLastPrompts] = useState<string>("");
    const [showReportModal, setShowReportModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showGuestLimitModal, setShowGuestLimitModal] = useState(false);
    const [betaClickCount, setBetaClickCount] = useState(0);
    const [simulatedTier, setSimulatedTier] = useState<'none' | 'guest' | 'free' | 'pro'>('none');
    const [signingIn, setSigningIn] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [generatedSummary, setGeneratedSummary] = useState<string>('');
    const [isEditing, setIsEditing] = useState(false);
    const [showDebugToastDropdown, setShowDebugToastDropdown] = useState(false);
    const [showSuccessTypes, setShowSuccessTypes] = useState(true);
    const [showErrorTypes, setShowErrorTypes] = useState(true);

    const effectiveUser = simulatedTier === 'none' ? user :
        simulatedTier === 'guest' ? null : user;

    const effectiveIsPro = simulatedTier === 'none' ? isPro :
        simulatedTier === 'pro' ? true : false;

    const handleTestEmail = async () => {
        if (!user?.email) return toast.error("No email found");
        try {
            const toastId = toast.loading("Sending email...");
            const BACKEND_URL = "https://tai-backend.amaravadhibharath.workers.dev";
            await fetch(`${BACKEND_URL}/send-welcome-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    name: user.name
                })
            });
            toast.dismiss(toastId);
            toast.success("Email sent!");
        } catch (e) {
            toast.dismiss();
            toast.error("Failed to send");
            console.error(e);
        }
    };

    useEffect(() => {

        const handleResize = () => setContainerHeight(window.innerHeight || 800);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const unsubscribe = subscribeToAdminFeatures(() => {

        });
        return () => unsubscribe();
    }, []);

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isEditing) {
                    setIsEditing(false);
                } else if (genState === 'completed' && generatedSummary) {
                    setGeneratedSummary('');
                    setGenState('idle');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [genState, generatedSummary, isEditing]);

    useEffect(() => {
        if (user?.email) {
            checkUserProStatus(user.email).then((isAdminPro) => {
                if (isAdminPro) setIsPro(true);
            });
        }
    }, [user]);

    useEffect(() => {
        if (autoGenerate && onAutoGenerateHandled) {
            handleRegenerate();
            onAutoGenerateHandled();
        }
    }, [autoGenerate]);

    const isCompact = containerHeight < 250;

    const checkCurrentTab = async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const url = tab?.url;

            if (url) {
                const supported = isUrlSupported(url);
                setIsSupported(supported);

                if (tab.id && supported) {
                    try {
                        await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
                        setIsContentScriptReady(true);
                    } catch (e) {
                        // Content script not ready
                        setIsContentScriptReady(true);
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

    const checkConversationContent = async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab?.id) {
                setHasConversation(false);
                return;
            }

            const url = tab.url || '';
            const isChatPlatform = url.includes('chatgpt.com') ||
                url.includes('gemini.google.com') ||
                url.includes('claude.ai');

            if (!isChatPlatform) {
                setHasConversation(true);
                return;
            }

            setHasConversation(true);
        } catch (error) {
            setHasConversation(true);
        }
    };

    useEffect(() => {
        initAnalytics();
        setTimeout(() => {
            trackEvent('extension_opened');
        }, 100);

        chrome.storage.local.get(['isPro'], (result) => {
            setIsPro(!!result.isPro);
        });

        checkCurrentTab();
        checkConversationContent();

        const handleTabActivated = () => {
            setIsLoading(true);
            checkCurrentTab();
            checkConversationContent();
        };

        const handleTabUpdated = (_tabId: number, _changeInfo: any, tab: chrome.tabs.Tab) => {
            if (tab.active) {
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

    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges(async (u: ChromeUser | null) => {
            setUser(u);
            if (u) {
                identifyUser(u.id, u.email || undefined);
                saveUserProfile(u);
                const cloudHistory = await getHistoryFromFirestore(u.id);
                if (cloudHistory && cloudHistory.length > 0) {
                    setHistory(cloudHistory);
                    chrome.storage.local.set({ history: cloudHistory });
                }
                chrome.storage.local.set({ quotaUsed: 0 });
            } else {
                resetAnalytics();
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        chrome.storage.local.get(['summaryType', 'provider', 'history'], (result) => {
            if (result.summaryType) setSummaryType(result.summaryType as 'TXT' | 'JSON' | 'XML');
            if (result.provider) setProvider(result.provider as 'openai' | 'google' | 'auto');
            if (result.history && Array.isArray(result.history)) setHistory(result.history);
        });
    }, []);

    const handleLogin = async () => {
        setSigningIn(true);
        try {
            await signInWithGoogle();
            setSimulatedTier('none');
            setActivePopup('none');
            toast.success('Successfully signed in!');
        } catch (e: any) {
            console.error("Login Error:", e);
            toast.error(`Login failed: ${e.message}`);
        } finally {
            setSigningIn(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        setActivePopup('none');
        toast('Successfully signed out.', { icon: '👋' });
    };

    const handleViewHistoryItem = (item: any) => {
        setActivePopup('none');
        trackEvent('history_item_viewed', { item_id: item.id });
        if (onGenerateComplete) onGenerateComplete(item.summary);
    };

    const handleHelpAction = (action: string) => {
        if (action === 'docs') {
            window.open('https://docs.google.com/document/d/1L1BC8IQIQW72Rdpqi1L7TPmeQyc2e9mQAxzExC5un_A/edit?usp=sharing', '_blank');
        } else {
            window.open(`https://superextension.in/help?topic=${action}`, '_blank');
        }
        setActivePopup('none');
        trackEvent('help_action_clicked', { action });
    };

    const handleGenerate = async (
        overrideInfo?: string,
        overrideFormat?: 'paragraph' | 'points' | 'JSON' | 'XML',
        overrideTone?: 'normal' | 'professional' | 'creative'
    ) => {
        const finalInfo = typeof overrideInfo === 'string' ? overrideInfo : '';
        let finalFormat = overrideFormat || summaryType;

        if ((summaryType === 'JSON' || summaryType === 'XML') && finalFormat === 'paragraph') {
            finalFormat = summaryType;
        }

        const finalTone = overrideTone || 'normal';
        setGenState('generating');

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab.id) throw new Error("No active tab found");

            const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageContent', includeImages: analyzeImages }, { frameId: 0 });

            // Check if response is a scraper error
            if (response && 'code' in response) {
                setGenState('error');

                // Show detailed error with suggestion
                toast.error(
                    <div>
                        <div className="font-semibold">{response.message}</div>
                        <div className="text-xs mt-1 opacity-90">💡 {response.suggestion}</div>
                        {response.platform && (
                            <div className="text-xs mt-1 opacity-75">Platform: {response.platform}</div>
                        )}
                    </div>,
                    { duration: 8000 }
                );

                trackEvent('scraping_failed', {
                    code: response.code,
                    platform: response.platform || 'unknown',
                    url: tab.url
                });

                return;
            }

            if (!response) {
                setGenState('error');
                toast.error(
                    <div>
                        <div className="font-semibold">Unable to access page content</div>
                        <div className="text-xs mt-1 opacity-90">💡 Try refreshing the page and waiting for it to fully load</div>
                    </div>,
                    { duration: 6000 }
                );
                return;
            }

            // Track successful scraping
            trackEvent('scraping_success', {
                platform: response.platform || 'unknown',
                messageCount: response.conversation?.length || 0,
                hasStructuredData: response.conversation && response.conversation.length > 0
            });

            // REMOVED NORMALIZER to ensure raw data integrity
            // if (response.conversation) {
            //    response.conversation = normalizeConversation(response.conversation);
            // }

            // BYPASS SURGERY: Manually extract user messages to avoid ANY processor filtering.
            let textToAnalyze = "";
            if (response.conversation && response.conversation.length > 0) {

                textToAnalyze = response.conversation
                    .filter((t: any) => includeAI ? true : t.role === 'user')
                    .map((t: any) => `${t.role === 'user' ? 'User' : 'AI'}: ${t.content}`)
                    .join('\n\n');
            } else {
                // Fallback to processor for raw text
                textToAnalyze = processContent(response, { includeAI });
            }

            // CRITICAL FIX: When regenerating, DO NOT append the previous summary.
            // We want the backend to re-evaluate the RAW content from scratch.
            // The backend has a "Raw Truth Priority" rule that works best on fresh input.
            // So we send `textToAnalyze` as is, which contains only the scraped user prompts.

            if (!textToAnalyze || textToAnalyze.trim().length === 0) {
                textToAnalyze = response.rawText || "";
                if (!textToAnalyze) throw new Error("No content found");
            }

            setLastPrompts(textToAnalyze);


            const animationPromise = new Promise(resolve => setTimeout(resolve, 1000));

            let deviceId = '';
            try {
                const stored = await chrome.storage.local.get(['deviceId']);
                if (stored.deviceId) {
                    deviceId = stored.deviceId as string;
                } else {
                    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    await chrome.storage.local.set({ deviceId });
                }
            } catch (e) {
                deviceId = `temp_${Date.now()}`;
            }

            let authToken: string | undefined = undefined;
            if (user) {
                try {
                    const accessToken = await new Promise<string | undefined>((resolve) => {
                        chrome.identity.getAuthToken({ interactive: false }, (token) => {
                            resolve((token as string) || undefined);
                        });
                    });
                    if (accessToken) authToken = accessToken;
                } catch (e) {
                    console.error("Auth token error:", e);
                }
            }

            // Smart provider selection based on content length
            let selectedProvider = provider; // User's preference
            const contentLength = textToAnalyze.trim().length;

            // Override: Use OpenAI for short content (< 50 chars) for better quality
            if (contentLength < 50) {
                selectedProvider = 'openai';
            }

            // Try primary provider with automatic fallback
            let summary: string;
            let usedProvider = selectedProvider;

            // Check Pro Quota (Client-side enforcement)
            if (effectiveIsPro) {
                await new Promise<void>((resolve, reject) => {
                    chrome.storage.local.get(['quotaUsed', 'quotaDate'], (res) => {
                        const today = new Date().toDateString();
                        let used = (res.quotaUsed as number) || 0;
                        // Reset if date changed (stale data)
                        if (res.quotaDate !== today) {
                            used = 0;
                        }

                        if (used >= 99) {
                            reject(new Error("Daily Quota Exceeded"));
                        } else {
                            resolve();
                        }
                    });
                });
            }

            try {
                const [result] = await Promise.all([
                    generateSummary(textToAnalyze, {
                        includeAI,
                        format: finalFormat as any,
                        length: 'medium',
                        apiKey: '',
                        provider: selectedProvider,
                        images: analyzeImages ? response.images : undefined,
                        tone: finalTone
                    }, selectedProvider, finalInfo, authToken, deviceId),
                    animationPromise
                ]);

                summary = result;

                // Track successful generation
                trackEvent('summary_generated_success', {
                    provider: selectedProvider,
                    contentLength,
                    wasShortContent: contentLength < 50,
                    format: finalFormat,
                    tone: finalTone
                });

            } catch (primaryError: any) {
                console.error(`Lotus: ${selectedProvider} failed:`, primaryError);

                // Fallback to Gemini if OpenAI fails
                if (selectedProvider === 'openai') {

                    try {
                        const [result] = await Promise.all([
                            generateSummary(textToAnalyze, {
                                includeAI,
                                format: finalFormat as any,
                                length: 'medium',
                                apiKey: '',
                                provider: 'google',
                                images: analyzeImages ? response.images : undefined,
                                tone: finalTone
                            }, 'google', finalInfo, authToken, deviceId),
                            new Promise(resolve => setTimeout(resolve, 500))
                        ]);

                        summary = result;
                        usedProvider = 'google';

                        // Track successful fallback
                        trackEvent('summary_generated_fallback', {
                            primaryProvider: 'openai',
                            fallbackProvider: 'gemini',
                            contentLength,
                            primaryError: primaryError.message
                        });

                        // Notify user about fallback
                        setTimeout(() => {
                            toast.success(
                                '✨ Summary generated using Gemini (OpenAI temporarily unavailable)',
                                { duration: 4000 }
                            );
                        }, 1200);

                    } catch (fallbackError: any) {
                        console.error('Lotus: Gemini fallback also failed:', fallbackError);

                        // Track double failure
                        trackEvent('summary_generation_failed', {
                            primaryProvider: 'openai',
                            fallbackProvider: 'gemini',
                            primaryError: primaryError.message,
                            fallbackError: fallbackError.message
                        });

                        throw new Error(`Both providers failed. OpenAI: ${primaryError.message}, Gemini: ${fallbackError.message}`);
                    }
                } else {
                    // Gemini was primary and failed, no fallback
                    trackEvent('summary_generation_failed', {
                        provider: selectedProvider,
                        error: primaryError.message,
                        contentLength
                    });

                    throw primaryError;
                }
            }

            if (!summary || summary.trim().length === 0) {
                throw new Error("AI returned an empty summary");
            }

            setGeneratedSummary(summary);
            setGenState('completed');
            setIsRegenerating(false);

            const newHistoryItem = {
                id: Date.now(),
                summary: summary,
                date: new Date().toISOString(),
                preview: summary.slice(0, 100) + "...",
                platform: response.platform || 'generic',
                type: analyzeImages ? 'prompt+response+image' : (includeAI ? 'prompt+response' : 'prompt')
            };

            chrome.storage.local.get(['history'], (result) => {
                const currentHistory = (result.history as any[]) || [];
                const updatedHistory = [newHistoryItem, ...currentHistory].slice(0, 50);
                chrome.storage.local.set({ history: updatedHistory });
                setHistory(updatedHistory);
            });

            chrome.storage.local.get(['summarizeCount'], (res) => {
                const currentCount = (res.summarizeCount as number) || 0;
                chrome.storage.local.set({ summarizeCount: currentCount + 1 });
            });

            if (user && tab.url && summary) {
                saveHistoryToFirestore(user.id, summary, tab.url);
            }

            trackEvent('summary_generated', {
                type: summaryType,
                length: summary.length,
                is_pro: effectiveIsPro,
                include_ai: includeAI,
                analyze_images: analyzeImages,
                format: finalFormat,
                tone: finalTone,
                provider: provider
            });

            if (!effectiveUser) {
                setTimeout(() => {
                    toast.success(
                        "🎉 Summary generated! Sign in for more features.",
                        { duration: 6000, icon: '🚀' }
                    );
                }, 1000);
            }

            if (onGenerateComplete) {
                onGenerateComplete(summary);
            }

        } catch (error: any) {
            console.error("Generation failed:", error);
            const msg = error.message || "Failed to generate summary";

            if (msg.includes("Guest Quota Exceeded") || msg.includes("Daily Quota Exceeded")) {
                if (!effectiveUser) {
                    setShowGuestLimitModal(true);
                } else {
                    setShowUpgradeModal(true);
                }
                setGenState('error');
            } else {
                setGenState('error');
                toast.error(msg);
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
            if (user) clearHistoryFromFirestore(user.id);
            toast.success('History cleared successfully.');
        }
    };

    const handleRegenerate = () => {
        setIsRegenerating(true);
        trackEvent('regenerate_clicked');
        handleGenerate();
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activePopup !== 'none') {
                const target = event.target as HTMLElement;
                if (!target.closest('.popup-content') && !target.closest('button')) {
                    setActivePopup('none');
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activePopup]);

    useEffect(() => {
        if (effectiveUser) {
            trackUserSignup(effectiveUser);
        }
    }, [effectiveUser]);

    return (
        <Layout>
            <div className="flex flex-col h-full relative">
                {/* Main Summary Box - Takes available space but leaves room for checkboxes */}
                <div className="flex-1 min-h-0 overflow-hidden">
                    <div className="w-full h-full flex flex-col relative rounded-2xl overflow-hidden" style={{
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-primary)'
                    }}>
                        <div className="absolute top-4 right-4 z-[300] flex items-center gap-2">
                            {(() => {
                                const isAdmin = user?.email === ADMIN_EMAIL;
                                let badgeText = "GUEST";
                                let badgeClass = "bg-blue-50 text-blue-600 border-blue-100";

                                if (simulatedTier === 'none' && isAdmin) {
                                    badgeText = "ADMIN";
                                    badgeClass = "bg-black text-white border-black";
                                } else if (effectiveIsPro) {
                                    badgeText = "PRO";
                                    badgeClass = "bg-yellow-50 text-yellow-600 border-yellow-100";
                                } else if (effectiveUser) {
                                    badgeText = "FREE";
                                    badgeClass = "bg-green-50 text-green-600 border-green-100";
                                }

                                return (
                                    <span
                                        className={cn("px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm cursor-pointer transition-colors", badgeClass)}
                                        onClick={() => {
                                            const newCount = betaClickCount + 1;
                                            setBetaClickCount(newCount);
                                            if (newCount === 6) {
                                                setActivePopup('feedback');
                                                setBetaClickCount(0);
                                            }
                                        }}
                                    >
                                        {badgeText}
                                    </span>
                                );
                            })()}

                            <QuotaCounter user={effectiveUser} isPro={effectiveIsPro} />

                            <Tooltip content="Profile" disabled={activePopup === 'profile'} side="bottom">
                                <div
                                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-300 transition-colors overflow-hidden"
                                    onClick={() => setActivePopup(activePopup === 'profile' ? 'none' : 'profile')}
                                >
                                    {effectiveUser && effectiveUser.picture ? (
                                        <img src={effectiveUser.picture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        effectiveUser && effectiveUser.name ? effectiveUser.name[0].toUpperCase() : <User className="w-4 h-4" />
                                    )}
                                </div>
                            </Tooltip>

                            {activePopup === 'profile' && (
                                <>
                                    <div className="fixed inset-0 z-[150]" onClick={() => setActivePopup('none')} />
                                    <div className="popup-content fixed top-[74px] right-8 w-auto min-w-[200px] max-w-[400px] max-h-[400px] overflow-y-auto rounded-2xl shadow-xl z-[300] flex flex-col py-1" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }} onClick={(e) => e.stopPropagation()}>
                                        {effectiveUser ? (
                                            <>
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{effectiveUser.name}</p>
                                                    <p className="text-[10px] truncate" style={{ color: 'var(--text-secondary)' }}>{effectiveUser.email}</p>
                                                </div>
                                                {/* Logout Button - Show for all except admin in real mode */}
                                                {!(user?.email === 'amaravadhibharath@gmail.com' && simulatedTier === 'none') && (
                                                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 w-full text-left transition-colors">
                                                        <Power className="w-3.5 h-3.5" />
                                                        Logout
                                                    </button>
                                                )}

                                                {/* Admin Debug Section - Only for admin in real mode */}
                                                {(user?.email === 'amaravadhibharath@gmail.com' && simulatedTier === 'none') && (
                                                    <div className="px-4 py-2 border-t border-gray-100">
                                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Simulate Mode</p>
                                                        <div className="grid grid-cols-4 gap-1">
                                                            {(['none', 'guest', 'free', 'pro'] as const).map((mode) => (
                                                                <button
                                                                    key={mode}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSimulatedTier(mode);
                                                                    }}
                                                                    className={cn(
                                                                        "px-1 py-1 text-[9px] font-medium rounded border transition-all text-center",
                                                                        simulatedTier === mode
                                                                            ? "bg-black text-white border-black"
                                                                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                                                    )}
                                                                >
                                                                    {mode === 'none' ? 'Real' : mode.charAt(0).toUpperCase()}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                                            <Tooltip content="Test Welcome Email">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleTestEmail();
                                                                    }}
                                                                    className="w-full py-1.5 flex items-center justify-center text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
                                                                >
                                                                    <Mail className="w-4 h-4" />
                                                                </button>
                                                            </Tooltip>

                                                            <Tooltip content="Extract Prompts (Admin)">
                                                                <button
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        try {
                                                                            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                                                                            if (!tab?.id) return toast.error('No active tab');

                                                                            const response = await chrome.tabs.sendMessage(tab.id, {
                                                                                action: 'getPageContent',
                                                                                includeImages: false
                                                                            });

                                                                            if (response?.error) {
                                                                                toast.error(response.error);
                                                                                return;
                                                                            }

                                                                            const userPrompts = response.conversation
                                                                                .filter((msg: any) => msg.role === 'user')
                                                                                .map((msg: any) => msg.text)
                                                                                .join('\n\n---\n\n');

                                                                            if (!userPrompts) {
                                                                                toast.error('No user prompts found');
                                                                                return;
                                                                            }

                                                                            await navigator.clipboard.writeText(userPrompts);
                                                                            toast.success(`Copied ${response.conversation.filter((m: any) => m.role === 'user').length} prompts!`);
                                                                        } catch (error: any) {
                                                                            if (error.message?.includes('No tab with id') || error.message?.includes('Cannot access')) {
                                                                                toast.error('Tab closed or inaccessible. Please reload the page.');
                                                                            } else {
                                                                                toast.error(error.message || 'Failed to extract prompts');
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="w-full py-1.5 flex items-center justify-center text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100"
                                                                >
                                                                    <MessageSquare className="w-4 h-4" />
                                                                </button>
                                                            </Tooltip>

                                                            <Tooltip content="Clear Cache">
                                                                <button
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        try {
                                                                            await chrome.storage.local.clear();
                                                                            toast.success('Cache cleared successfully.');
                                                                            setHistory([]);
                                                                            setGeneratedSummary('');
                                                                            setGenState('idle');
                                                                        } catch (error) {
                                                                            toast.error('Failed to clear cache');
                                                                        }
                                                                    }}
                                                                    className="w-full py-1.5 flex items-center justify-center text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100"
                                                                >
                                                                    <Trash className="w-4 h-4" />
                                                                </button>
                                                            </Tooltip>
                                                        </div>

                                                        {/* Debug Toast Dropdown - Admin Only */}
                                                        <div className="relative mt-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setShowDebugToastDropdown(!showDebugToastDropdown);
                                                                }}
                                                                className="w-full py-1 text-[10px] font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 flex items-center justify-center gap-1"
                                                            >
                                                                Test Toasts
                                                                <ChevronDown className="w-3 h-3" />
                                                            </button>
                                                            {showDebugToastDropdown && (
                                                                <div className="mt-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col p-1 gap-1">
                                                                    {/* Success Types Section */}
                                                                    <div className="flex flex-col gap-1">
                                                                        <div
                                                                            className="flex items-center justify-between text-[9px] font-semibold text-gray-400 px-1 uppercase tracking-wider cursor-pointer hover:text-gray-600"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setShowSuccessTypes(!showSuccessTypes);
                                                                            }}
                                                                        >
                                                                            <span>Success Types</span>
                                                                            <ChevronDown className={cn("w-3 h-3 transition-transform", !showSuccessTypes && "-rotate-90")} />
                                                                        </div>

                                                                        {showSuccessTypes && (
                                                                            <>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        toast.success('Successfully signed in!');
                                                                                    }}
                                                                                    className="py-1 text-[10px] font-medium text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100 text-left px-2"
                                                                                >
                                                                                    Login Success
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        toast('Successfully signed out.', { icon: '👋' });
                                                                                    }}
                                                                                    className="py-1 text-[10px] font-medium text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100 text-left px-2"
                                                                                >
                                                                                    Logout Success
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        toast.success('Format changed to JSON');
                                                                                    }}
                                                                                    className="py-1 text-[10px] font-medium text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100 text-left px-2"
                                                                                >
                                                                                    Format Change
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        toast.success('History cleared successfully.');
                                                                                    }}
                                                                                    className="py-1 text-[10px] font-medium text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100 text-left px-2"
                                                                                >
                                                                                    History Cleared
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>

                                                                    <div className="h-px bg-gray-100 my-1" />

                                                                    {/* Error Types Section */}
                                                                    <div className="flex flex-col gap-1">
                                                                        <div
                                                                            className="flex items-center justify-between text-[9px] font-semibold text-gray-400 px-1 uppercase tracking-wider cursor-pointer hover:text-gray-600"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setShowErrorTypes(!showErrorTypes);
                                                                            }}
                                                                        >
                                                                            <span>Error Types</span>
                                                                            <ChevronDown className={cn("w-3 h-3 transition-transform", !showErrorTypes && "-rotate-90")} />
                                                                        </div>

                                                                        {showErrorTypes && (
                                                                            <>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        toast.error('Login failed. Please try again.');
                                                                                    }}
                                                                                    className="py-1 text-[10px] font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 text-left px-2"
                                                                                >
                                                                                    Auth Failed
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        toast.error("You've used all 5 free summaries today! Sign in with Google to get 10 daily summaries.", { duration: 5000 });
                                                                                    }}
                                                                                    className="py-1 text-[10px] font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 text-left px-2"
                                                                                >
                                                                                    Quota Exceeded
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        toast.error('No user prompts found');
                                                                                    }}
                                                                                    className="py-1 text-[10px] font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 text-left px-2"
                                                                                >
                                                                                    No Content
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        toast.error('Tab closed or inaccessible. Please reload the page.');
                                                                                    }}
                                                                                    className="py-1 text-[10px] font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 text-left px-2"
                                                                                >
                                                                                    Connection Error
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        toast.error('Error! Something went wrong.');
                                                                                    }}
                                                                                    className="py-1 text-[10px] font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 text-left px-2"
                                                                                >
                                                                                    Generic Error
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>

                                                                    <div className="h-px bg-gray-100 my-1" />

                                                                    {/* Modal Types Section */}
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="text-[9px] font-semibold text-gray-400 px-1 uppercase tracking-wider">
                                                                            Modals
                                                                        </div>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setShowUpgradeModal(true);
                                                                            }}
                                                                            className="py-1 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 text-left px-2"
                                                                        >
                                                                            Test Upgrade Modal
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setShowGuestLimitModal(true);
                                                                            }}
                                                                            className="py-1 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 text-left px-2"
                                                                        >
                                                                            Test Guest Limit Modal
                                                                        </button>
                                                                    </div>

                                                                    <div className="h-px bg-gray-100 my-1" />

                                                                    {/* Custom Toasts */}
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const id = toast.loading('Loading data...');
                                                                            setTimeout(() => toast.dismiss(id), 2000);
                                                                        }}
                                                                        className="py-1 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
                                                                    >
                                                                        Loading
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            toast('Custom Icon Toast', { icon: '🚀' });
                                                                        }}
                                                                        className="py-1 text-[10px] font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100"
                                                                    >
                                                                        Custom
                                                                    </button>

                                                                    <div className="h-px bg-gray-100 my-1" />
                                                                    <div className="text-[9px] font-semibold text-gray-400 px-1 uppercase tracking-wider">Pages</div>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
                                                                        }}
                                                                        className="py-1 text-[10px] font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 text-left px-2"
                                                                    >
                                                                        Open Welcome
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            window.open('https://www.superextension.in/', '_blank');
                                                                        }}
                                                                        className="py-1 text-[10px] font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 text-left px-2"
                                                                    >
                                                                        Open Landing
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="p-4 flex flex-col gap-3">
                                                <p className="text-xs text-gray-600 text-center">Sign in to sync and upgrade</p>
                                                <button onClick={handleLogin} disabled={signingIn} className="flex items-center justify-center gap-2 w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-xs font-medium">
                                                    {signingIn ? 'Signing in...' : <><User className="w-3.5 h-3.5" /> Sign in with Google</>}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Summary Display Box */}
                        <div className="w-full h-full flex flex-col relative">
                            {genState === 'completed' && generatedSummary ? (
                                <>
                                    {/* HEADER - Back Button (Fixed) */}
                                    <div className="shrink-0 p-4 pb-0">
                                        <Tooltip content="Back" side="right">
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                onClick={() => {
                                                    setGeneratedSummary('');
                                                    setGenState('idle');
                                                }}
                                                className="rounded-full w-8 h-8 shadow-sm backdrop-blur-sm"
                                                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
                                            >
                                                <ArrowLeft className="w-4 h-4 text-gray-600" />
                                            </Button>
                                        </Tooltip>
                                    </div>

                                    {/* BODY - Summary Content (Scrollable) */}
                                    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 pb-24">
                                        {isEditing ? (
                                            <textarea
                                                value={generatedSummary}
                                                onChange={(e) => setGeneratedSummary(e.target.value)}
                                                onBlur={() => setIsEditing(false)}
                                                autoFocus
                                                className="w-full h-full resize-none p-0 text-sm leading-relaxed bg-transparent border-none focus:ring-0 focus:outline-none"
                                                style={{ color: 'var(--text-primary)' }}
                                            />
                                        ) : (
                                            <div
                                                onClick={() => setIsEditing(true)}
                                                className="text-sm leading-relaxed cursor-text space-y-2"
                                                style={{ color: 'var(--text-primary)', textAlign: 'justify' }}
                                            >
                                                {generatedSummary.split('\n').map((line, i) => {
                                                    const trimmed = line.trim();
                                                    // Smart bullet formatting
                                                    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                                                        return (
                                                            <div key={i} className="flex gap-2 items-start">
                                                                <span className="shrink-0 font-bold" style={{ color: 'var(--text-primary)' }}>•</span>
                                                                <span>{trimmed.substring(1).trim()}</span>
                                                            </div>
                                                        );
                                                    }
                                                    return <p key={i}>{line}</p>;
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Disclaimer - Floating above toolbar */}
                                    <div className="absolute bottom-16 left-0 right-0 flex justify-center z-20 pointer-events-none">
                                        <span className="text-[10px] px-3 py-1 rounded-full shadow-sm backdrop-blur-sm" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                                            Captures your final intent. Regenerate if needed.
                                        </span>
                                    </div>

                                </>
                            ) : isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="w-6 h-6 border-2 border-gray-100 border-t-gray-400 rounded-full animate-spin" />
                                </div>
                            ) : !isSupported ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3 text-center max-w-sm mx-auto">
                                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center"><Info className="w-6 h-6 text-amber-600" /></div>
                                    <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Page not supported</h3>
                                    <div className="w-full max-w-[300px] flex flex-col gap-1">
                                        <Marquee
                                            items={['ChatGPT', 'Claude', 'OpenAI', 'Perplexity', 'Gemini', 'Figma', 'Cursor']}
                                            speed={16}
                                        />
                                        <Marquee
                                            items={['Emergent', 'Rocket', 'Lovable', 'Bolt', 'Base44', 'Meta AI', 'MS Copilot']}
                                            speed={16}
                                            reverse
                                        />
                                    </div>
                                </div>
                            ) : !hasConversation ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3 text-center max-w-sm mx-auto">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center"><Info className="w-6 h-6 text-blue-600" /></div>
                                    <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>No conversation found</h3>
                                    <p className="text-sm text-gray-600">Start a chat first</p>
                                </div>
                            ) : !isContentScriptReady ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3">
                                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center"><RefreshCw className="w-6 h-6 text-orange-600" /></div>
                                    <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Reload Required</h3>
                                    <button onClick={async () => { const [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); if (tab.id) chrome.tabs.reload(tab.id); }} className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium">
                                        Reload Page
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Ready to generate</span>
                                </div>
                            )}
                        </div>

                        {/* Fixed Floating Summary Toolbar - Bottom Right */}
                        {genState === 'completed' && generatedSummary && (
                            <div className="absolute bottom-4 right-4 z-40">
                                <SummaryToolbar
                                    summary={generatedSummary}
                                    onRegenerate={handleRegenerate}
                                    onReportIssue={() => setShowReportModal(true)}
                                    isRegenerating={isRegenerating}
                                    isGuest={!effectiveUser}
                                />
                            </div>
                        )}

                        {!effectiveUser && !isCompact && genState !== 'completed' && (
                            <GenerateButton
                                onGenerate={handleGenerate}
                                state={genState}
                                isRegenerating={isRegenerating}
                                disabled={!isSupported || !hasConversation}
                                includeAI={includeAI}
                                analyzeImages={analyzeImages}
                                isGuest={true}
                            />
                        )}
                    </div>
                </div>

                {/* Checkboxes and Controls - Always Visible at Bottom */}
                <div className={cn("shrink-0 flex flex-col gap-4 pt-4 pb-2", isCompact && "gap-0 pb-0")}>
                    {effectiveUser && genState !== 'completed' && (
                        <GenerateButton
                            onGenerate={handleGenerate}
                            state={genState}
                            isRegenerating={isRegenerating}
                            disabled={!isSupported}
                            includeAI={includeAI}
                            analyzeImages={analyzeImages}
                            isGuest={false}
                        />
                    )}

                    <div className="space-y-3 px-1">
                        <CheckboxRow
                            label="Include AI responses"
                            subtext="Full conversation"
                            checked={includeAI}
                            onChange={() => {
                                const newValue = !includeAI;
                                setIncludeAI(newValue);
                                if (newValue) {
                                    toast.success(analyzeImages ? "Including AI responses & Images" : "Including AI responses");
                                } else {
                                    toast.success(analyzeImages ? "Prompts & Images only" : "Prompts only");
                                }
                            }}
                        />
                        <CheckboxRow
                            label="Read images"
                            subtext="Visual context"
                            checked={analyzeImages}
                            onChange={() => {
                                const newValue = !analyzeImages;
                                setAnalyzeImages(newValue);
                                if (newValue) {
                                    toast.success(includeAI ? "Including AI responses & Images" : "Including Images");
                                } else {
                                    toast.success(includeAI ? "AI responses only" : "Images excluded");
                                }
                            }}
                        />
                    </div>

                    {/* Bottom Buttons - Wrapped in relative container for popup positioning */}
                    <div className="relative z-[400]">
                        <div className="flex items-center justify-between pt-2 px-1">
                            <Tooltip content="Info" disabled={activePopup === 'metadata'}>
                                <Button variant="secondary" size="icon" className="rounded-full w-8 h-8" onClick={() => setActivePopup('metadata')}>
                                    <Info className="w-4 h-4" />
                                </Button>
                            </Tooltip>

                            <div className="flex items-center gap-2">
                                <Tooltip content="Feedback" disabled={activePopup === 'feedback'}>
                                    <Button variant="secondary" size="icon" className="rounded-full w-8 h-8" onClick={() => setActivePopup('feedback')}>
                                        <MessageSquare className="w-4 h-4" />
                                    </Button>
                                </Tooltip>

                                <Tooltip content="History" side="top" disabled={activePopup === 'history'}>
                                    <Button variant="secondary" size="icon" className="rounded-full w-8 h-8" onClick={() => setActivePopup('history')}>
                                        <History className="w-4 h-4" />
                                    </Button>
                                </Tooltip>

                                {effectiveUser && (
                                    <Tooltip content="Settings" disabled={activePopup === 'settings'}>
                                        <Button variant="secondary" size="icon" className="rounded-full w-8 h-8" onClick={() => setActivePopup('settings')}>
                                            <Settings className="w-4 h-4" />
                                        </Button>
                                    </Tooltip>
                                )}

                                <Tooltip content="Help" disabled={activePopup === 'help'}>
                                    <Button variant="secondary" size="icon" className="rounded-full w-8 h-8" onClick={() => setActivePopup('help')}>
                                        <HelpCircle className="w-4 h-4" />
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>

                        {/* Metadata Popup */}
                        {activePopup === 'metadata' && (
                            <>
                                <div className="fixed inset-0 z-[90]" onClick={() => setActivePopup('none')} />
                                <div className="popup-content absolute bottom-full left-0 mb-2 z-[300] w-auto min-w-[240px] max-h-[500px] overflow-y-auto rounded-2xl shadow-xl p-4 text-sm origin-bottom-left" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }} onClick={(e) => e.stopPropagation()}>
                                    <h3 className="font-semibold mb-3 text-xs" style={{ color: 'var(--text-primary)' }}>Metadata</h3>
                                    <div className="space-y-2.5" style={{ color: 'var(--text-secondary)' }}>
                                        <div className="flex justify-between items-center gap-4">
                                            <span className="text-xs">Version</span>
                                            <span className="font-medium px-2 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>v1.9.0</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4">
                                            <span className="text-xs">AI Engine</span>
                                            <span className="font-medium text-xs text-right" style={{ color: 'var(--text-primary)' }}>GPT-4o-mini & Gemini 2.0</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4">
                                            <span className="text-xs">Status</span>
                                            <span className="font-medium text-xs inline-flex items-center gap-1.5 bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                Active
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center gap-4">
                                            <span className="text-xs">Developer</span>
                                            <span className="font-medium text-xs" style={{ color: 'var(--text-primary)' }}>Bharath Amaravadhi</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* History Popup */}
                        {activePopup === 'history' && (
                            <>
                                <div className="fixed inset-0 z-[90]" onClick={() => setActivePopup('none')} />
                                <div className="popup-content absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[300] w-full max-h-[500px] overflow-y-auto rounded-2xl shadow-xl p-5 text-sm" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }} onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>History</h3>
                                        <button onClick={handleClearHistory} className="text-[10px] font-medium text-red-500 hover:text-red-600 transition-colors">Clear all</button>
                                    </div>
                                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                                        {history.length === 0 ? (
                                            <div className="text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
                                                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <p>No history yet</p>
                                            </div>
                                        ) : (
                                            history.map((item) => (
                                                <div key={item.id} onClick={() => handleViewHistoryItem(item)} className="flex flex-col gap-1 p-3 rounded-xl transition-colors cursor-pointer shrink-0" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-medium text-xs line-clamp-1 capitalize" style={{ color: 'var(--text-primary)' }}>{item.platform ? `${item.platform} | ${item.type} summary` : 'Summary'}</span>
                                                        <span className="text-[10px] whitespace-nowrap ml-2" style={{ color: 'var(--text-tertiary)' }}>{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <p className="text-[10px] line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.preview}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Settings Popup */}
                        {activePopup === 'settings' && (
                            <>
                                <div className="fixed inset-0 z-[90]" onClick={() => setActivePopup('none')} />
                                <div className="popup-content absolute bottom-full right-0 mb-2 z-[300] w-max max-h-[500px] overflow-y-auto rounded-2xl shadow-xl p-5 text-sm origin-bottom-right" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }} onClick={(e) => e.stopPropagation()}>
                                    <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Summary Format</h3>
                                    <div className="space-y-2">
                                        <div className="flex flex-col gap-2">
                                            {(['TXT', 'JSON', 'XML'] as const).map((type) => (
                                                <label key={type} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors" style={{ border: '1px solid var(--border-primary)', backgroundColor: summaryType === type ? 'var(--bg-secondary)' : 'transparent' }}>
                                                    <div
                                                        className="w-4 h-4 rounded-full flex items-center justify-center transition-all"
                                                        style={{
                                                            border: `2px solid ${summaryType === type ? 'var(--text-primary)' : 'var(--border-primary)'}`,
                                                            backgroundColor: summaryType === type ? 'var(--text-primary)' : 'transparent'
                                                        }}
                                                    >
                                                        {summaryType === type && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--bg-primary)' }} />}
                                                    </div>
                                                    <input type="radio" name="summaryType" value={type} checked={summaryType === type} onChange={() => { setSummaryType(type); chrome.storage.local.set({ summaryType: type }); toast.success(`Format changed to ${type}`); }} className="hidden" />
                                                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{type}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Help Popup */}
                        {activePopup === 'help' && (
                            <>
                                <div className="fixed inset-0 z-[90]" onClick={() => setActivePopup('none')} />
                                <div className="popup-content absolute bottom-full right-0 mb-2 z-[300] w-max max-h-[500px] overflow-y-auto rounded-2xl shadow-xl p-5 text-sm origin-bottom-right" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }} onClick={(e) => e.stopPropagation()}>
                                    <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Help & Support</h3>
                                    <div className="space-y-3">
                                        <button onClick={() => handleHelpAction('docs')} className="flex items-center gap-3 w-full text-left transition-colors cursor-pointer p-2 rounded-lg hover:bg-[var(--bg-tertiary)]" style={{ color: 'var(--text-secondary)' }}>
                                            <Info className="w-4 h-4" /> Documentation
                                        </button>
                                        <button onClick={() => handleHelpAction('faqs')} className="flex items-center gap-3 w-full text-left transition-colors cursor-pointer p-2 rounded-lg hover:bg-[var(--bg-tertiary)]" style={{ color: 'var(--text-secondary)' }}>
                                            <HelpCircle className="w-4 h-4" /> FAQs
                                        </button>
                                        <button onClick={() => handleHelpAction('support')} className="flex items-center gap-3 w-full text-left transition-colors cursor-pointer p-2 rounded-lg hover:bg-[var(--bg-tertiary)]" style={{ color: 'var(--text-secondary)' }}>
                                            <MessageSquare className="w-4 h-4" /> Contact Support
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        <PulseCheck open={activePopup === 'feedback'} onOpenChange={(open) => setActivePopup(open ? 'feedback' : 'none')} userEmail={effectiveUser?.email} />
                    </div> {/* Close relative wrapper */}
                </div>
            </div>

            <ReportIssueModal open={showReportModal} onClose={() => setShowReportModal(false)} summary={generatedSummary} prompts={lastPrompts} />
            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
            <GuestLimitModal isOpen={showGuestLimitModal} onClose={() => setShowGuestLimitModal(false)} />
        </Layout >
    );
};
