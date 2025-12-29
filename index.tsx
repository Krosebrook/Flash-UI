/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI } from '@google/genai';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

import { Artifact, Session, ComponentVariation } from './types';
import { INITIAL_PLACEHOLDERS } from './constants';
import { generateId } from './utils';

import { StorageProvider, useStorage } from './contexts/StorageContext';
import DottedGlowBackground from './components/DottedGlowBackground';
import ArtifactCard from './components/ArtifactCard';
import SideDrawer from './components/SideDrawer';
import Terminal from './components/Terminal';
import KeyManager from './components/KeyManager';
import GlobalLoadingIndicator from './components/GlobalLoading';
import { 
    ThinkingIcon, 
    CodeIcon, 
    SparklesIcon, 
    ArrowLeftIcon, 
    ArrowRightIcon, 
    ArrowUpIcon, 
    GridIcon,
    CheckIcon,
    CopyIcon,
    RotateCcwIcon,
    PlusIcon
} from './components/Icons';

type UILibrary = 'vanilla' | 'mui' | 'chakra' | 'image';

const LIBRARY_TOOLTIPS: Record<UILibrary, string> = {
  vanilla: 'Pure HTML/CSS. Zero dependencies, maximum performance.',
  mui: 'Material UI (React). Google-inspired professional design system.',
  chakra: 'Chakra UI (React). Accessible and developer-friendly components.',
  image: 'AI Image. Generate high-quality visual assets with Gemini.'
};

