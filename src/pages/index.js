import React from 'react';
import Layout from '@theme/Layout';
import { motion } from 'framer-motion';
import SkipLink from '@site/src/components/SkipLink';
import AnimatedBlock from '@site/src/components/AnimatedBlock';
import AIAssistant from '@site/src/components/AIAssistant';
import CommandPalette from '@site/src/components/CommandPalette';
import PerformanceDashboard from '@site/src/components/PerformanceDashboard';

export default function Home() {
  return (
    <Layout title="EUV Lithography Guide" description="Visual, interactive learning for next-generation semiconductor manufacturing">
      <SkipLink />
      <main id="main-content">
        <AnimatedBlock className="container">
          <h1 style={{ textAlign: 'center', marginTop: '2rem' }}>
            🚀 EUV Lithography — Next-Level Learning Platform
          </h1>
          <p style={{ textAlign: 'center', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
            Advanced interactive platform with AI assistance, 3D visualization, and cutting-edge web technologies for mastering next-gen chipmaking.
          </p>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <a href="/docs/intro" className="button button--primary button--lg" style={{ marginRight: '1rem' }}>
              Start Learning 🚀
            </a>
            <button 
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
                document.dispatchEvent(event);
              }}
              className="button button--secondary button--lg"
            >
              Command Palette ⌘K
            </button>
          </div>
          
          {/* Enhanced feature highlights */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem', 
            marginTop: '4rem',
            maxWidth: '1200px',
            margin: '4rem auto 0'
          }}>
            <motion.div 
              style={{ 
                textAlign: 'center', 
                padding: '2rem', 
                background: 'var(--ifm-card-background-color)',
                border: '1px solid var(--ifm-color-emphasis-200)', 
                borderRadius: '12px',
                cursor: 'pointer'
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onClick={() => {
                const aiButton = document.querySelector('.ai-assistant-trigger');
                aiButton?.click();
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
              <h3 style={{ color: 'var(--ifm-color-primary)' }}>AI Learning Assistant</h3>
              <p>Contextual EUV guidance with intelligent responses and learning support</p>
            </motion.div>
            
            <motion.div 
              style={{ 
                textAlign: 'center', 
                padding: '2rem', 
                background: 'var(--ifm-card-background-color)',
                border: '1px solid var(--ifm-color-emphasis-200)', 
                borderRadius: '12px',
                cursor: 'pointer'
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧬</div>
              <h3 style={{ color: 'var(--ifm-color-primary)' }}>3D Molecular Viewer</h3>
              <p>Interactive Three.js visualization of resist chemistry and molecular structures</p>
            </motion.div>
            
            <motion.div 
              style={{ 
                textAlign: 'center', 
                padding: '2rem', 
                background: 'var(--ifm-card-background-color)',
                border: '1px solid var(--ifm-color-emphasis-200)', 
                borderRadius: '12px',
                cursor: 'pointer'
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
              <h3 style={{ color: 'var(--ifm-color-primary)' }}>Command Palette</h3>
              <p>Fast navigation with fuzzy search and keyboard shortcuts (Ctrl+K)</p>
            </motion.div>
            
            <motion.div 
              style={{ 
                textAlign: 'center', 
                padding: '2rem', 
                background: 'var(--ifm-card-background-color)',
                border: '1px solid var(--ifm-color-emphasis-200)', 
                borderRadius: '12px',
                cursor: 'pointer'
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onClick={() => {
                const perfButton = document.querySelector('.performance-trigger');
                perfButton?.click();
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ color: 'var(--ifm-color-primary)' }}>Performance Dashboard</h3>
              <p>Real-time Web Vitals monitoring with Core Performance Metrics</p>
            </motion.div>
            
            <motion.div 
              style={{ 
                textAlign: 'center', 
                padding: '2rem', 
                background: 'var(--ifm-card-background-color)',
                border: '1px solid var(--ifm-color-emphasis-200)', 
                borderRadius: '12px'
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>♿</div>
              <h3 style={{ color: 'var(--ifm-color-primary)' }}>WCAG AA Compliant</h3>
              <p>Full accessibility with screen reader support and keyboard navigation</p>
            </motion.div>
            
            <motion.div 
              style={{ 
                textAlign: 'center', 
                padding: '2rem', 
                background: 'var(--ifm-card-background-color)',
                border: '1px solid var(--ifm-color-emphasis-200)', 
                borderRadius: '12px'
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>�</div>
              <h3 style={{ color: 'var(--ifm-color-primary)' }}>Progressive Web App</h3>
              <p>Offline support, mobile optimization, and app-like experience</p>
            </motion.div>
          </div>
          
          {/* Call to Action */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '4rem', 
            padding: '3rem 2rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            color: 'white'
          }}>
            <h2 style={{ marginBottom: '1rem', color: 'white' }}>Ready to Master EUV Technology?</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.9 }}>
              Experience the future of semiconductor education with our cutting-edge learning platform
            </p>
            <a href="/docs/intro" className="button button--secondary button--lg">
              Begin Your Journey 🎯
            </a>
          </div>
        </AnimatedBlock>
      </main>
      
      {/* Advanced Components */}
      <AIAssistant />
      <CommandPalette />
      <PerformanceDashboard />
    </Layout>
  );
}
