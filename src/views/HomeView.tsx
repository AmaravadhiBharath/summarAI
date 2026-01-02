import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Settings, History, HelpCircle, Info, ArrowLeft, RefreshCw, Power, Book, MessageSquare, Mail, User, ChevronDown, Trash } from 'lucide-react';
import { PulseCheck } from '../components/PulseCheck';
import { Layout } from '../components/Layout';
import { GenerateButton } from '../components/GenerateButton';
import { Tooltip } from '../components/ui/Tooltip';
import { Button } from '../components/ui/Button';
import { cn } from '../components/ui/Tooltip';
import { processContent } from '../core/pipeline/processor';
import { normalizeConversation } from '../core/pipeline/normalizer'; // Optional, but good practice
import { wakeUpServiceWorker } from '../core/utils';
import { generateSummary } from '../services/openai';
import { signInWithGoogle, logout, subscribeToAuthChanges, type ChromeUser } from '../services/chrome-auth';
import { saveHistoryToFirestore, getHistoryFromFirestore, clearHistoryFromFirestore, saveUserProfile, subscribeToAdminFeatures, checkUserProStatus } from '../services/firebase-extension';

import { identifyUser, trackEvent, resetAnalytics, initAnalytics } from '../services/analytics';
import { isUrlSupported } from '../constants/supportedSites';
import { ReportIssueModal } from '../components/ReportIssueModal';
import { UpgradeModal } from '../components/UpgradeModal';
import { LoginModal } from '../components/LoginModal';

interface HomeViewProps {
    onGenerateComplete?: (summary: string) => void;
}

import { CheckboxRow } from '../components/CheckboxRow';
import { QuotaCounter } from '../components/QuotaCounter';
import { SummaryToolbar } from '../components/SummaryToolbar';

type PopupType = 'none' | 'more' | 'profile' | 'metadata' | 'history' | 'settings' | 'help' | 'feedback';

