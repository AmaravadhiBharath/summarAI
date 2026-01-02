import React, { useState } from 'react';
import { X, AlertCircle, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { trackEvent } from '../services/analytics';

interface ReportIssueModalProps {
    open: boolean;
    onClose: () => void;
    summary: string;
    prompts: string;
    initialFeedback?: string;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ open, onClose, summary, prompts, initialFeedback = '' }) => {
    const [feedback, setFeedback] = useState(initialFeedback);
    const [includeData, setIncludeData] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    React.useEffect(() => {
        if (open) setFeedback(initialFeedback);
    }, [open, initialFeedback]);

    const handleSubmit = async () => {
        if (!feedback.trim()) {
            setError('Please describe what went wrong.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const eventData: any = {
                rating: 'negative',
                feedback: feedback,
                summary_length: summary.length,
                prompts_length: prompts.length,
            };

            if (includeData) {
                eventData.summary_text = summary;
                eventData.input_prompts = prompts;
            }

            trackEvent('feedback_negative_detailed', eventData);
            setShowSuccess(true);
            setTimeout(() => {
                setFeedback('');
                setIncludeData(false);
                setShowSuccess(false);
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            setError('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-[200] animate-fade-in" onClick={onClose} />
            <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up-fade" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-5 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                            <h3 className="font-semibold text-gray-900">Report Issue</h3>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-5 space-y-4">
                        {showSuccess ? (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <Check className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank you!</h3>
                                <p className="text-sm text-gray-600">Your feedback has been submitted.</p>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">What went wrong?</label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => { setFeedback(e.target.value); setError(''); }}
                                        placeholder="Describe the issue..."
                                        className={`w-full h-32 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent resize-none ${error ? 'border-red-300' : 'border-gray-300'}`}
                                        autoFocus
                                    />
                                    {error && <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setIncludeData(!includeData)}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${includeData ? 'bg-black border-black' : 'bg-white border-gray-300'}`}>
                                        {includeData && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">Include conversation data for debugging</p>
                                        <p className="text-xs text-gray-500 mt-1">Optional.</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200">
                        <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-black text-white hover:bg-gray-800">{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</Button>
                    </div>
                </div>
            </div>
        </>
    );
};
