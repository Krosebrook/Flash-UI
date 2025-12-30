/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI } from '@google/genai';
import React, { useState, useCallback, useEffect, useRef, Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';

import { Artifact, Session } from './types';
import { INITIAL_PLACEHOLDERS } from './constants';
import { generateId } from './utils';

import { StorageProvider, useStorage } from './contexts/StorageContext';
import DottedGlowBackground from './components/DottedGlowBackground';
import ArtifactCard from './components/ArtifactCard';
import SideDrawer from './components/SideDrawer';
import GlobalLoadingIndicator from './components/GlobalLoading';
import { 
    CodeIcon, 
    SparklesIcon, 
    ArrowLeftIcon, 
    ArrowRightIcon, 
    ArrowUpIcon, 
    GridIcon,
    CheckIcon,
    CopyIcon,
    RotateCcwIcon,
    WarningIcon
} from './components/Icons';

// Lazy load non-critical utility components
const Terminal = lazy(() => import('./components/Terminal'));
const KeyManager = lazy(() => import('./components/KeyManager'));

type UILibrary = 'vanilla' | 'mui' | 'chakra' | 'image';

const LIBRARY_TOOLTIPS: Record<UILibrary, string> = {
  vanilla: 'Pure HTML/CSS. Zero dependencies, maximum performance.',
  mui: 'Material UI (React). Google-inspired professional design system.',
  chakra: 'Chakra UI (React). Accessible and developer-friendly components.',
  image: 'AI Image. Generate high-quality visual assets with Gemini.'
};

/**
 * Custom Hook: usePWA
 * Manages Service Worker lifecycle and Installation state
 */
function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check local storage to prevent spamming the user if they dismissed it permanently
      const isDismissed = localStorage.getItem('pwa_install_dismissed');
      if (!isDismissed) {
        setIsInstallable(true);
      }
    };

    const handleAppInstalled = () => {
      // Hide the prompt if the user installed the app (via banner or browser menu)
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('Flash UI was successfully installed.');
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // SW Registration with relative path safety
    if ('serviceWorker' in navigator) {
      const swPath = './sw.js';
      navigator.serviceWorker.register(swPath)
        .then(reg => {
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              };
            }
          };
        })
        .catch(err => console.debug('SW Registration skipped in this environment.'));

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, discard it
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const dismissInstall = () => {
    setIsInstallable(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  return { isInstallable, isOffline, updateAvailable, installApp, dismissInstall };
}

function AppContent() {
  const { sessions, config, addSession, updateArtifact, setLibrary, setHqMode, setGlobalLoading } = useStorage();
  const { isInstallable, isOffline, updateAvailable, installApp, dismissInstall } = usePWA();
  
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(-1);
  const [focusedArtifactIndex, setFocusedArtifactIndex] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  
  const [drawerState, setDrawerState] = useState<{
      isOpen: boolean;
      mode: 'code' | 'variations' | null;
      title: string;
      data: any; 
  }>({ isOpen: false, mode: null, title: '', data: null });

  const [isCopied, setIsCopied] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-switch placeholder for dynamic feel
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((p) => (p + 1) % INITIAL_PLACEHOLDERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update session index on new session
  useEffect(() => {
    if (sessions.length > 0 && currentSessionIndex === -1) {
      setCurrentSessionIndex(sessions.length - 1);
    }
  }, [sessions, currentSessionIndex]);

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
    
    const baseLibs = `
      <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    `;

    if (library === 'mui') return `<!DOCTYPE html><html><head>${baseLibs}<script src="https://unpkg.com/@mui/material@latest/umd/material-ui.production.min.js"></script><style>body { margin: 0; padding: 20px; background: transparent; color: #fff; }</style></head><body><div id="root"></div><script type="text/babel">const {ThemeProvider,createTheme,CssBaseline,Button,Container,Typography,Box,Card,CardContent,Grid,AppBar,Toolbar,IconButton,TextField}=MaterialUI;const theme=createTheme({palette:{mode:'dark'},shape:{borderRadius:12}});${cleanCode} const root=ReactDOM.createRoot(document.getElementById('root'));root.render(<ThemeProvider theme={theme}><CssBaseline/><App/></ThemeProvider>);</script></body></html>`;
    if (library === 'chakra') return `<!DOCTYPE html><html><head>${baseLibs}<script src="https://unpkg.com/@chakra-ui/react@2.2.1/dist/chakra-ui.production.min.js"></script><style>body{margin:0;padding:20px;background: transparent; color: #fff;}</style></head><body><div id="root"></div><script type="text/babel">const {ChakraProvider,extendTheme,Box,Container,Heading,Text,Button,VStack,HStack,Stack,Flex,SimpleGrid}=ChakraUI;const theme=extendTheme({config:{initialColorMode:'dark'}});${cleanCode} const root=ReactDOM.createRoot(document.getElementById('root'));root.render(<ChakraProvider theme={theme}><App/></ChakraProvider>);</script></body></html>`;
    return cleanCode;
  };

  const generateArtifact = async (sessionId: string, artifactId: string, styleInstruction: string, promptText: string, library: UILibrary) => {
    try {
      if (isOffline) throw new Error("Connection Lost. Check your internet.");
      
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
      
      const systemPrompt = `Create a functional ${library.toUpperCase()} component for: "${promptText}". Style: ${styleInstruction}. Return ONLY functional code. No commentary. Ensure it is accessible and uses modern best practices. Use a dark theme palette by default.`;
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: systemPrompt }], role: "user" }],
        config: { tools: [{ googleSearch: {} }] } // Production grounding
      });
      
      let accumulated = '';
      for await (const chunk of responseStream) {
        accumulated += chunk.text;
        const wrapped = wrapCodeInLibraryTemplate(accumulated, library);
        updateArtifact(sessionId, artifactId, { html: wrapped, status: 'streaming' });
      }
      updateArtifact(sessionId, artifactId, { html: wrapCodeInLibraryTemplate(accumulated, library), status: 'complete' });
    } catch (e: any) {
      updateArtifact(sessionId, artifactId, { status: 'error', html: JSON.stringify({ title: "Error", message: e.message || "Failed to generate." }) });
    }
  };

  const handleSendMessage = useCallback(async (manualPrompt?: string) => {
    const promptToUse = (manualPrompt || inputValue).trim();
    if (!promptToUse || isLoading) return;
    if (isOffline) return;
    
    if (!manualPrompt) setInputValue('');
    setIsLoading(true);
    setGlobalLoading(true, "Architecting Concepts...");
    
    const sessionId = generateId();
    const placeholders: Artifact[] = Array(3).fill(null).map((_, i) => ({
      id: `${sessionId}_${i}`,
      styleName: 'Reasoning...',
      html: '',
      status: 'streaming',
    }));

    addSession({ id: sessionId, prompt: promptToUse, timestamp: Date.now(), artifacts: placeholders });
    setCurrentSessionIndex(sessions.length);
    setFocusedArtifactIndex(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const styleResp = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { role: 'user', parts: [{ text: `Synthesize 3 distinct visual design directions (e.g. 'Cyberspace Brutalist', 'Neo-Glassmorphic', 'Swiss Tech Minimalist') for: "${promptToUse}". Return ONLY a JSON array of 3 strings.` }] }
      });
      let styles = ["Direction A", "Direction B", "Direction C"];
      try { styles = JSON.parse(styleResp.text?.match(/\[.*\]/s)?.[0] || '[]'); } catch { }
      styles.forEach((style, i) => updateArtifact(sessionId, `${sessionId}_${i}`, { styleName: style }));
      await Promise.all(placeholders.map((art, i) => generateArtifact(sessionId, art.id, styles[i], promptToUse, config.library)));
    } finally {
      setIsLoading(false);
      setGlobalLoading(false);
    }
  }, [inputValue, isLoading, sessions.length, config.library, addSession, updateArtifact, setGlobalLoading, isOffline]);

  const prevItem = () => {
    if (focusedArtifactIndex !== null) {
      if (focusedArtifactIndex > 0) setFocusedArtifactIndex(focusedArtifactIndex - 1);
      else if (currentSessionIndex > 0) { setCurrentSessionIndex(currentSessionIndex - 1); setFocusedArtifactIndex(2); }
    } else if (currentSessionIndex > 0) setCurrentSessionIndex(currentSessionIndex - 1);
  };

  const nextItem = () => {
    if (focusedArtifactIndex !== null) {
      if (focusedArtifactIndex < 2) setFocusedArtifactIndex(focusedArtifactIndex + 1);
      else if (currentSessionIndex < sessions.length - 1) { setCurrentSessionIndex(currentSessionIndex + 1); setFocusedArtifactIndex(0); }
    } else if (currentSessionIndex < sessions.length - 1) setCurrentSessionIndex(currentSessionIndex + 1);
  };

  const hasStarted = sessions.length > 0 || isLoading;
  const currentSession = sessions[currentSessionIndex];

  return (
    <>
      <DottedGlowBackground />
      <GlobalLoadingIndicator />
      
      {isOffline && (
        <div className="network-status-toast">
          <WarningIcon />
          <span>Offline Mode: Previous artifacts are available locally.</span>
        </div>
      )}

      {updateAvailable && (
        <div className="system-update-banner">
          <SparklesIcon />
          <span>New Studio updates are ready.</span>
          <button onClick={() => window.location.reload()}>Apply Updates</button>
        </div>
      )}

      {isInstallable && (
        <div className="install-banner">
          <div className="install-content">
            <SparklesIcon />
            <span>Install Flash UI for a native fullscreen experience.</span>
          </div>
          <div className="install-actions">
            <button onClick={installApp} className="install-btn">Install Now</button>
            <button onClick={dismissInstall} className="dismiss-btn">&times;</button>
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
              <p>Generation-first design system. Build components at the speed of thought.</p>
              <button className="surprise-button" onClick={() => handleSendMessage(INITIAL_PLACEHOLDERS[placeholderIndex])} disabled={isLoading || isOffline}><SparklesIcon /> Surprise Me</button>
            </div>
          </div>

          {sessions.map((session, sIndex) => (
            <div key={session.id} className={`session-group ${sIndex === currentSessionIndex ? 'active-session' : sIndex < currentSessionIndex ? 'past-session' : 'future-session'}`}>
              <div className="artifact-grid">
                {session.artifacts.map((artifact, aIndex) => (
                  <ArtifactCard 
                    key={artifact.id} 
                    artifact={artifact} 
                    isFocused={focusedArtifactIndex === aIndex} 
                    onClick={() => setFocusedArtifactIndex(aIndex)} 
                    onRetry={(id) => generateArtifact(session.id, id, artifact.styleName, session.prompt, config.library)} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {hasStarted && (currentSessionIndex > 0 || (focusedArtifactIndex !== null && focusedArtifactIndex > 0)) && <button className="nav-handle left" onClick={prevItem} aria-label="Previous"><ArrowLeftIcon /></button>}
        {hasStarted && (currentSessionIndex < sessions.length - 1 || (focusedArtifactIndex !== null && focusedArtifactIndex < 2)) && <button className="nav-handle right" onClick={nextItem} aria-label="Next"><ArrowRightIcon /></button>}

        <div className={`action-bar ${focusedArtifactIndex !== null ? 'visible' : (hasStarted && !isLoading ? 'visible' : '')}`}>
          <div className="active-prompt-label">{currentSession?.prompt}</div>
          <div className="action-buttons">
            {focusedArtifactIndex !== null ? (
              <>
                <button onClick={() => setFocusedArtifactIndex(null)}><GridIcon /> Close Preview</button>
                <button onClick={() => setDrawerState({ isOpen: true, mode: 'code', title: 'Component Source', data: currentSession?.artifacts[focusedArtifactIndex].html })}><CodeIcon /> View Source</button>
              </>
            ) : (
              hasStarted && !isLoading && (
                <button onClick={() => handleSendMessage(currentSession?.prompt)} disabled={isOffline}><RotateCcwIcon /> Regenerate All</button>
              )
            )}
          </div>
        </div>

        <div className="floating-input-container">
          <div className={`input-wrapper ${isLoading ? 'loading' : ''} ${isOffline ? 'offline' : ''}`}>
            <div className="library-selector">
              {(['vanilla', 'mui', 'chakra', 'image'] as UILibrary[]).map((lib) => (
                <button 
                  key={lib} 
                  className={`lib-btn ${config.library === lib ? 'active' : ''}`} 
                  onClick={() => setLibrary(lib)}
                  data-tooltip={LIBRARY_TOOLTIPS[lib]}
                >
                  {lib.charAt(0).toUpperCase()}
                </button>
              ))}
            </div>
            {config.library === 'image' && (
              <div className="hq-toggle-box" data-tooltip="Pro Model (Paid Tier Required)">
                <span className="hq-label">HQ</span>
                <input type="checkbox" checked={config.hq} onChange={(e) => setHqMode(e.target.checked)} />
              </div>
            )}
            <input 
              ref={inputRef} 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
              placeholder={isOffline ? "Currently Offline..." : INITIAL_PLACEHOLDERS[placeholderIndex]} 
              disabled={isLoading || isOffline}
            />
            <button className="send-button" onClick={() => handleSendMessage()} disabled={isLoading || isOffline || !inputValue.trim()}>
              <ArrowUpIcon />
            </button>
          </div>
        </div>

        <div className="utility-bar">
          <button className="utility-btn" onClick={() => setIsVaultOpen(true)} aria-label="Open Vault"><SparklesIcon /> <span>Vault</span></button>
          <button className="utility-btn" onClick={() => setIsTerminalOpen(true)} aria-label="Open CLI"><CodeIcon /> <span>CLI</span></button>
        </div>

        <Suspense fallback={null}>
          <Terminal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
          <KeyManager isOpen={isVaultOpen} onClose={() => setIsVaultOpen(false)} />
        </Suspense>
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