// src/components/Plot.tsx
import React, { useEffect, useRef, useState } from 'react';

interface PlotProps {
  data: any[];
  layout?: any;
  config?: any;
  staticFallback?: string;
  className?: string;
}

const Plotly = React.lazy(() => import('react-plotly.js'));

export default function Plot({ data, layout = {}, config = {}, staticFallback, className }: PlotProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 600, height: 360 });
  const [open, setOpen] = useState(false);
  const [PlotComponent, setPlotComponent] = useState<any>(null);

  useEffect(() => {
    // Dynamically import Plotly
    import('react-plotly.js').then((module) => {
      setPlotComponent(() => module.default);
    });
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = Math.max(320, Math.floor(entry.contentRect.width));
        const h = Math.max(180, Math.floor(entry.contentRect.width * 0.56));
        setSize({ width: w, height: h });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref.current]);

  // high DPI handling
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const finalLayout = { 
    ...layout, 
    width: Math.round(size.width * dpr), 
    height: Math.round(size.height * dpr) 
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  if (!PlotComponent) {
    return (
      <div className="plot-loading" aria-busy="true">
        Loading chart…
      </div>
    );
  }

  return (
    <div ref={ref} className={`plot-wrapper ${className || ''}`}>
      <div style={{ position: 'absolute', right: 8, top: 8, zIndex: 20 }}>
        <button 
          aria-label="Open plot fullscreen" 
          onClick={() => setOpen(true)}
          style={{ 
            background: 'rgba(0,0,0,0.7)', 
            color: 'white', 
            border: 'none', 
            padding: '4px 8px', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ⤢
        </button>
      </div>

      <PlotComponent
        data={data}
        layout={finalLayout}
        config={{ responsive: true, displayModeBar: true, ...config }}
        useResizeHandler={false}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Fullscreen modal */}
      {open && (
        <div 
          className="plot-modal" 
          role="dialog" 
          aria-modal="true" 
          aria-label={layout?.title || 'Plot'}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="plot-modal-inner">
            <button 
              className="plot-modal-close" 
              onClick={() => setOpen(false)}
              aria-label="Close fullscreen plot"
            >
              ✕
            </button>
            <PlotComponent 
              data={data} 
              layout={{
                ...layout, 
                width: Math.round(window.innerWidth * dpr * 0.9), 
                height: Math.round(window.innerHeight * dpr * 0.8)
              }} 
              config={{ ...config, responsive: true }} 
            />
          </div>
        </div>
      )}

      {/* Static fallback for no-JS or SSR */}
      {typeof window === 'undefined' && staticFallback && (
        <img 
          src={staticFallback} 
          alt={layout?.title || 'Chart'} 
          style={{ width: '100%' }} 
        />
      )}
    </div>
  );
}
