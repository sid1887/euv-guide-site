// src/components/PerformanceDashboard.tsx
import React, { useState, useEffect } from 'react';
import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals';
import { motion, AnimatePresence } from 'framer-motion';

interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  description: string;
  threshold: { good: number; poor: number };
}

export default function PerformanceDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateMetric = (name: string, value: number, thresholds: { good: number; poor: number }, description: string) => {
      const rating: 'good' | 'needs-improvement' | 'poor' = 
        value <= thresholds.good ? 'good' : 
        value <= thresholds.poor ? 'needs-improvement' : 'poor';
      
      setMetrics(prev => {
        const existing = prev.find(m => m.name === name);
        const newMetric: Metric = { name, value, rating, description, threshold: thresholds };
        
        if (existing) {
          return prev.map(m => m.name === name ? newMetric : m);
        }
        return [...prev, newMetric];
      });
    };

    // Collect Core Web Vitals
    onCLS((metric) => {
      updateMetric('CLS', metric.value, { good: 0.1, poor: 0.25 }, 
        'Cumulative Layout Shift - Visual stability measure');
    });

    onFCP((metric) => {
      updateMetric('FCP', metric.value, { good: 1800, poor: 3000 }, 
        'First Contentful Paint - Loading measure (ms)');
    });

    onLCP((metric) => {
      updateMetric('LCP', metric.value, { good: 2500, poor: 4000 }, 
        'Largest Contentful Paint - Loading measure (ms)');
    });

    onTTFB((metric) => {
      updateMetric('TTFB', metric.value, { good: 800, poor: 1800 }, 
        'Time to First Byte - Server response (ms)');
    });

    // Additional performance metrics
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.startTime;
        updateMetric('DCL', domContentLoaded, { good: 1600, poor: 3000 }, 
          'DOM Content Loaded - Parse time (ms)');

        const loadComplete = navigation.loadEventEnd - navigation.startTime;
        updateMetric('Load', loadComplete, { good: 2000, poor: 4000 }, 
          'Load Complete - Total load time (ms)');
      }
    }

    setLoading(false);
  }, []);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return '#0cce6b';
      case 'needs-improvement': return '#ffa400';
      case 'poor': return '#ff4e42';
      default: return '#666';
    }
  };

  const getOverallScore = () => {
    if (metrics.length === 0) return 0;
    const scores = metrics.map(m => m.rating === 'good' ? 100 : m.rating === 'needs-improvement' ? 60 : 20);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  return (
    <>
      {/* Floating Performance Button */}
      <motion.button
        className="performance-trigger"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'fixed',
          bottom: '120px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          zIndex: 1000
        }}
        title="Performance Dashboard"
      >
        📊
      </motion.button>

      {/* Performance Dashboard Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="performance-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              zIndex: 9998,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              className="performance-dashboard"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '800px',
                maxWidth: '90vw',
                maxHeight: '80vh',
                background: '#1a1a2e',
                borderRadius: '16px',
                border: '1px solid #333',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Header */}
              <div style={{
                padding: '24px',
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{ color: '#fff', margin: 0, fontSize: '24px' }}>
                    Performance Dashboard
                  </h2>
                  <p style={{ color: '#999', margin: '4px 0 0 0' }}>
                    Real-time Web Vitals and performance metrics
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#999',
                    fontSize: '24px',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Overall Score */}
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  background: `conic-gradient(${getRatingColor(getOverallScore() >= 80 ? 'good' : getOverallScore() >= 50 ? 'needs-improvement' : 'poor')} ${getOverallScore() * 3.6}deg, #333 0deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: '#1a1a2e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}>
                    <span style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}>
                      {getOverallScore()}
                    </span>
                    <span style={{ color: '#999', fontSize: '12px' }}>Score</span>
                  </div>
                </div>
                <h3 style={{ color: '#fff', margin: 0 }}>
                  {getOverallScore() >= 80 ? 'Excellent' : 
                   getOverallScore() >= 50 ? 'Good' : 'Needs Work'}
                </h3>
              </div>

              {/* Metrics Grid */}
              <div style={{
                padding: '0 24px 24px',
                overflowY: 'auto',
                flex: 1
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '16px'
                }}>
                  {loading ? (
                    <div style={{ 
                      gridColumn: '1 / -1',
                      textAlign: 'center',
                      color: '#999',
                      padding: '40px'
                    }}>
                      Collecting performance metrics...
                    </div>
                  ) : (
                    metrics.map((metric) => (
                      <motion.div
                        key={metric.name}
                        className="metric-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          background: '#2a2a4e',
                          borderRadius: '12px',
                          padding: '20px',
                          border: `2px solid ${getRatingColor(metric.rating)}`
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px'
                        }}>
                          <h4 style={{
                            color: '#fff',
                            margin: 0,
                            fontSize: '18px'
                          }}>
                            {metric.name}
                          </h4>
                          <span style={{
                            background: getRatingColor(metric.rating),
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {metric.rating.toUpperCase()}
                          </span>
                        </div>
                        
                        <div style={{
                          fontSize: '28px',
                          fontWeight: 'bold',
                          color: getRatingColor(metric.rating),
                          marginBottom: '8px'
                        }}>
                          {metric.name === 'CLS' ? 
                            metric.value.toFixed(3) : 
                            Math.round(metric.value)}
                          {metric.name !== 'CLS' && <span style={{ fontSize: '14px' }}>ms</span>}
                        </div>
                        
                        <p style={{
                          color: '#999',
                          fontSize: '14px',
                          margin: 0,
                          lineHeight: '1.4'
                        }}>
                          {metric.description}
                        </p>
                        
                        <div style={{
                          marginTop: '12px',
                          fontSize: '12px',
                          color: '#666'
                        }}>
                          Good: {metric.name === 'CLS' ? 
                            `≤ ${metric.threshold.good}` : 
                            `≤ ${metric.threshold.good}ms`}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Footer */}
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid #333',
                fontSize: '12px',
                color: '#666',
                textAlign: 'center'
              }}>
                Metrics update automatically as you interact with the site
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
