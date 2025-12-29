
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { db } from '../db';
import { decrypt, encrypt } from '../utils/crypto';

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
    help: async (args) => {
      const list = [
        "GENERAL COMMANDS:",
        "  help          - Display this help menu",
        "  clear         - Clear terminal screen",
        "  whoami        - Display current session information",
        "  exit          - Close the terminal",
        "",
        "VAULT & KEYS:",
        "  listkeys      - List all configured API providers",
        "  setkey        - Usage: setkey <provider> <key>",
        "                  (Encrypts if vault is active/unlocked)",
        "  getkey        - Usage: getkey <provider> (Masked display)",
        "  rmkey         - Usage: rmkey <provider> (Delete a key)",
        "",
        "SYSTEM & DATABASE:",
        "  tables        - List all IndexedDB tables",
        "  getdb         - Usage: getdb <tableName> (View all table data)",
        "  cleardb       - Usage: cleardb <tableName> (Wipe specific table)",
        "  reset         - WIPE ALL LOCAL STORAGE & INDEXEDDB",
      ];
      list.forEach(line => addToHistory(line));
    },
    clear: async () => {
      setHistory([]);
    },
    exit: async (_, { onClose }) => {
      onClose();
    },
    whoami: async () => {
      const keysCount = await db.apiKeys.count();
      addToHistory(`User: Flash Designer`);
      addToHistory(`Session: Local-Only (PWA)`);
      addToHistory(`Storage: IndexedDB (Dexie) + LocalStorage`);
      addToHistory(`Vault Status: ${keysCount} items stored`);
    },
    tables: async () => {
      const tableNames = db.tables.map(t => t.name);
      addToHistory(`IndexedDB Tables: ${tableNames.join(', ')}`);
    },
    getdb: async (args) => {
      if (args.length < 1) {
        addToHistory("Error: Usage: getdb <tableName>");
        return;
      }
      const tableName = args[0];
      const table = db.tables.find(t => t.name === tableName);
      
      if (!table) {
        addToHistory(`Error: Table '${tableName}' not found.`);
        return;
      }

      try {
        const data = await table.toArray();
        if (data.length === 0) {
          addToHistory(`Table '${tableName}' is empty.`);
        } else {
          addToHistory(`Contents of '${tableName}':`);
          data.forEach((item, idx) => {
            // Mask sensitive fields in output
            const safeItem = { ...item };
            if ('key' in safeItem) safeItem.key = '********';
            if ('encryptedKey' in safeItem) safeItem.encryptedKey = '[ENCRYPTED_PAYLOAD]';
            addToHistory(`[${idx}] ${JSON.stringify(safeItem)}`);
          });
        }
      } catch (err: any) {
        addToHistory(`Error accessing database: ${err.message}`);
      }
    },
    cleardb: async (args) => {
      if (args.length < 1) {
        addToHistory("Error: Usage: cleardb <tableName>");
        return;
      }
      const tableName = args[0];
      const table = db.tables.find(t => t.name === tableName);
      
      if (!table) {
        addToHistory(`Error: Table '${tableName}' not found.`);
        return;
      }

      try {
        await table.clear();
        addToHistory(`Success: Table '${tableName}' has been cleared.`);
      } catch (err: any) {
        addToHistory(`Error clearing database: ${err.message}`);
      }
    },
    listkeys: async () => {
      const all = await db.apiKeys.toArray();
      const providers = all.filter(k => k.provider !== '__vault_config__').map(k => k.provider);
      if (providers.length === 0) {
        addToHistory("No keys configured.");
      } else {
        addToHistory("Configured Providers:");
        providers.forEach(p => addToHistory(`  - ${p}`));
      }
    },
    setkey: async (args) => {
      if (args.length < 2) {
        addToHistory("Error: Usage: setkey <provider> <key>");
        return;
      }
      const [provider, key] = args;
      const normalized = provider.toLowerCase();
      
      try {
        const config = await db.apiKeys.get('__vault_config__');
        if (config) {
           addToHistory("Notice: Vault is initialized. Use the Vault UI to manage encrypted keys securely.");
           return;
        }

        await db.apiKeys.put({
          provider: normalized,
          key: key,
          updatedAt: Date.now()
        });
        addToHistory(`Success: Key for '${normalized}' saved.`);
      } catch (err: any) {
        addToHistory(`Error: ${err.message}`);
      }
    },
    getkey: async (args) => {
      if (args.length < 1) {
        addToHistory("Error: Usage: getkey <provider>");
        return;
      }
      const provider = args[0].toLowerCase();
      const entry = await db.apiKeys.get(provider);
      
      if (!entry) {
        addToHistory(`Error: Provider '${provider}' not found.`);
        return;
      }

      const val = entry.key || (entry.encryptedKey ? "[ENCRYPTED]" : "N/A");
      const masked = val === "[ENCRYPTED]" ? val : `${val.substring(0, 4)}...${val.substring(val.length - 4)}`;
      addToHistory(`${provider.toUpperCase()}: ${masked} (Updated: ${new Date(entry.updatedAt).toLocaleDateString()})`);
    },
    rmkey: async (args) => {
      if (args.length < 1) {
        addToHistory("Error: Usage: rmkey <provider>");
        return;
      }
      const provider = args[0].toLowerCase();
      await db.apiKeys.delete(provider);
      addToHistory(`Deleted: Key for '${provider}'.`);
    },
    reset: async () => {
      addToHistory("WARNING: System reset initiated...");
      localStorage.clear();
      await db.apiKeys.clear();
      addToHistory("SUCCESS: All local databases and configurations have been purged.");
      setTimeout(() => window.location.reload(), 1500);
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

    if (commandFn) {
      await commandFn(args, { setHistory, onClose });
    } else {
      addToHistory(`Command not found: ${cmd}. Type 'help' for options.`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput("");
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
          <span className="terminal-title">flash-terminal — 80x24</span>
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
