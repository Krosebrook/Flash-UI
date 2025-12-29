
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Refactored for PWA/Persistence by Senior AI Architect
import { GoogleGenAI } from '@google/genai';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

import { Artifact, Session, ComponentVariation } from './types';
import { INITIAL_PLACEHOLDERS } from './constants';
import { generateId } from './utils';

import DottedGlowBackground from './components/DottedGlowBackground';
import ArtifactCard from './components/ArtifactCard';
import SideDrawer from './components/SideDrawer';
import Terminal from './components/Terminal';
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

const VARIATION_LOADING_MESSAGES = [
    "Analyzing design systems...",
    "Drafting architectural logic...",
    "Optimizing responsive breakpoints...",
    "Refining visual hierarchy...",
    "Exploring creative metaphors..."
];

type UILibrary = 'vanilla' | 'mui' | 'chakra' | 'image';

const STORAGE_KEY_SESSIONS = 'flash_ui_sessions_v1';
const STORAGE_KEY_CONFIG = 'flash_ui_config_v1';

function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(-1);
  const [focusedArtifactIndex, setFocusedArtifactIndex] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [variationKeywords, setVariationKeywords] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedLibrary, setSelectedLibrary] = useState<UILibrary>('vanilla');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isHighQualityImage, setIsHighQualityImage] = useState<boolean>(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  
  const [drawerState, setDrawerState] = useState<{
      isOpen: boolean;
      mode: 'code' | 'variations' | null;
      title: string;
      data: any; 
  }>({ isOpen: false, mode: null, title: '', data: null });

  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [componentVariations, setComponentVariations] = useState<ComponentVariation[]>([]);
  const [variationLoadingIndex, setVariationLoadingIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Persistence: Load on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
        if (parsed.length > 0) setCurrentSessionIndex(parsed.length - 1);
      } catch (e) {
        console.error("Failed to restore sessions", e);
      }
    }

    const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (savedConfig) {
      try {
        const { library, hq } = JSON.parse(savedConfig);
        if (library) setSelectedLibrary(library);
        if (hq !== undefined) setIsHighQualityImage(hq);
      } catch (e) {}
    }

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
          console.log('SW registration failed: ', err);
        });
      });
    }
  }, []);

  // Persistence: Sync on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({ library: selectedLibrary, hq: isHighQualityImage }));
  }, [selectedLibrary, isHighQualityImage]);

  useEffect(() => {
      inputRef.current?.focus();
  }, []);

  const isLoadingDrawer = isLoading && drawerState.mode === 'variations' && componentVariations.length === 0;
  useEffect(() => {
      if (!isLoadingDrawer) return;
      const interval = setInterval(() => {
          setVariationLoadingIndex(prev => (prev + 1) % VARIATION_LOADING_MESSAGES.length);
      }, 2000);
      return () => clearInterval(interval);
  }, [isLoadingDrawer]);

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
          if (!hasKey) {
              await window.aistudio.openSelectKey();
          }
      }
  };

  const wrapCodeInLibraryTemplate = (code: string, library: UILibrary) => {
      let cleanCode = code.trim();
      if (cleanCode.startsWith('```')) {
          const lines = cleanCode.split('\n');
          if (lines[0].includes('```')) lines.shift();
          if (lines[lines.length-1].includes('```')) lines.pop();
          cleanCode = lines.join('\n');
      }
      if (library === 'vanilla' || library === 'image') return cleanCode;
      
      // Templates for MUI/Chakra
      if (library === 'mui') return `<!DOCTYPE html><html><head><script src="https://unpkg.com/react@18/umd/react.production.min.js"></script><script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script><script src="https://unpkg.com/@babel/standalone/babel.min.js"></script><script src="https://unpkg.com/@mui/material@latest/umd/material-ui.production.min.js"></script><style>body { margin: 0; padding: 20px; }</style></head><body><div id="root"></div><script type="text/babel">const {ThemeProvider,createTheme,CssBaseline,Button,Container,Typography,Box,Card,CardContent,Grid,AppBar,Toolbar,IconButton,TextField}=MaterialUI;const theme=createTheme({palette:{mode:'light'},shape:{borderRadius:12}});${cleanCode} const root=ReactDOM.createRoot(document.getElementById('root'));root.render(<ThemeProvider theme={theme}><CssBaseline/><App/></ThemeProvider>);</script></body></html>`;
      
      if (library === 'chakra') return `<!DOCTYPE html><html><head><script src="https://unpkg.com/react@18/umd/react.production.min.js"></script><script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script><script src="https://unpkg.com/@babel/standalone/babel.min.js"></script><script src="https://unpkg.com/@chakra-ui/react@2.2.1/dist/chakra-ui.production.min.js"></script><style>body{margin:0;padding:20px;}</style></head><body><div id="root"></div><script type="text/babel">const {ChakraProvider,extendTheme,Box,Container,Heading,Text,Button,VStack,HStack,Stack,Flex,SimpleGrid}=ChakraUI;const theme=extendTheme({});${cleanCode} const root=ReactDOM.createRoot(document.getElementById('root'));root.render(<ChakraProvider theme={theme}><App/></ChakraProvider>);</script></body></html>`;
      
      return cleanCode;
  };

  const generateArtifact = async (sessionId: string, artifactId: string, styleInstruction: string, promptText: string, library: UILibrary) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        if (library === 'image') {
            const modelName = isHighQualityImage ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
            if (isHighQualityImage) await handleApiKeySelection();

            const response = await ai.models.generateContent({
                model: modelName,
                contents: { parts: [{ text: `${promptText}. Style: ${styleInstruction}` }] },
                config: { imageConfig: { aspectRatio: "1:1", imageSize: isHighQualityImage ? "1K" : undefined } }
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

            setSessions(prev => prev.map(sess => sess.id === sessionId ? { ...sess, artifacts: sess.artifacts.map(art => art.id === artifactId ? { ...art, html: imageHtml, status: 'complete' } : art) } : sess));
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
            setSessions(prev => prev.map(sess => sess.id === sessionId ? { ...sess, artifacts: sess.artifacts.map(art => art.id === artifactId ? { ...art, html: wrapped, status: 'streaming' } : art) } : sess));
        }
        
        const final = wrapCodeInLibraryTemplate(accumulated, library);
        setSessions(prev => prev.map(sess => sess.id === sessionId ? { ...sess, artifacts: sess.artifacts.map(art => art.id === artifactId ? { ...art, html: final, status: 'complete' } : art) } : sess));

    } catch (e: any) {
        console.error(e);
        setSessions(prev => prev.map(sess => sess.id === sessionId ? { ...sess, artifacts: sess.artifacts.map(art => art.id === artifactId ? { ...art, status: 'error', html: JSON.stringify({title:"Error", message: e.message || "Failed to generate.", solution:"Check your API key or connection."}) } : art) } : sess));
    }
  };

  const handleSendMessage = useCallback(async (manualPrompt?: string) => {
    const promptToUse = manualPrompt || inputValue;
    const trimmed = promptToUse.trim();
    if (!trimmed || isLoading) return;
    if (!manualPrompt) setInputValue('');

    setIsLoading(true);
    const sessionId = generateId();
    const placeholderArtifacts: Artifact[] = Array(3).fill(null).map((_, i) => ({
        id: `${sessionId}_${i}`,
        styleName: 'Thinking...',
        html: '',
        status: 'streaming',
    }));

    const newSession = { id: sessionId, prompt: trimmed, timestamp: Date.now(), artifacts: placeholderArtifacts };
    setSessions(prev => [...prev, newSession]);
    setCurrentSessionIndex(sessions.length);
    setFocusedArtifactIndex(null);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const styleResp = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { role: 'user', parts: [{ text: `Generate 3 creative design directions for: "${trimmed}". Return ONLY JSON array of 3 strings.` }] }
        });

        let styles = ["Concept A", "Concept B", "Concept C"];
        try { styles = JSON.parse(styleResp.text?.match(/\[.*\]/s)?.[0] || '[]'); } catch {}

        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, artifacts: s.artifacts.map((art, i) => ({ ...art, styleName: styles[i] || art.styleName })) } : s));
        await Promise.all(placeholderArtifacts.map((art, i) => generateArtifact(sessionId, art.id, styles[i], trimmed, selectedLibrary)));
    } finally {
        setIsLoading(false);
    }
  }, [inputValue, isLoading, sessions.length, selectedLibrary, isHighQualityImage]);

  const handleRetryArtifact = useCallback((artifactId: string) => {
      const session = sessions.find(s => s.artifacts.some(a => a.id === artifactId));
      if (!session) return;
      const artifact = session.artifacts.find(a => a.id === artifactId);
      if (!artifact) return;

      setSessions(prev => prev.map(s => s.id === session.id ? {
          ...s,
          artifacts: s.artifacts.map(a => a.id === artifactId ? { ...a, status: 'streaming', html: '' } : a)
      } : s));

      generateArtifact(session.id, artifact.id, artifact.styleName, session.prompt, selectedLibrary);
  }, [sessions, selectedLibrary]);

  const handleRegenerateSession = useCallback(() => {
      const current = sessions[currentSessionIndex];
      if (current) {
          handleSendMessage(current.prompt);
      }
  }, [sessions, currentSessionIndex, handleSendMessage]);

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
        <a href="https://x.com/ammaar" target="_blank" rel="noreferrer" className={`creator-credit ${hasStarted ? 'hide-on-mobile' : ''}`}>created by @ammaar</a>

        <SideDrawer isOpen={drawerState.isOpen} onClose={() => setDrawerState(s => ({...s, isOpen: false}))} title={drawerState.title}>
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
                                <ArtifactCard 
                                    key={artifact.id} 
                                    artifact={artifact} 
                                    isFocused={focusedArtifactIndex === aIndex} 
                                    onClick={() => setFocusedArtifactIndex(aIndex)} 
                                    onRetry={handleRetryArtifact}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {hasStarted && (currentSessionIndex > 0 || (focusedArtifactIndex && focusedArtifactIndex > 0)) && <button className="nav-handle left" onClick={prevItem}><ArrowLeftIcon /></button>}
            {hasStarted && (currentSessionIndex < sessions.length - 1 || (focusedArtifactIndex !== null && focusedArtifactIndex < 2)) && <button className="nav-handle right" onClick={nextItem}><ArrowRightIcon /></button>}

            <div className={`action-bar ${focusedArtifactIndex !== null ? 'visible' : (hasStarted && !isLoading ? 'visible' : '')}`}>
                 <div className="active-prompt-label">{currentSession?.prompt}</div>
                 <div className="action-buttons">
                    {focusedArtifactIndex !== null ? (
                        <>
                            <button onClick={() => setFocusedArtifactIndex(null)}><GridIcon /> Grid</button>
                            <button onClick={handleRegenerateSession} disabled={isLoading}><RotateCcwIcon /> Regenerate All</button>
                            <button onClick={() => setDrawerState({ isOpen: true, mode: 'code', title: 'Source Code', data: currentSession?.artifacts[focusedArtifactIndex].html })}><CodeIcon /> Source</button>
                        </>
                    ) : (
                        hasStarted && !isLoading && (
                            <>
                                <button onClick={handleRegenerateSession}><RotateCcwIcon /> Regenerate All</button>
                                <button onClick={() => { setInputValue(''); inputRef.current?.focus(); }}><PlusIcon /> New Draft</button>
                            </>
                        )
                    )}
                 </div>
            </div>

            <div className="floating-input-container">
                <div className={`input-wrapper ${isLoading ? 'loading' : ''}`}>
                    <div className="library-selector">
                        <button className={`lib-btn ${selectedLibrary === 'vanilla' ? 'active' : ''}`} onClick={() => setSelectedLibrary('vanilla')}>F</button>
                        <button className={`lib-btn ${selectedLibrary === 'mui' ? 'active' : ''}`} onClick={() => setSelectedLibrary('mui')}>M</button>
                        <button className={`lib-btn ${selectedLibrary === 'chakra' ? 'active' : ''}`} onClick={() => setSelectedLibrary('chakra')}>C</button>
                        <button className={`lib-btn ${selectedLibrary === 'image' ? 'active' : ''}`} onClick={() => setSelectedLibrary('image')}>I</button>
                    </div>

                    {selectedLibrary === 'image' && (
                        <div className="hq-toggle-box">
                            <span className="hq-label">HQ</span>
                            <input type="checkbox" checked={isHighQualityImage} onChange={(e) => setIsHighQualityImage(e.target.checked)} />
                        </div>
                    )}

                    {!isLoading ? (
                        <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={INITIAL_PLACEHOLDERS[placeholderIndex]} />
                    ) : (
                        <div className="input-generating-label"><ThinkingIcon /> Designing...</div>
                    )}
                    <button className="send-button" onClick={() => handleSendMessage()} disabled={isLoading || !inputValue.trim()}><ArrowUpIcon /></button>
                </div>
            </div>

            <button className="terminal-toggle" onClick={() => setIsTerminalOpen(true)} aria-label="Open Terminal">
              <CodeIcon />
            </button>
            <Terminal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
        </div>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
