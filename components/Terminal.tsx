
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { db } from '../db';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandContext {
  setHistory: React.Dispatch<React.SetStateAction<string[]>>;
  onClose: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState<string[]>(["Flash OS [Version 1.2.1]", "(c) 2025 Flash UI Corp. All rights reserved.", "", "Type 'help' to see available commands."]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [history, isOpen]);

  const addToHistory = (line: string) => {
    setHistory(prev => [...prev, line]);
  };

  const commands: Record<string, (args: string[], ctx: CommandContext) => Promise<void>> = {
    help: async () => {
      const list = [
        "GENERAL COMMANDS: help, clear, whoami, exit",
        "VAULT: listkeys, setkey, getkey, rmkey",
        "SYSTEM: tables, getdb, cleardb, reset",
      ];
      list.forEach(line => addToHistory(line));
    },
    clear: async () => { setHistory([]); },
    exit: async (_, { onClose }) => { onClose(); },
    whoami: async () => {
      const keysCount = await db.apiKeys.count();
      addToHistory(`User: Flash Designer | Session: PWA Local | Vault: ${keysCount} keys`);
    },
    tables: async () => {
      addToHistory(`Tables: ${db.tables.map(t => t.name).join(', ')}`);
    },
    getdb: async (args) => {
      if (!args.length) { addToHistory("Usage: getdb <tableName>"); return; }
      const table = db.tables.find(t => t.name === args[0]);
      if (!table) { addToHistory(`Table '${args[0]}' not found.`); return; }
      const data = await table.toArray();
      data.forEach((item, idx) => addToHistory(`[${idx}] ${JSON.stringify(item).substring(0, 100)}...`));
    },
    cleardb: async (args) => {
      if (!args.length) { addToHistory("Usage: cleardb <tableName>"); return; }
      const table = db.tables.find(t => t.name === args[0]);
      if (table) { await table.clear(); addToHistory(`Cleared ${args[0]}.`); }
    },
    listkeys: async () => {
      const all = await db.apiKeys.toArray();
      const providers = all.filter(k => k.provider !== '__vault_config__').map(k => k.provider);
      addToHistory(providers.length ? `Providers: ${providers.join(', ')}` : "No keys found.");
    },
    setkey: async (args) => {
      if (args.length < 2) { addToHistory("Usage: setkey <provider> <key>"); return; }
      await db.apiKeys.put({ provider: args[0].toLowerCase(), key: args[1], updatedAt: Date.now() });
      addToHistory(`Saved key for ${args[0]}.`);
    },
    getkey: async (args) => {
      if (!args.length) { addToHistory("Usage: getkey <provider>"); return; }
      const entry = await db.apiKeys.get(args[0].toLowerCase());
      addToHistory(entry ? `${args[0].toUpperCase()}: ${entry.key ? '********' : '[ENCRYPTED]'}` : "Not found.");
    },
    rmkey: async (args) => {
      if (!args.length) { addToHistory("Usage: rmkey <provider>"); return; }
      await db.apiKeys.delete(args[0].toLowerCase());
      addToHistory(`Removed ${args[0]}.`);
    },
    reset: async () => {
      localStorage.clear();
      await db.apiKeys.clear();
      addToHistory("System wiped. Reloading...");
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleCommand = async (cmdString: string) => {
    const trimmed = cmdString.trim();
    if (!trimmed) return;
    setCommandHistory(prev => [trimmed, ...prev]);
    setHistoryIndex(-1);
    addToHistory(`$ ${trimmed}`);
    const [cmd, ...args] = trimmed.split(/\s+/);
    const commandFn = commands[cmd.toLowerCase()];
    if (commandFn) await commandFn(args, { setHistory, onClose });
    else addToHistory(`Unknown command: ${cmd}. Type 'help'.`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput("");
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const matches = Object.keys(commands).filter(c => c.startsWith(input.toLowerCase()));
      if (matches.length === 1) {
        setInput(matches[0]);
      } else if (matches.length > 1) {
        addToHistory(`$ ${input}`);
        addToHistory(matches.join('  '));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIndex = historyIndex + 1;
      if (nextIndex < commandHistory.length) {
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = historyIndex - 1;
      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="terminal-overlay" onClick={onClose}>
      <div className="terminal-window" onClick={e => e.stopPropagation()}>
        <div className="terminal-header">
          <div className="terminal-controls">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
          </div>
          <span className="terminal-title">flash-terminal</span>
          <button className="terminal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="terminal-body" ref={scrollRef}>
          {history.map((line, i) => (
            <div key={i} className={`terminal-line ${line.startsWith('$') ? 'input-line' : ''}`}>
              {line}
            </div>
          ))}
          <div className="terminal-input-row">
            <span className="prompt">$</span>
            <input 
              ref={inputRef}
              type="text" 
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoFocus
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;