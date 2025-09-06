// src/components/AIAssistant.tsx
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: getContextualResponse(input),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const getContextualResponse = (question: string): string => {
    // Simple pattern matching for demo - replace with real AI
    if (question.toLowerCase().includes('wavelength')) {
      return "EUV operates at 13.5nm wavelength, which is about 14× shorter than ArF (193nm). This dramatic reduction enables much smaller feature sizes according to the Rayleigh criterion: R = k₁λ/NA.";
    }
    if (question.toLowerCase().includes('resolution')) {
      return "The resolution limit is governed by R = k₁λ/NA. With EUV's 13.5nm wavelength and NA≈0.33, we can achieve sub-10nm features. Would you like me to show you the interactive plot?";
    }
    return "That's a great question about EUV lithography! Let me help you understand this concept better. Would you like me to point you to a specific section or create a custom visualization?";
  };

  return (
    <>
      {/* Floating AI Button */}
      <motion.button
        className="ai-assistant-trigger"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)'
        }}
      >
        🤖
      </motion.button>

      {/* AI Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ai-assistant-panel"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            style={{
              position: 'fixed',
              bottom: '100px',
              right: '2rem',
              width: '400px',
              height: '500px',
              background: '#1a1a2e',
              borderRadius: '16px',
              border: '1px solid #333',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
          >
            {/* Header */}
            <div style={{ 
              padding: '1rem', 
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, color: '#fff' }}>🤖 EUV Assistant</h3>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div style={{ 
              flex: 1, 
              padding: '1rem', 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {messages.length === 0 && (
                <div style={{ color: '#999', textAlign: 'center', marginTop: '2rem' }}>
                  Hi! I'm your EUV learning assistant. Ask me anything about extreme ultraviolet lithography!
                </div>
              )}
              
              {messages.map(message => (
                <div 
                  key={message.id}
                  style={{
                    alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                    background: message.type === 'user' ? '#667eea' : '#333',
                    color: '#fff',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    maxWidth: '80%'
                  }}
                >
                  {message.content}
                </div>
              ))}
              
              {isLoading && (
                <div style={{ alignSelf: 'flex-start', color: '#999' }}>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Thinking...
                  </motion.div>
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{ 
              padding: '1rem', 
              borderTop: '1px solid #333',
              display: 'flex',
              gap: '0.5rem'
            }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about EUV lithography..."
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  background: '#0f0f23',
                  color: '#fff'
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                style={{
                  padding: '0.75rem 1rem',
                  background: '#667eea',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