export const HomeView: React.FC<HomeViewProps> = () => {
    const [genState, setGenState] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
    const [includeAI, setIncludeAI] = useState(false);
    const [analyzeImages, setAnalyzeImages] = useState(false);
    const [activePopup, setActivePopup] = useState<PopupType>('none');
    const [summary, setSummary] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [summaryType, setSummaryType] = useState<'TXT' | 'JSON' | 'XML'>('TXT');
    // @ts-ignore - used in handleGenerate
    const [structure] = useState<'paragraph' | 'points'>('paragraph');
    // @ts-ignore - used in handleGenerate
    const [tone] = useState<'normal' | 'professional' | 'creative'>('normal');
    // @ts-ignore - used in handleGenerate
    const [additionalInfo] = useState('');
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
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [betaClickCount, setBetaClickCount] = useState(0);
    const [simulatedTier, setSimulatedTier] = useState<'none' | 'guest' | 'free' | 'pro'>('none');
    const [signingIn, setSigningIn] = useState(false);
    // @ts-ignore - used in useEffect
    const [adminFeatures, setAdminFeatures] = useState({
        imageAnalysis: true,
        creativeTone: true,
        professionalTone: true,
        jsonFormat: true,
        xmlFormat: true
    });
    const [showDebugToastDropdown, setShowDebugToastDropdown] = useState(false);
    const [showSuccessTypes, setShowSuccessTypes] = useState(true);
    const [showErrorTypes, setShowErrorTypes] = useState(true);


    const effectiveUser = simulatedTier === 'none' ? user :
        simulatedTier === 'guest' ? null : user; // Use real user for FREE/PRO simulation

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
        console.log("Summarai Version 1.0.5 Loaded");
        const handleResize = () => setContainerHeight(window.innerHeight || 800);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Subscribe to admin feature flags
    useEffect(() => {
        const unsubscribe = subscribeToAdminFeatures((features) => {
            setAdminFeatures(features);
            console.log('Admin features updated:', features);
        });
        return () => unsubscribe();
    }, []);

    // Check if user has admin-granted Pro status
    useEffect(() => {
        if (user?.email) {
            checkUserProStatus(user.email).then((isAdminPro) => {
                if (isAdminPro) {
                    setIsPro(true);
                    console.log('User has admin-granted Pro status');
                }
            });
        }
    }, [user]);

    const isCompact = containerHeight < 250;


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
                        // Content script not loaded - try to inject it automatically
                        console.log('Content script not ready - attempting auto-injection...');

                        let injectionSuccess = false;

                        try {
                            // Get the manifest to find the content script file
                            const manifest = chrome.runtime.getManifest();
                            // Use index 1 since index 0 is for Google Docs
                            const contentScripts = manifest.content_scripts?.[1]?.js || [];

                            if (contentScripts.length > 0) {
                                // Try injecting with the manifest-defined scripts
                                await chrome.scripting.executeScript({
                                    target: { tabId: tab.id, allFrames: true },
                                    files: contentScripts
                                });
                                console.log('Content script injected via manifest');
                                injectionSuccess = true;
                            }
                        } catch (manifestError) {
                            console.warn('Manifest-based injection failed, trying fallback...', manifestError);
                        }

                        // Fallback: try common build output patterns
                        if (!injectionSuccess) {
                            try {
                                await chrome.scripting.executeScript({
                                    target: { tabId: tab.id, allFrames: true },
                                    files: ['src/content.ts']
                                });
                                console.log('Content script injected via fallback');
                                injectionSuccess = true;
                            } catch (fallbackError) {
                                console.error('All injection methods failed:', fallbackError);
                            }
                        }

                        // Always set ready on supported sites - be optimistic
                        // The script should be there either from manifest or our injection
                        console.log('Setting content script ready (optimistic mode)');
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
            }, { frameId: 0 });

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

                // Reset quotaUsed in local storage to avoid stale guest usage showing up
                // The backend will enforce the true quota on the next request
                chrome.storage.local.set({ quotaUsed: 0 });
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
        toast.success('Successfully signed out.');
    };

    const handleViewHistoryItem = (item: any) => {
        setSummary(item.summary);
        setGenState('completed');
        setActivePopup('none');
        trackEvent('history_item_viewed', { item_id: item.id });
    };

    const handleHelpAction = (action: string) => {
        if (action === 'docs') {
            window.open('https://drive.google.com/file/d/1kCN7L9rHQnZwkqb6-JgglPOCwbqWoFk8/view?usp=drive_link', '_blank');
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
        const finalInfo = typeof overrideInfo === 'string' ? overrideInfo : additionalInfo;

        // Determine format:
        // 1. Start with override (from button) or current state
        let finalFormat = overrideFormat || summaryType;

        // 2. If Settings is JSON/XML, and the requested format is 'paragraph' (default from button),
        //    we prioritize the Settings (JSON/XML).
        //    We allow 'points' to override this if the user explicitly toggled the List button.
        if ((summaryType === 'JSON' || summaryType === 'XML') && finalFormat === 'paragraph') {
            finalFormat = summaryType;
        }

        const finalTone = overrideTone || tone;

        setGenState('generating');

        try {
            // 0. Wake up service worker to prevent connection errors
            const swReady = await wakeUpServiceWorker();
            if (!swReady) {
                throw new Error("Extension service worker is not responding. Please reload the extension or refresh the page.");
            }

            // 1. Get Active Tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab.id) throw new Error("No active tab found");

            // 2. Scrape Content
            // CRITICAL FIX: Target frameId: 0 to ensure we scrape the main page, not an empty iframe
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageContent', includeImages: analyzeImages }, { frameId: 0 });
            console.log("Tiger: Scraper Response:", response);

            if (!response) {
                throw new Error("Failed to scrape content. Refresh the page and try again.");
            }

            // Prepare content using the new Pipeline

            // 1. Normalize (Deduplicate, clean noise)
            if (response.conversation) {
                response.conversation = normalizeConversation(response.conversation);

                // UX: Confirm to user that we captured their prompts
                const userPromptCount = response.conversation.filter((m: any) => m.role === 'user').length;
                if (userPromptCount > 0) {
                    toast.success('Content captured', { icon: '🔍', duration: 3000 });
                }
            }

            // 2. Process (Filter includeAI, format)
            let textToAnalyze = processContent(response, { includeAI });

            if (!textToAnalyze || textToAnalyze.trim().length === 0) {
                console.log("Tiger: No content after processing. Falling back to raw text.");
                textToAnalyze = response.rawText || "";

                if (!textToAnalyze) {
                    throw new Error("No content found to summarize.");
                }
            }

            setLastPrompts(textToAnalyze);

            // Final validation before sending to backend
            if (!textToAnalyze || textToAnalyze.trim().length === 0) {
                throw new Error("Could not find enough text to summarize. If this is a chat, try scrolling up. If it's a website, ensure it has visible text.");
            }

            // 3. Generate Summary
            console.log("Calling generateSummary with:", { includeAI, format: finalFormat, provider, images: response.images?.length, tone: finalTone });

            // Create a promise for the minimum animation time (1.0 seconds for speed)
            const animationPromise = new Promise(resolve => setTimeout(resolve, 1000));

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
                        authToken = accessToken;
                        console.log("Auth token obtained for user:", user.email);
                    }
                } catch (e) {
                    console.error("Auth token error:", e);
                }
            }

            // Run generation and animation timer in parallel
            const [generatedSummary] = await Promise.all([
                generateSummary(textToAnalyze, {
                    includeAI,
                    format: finalFormat as any,
                    length: 'medium',
                    apiKey: '',
                    provider,
                    images: analyzeImages ? response.images : undefined,
                    tone: finalTone
                }, provider, finalInfo, authToken, deviceId),
                animationPromise
            ]);

            console.log("✅ Generated summary:", generatedSummary);
            console.log("📊 Summary length:", generatedSummary?.length || 0);

            if (!generatedSummary || generatedSummary.trim().length === 0) {
                throw new Error("AI returned an empty summary. Please try again.");
            }

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
                saveHistoryToFirestore(user.id, newHistoryItem);
            }

            trackEvent('summary_generated', {
                type: summaryType,
                length: summary ? summary.length : 0,
                is_pro: effectiveIsPro,
                include_ai: includeAI,
                analyze_images: analyzeImages,
                format: finalFormat,
                tone: finalTone,
                provider: provider
            });

            // Encourage guest users to sign in after successful summary
            if (!effectiveUser) {
                setTimeout(() => {
                    toast.success(
                        "🎉 Summary generated! Sign in with Google to unlock 9 summaries/day, history sync, and more features.",
                        {
                            duration: 6000,
                            icon: '🚀'
                        }
                    );
                }, 1000); // Delay so it doesn't conflict with generation success
            }
        } catch (error: any) {
            console.error("Generation failed:", error);
            const msg = error.message || "Failed to generate summary";

            if (msg.includes("Guest Quota Exceeded")) {
                if (effectiveUser) {
                    toast.error("You've reached your daily limit (10/10). Upgrade to Pro for 100 summaries!", { duration: 5000 });
                    setShowUpgradeModal(true);
                } else {
                    toast.error(<div>You've used your 5 free summaries!<br />Sign in for 10 more.</div>, { duration: 5000 });
                    setShowLoginModal(true);
                }
                setGenState('error');
            } else if (msg.includes("Daily Quota Exceeded")) {
                setShowUpgradeModal(true);
                setGenState('error');
            } else if (msg.includes("Could not establish connection") || msg.includes("Receiving end does not exist") || msg.includes("Extension context invalidated")) {
                try {
                    // Attempt to re-inject content script
                    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                    if (tab?.id) {
                        const manifest = chrome.runtime.getManifest();
                        const contentScript = manifest.content_scripts?.find(cs => cs.matches?.includes('<all_urls>'))?.js?.[0];

                        if (contentScript) {
                            await chrome.scripting.executeScript({
                                target: { tabId: tab.id },
                                files: [contentScript]
                            });
                            // Retry generation once
                            toast.success("Connection restored! Please click 'Generate' again.");
                        } else {
                            throw new Error("Content script not found");
                        }
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
            toast.success('History cleared successfully.');
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
                <div className="flex-1 min-h-0 mb-4 overflow-hidden">
                    <div className="w-full h-full flex flex-col relative border border-gray-200 rounded-2xl overflow-hidden">
                        {/* Top Right: Beta, Quota & Profile - Always Visible */}
                        <div className="absolute top-4 right-4 z-[200] flex items-center gap-2">
                            {(() => {
                                const isAdmin = user?.email === 'amaravadhibharath@gmail.com';

                                let badgeText = "GUEST";
                                let badgeClass = "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100";

                                if (simulatedTier === 'none' && isAdmin) {
                                    badgeText = "ADMIN";
                                    badgeClass = "bg-black text-white border-black hover:bg-gray-800";
                                } else if (effectiveIsPro) {
                                    badgeText = "PRO";
                                    badgeClass = "bg-yellow-50 text-yellow-600 border-yellow-100 hover:bg-yellow-100";
                                } else if (effectiveUser) {
                                    badgeText = "FREE";
                                    badgeClass = "bg-green-50 text-green-600 border-green-100 hover:bg-green-100";
                                }

                                return (
                                    <span
                                        className={cn(
                                            "px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm cursor-pointer transition-colors",
                                            badgeClass
                                        )}
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

                            {/* Quota Counter */}
                            {/* Quota Counter */}
                            <QuotaCounter user={effectiveUser} isPro={effectiveIsPro} />

                            <Tooltip content="Profile" side="bottom" disabled={activePopup === 'profile'}>
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

                            {/* Profile Popup */}
                            {activePopup === 'profile' && (
                                <>
                                    <div className="fixed inset-0 z-[150]" onClick={() => setActivePopup('none')} />
                                    <div
                                        className="popup-content fixed top-[76px] right-8 w-auto min-w-[200px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-visible z-[200] flex flex-col py-1 animate-slide-up-fade"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {effectiveUser ? (
                                            <>
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="text-xs font-medium text-gray-900">{effectiveUser.name}</p>
                                                    <p className="text-[10px] text-gray-500 truncate">{effectiveUser.email}</p>

                                                </div>

                                                {!(user?.email === 'amaravadhibharath@gmail.com') && (
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                                                    >
                                                        <Power className="w-3.5 h-3.5" />
                                                        Logout
                                                    </button>
                                                )}

                                                {/* Debug Mode in Profile - Admin Only */}
                                                {(user?.email === 'amaravadhibharath@gmail.com') && (
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

                                                                            // Extract only user prompts
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
                                                                            toast.success('History cleared successfully.');
                                                                            setHistory([]);
                                                                            setSummary(null);

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
                                                                                        toast.success('Successfully signed out.');
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
                                                                                        toast.error("You've used your 3 free summaries today! Sign in with Google to get 14 daily summaries.", { duration: 5000 });
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
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Simulate Popups */}
                                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                                            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Simulate Popups</p>
                                                            <div className="grid grid-cols-2 gap-1">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setShowLoginModal(true);
                                                                        toast.error(<div>Guest Quota Exceeded (5/5).<br />Sign in for 10 more!</div>, { duration: 3000 });
                                                                    }}
                                                                    className="py-1.5 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
                                                                >
                                                                    Guest → Free
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setShowUpgradeModal(true);
                                                                        toast.error("Daily Quota Exceeded (10/10). Upgrade to Pro!", { duration: 3000 });
                                                                    }}
                                                                    className="py-1.5 text-[10px] font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100"
                                                                >
                                                                    Free → Pro
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="p-4 flex flex-col gap-3">
                                                <p className="text-xs text-gray-600 text-center">Sign in to sync history and upgrade.</p>
                                                <button
                                                    onClick={handleLogin}
                                                    disabled={signingIn}
                                                    className="flex items-center justify-center gap-2 w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-xs font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                                                >
                                                    {signingIn ? (
                                                        <>
                                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            Signing in...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <User className="w-3.5 h-3.5" />
                                                            Sign in with Google
                                                        </>
                                                    )}
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
                                className="flex flex-col flex-1 relative animate-fade-in overflow-hidden rounded-2xl"
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
                                    <div className="flex-1 overflow-y-auto text-sm leading-relaxed text-gray-700 text-justify font-sans p-6 pt-20 pb-4 space-y-2 custom-scrollbar">
                                        {summary.split('\n').map((line, i) => {
                                            const trimmed = line.trim();
                                            if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
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
                                            Captures your final intent. Regenerate if needed.
                                        </span>
                                    </div>

                                    {/* Floating Toolbar */}
                                    <SummaryToolbar
                                        summary={summary}
                                        onRegenerate={handleRegenerate}
                                        onReportIssue={() => setShowReportModal(true)}
                                        isRegenerating={isRegenerating}
                                        isGuest={!effectiveUser}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div
                                    key="empty-state"
                                    className="w-full h-full animate-fade-in p-6 pt-16 flex flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl"
                                >
                                    {isLoading ? (
                                        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
                                            <div className="w-6 h-6 border-2 border-gray-100 border-t-gray-400 rounded-full animate-spin" />
                                        </div>
                                    ) : !isSupported ? (
                                        <div className="flex flex-col items-center justify-center w-full">
                                            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                                                <Info className="w-8 h-8 text-orange-500" />
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900 mb-8">
                                                Page not supported
                                            </h2>
                                            <div className="w-full overflow-hidden space-y-3 opacity-50 max-w-[280px]">
                                                <div className="flex w-max animate-marquee">
                                                    {[...["Gemini", "Figma", "ChatGPT", "Lovable", "Bolt", "Claude"], ...["Gemini", "Figma", "ChatGPT", "Lovable", "Bolt", "Claude"]].map((site, i) => (
                                                        <span key={i} className="mx-3 text-xs font-medium text-gray-400 whitespace-nowrap">
                                                            {site} •
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex w-max animate-marquee-reverse">
                                                    {[...["Perplexity", "Cursor", "Base44", "Rocket", "Emergent"], ...["Perplexity", "Cursor", "Base44", "Rocket", "Emergent"]].map((site, i) => (
                                                        <span key={i} className="mx-3 text-xs font-medium text-gray-400 whitespace-nowrap">
                                                            {site} •
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
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
                                        !isContentScriptReady ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                                                    <RefreshCw className="w-6 h-6 text-orange-600" />
                                                </div>
                                                <h3 className="text-base font-semibold text-gray-900">
                                                    Page Reload Required
                                                </h3>
                                                <p className="text-sm text-gray-600 text-center leading-relaxed">
                                                    The extension needs to reload this page to work properly.
                                                </p>
                                                <button
                                                    onClick={async () => {
                                                        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                                                        if (tab.id) {
                                                            chrome.tabs.reload(tab.id);
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-2"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                    Reload Page Now
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">
                                                Ready to generate summary
                                            </span>
                                        )
                                    )}
                                </div>


                            </>
                        )}
                        {/* Guest Floating Button (Inside Summary Box) */}
                        {!effectiveUser && !isCompact && (
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
                                isGuest={!effectiveUser}
                            />
                        </div>
                    )}



                </div>

                {/* Fixed Bottom Section */}
                <div className={cn("shrink-0 flex flex-col gap-4 pb-2 relative z-50", isCompact && "gap-0 pb-0")}>

                    {/* Advanced Generation Panel (Pro/Free/Real) */}
                    {effectiveUser && !summary && (
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
                            subtext="Summarize the full conversation"
                            checked={includeAI}
                            onChange={() => {
                                const newValue = !includeAI;
                                setIncludeAI(newValue);
                                if (newValue) {
                                    if (analyzeImages) {
                                        toast.success("Including AI responses & Images");
                                    } else {
                                        toast.success("Including AI responses");
                                    }
                                } else {
                                    if (analyzeImages) {
                                        toast.success("Prompts & Images only");
                                    } else {
                                        toast.success("Prompts only");
                                    }
                                }
                            }}
                        />
                        <CheckboxRow
                            label="Read images"
                            subtext="Include visual context"
                            checked={analyzeImages}
                            onChange={() => {
                                const newValue = !analyzeImages;
                                setAnalyzeImages(newValue);
                                if (newValue) {
                                    if (includeAI) {
                                        toast.success("Including AI responses & Images");
                                    } else {
                                        toast.success("Including Images");
                                    }
                                } else {
                                    if (includeAI) {
                                        toast.success("Including AI responses");
                                    } else {
                                        toast.success("Images excluded");
                                    }
                                }
                            }}
                        />
                    </div>


                    {/* Bottom Buttons Row */}
                    <div className="relative flex items-center justify-between pt-2 px-1 flex-nowrap">
                        <div className="relative z-[2100]">
                            <Tooltip content="Metadata" disabled={activePopup === 'metadata'}>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className={cn(
                                        "relative z-[110] rounded-full w-8 h-8 shadow-sm border-gray-200 text-gray-500 transition-colors hover:bg-gray-50",
                                        activePopup === 'metadata' && "bg-black text-white border-black hover:bg-gray-900 shadow-md"
                                    )}
                                    onClick={() => setActivePopup(activePopup === 'metadata' ? 'none' : 'metadata')}
                                >
                                    <Info className="w-4 h-4" />
                                </Button>
                            </Tooltip>
                            {activePopup === 'metadata' && (
                                <>
                                    <div className="fixed inset-0 z-[90]" onClick={() => setActivePopup('none')} />
                                    <div className="popup-content absolute bottom-[32px] left-0 mb-3 z-[100] w-auto min-w-[240px] bg-white rounded-2xl shadow-xl border border-gray-200 p-4 text-sm origin-bottom-left" onClick={(e) => e.stopPropagation()}>
                                        <h3 className="font-semibold text-gray-900 mb-3 text-xs">Metadata</h3>
                                        <div className="space-y-2.5 text-gray-600">
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-xs">Version</span>
                                                <span className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">v1.0.6</span>
                                            </div>
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-xs">AI Engine</span>
                                                <span className="font-medium text-gray-900 text-xs text-right">GPT-4o-mini & Gemini 2.0</span>
                                            </div>
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-xs">Status</span>
                                                <span className="flex items-center gap-1.5 font-medium text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                                                    Active
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-xs">Developer</span>
                                                <span className="font-medium text-gray-900 text-xs">Bharath Amaravadhi</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>



                        {/* Right Side Buttons: Feedback, History, Help, Settings */}
                        <div className="relative z-[2100] flex items-center gap-2 flex-nowrap">
                            {/* Feedback Button */}
                            <div className="relative">
                                <Tooltip content="Feedback" disabled={activePopup === 'feedback'}>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className={cn(
                                            "relative z-[110] rounded-full w-8 h-8 shadow-sm border-gray-200 text-gray-500 transition-colors hover:bg-gray-50",
                                            activePopup === 'feedback' && "bg-black text-white border-black hover:bg-gray-900 shadow-md"
                                        )}
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
                                            activePopup === 'history' && "bg-black text-white border-black hover:bg-gray-900 shadow-md"
                                        )}
                                        onClick={() => setActivePopup(activePopup === 'history' ? 'none' : 'history')}
                                    >
                                        <History className="w-4 h-4" />
                                    </Button>
                                </Tooltip>
                            </div>


                            {effectiveUser && (
                                <div className="relative">
                                    <Tooltip content="Settings" disabled={activePopup === 'settings'}>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className={cn(
                                                "relative z-[110] rounded-full w-8 h-8 shadow-sm border-gray-200 text-gray-500 transition-colors hover:bg-gray-50",
                                                activePopup === 'settings' && "bg-black text-white border-black hover:bg-gray-900 shadow-md"
                                            )}
                                            onClick={() => setActivePopup(activePopup === 'settings' ? 'none' : 'settings')}
                                        >
                                            <Settings className="w-4 h-4" />
                                        </Button>
                                    </Tooltip>
                                    {activePopup === 'settings' && (
                                        <>
                                            <div className="fixed inset-0 z-[90]" onClick={() => setActivePopup('none')} />
                                            <div className="popup-content absolute bottom-[32px] right-0 mb-3 z-[100] w-max bg-white rounded-2xl shadow-xl border border-gray-200 p-5 text-sm origin-bottom-right" onClick={(e) => e.stopPropagation()}>
                                                <h3 className="font-semibold text-gray-900 mb-4">Summary Format</h3>
                                                <div className="space-y-2">
                                                    {/* Summary Format Selection */}
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
                                                                    onChange={() => {
                                                                        setSummaryType(type);
                                                                        chrome.storage.local.set({ summaryType: type });
                                                                        toast.success(`Format changed to ${type}`);
                                                                    }}
                                                                    className="hidden"
                                                                />
                                                                <span className="text-xs font-medium text-gray-700">{type}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Help Button */}
                            <div className="relative">
                                <Tooltip content="Help" disabled={activePopup === 'help'}>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className={cn(
                                            "relative z-[110] rounded-full w-8 h-8 shadow-sm border-gray-200 text-gray-500 transition-colors hover:bg-gray-50",
                                            activePopup === 'help' && "bg-black text-white border-black hover:bg-gray-900 shadow-md"
                                        )}
                                        onClick={() => setActivePopup(activePopup === 'help' ? 'none' : 'help')}
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                    </Button>
                                </Tooltip>
                                {activePopup === 'help' && (
                                    <>
                                        <div className="fixed inset-0 z-[90]" onClick={() => setActivePopup('none')} />
                                        <div className="popup-content absolute bottom-[32px] right-0 mb-3 z-[100] w-max bg-white rounded-2xl shadow-xl border border-gray-200 p-5 text-sm origin-bottom-right" onClick={(e) => e.stopPropagation()}>
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

                            {/* Settings Button - Only for logged-in users */}

                        </div>
                        {/* Moved Popups for Full Width (Absolute Position) */}
                        {activePopup === 'feedback' && (
                            <div className="fixed inset-0 z-[90]" onClick={() => setActivePopup('none')} />
                        )}

                        <PulseCheck
                            open={activePopup === 'feedback'}
                            onOpenChange={(open) => setActivePopup(open ? 'feedback' : 'none')}
                            userEmail={effectiveUser?.email}
                        />

                        {activePopup === 'history' && (
                            <>
                                <div className="fixed inset-0 z-[90]" onClick={() => setActivePopup('none')} />

                                <div className="popup-content absolute bottom-[32px] left-0 right-0 mb-3 z-[2000]" onClick={(e) => e.stopPropagation()}>
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
                initialFeedback={genState === 'error' ? `I encountered this error: ${summary}` : ''}
            />

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                userEmail={effectiveUser?.email}
            />

            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLoginSuccess={() => {
                    setShowLoginModal(false);
                    setSimulatedTier('none');
                }}
            />

        </Layout>
    );
};
