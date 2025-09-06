import React from 'react';
import Layout from '@theme/Layout';
import { motion } from 'framer-motion';
import SkipLink from '@site/src/components/SkipLink';
import AnimatedBlock from '@site/src/components/AnimatedBlock';
import CommandPalette from '@site/src/components/CommandPalette';
import PerformanceDashboard from '@site/src/components/PerformanceDashboard';

export default function Home() {
  return (
    <Layout title="Universal Document Analysis Platform" description="AI-powered document analysis with intelligent visualization and knowledge extraction">
      <SkipLink />
      <main id="main-content">
        <AnimatedBlock className="container">
          <h1 style={{ textAlign: 'center', marginTop: '2rem' }}>
            🧠 Universal Document Analysis Platform
          </h1>
          <p style={{ textAlign: 'center', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
            Transform any document, research paper, or content into interactive visualizations and knowledge graphs using advanced machine learning and AI.
          </p>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <a href="/docs/intro" className="button button--primary button--lg" style={{ marginRight: '1rem' }}>
              Get Started 🚀
            </a>
            <button 
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
                document.dispatchEvent(event);
              }}
              className="button button--secondary button--lg"
            >
              Quick Actions ⌘K
            </button>
          </div>
          
          {/* Core Features Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem', 
            marginTop: '4rem',
            maxWidth: '1400px',
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
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
              <h3 style={{ color: 'var(--ifm-color-primary)' }}>Document Processing</h3>
              <p>Advanced ML-powered analysis of PDFs, DOCX, text files, and web content with intelligent content extraction</p>
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
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</div>
              <h3 style={{ color: 'var(--ifm-color-primary)' }}>Knowledge Graphs</h3>
              <p>Automatically build interconnected knowledge networks from concepts, entities, and relationships</p>
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
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ color: 'var(--ifm-color-primary)' }}>Smart Visualizations</h3>
              <p>AI-generated interactive charts, network graphs, timelines, and 3D visualizations tailored to your content</p>
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
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ color: 'var(--ifm-color-primary)' }}>Intelligent Search</h3>
              <p>Semantic search across documents with concept-based discovery and cross-reference analysis</p>
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
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔗</div>
              <h3 style={{ color: 'var(--ifm-color-primary)' }}>Multi-Document Analysis</h3>
              <p>Compare documents, find patterns, and discover insights across entire document collections</p>
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
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
              <h3 style={{ color: 'var(--ifm-color-primary)' }}>Real-time Performance</h3>
              <p>Optimized processing with live performance monitoring and Web Vitals tracking</p>
            </motion.div>
          </div>
          
          {/* Technology Stack */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '4rem', 
            padding: '3rem 2rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            color: 'white'
          }}>
            <h2 style={{ marginBottom: '1rem', color: 'white' }}>Powered by Advanced AI & ML</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.9 }}>
              Built with TensorFlow.js, Natural Language Processing, Knowledge Graph algorithms, and cutting-edge web technologies
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
              marginTop: '2rem'
            }}>
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤖</div>
                <h4 style={{ color: 'white', margin: 0 }}>TensorFlow.js</h4>
                <p style={{ fontSize: '0.9rem', opacity: 0.8, margin: 0 }}>Machine Learning</p>
              </div>
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                <h4 style={{ color: 'white', margin: 0 }}>Natural NLP</h4>
                <p style={{ fontSize: '0.9rem', opacity: 0.8, margin: 0 }}>Text Processing</p>
              </div>
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🕸️</div>
                <h4 style={{ color: 'white', margin: 0 }}>Knowledge Graphs</h4>
                <p style={{ fontSize: '0.9rem', opacity: 0.8, margin: 0 }}>Relationship Mapping</p>
              </div>
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎨</div>
                <h4 style={{ color: 'white', margin: 0 }}>D3.js & Three.js</h4>
                <p style={{ fontSize: '0.9rem', opacity: 0.8, margin: 0 }}>Visualization</p>
              </div>
            </div>
            <div style={{ marginTop: '2rem' }}>
              <a href="/docs/intro" className="button button--secondary button--lg">
                Explore the Technology 🔬
              </a>
            </div>
          </div>
        </AnimatedBlock>
      </main>
      
      {/* Advanced Components */}
      <CommandPalette />
      <PerformanceDashboard />
    </Layout>
  );
}
