
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef } from 'react';
import { Artifact } from '../types';
import { WarningIcon, SparklesIcon, RotateCcwIcon } from './Icons';

interface ArtifactCardProps {
    artifact: Artifact;
    isFocused: boolean;
    onClick: () => void;
    onRetry?: (id: string) => void;
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

    let errorData = null;
    if (isError) {
        try {
            errorData = JSON.parse(artifact.html);
        } catch (e) {
            errorData = {
                title: "Notice",
                message: artifact.html,
                solution: "Please try again or rephrase your request."
            };
        }
    }

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
                        <div className="error-content">
                            <div className="error-icon-circle">
                                <WarningIcon />
                            </div>
                            <h3>{errorData.title}</h3>
                            <p className="error-main-msg">{errorData.message}</p>
                            <div className="error-solution-box">
                                <span className="solution-label">Solution</span>
                                <p>{errorData.solution}</p>
                            </div>
                            <button className="error-retry-btn" onClick={handleRetry}>
                                <SparklesIcon /> Regenerate
                            </button>
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
