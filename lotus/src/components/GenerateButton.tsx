import React, { useState, useEffect, useRef } from 'react';
import { Check, AlignLeft, List, ArrowRight, Loader2, ChevronDown } from 'lucide-react';
import { Tooltip } from './ui/Tooltip';
import { cn } from '../utils/cn';

type GenerateState = 'idle' | 'generating' | 'completed' | 'error';

interface GenerateButtonProps {
    onGenerate: (additionalInfo?: string, format?: 'paragraph' | 'points', tone?: 'normal' | 'professional' | 'creative') => void;
    state: GenerateState;
    isRegenerating?: boolean;
    disabled?: boolean;
    compact?: boolean;
    includeAI?: boolean;
    analyzeImages?: boolean;
    isGuest?: boolean;
}

const STEPS_DEFAULT = ["Analyzing prompts", "Extracting insights", "Drafting summary"];
const STEPS_REGEN = ["Re-analyzing prompts", "Re-extracting insights", "Re-drafting summary"];

export const GenerateButton: React.FC<GenerateButtonProps> = ({
    onGenerate,
    state,
    isRegenerating = false,
    disabled = false,
    compact = false,
    isGuest = false
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // New UI States
    const [format, setFormat] = useState<'paragraph' | 'points'>('paragraph');
    const [tone, setTone] = useState<'normal' | 'professional' | 'creative'>('normal');
    const [additionalInfo, setAdditionalInfo] = useState("");


    // Determine which steps to show
    const steps = isRegenerating ? STEPS_REGEN : STEPS_DEFAULT;


    // Animation States
    const [currentStep, setCurrentStep] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [timer, setTimer] = useState(0.0);

    // Reset options on idle
    useEffect(() => {
        if (state === 'idle') {
            setTimer(0);
            setCurrentStep(0);
            setIsExpanded(false);
            return;
        }

        if (state === 'generating') {
            setCurrentStep(0);
            setIsExpanded(false);
            setTimer(0);

            // Timer for the "0.0s" display
            const timerInterval = setInterval(() => {
                setTimer(prev => prev + 0.1);
            }, 100);

            // Step Progress Animation
            // Total time is approx 2.5s (controlled by parent), so we step every ~800ms
            const stepInterval = setInterval(() => {
                setCurrentStep(prev => {
                    if (prev < steps.length) return prev + 1;
                    return prev;
                });
            }, 800);

            return () => {
                clearInterval(timerInterval);
                clearInterval(stepInterval);
            };
        }
    }, [state, steps.length]); // Add steps.length dependency

    // Compact Mode Rendering (Idle Only)
    if (compact && state === 'idle') {
        return (
            <Tooltip content={disabled ? "Not available on this page" : "Generate Summary"}>
                <button
                    onClick={() => !disabled && onGenerate(additionalInfo, format, tone)}
                    disabled={disabled}
                    className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors group shadow-md",
                        disabled ? "bg-gray-200 cursor-not-allowed" : "bg-black hover:bg-gray-800"
                    )}
                >
                    <ArrowRight className={cn("w-5 h-5", disabled ? "text-gray-400" : "text-white")} />
                </button>
            </Tooltip>
        );
    }

    // GUEST MODE: Return only floating button without container (all states)
    if (isGuest) {
        // If regenerating (e.g. from summary box), do not show floating button
        if (isRegenerating) return null;

        if (state === 'idle') {
            return (
                <Tooltip content={disabled ? "Not available on this page" : "Generate Summary"}>
                    <button
                        onClick={() => !disabled && onGenerate(additionalInfo, format, tone)}
                        disabled={disabled}
                        className="absolute right-4 bottom-4 w-12 h-12 rounded-full flex items-center justify-center transition-colors group shadow-lg z-[210]"
                        style={{
                            backgroundColor: disabled ? '#e5e7eb' : 'black',
                            cursor: disabled ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <ArrowRight className={cn("w-5 h-5", disabled ? "text-gray-400" : "text-white")} />
                    </button>
                </Tooltip >
            );
        } else if (state === 'generating') {
            return (
                <Tooltip content="Generating..." disabled={true}>
                    <div className="absolute right-4 bottom-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-[210]" style={{ backgroundColor: '#ffffff' }}>
                        <Loader2 className="w-5 h-5 text-black animate-spin" />
                    </div>
                </Tooltip>
            );
        } else if (state === 'completed') {
            return null;
        }
        return null;
    }

    const adjustHeight = (el: HTMLTextAreaElement) => {
        if (!el.value.trim()) {
            // If empty, reset to minimum height
            el.style.height = '24px';
            return;
        }
        el.style.height = 'auto';
        const newHeight = Math.min(el.scrollHeight, 120); // Max 5 lines (approx 24px * 5)
        el.style.height = `${newHeight}px`;
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setAdditionalInfo(e.target.value);
        adjustHeight(e.target);
    };

    // Adjust height when additionalInfo changes (e.g. via Mic)
    useEffect(() => {
        if (textareaRef.current) {
            adjustHeight(textareaRef.current);
        }
    }, [additionalInfo]);



    return (
        <div
            className={cn(
                "relative w-full font-medium text-sm transition-all duration-300 ease-in-out z-[210]",
                state === 'idle' ? "rounded-2xl" : "rounded-xl",
                // Adjust height based on state and expansion
                state === 'idle' ? "" :
                    state === 'generating' ? "min-h-[160px]" :
                        isExpanded ? "min-h-[160px]" : "h-12"
            )}
            style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)'
            }}
        >
            {state === 'idle' && (
                <div className="flex flex-col p-5 gap-6 animate-fade-in">
                    {/* Top: Format Toggles and Toggle Switch */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 p-1 rounded-lg w-fit" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                            <Tooltip content="Alignment">
                                <button
                                    onClick={() => setFormat('paragraph')}
                                    className="p-1.5 rounded-md transition-all"
                                    style={{
                                        backgroundColor: format === 'paragraph' ? 'var(--bg-primary)' : 'transparent',
                                        color: format === 'paragraph' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                                        boxShadow: format === 'paragraph' ? 'var(--shadow-sm)' : 'none'
                                    }}
                                >
                                    <AlignLeft className="w-4 h-4" />
                                </button>
                            </Tooltip>
                            <Tooltip content="List">
                                <button
                                    onClick={() => setFormat('points')}
                                    className="p-1.5 rounded-md transition-all"
                                    style={{
                                        backgroundColor: format === 'points' ? 'var(--bg-primary)' : 'transparent',
                                        color: format === 'points' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                                        boxShadow: format === 'points' ? 'var(--shadow-sm)' : 'none'
                                    }}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </Tooltip>
                        </div>


                    </div>


                    {/* Middle: Input */}
                    <div className="w-full relative">
                        <textarea
                            ref={textareaRef}
                            placeholder="type additional information here"
                            value={additionalInfo}
                            onChange={handleInput}
                            rows={1}
                            spellCheck={true}
                            className="w-full border-none p-0 pr-2 text-base font-medium focus:ring-0 focus:outline-none bg-transparent resize-none min-h-[24px] max-h-[120px] overflow-y-auto"
                            style={{ color: 'var(--text-primary)', caretColor: 'var(--text-primary)' }}
                            onFocus={(e) => e.target.style.setProperty('--placeholder-color', 'var(--text-tertiary)')}
                        />

                        <div className="w-full h-px mt-3" style={{ backgroundColor: 'var(--border-primary)' }} />
                    </div>

                    {/* Bottom: Tone & Action */}
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setTone(prev => prev === 'professional' ? 'normal' : 'professional')}
                                className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                                style={{
                                    backgroundColor: tone === 'professional' ? 'black' : 'var(--bg-secondary)',
                                    color: tone === 'professional' ? 'white' : 'var(--text-tertiary)'
                                }}
                            >
                                professional
                            </button>
                            <button
                                onClick={() => setTone(prev => prev === 'creative' ? 'normal' : 'creative')}
                                className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                                style={{
                                    backgroundColor: tone === 'creative' ? 'black' : 'var(--bg-secondary)',
                                    color: tone === 'creative' ? 'white' : 'var(--text-tertiary)'
                                }}
                            >
                                creative
                            </button>
                        </div>

                        <Tooltip content="Generate Summary">
                            <button
                                onClick={() => onGenerate(additionalInfo, format, tone)}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors group shadow-md"
                                style={{ backgroundColor: 'black' }}
                            >
                                <ArrowRight className="w-5 h-5 text-white" />
                            </button>
                        </Tooltip>
                    </div>
                </div>
            )}

            {/* GENERATING STATE: Show Steps */}
            {state === 'generating' && (
                <div className="flex flex-col justify-center min-h-[160px] p-6 gap-3 animate-fade-in">
                    {steps.map((step, index) => (
                        <div key={index} className="flex items-center gap-3">
                            {index < currentStep ? (
                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-green-600" />
                                </div>
                            ) : index === currentStep ? (
                                <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-primary)' }} />
                            ) : (
                                <div className="w-5 h-5 rounded-full" style={{ border: '1px solid var(--border-primary)' }} />
                            )}

                            <span
                                className="text-sm transition-colors"
                                style={{
                                    color: index <= currentStep ? 'var(--text-primary)' : 'var(--text-tertiary)',
                                    fontWeight: index <= currentStep ? '500' : '400'
                                }}
                            >
                                {step}
                            </span>
                        </div>
                    ))}

                    <div className="absolute bottom-4 right-6 text-xs text-gray-400 font-mono">
                        {timer.toFixed(1)}s
                    </div>
                </div>
            )}

            {/* COMPLETED STATE */}
            {state === 'completed' && (
                <div className="w-full h-full flex flex-col animate-fade-in">
                    {/* Collapsed View (Default) */}
                    {!isExpanded && (
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="w-full h-12 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors rounded-xl"
                        >
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                <ArrowRight className="w-3 h-3 text-green-600 -rotate-90" /> {/* Up Arrow */}
                            </div>
                            <span className="font-medium text-gray-900">Summary Generated</span>
                            <span className="text-[10px] text-gray-400 font-mono ml-1">
                                {timer.toFixed(1)}s
                            </span>
                        </button>
                    )}

                    {/* Expanded View (Processing Details) */}
                    {isExpanded && (
                        <div className="flex flex-col justify-center min-h-[160px] p-6 gap-3 relative">
                            {steps.map((step, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-green-600" />
                                    </div>
                                    <span className="text-sm text-gray-900 font-medium">
                                        {step}
                                    </span>
                                </div>
                            ))}

                            <button
                                onClick={() => setIsExpanded(false)}
                                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>

                            <div className="absolute bottom-4 right-6 text-xs text-gray-400 font-mono">
                                {timer.toFixed(1)}s
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
