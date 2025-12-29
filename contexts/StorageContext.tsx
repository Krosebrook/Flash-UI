
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, Artifact } from '../types';

type UILibrary = 'vanilla' | 'mui' | 'chakra' | 'image';

interface StorageConfig {
  library: UILibrary;
  hq: boolean;
}

interface LoadingState {
  active: boolean;
  message: string;
}

interface StorageContextType {
  sessions: Session[];
  config: StorageConfig;
  globalLoading: LoadingState;
  addSession: (session: Session) => void;
  updateArtifact: (sessionId: string, artifactId: string, updates: Partial<Artifact>) => void;
  setLibrary: (lib: UILibrary) => void;
  setHqMode: (hq: boolean) => void;
  setGlobalLoading: (active: boolean, message?: string) => void;
  clearAll: () => void;
}

const STORAGE_KEY_SESSIONS = 'flash_ui_sessions_v1';
const STORAGE_KEY_CONFIG = 'flash_ui_config_v1';

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [config, setConfig] = useState<StorageConfig>({ library: 'vanilla', hq: false });
  const [globalLoading, setGlobalLoadingInternal] = useState<LoadingState>({ active: false, message: '' });

  // Initial Load
  useEffect(() => {
    const savedSessions = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (e) {
        console.error("Failed to restore sessions", e);
      }
    }

    const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed to restore config", e);
      }
    }
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }, [config]);

  const addSession = useCallback((session: Session) => {
    setSessions(prev => [...prev, session]);
  }, []);

  const updateArtifact = useCallback((sessionId: string, artifactId: string, updates: Partial<Artifact>) => {
    setSessions(prev => prev.map(sess => 
      sess.id === sessionId ? {
        ...sess,
        artifacts: sess.artifacts.map(art => 
          art.id === artifactId ? { ...art, ...updates } : art
        )
      } : sess
    ));
  }, []);

  const setLibrary = useCallback((library: UILibrary) => {
    setConfig(prev => ({ ...prev, library }));
  }, []);

  const setHqMode = useCallback((hq: boolean) => {
    setConfig(prev => ({ ...prev, hq }));
  }, []);

  const setGlobalLoading = useCallback((active: boolean, message: string = '') => {
    setGlobalLoadingInternal({ active, message });
  }, []);

  const clearAll = useCallback(() => {
    localStorage.clear();
    setSessions([]);
    setConfig({ library: 'vanilla', hq: false });
  }, []);

  return (
    <StorageContext.Provider value={{ 
      sessions, 
      config, 
      globalLoading,
      addSession, 
      updateArtifact, 
      setLibrary, 
      setHqMode, 
      setGlobalLoading,
      clearAll 
    }}>
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
};
