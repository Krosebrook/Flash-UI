
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState<string[]>(["Welcome to Flash Terminal v1.0", "Type 'help' for commands."]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, isOpen]);

  const processCommand = (cmd: string) => {
    const parts = cmd.trim().split(" ");
    const action = parts[0].toLowerCase();
    const args = parts.slice(1);

    setHistory(prev => [...prev, `> ${cmd}`]);

    switch (action) {
      case 'help':
        setHistory(prev => [...prev, 
          "Available commands:",
          "  setkey [provider] [key] - Store a key locally (OpenAI, Anthropic, etc.)",
          "  getkey [provider]       - View stored key (masked)",
          "  whoami                 - Show local session status",
          "  clear                  - Clear terminal history",
          "  reset                  - WIPE ALL LOCAL STORAGE",
          "  exit                   - Close terminal"
        ]);
        break;
      case 'setkey':
        if (args.length < 2) {
          setHistory(prev => [...prev, "Usage: setkey [provider] [key]"]);
        } else {
          const [provider, key] = args;
          localStorage.setItem(`key_${provider.toLowerCase()}`, key);
          setHistory(prev => [...prev, `Key for ${provider} saved to local storage.`]);
        }
        break;
      case 'getkey':
        const prov = args[0]?.toLowerCase();
        const k = localStorage.getItem(`key_${prov}`);
        setHistory(prev => [...prev, k ? `${args[0]}: ${k.substring(0, 4)}...${k.substring(k.length-4)}` : "Key not found."]);
        break;
      case 'whoami':
        setHistory(prev => [...prev, `Environment: Production PWA`, `Storage: LocalStorage + Memory`]);
        break;
      case 'clear':
        setHistory([]);
        break;
      case 'reset':
        localStorage.clear();
        setHistory(prev => [...prev, "SYSTEM RESET COMPLETE. All local data wiped."]);
        break;
      case 'exit':
        onClose();
        break;
      default:
        setHistory(prev => [...prev, `Command not found: ${action}`]);
    }
    setInput("");
  };

  if (!isOpen) return null;

  return (
    <div className="terminal-overlay" onClick={onClose}>
      <div className="terminal-window" onClick={e => e.stopPropagation()}>
        <div className="terminal-header">
          <span>API Terminal</span>
          <button onClick={onClose}>&times;</button>
        </div>
        <div className="terminal-body" ref={scrollRef}>
          {history.map((line, i) => (
            <div key={i} className="terminal-line">{line}</div>
          ))}
          <div className="terminal-input-line">
            <span className="prompt">$</span>
            <input 
              autoFocus 
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && processCommand(input)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
