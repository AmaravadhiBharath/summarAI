import React from 'react';
import { ArrowLeft, Copy, ThumbsUp, ThumbsDown, RefreshCw, MoreVertical } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Tooltip } from '../components/ui/Tooltip';
import { motion } from 'framer-motion';
import { trackEvent } from '../services/analytics';

interface SummaryViewProps {
    summary: string;
    rawInput?: string; // The raw text sent to AI
    onBack: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ summary, rawInput, onBack }) => {
    const [activeTab, setActiveTab] = React.useState<'summary' | 'raw'>('summary');

    return (
        <Layout>
            <div className="flex flex-col h-full relative">
                {/* Summary Card */}
                <div className="flex-1 min-h-0 mb-4 relative">
                    <div className="w-full h-full bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden relative">

                        {/* Floating Back Button (inside card) */}
                        <div className="absolute top-4 left-4 z-10">
                            <Tooltip content="Back">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    onClick={onBack}
                                    className="rounded-full w-8 h-8 shadow-sm border-gray-200 bg-white/80 backdrop-blur-sm"
                                >
                                    <ArrowLeft className="w-4 h-4 text-gray-600" />
                                </Button>
                            </Tooltip>
                        </div>

                        {/* Tab Buttons (only show if rawInput exists) */}
                        {rawInput && (
                            <div className="absolute top-4 right-4 z-10 flex gap-1 bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setActiveTab('summary')}
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${activeTab === 'summary'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Summary
                                </button>
                                <button
                                    onClick={() => setActiveTab('raw')}
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${activeTab === 'raw'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Raw Input
                                </button>
                            </div>
                        )}

                        {/* Content */}
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex-1 overflow-y-auto text-sm leading-relaxed text-gray-700 text-justify font-sans p-6 pt-16 pb-20"
                        >
                            {activeTab === 'summary' ? summary : (rawInput || 'No raw input available')}
                        </motion.div>

                        {/* Bottom Section (inside card overlay) */}
                        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-end gap-3 bg-gradient-to-t from-white via-white/95 to-transparent pt-12 pb-4 px-4">

                            {/* Disclaimer */}
                            <div className="w-full text-center">
                                <span className="text-[10px] text-gray-300 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                    AI can make mistakes. Regenerate if needed.
                                </span>
                            </div>

                            {/* Floating Toolbar */}
                            <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-gray-100 shadow-lg">
                                <Tooltip content="Good Response">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-gray-50 rounded-lg text-gray-500"
                                        onClick={() => trackEvent('feedback_positive', { type: 'thumbs_up', length: summary.length })}
                                    >
                                        <ThumbsUp className="w-4 h-4" />
                                    </Button>
                                </Tooltip>
                                <Tooltip content="Bad Response">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-gray-50 rounded-lg text-gray-500"
                                        onClick={() => trackEvent('feedback_negative', { type: 'thumbs_down', length: summary.length })}
                                    >
                                        <ThumbsDown className="w-4 h-4" />
                                    </Button>
                                </Tooltip>
                                <div className="w-px h-4 bg-gray-200 mx-0.5" />
                                <Tooltip content="Regenerate">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-50 rounded-lg text-gray-500">
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                </Tooltip>
                                <Tooltip content="Copy">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-50 rounded-lg text-gray-500">
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </Tooltip>
                                <Tooltip content="More">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-50 rounded-lg text-gray-500">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
