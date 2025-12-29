
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef, useMemo } from 'react';
import { Artifact } from '../types';
import { WarningIcon, SparklesIcon, RotateCcwIcon, CodeIcon } from './Icons';

interface ArtifactCardProps {
    artifact: Artifact;
    isFocused: boolean;
    onClick: () => void;
    onRetry?: (id: string) => void;
}

interface ErrorDisplay {
    title: string;
    message: string;
    solution: string;
    type: 'auth' | 'rate' | 'safety' | 'network' | 'generic';
}

const ArtifactCard = React.memo(({ 
    artifact, 
    isFocused, 
    onClick,
    onRetry
}: ArtifactCardProps) => {
    const codeRef = useRef<HTMLPreElement>(null);

    // Auto-scroll logic for code preview
    useEffect(() => {
        if (codeRef.current) {
            codeRef.current.scrollTop = codeRef.current.scrollHeight;
        }
    }, [artifact.html]);

    const isBlurring = artifact.status === 'streaming';
    const isError = artifact.status === 'error';
    const isComplete = artifact.status === 'complete';

    const errorData = useMemo((): ErrorDisplay | null => {
        if (!isError) return null;

        let rawMessage = "";
        let parsed = null;

        try {
            parsed = JSON.parse(artifact.html);
            rawMessage = parsed.message || artifact.html;
        } catch (e) {
            rawMessage = artifact.html;
        }

        const msg = rawMessage.toUpperCase();

        if (msg.includes("API_KEY_INVALID") || msg.includes("INVALID_ARGUMENT") || msg.includes("403") || msg.includes("API KEY")) {
            return {
                title: "Authentication Error",
                message: "Your API key is missing or invalid.",
                solution: "Open the Vault and ensure you have a valid Gemini API key configured.",
                type: 'auth'
            };
        }

        if (msg.includes("429") || msg.includes("EXHAUSTED") || msg.includes("RATE_LIMIT")) {
            return {
                title: "Rate Limit Exceeded",
                message: "You've sent too many requests in a short time.",
                solution: "Wait 60 seconds and try again. High-quality generations require a paid-tier key.",
                type: 'rate'
            };
        }

        if (msg.includes("SAFETY") || msg.includes("BLOCKED") || msg.includes("CANDIDATE")) {
            return {
                title: "Content Blocked",
                message: "The AI safety filters were triggered by this request.",
                solution: "Try rephrasing your prompt to be more specific and technical.",
                type: 'safety'
            };
        }

        if (msg.includes("NETWORK") || msg.includes("FETCH") || msg.includes("OFFLINE")) {
            return {
                title: "Connection Lost",
                message: "We couldn't reach the Gemini servers.",
                solution: "Check your internet connection and try again.",
                type: 'network'
            };
        }

        return {
            title: parsed?.title || "Generation Failed",
            message: parsed?.message || rawMessage || "An unexpected error occurred.",
            solution: parsed?.solution || "Check the Terminal for logs or try a different design direction.",
            type: 'generic'
        };
    }, [isError, artifact.html]);

    const handleRetry = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onRetry) onRetry(artifact.id);
    };

    return (
        <div 
            className={`artifact-card ${isFocused ? 'focused' : ''} ${isBlurring ? 'generating' : ''} ${isError ? 'error-state' : ''}`}
            onClick={onClick}
        >
            <div className="artifact-header">
                <span className="artifact-style-tag">{artifact.styleName}</span>
                {onRetry && isComplete && (
                    <button 
                        className="artifact-refresh-btn" 
                        onClick={handleRetry}
                        title="Regenerate this specific version"
                    >
                        <RotateCcwIcon />
                    </button>
                )}
            </div>
            <div className="artifact-card-inner">
                {isBlurring && (
                    <div className="generating-overlay">
                        <pre ref={codeRef} className="code-stream-preview">
                            {artifact.html}
                        </pre>
                    </div>
                )}
                
                {isError && errorData ? (
                    <div className="error-overlay">
                        <div className={`error-content error-type-${errorData.type}`}>
                            <div className="error-icon-circle">
                                <WarningIcon />
                            </div>
                            <h3>{errorData.title}</h3>
                            <p className="error-main-msg">{errorData.message}</p>
                            <div className="error-solution-box">
                                <span className="solution-label">Actionable Solution</span>
                                <p>{errorData.solution}</p>
                            </div>
                            <div className="error-actions">
                                <button className="error-retry-btn" onClick={handleRetry}>
                                    <SparklesIcon /> Try Again
                                </button>
                                {errorData.type === 'auth' && (
                                    <button className="error-action-link" onClick={() => window.dispatchEvent(new CustomEvent('open-vault'))}>
                                        Update Vault
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <iframe 
                        srcDoc={artifact.html} 
                        title={artifact.id} 
                        sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation allow-same-origin"
                        className="artifact-iframe"
                    />
                )}
            </div>
        </div>
    );
});

export default ArtifactCard;