function AppContent() {
  const { sessions, config, addSession, updateArtifact, setLibrary, setHqMode, setGlobalLoading } = useStorage();
  
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(-1);
  const [focusedArtifactIndex, setFocusedArtifactIndex] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  
  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const [drawerState, setDrawerState] = useState<{
      isOpen: boolean;
      mode: 'code' | 'variations' | null;
      title: string;
      data: any; 
  }>({ isOpen: false, mode: null, title: '', data: null });

  const [isCopied, setIsCopied] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sessions.length > 0 && currentSessionIndex === -1) {
      setCurrentSessionIndex(sessions.length - 1);
    }
  }, [sessions, currentSessionIndex]);

  useEffect(() => {
    const handleOpenVault = () => setIsVaultOpen(true);
    window.addEventListener('open-vault', handleOpenVault);
    
    const params = new URLSearchParams(window.location.search);
    if (params.get('open') === 'vault') {
      setIsVaultOpen(true);
      window.history.replaceState({}, document.title, "/");
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    const handleAppInstalled = () => {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('open-vault', handleOpenVault);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.debug(`Install outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        setGlobalLoading(true, "Booting PWA...");
        
        // Use a relative path directly instead of new URL() to avoid origin-related construction failures
        navigator.serviceWorker.register('./sw.js')
          .then(registration => {
            setGlobalLoading(false);
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                setGlobalLoading(true, "Updating System...");
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    setGlobalLoading(false);
                    window.location.reload();
                  }
                };
              }
            };
          })
          .catch(err => {
            console.error('SW registration failed: ', err);
            setGlobalLoading(false);
          });
      });
    }
  }, [setGlobalLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % INITIAL_PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleApiKeySelection = async () => {
    // @ts-ignore
    if (typeof window.aistudio !== 'undefined') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) await window.aistudio.openSelectKey();
    }
  };

  const wrapCodeInLibraryTemplate = (code: string, library: UILibrary) => {
    let cleanCode = code.trim();
    if (cleanCode.startsWith('```')) {
      const lines = cleanCode.split('\n');
      if (lines[0].includes('```')) lines.shift();
      if (lines[lines.length - 1].includes('```')) lines.pop();
      cleanCode = lines.join('\n');
    }
    if (library === 'vanilla' || library === 'image') return cleanCode;
    if (library === 'mui') return `<!DOCTYPE html><html><head><script src="https://unpkg.com/react@18/umd/react.production.min.js"></script><script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script><script src="https://unpkg.com/@babel/standalone/babel.min.js"></script><script src="https://unpkg.com/@mui/material@latest/umd/material-ui.production.min.js"></script><style>body { margin: 0; padding: 20px; }</style></head><body><div id="root"></div><script type="text/babel">const {ThemeProvider,createTheme,CssBaseline,Button,Container,Typography,Box,Card,CardContent,Grid,AppBar,Toolbar,IconButton,TextField}=MaterialUI;const theme=createTheme({palette:{mode:'light'},shape:{borderRadius:12}});${cleanCode} const root=ReactDOM.createRoot(document.getElementById('root'));root.render(<ThemeProvider theme={theme}><CssBaseline/><App/></ThemeProvider>);</script></body></html>`;
    if (library === 'chakra') return `<!DOCTYPE html><html><head><script src="https://unpkg.com/react@18/umd/react.production.min.js"></script><script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script><script src="https://unpkg.com/@babel/standalone/babel.min.js"></script><script src="https://unpkg.com/@chakra-ui/react@2.2.1/dist/chakra-ui.production.min.js"></script><style>body{margin:0;padding:20px;}</style></head><body><div id="root"></div><script type="text/babel">const {ChakraProvider,extendTheme,Box,Container,Heading,Text,Button,VStack,HStack,Stack,Flex,SimpleGrid}=ChakraUI;const theme=extendTheme({});${cleanCode} const root=ReactDOM.createRoot(document.getElementById('root'));root.render(<ChakraProvider theme={theme}><App/></ChakraProvider>);</script></body></html>`;
    return cleanCode;
  };

  const generateArtifact = async (sessionId: string, artifactId: string, styleInstruction: string, promptText: string, library: UILibrary) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      if (library === 'image') {
        const modelName = config.hq ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
        if (config.hq) await handleApiKeySelection();
        const response = await ai.models.generateContent({
          model: modelName,
          contents: { parts: [{ text: `${promptText}. Style: ${styleInstruction}` }] },
          config: { imageConfig: { aspectRatio: "1:1", imageSize: config.hq ? "1K" : undefined } }
        });
        let imageUrl = '';
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
        if (!imageUrl) throw new Error("Image generation failed.");
        const imageHtml = `<!DOCTYPE html><html><head><style>body{margin:0;display:flex;align-items:center;justify-content:center;background:#09090b;height:100vh;overflow:hidden;}img{max-width:95%;max-height:95%;object-fit:contain;border-radius:24px;box-shadow:0 40px 100px rgba(0,0,0,0.8);animation:reveal 1s ease-out;}@keyframes reveal{from{opacity:0;transform:scale(0.92);filter:blur(20px);}to{opacity:1;transform:scale(1);filter:blur(0);}}</style></head><body><img src="${imageUrl}"/></body></html>`;
        updateArtifact(sessionId, artifactId, { html: imageHtml, status: 'complete' });
        return;
      }
      const systemPrompt = `Create a breathtaking, functional ${library.toUpperCase()} component for: "${promptText}". Conceptual Style: ${styleInstruction}. Return ONLY functional code.`;
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: systemPrompt }], role: "user" }],
      });
      let accumulated = '';
      for await (const chunk of responseStream) {
        accumulated += chunk.text;
        const wrapped = wrapCodeInLibraryTemplate(accumulated, library);
        updateArtifact(sessionId, artifactId, { html: wrapped, status: 'streaming' });
      }
      const final = wrapCodeInLibraryTemplate(accumulated, library);
      updateArtifact(sessionId, artifactId, { html: final, status: 'complete' });
    } catch (e: any) {
      updateArtifact(sessionId, artifactId, { status: 'error', html: JSON.stringify({ title: "Error", message: e.message || "Failed to generate.", solution: "Check your API key or connection." }) });
    }
  };

  const handleSendMessage = useCallback(async (manualPrompt?: string) => {
    const promptToUse = manualPrompt || inputValue;
    const trimmed = promptToUse.trim();
    if (!trimmed || isLoading) return;
    if (!manualPrompt) setInputValue('');

    setIsLoading(true);
    setGlobalLoading(true, "Designing Concepts...");
    const sessionId = generateId();
    const placeholderArtifacts: Artifact[] = Array(3).fill(null).map((_, i) => ({
      id: `${sessionId}_${i}`,
      styleName: 'Thinking...',
      html: '',
      status: 'streaming',
    }));

    addSession({ id: sessionId, prompt: trimmed, timestamp: Date.now(), artifacts: placeholderArtifacts });
    setCurrentSessionIndex(sessions.length);
    setFocusedArtifactIndex(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const styleResp = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { role: 'user', parts: [{ text: `Generate 3 creative design directions for: "${trimmed}". Return ONLY JSON array of 3 strings.` }] }
      });
      let styles = ["Concept A", "Concept B", "Concept C"];
      try { styles = JSON.parse(styleResp.text?.match(/\[.*\]/s)?.[0] || '[]'); } catch { }
      styles.forEach((style, i) => updateArtifact(sessionId, `${sessionId}_${i}`, { styleName: style }));
      setGlobalLoading(true, "Streaming Archetypes...");
      await Promise.all(placeholderArtifacts.map((art, i) => generateArtifact(sessionId, art.id, styles[i] || 'Concept', trimmed, config.library)));
    } finally {
      setIsLoading(false);
      setGlobalLoading(false);
    }
  }, [inputValue, isLoading, sessions.length, config.library, addSession, updateArtifact, setGlobalLoading]);

  const prevItem = useCallback(() => {
    if (focusedArtifactIndex !== null) {
      if (focusedArtifactIndex > 0) setFocusedArtifactIndex(focusedArtifactIndex - 1);
      else if (currentSessionIndex > 0) { setCurrentSessionIndex(currentSessionIndex - 1); setFocusedArtifactIndex(2); }
    } else if (currentSessionIndex > 0) setCurrentSessionIndex(currentSessionIndex - 1);
  }, [focusedArtifactIndex, currentSessionIndex]);

  const nextItem = useCallback(() => {
    if (focusedArtifactIndex !== null) {
      if (focusedArtifactIndex < 2) setFocusedArtifactIndex(focusedArtifactIndex + 1);
      else if (currentSessionIndex < sessions.length - 1) { setCurrentSessionIndex(currentSessionIndex + 1); setFocusedArtifactIndex(0); }
    } else if (currentSessionIndex < sessions.length - 1) setCurrentSessionIndex(currentSessionIndex + 1);
  }, [focusedArtifactIndex, currentSessionIndex, sessions.length]);

  const hasStarted = sessions.length > 0 || isLoading;
  const currentSession = sessions[currentSessionIndex];

  return (
    <>
      <DottedGlowBackground />
      <GlobalLoadingIndicator />
      <a href="https://x.com/ammaar" target="_blank" rel="noreferrer" className={`creator-credit ${hasStarted ? 'hide-on-mobile' : ''}`}>created by @ammaar</a>

      {showInstallBanner && (
        <div className="install-banner">
          <div className="install-content">
            <SparklesIcon />
            <span>Install Flash UI for a faster, offline-ready studio.</span>
          </div>
          <div className="install-actions">
            <button onClick={handleInstallClick} className="install-btn">Install Now</button>
            <button onClick={() => setShowInstallBanner(false)} className="dismiss-btn" aria-label="Dismiss">&times;</button>
          </div>
        </div>
      )}

      <SideDrawer isOpen={drawerState.isOpen} onClose={() => setDrawerState(s => ({ ...s, isOpen: false }))} title={drawerState.title}>
        {drawerState.mode === 'code' && (
          <div className="code-container">
            <button className={`copy-code-button ${isCopied ? 'copied' : ''}`} onClick={() => { navigator.clipboard.writeText(drawerState.data); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }}>
              {isCopied ? <CheckIcon /> : <CopyIcon />} <span>{isCopied ? 'Copied' : 'Copy Code'}</span>
            </button>
            <pre className="code-block"><code>{drawerState.data}</code></pre>
          </div>
        )}
      </SideDrawer>

      <div className="immersive-app">
        <div className={`stage-container ${focusedArtifactIndex !== null ? 'mode-focus' : 'mode-split'}`}>
          <div className={`empty-state ${hasStarted ? 'fade-out' : ''}`}>
            <div className="empty-content">
              <h1>Flash UI</h1>
              <p>Design artifacts in an instant.</p>
              <button className="surprise-button" onClick={() => handleSendMessage(INITIAL_PLACEHOLDERS[placeholderIndex])} disabled={isLoading}><SparklesIcon /> Surprise Me</button>
            </div>
          </div>

          {sessions.map((session, sIndex) => (
            <div key={session.id} className={`session-group ${sIndex === currentSessionIndex ? 'active-session' : sIndex < currentSessionIndex ? 'past-session' : 'future-session'}`}>
              <div className="artifact-grid">
                {session.artifacts.map((artifact, aIndex) => (
                  <ArtifactCard key={artifact.id} artifact={artifact} isFocused={focusedArtifactIndex === aIndex} onClick={() => setFocusedArtifactIndex(aIndex)} onRetry={(id) => generateArtifact(session.id, id, artifact.styleName, session.prompt, config.library)} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {hasStarted && (currentSessionIndex > 0 || (focusedArtifactIndex && focusedArtifactIndex > 0)) && <button className="nav-handle left" onClick={prevItem} aria-label="Previous"><ArrowLeftIcon /></button>}
        {hasStarted && (currentSessionIndex < sessions.length - 1 || (focusedArtifactIndex !== null && focusedArtifactIndex < 2)) && <button className="nav-handle right" onClick={nextItem} aria-label="Next"><ArrowRightIcon /></button>}

        <div className={`action-bar ${focusedArtifactIndex !== null ? 'visible' : (hasStarted && !isLoading ? 'visible' : '')}`}>
          <div className="active-prompt-label">{currentSession?.prompt}</div>
          <div className="action-buttons">
            {focusedArtifactIndex !== null ? (
              <>
                <button onClick={() => setFocusedArtifactIndex(null)} data-tooltip="Return to Grid View"><GridIcon /> Grid</button>
                <button onClick={() => handleSendMessage(currentSession?.prompt)} disabled={isLoading} data-tooltip="Regenerate all 3 artifacts"><RotateCcwIcon /> Regenerate All</button>
                <button onClick={() => setDrawerState({ isOpen: true, mode: 'code', title: 'Source Code', data: currentSession?.artifacts[focusedArtifactIndex].html })} data-tooltip="View Source Code"><CodeIcon /> Source</button>
              </>
            ) : (
              hasStarted && !isLoading && (
                <>
                  <button onClick={() => handleSendMessage(currentSession?.prompt)} data-tooltip="Regenerate current prompt"><RotateCcwIcon /> Regenerate All</button>
                  <button onClick={() => { setInputValue(''); inputRef.current?.focus(); }} data-tooltip="Clear input and start over"><PlusIcon /> New Draft</button>
                </>
              )
            )}
          </div>
        </div>

        <div className="floating-input-container">
          <div className={`input-wrapper ${isLoading ? 'loading' : ''}`}>
            <div className="library-selector">
              {(['vanilla', 'mui', 'chakra', 'image'] as UILibrary[]).map((lib) => (
                <button 
                  key={lib} 
                  className={`lib-btn ${config.library === lib ? 'active' : ''}`} 
                  onClick={() => setLibrary(lib)}
                  data-tooltip={LIBRARY_TOOLTIPS[lib]}
                  aria-label={LIBRARY_TOOLTIPS[lib]}
                >
                  {lib.charAt(0).toUpperCase()}
                </button>
              ))}
            </div>
            {config.library === 'image' && (
              <div className="hq-toggle-box" data-tooltip="High-Quality Mode (Gemini 3 Pro Image)">
                <span className="hq-label">HQ</span>
                <input type="checkbox" checked={config.hq} onChange={(e) => setHqMode(e.target.checked)} />
              </div>
            )}
            {!isLoading ? (
              <input 
                ref={inputRef} 
                type="text" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                placeholder={INITIAL_PLACEHOLDERS[placeholderIndex]} 
              />
            ) : (
              <div className="input-generating-label"><ThinkingIcon /> Designing...</div>
            )}
            <button 
              className="send-button" 
              onClick={() => handleSendMessage()} 
              disabled={isLoading || !inputValue.trim()}
              data-tooltip="Generate Artifacts (Enter)"
            >
              <ArrowUpIcon />
            </button>
          </div>
        </div>

        <div className="utility-bar">
          <button className="utility-btn" onClick={() => setIsVaultOpen(true)} data-tooltip="Secure API Key Management"><SparklesIcon /> <span>Vault</span></button>
          <button className="utility-btn" onClick={() => setIsTerminalOpen(true)} data-tooltip="Developer Command Line"><CodeIcon /> <span>Terminal</span></button>
        </div>

        <Terminal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
        <KeyManager isOpen={isVaultOpen} onClose={() => setIsVaultOpen(false)} />
      </div>
    </>
  );
}

function App() {
  return (
    <StorageProvider>
      <AppContent />
    </StorageProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
