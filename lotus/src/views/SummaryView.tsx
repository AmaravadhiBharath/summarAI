import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Tooltip } from '../components/ui/Tooltip';
import { motion } from 'framer-motion';
import { SummaryToolbar } from '../components/SummaryToolbar';

interface SummaryViewProps {
    summary: string;
    rawInput?: string;
    onBack: () => void;
    onRegenerate: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ summary, rawInput, onBack, onRegenerate }) => {
    const [activeTab, setActiveTab] = useState<'summary' | 'raw'>('summary');

    return (
        <Layout>
            <div className="flex flex-col h-full relative">
                <div className="flex-1 min-h-0 mb-4 relative">
                    <div className="w-full h-full bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden relative">

                        {/* Back Button */}
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

                        {/* Tabs */}
                        {rawInput && (
                            <div className="absolute top-4 right-4 z-10 flex gap-1 bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setActiveTab('summary')}
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${activeTab === 'summary' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Summary
                                </button>
                                <button
                                    onClick={() => setActiveTab('raw')}
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${activeTab === 'raw' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
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
                            className="flex-1 overflow-y-auto text-sm leading-relaxed text-gray-700 text-justify font-sans p-6 pt-16 pb-20 no-scrollbar"
                        >
                            {activeTab === 'summary' ? summary : (rawInput || 'No raw input available')}
                        </motion.div>

                        {/* Bottom Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-end gap-3 bg-gradient-to-t from-white via-white/95 to-transparent pt-12 pb-4 px-4">
                            <div className="w-full text-center">
                                <span className="text-[10px] text-gray-300 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                    AI can make mistakes. Regenerate if needed.
                                </span>
                            </div>

                            <SummaryToolbar
                                summary={summary}
                                onRegenerate={onRegenerate}
                                onReportIssue={() => { }} // TODO: Implement report issue
                                isRegenerating={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
