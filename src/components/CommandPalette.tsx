// src/components/CommandPalette.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import Fuse from 'fuse.js';
import { AnimatePresence, motion } from 'framer-motion';

interface Command {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  keywords: string[];
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Define available commands
  const commands: Command[] = useMemo(() => [
    {
      id: 'goto-intro',
      title: 'Go to Introduction',
      description: 'Learn the basics of EUV lithography',
      icon: '📚',
      action: () => window.location.href = '/docs/intro',
      keywords: ['intro', 'introduction', 'basics', 'start']
    },
    {
      id: 'goto-rayleigh',
      title: 'Why EUV? Rayleigh Criterion',
      description: 'Understand the physics behind EUV advantage',
      icon: '⚡',
      action: () => window.location.href = '/docs/chapters/why-euv-rayleigh',
      keywords: ['physics', 'rayleigh', 'resolution', 'wavelength']
    },
    {
      id: 'search-content',
      title: 'Search All Content',
      description: 'Full-text search across all chapters',
      icon: '🔍',
      action: () => {
        // Trigger Docusaurus search
        const searchButton = document.querySelector('[aria-label*="Search"]');
        (searchButton as HTMLElement)?.click();
      },
      keywords: ['search', 'find', 'content']
    },
    {
      id: 'toggle-theme',
      title: 'Toggle Dark/Light Theme',
      description: 'Switch between dark and light modes',
      icon: '🌓',
      action: () => {
        const themeToggle = document.querySelector('[aria-label*="theme"]');
        (themeToggle as HTMLElement)?.click();
      },
      keywords: ['theme', 'dark', 'light', 'mode']
    },
    {
      id: 'ai-assistant',
      title: 'Open AI Assistant',
      description: 'Get help from the EUV learning assistant',
      icon: '🤖',
      action: () => {
        const aiButton = document.querySelector('.ai-assistant-trigger');
        (aiButton as HTMLElement)?.click();
      },
      keywords: ['ai', 'assistant', 'help', 'chat']
    },
    {
      id: 'print-page',
      title: 'Print Current Page',
      description: 'Print-optimized version of current page',
      icon: '🖨️',
      action: () => window.print(),
      keywords: ['print', 'pdf', 'export']
    },
    {
      id: 'report-issue',
      title: 'Report Issue',
      description: 'Report a bug or suggest improvement',
      icon: '🐛',
      action: () => window.open('https://github.com/sid1887/euv-guide-site/issues', '_blank'),
      keywords: ['bug', 'issue', 'report', 'feedback']
    }
  ], []);

  // Fuzzy search setup
  const fuse = useMemo(() => new Fuse(commands, {
    keys: ['title', 'description', 'keywords'],
    threshold: 0.3,
    includeScore: true
  }), [commands]);

  // Search results
  const results = useMemo(() => {
    if (!query) return commands;
    return fuse.search(query).map(result => result.item);
  }, [query, fuse, commands]);

  // Keyboard shortcuts
  useHotkeys('meta+k, ctrl+k', (e) => {
    e.preventDefault();
    setIsOpen(true);
  });

  useHotkeys('escape', () => setIsOpen(false), { enabled: isOpen });

  useHotkeys('arrowup', (e) => {
    if (isOpen) {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(0, prev - 1));
    }
  }, { enabled: isOpen });

  useHotkeys('arrowdown', (e) => {
    if (isOpen) {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(results.length - 1, prev + 1));
    }
  }, { enabled: isOpen });

  useHotkeys('enter', (e) => {
    if (isOpen && results[selectedIndex]) {
      e.preventDefault();
      results[selectedIndex].action();
      setIsOpen(false);
      setQuery('');
      setSelectedIndex(0);
    }
  }, { enabled: isOpen });

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="command-palette-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '10vh'
          }}
        >
          <motion.div
            className="command-palette"
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '600px',
              maxWidth: '90vw',
              background: '#1a1a2e',
              borderRadius: '12px',
              border: '1px solid #333',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
          >
            {/* Search Input */}
            <div style={{ padding: '1rem', borderBottom: '1px solid #333' }}>
              <input
                type="text"
                placeholder="Type a command or search... (Ctrl+K)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px',
                  border: 'none',
                  background: 'transparent',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Results */}
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {results.length === 0 ? (
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center', 
                  color: '#999' 
                }}>
                  No commands found for "{query}"
                </div>
              ) : (
                results.map((command, index) => (
                  <motion.div
                    key={command.id}
                    className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => {
                      command.action();
                      setIsOpen(false);
                      setQuery('');
                      setSelectedIndex(0);
                    }}
                    whileHover={{ backgroundColor: '#2a2a4e' }}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #2a2a2a',
                      background: index === selectedIndex ? '#2a2a4e' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{command.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontWeight: '500' }}>
                        {command.title}
                      </div>
                      <div style={{ color: '#999', fontSize: '14px' }}>
                        {command.description}
                      </div>
                    </div>
                    {index === selectedIndex && (
                      <span style={{ 
                        color: '#667eea', 
                        fontSize: '12px',
                        padding: '2px 6px',
                        background: 'rgba(102, 126, 234, 0.2)',
                        borderRadius: '4px'
                      }}>
                        ↵
                      </span>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{ 
              padding: '8px 16px', 
              borderTop: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#666'
            }}>
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
