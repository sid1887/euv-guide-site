// src/components/Plot.tsx
import React, { useEffect, useState } from 'react';

interface PlotProps {
  data: any[];
  layout?: any;
  config?: any;
  staticFallback?: string;
}

export default function Plot({ data, layout, config, staticFallback }: PlotProps) {
  const [mounted, setMounted] = useState(false);
  const [PlotComponent, setPlotComponent] = useState<any>(null);
  
  useEffect(() => {
    setMounted(true);
    // Dynamically import Plotly
    import('react-plotly.js').then((module) => {
      setPlotComponent(() => module.default);
    });
  }, []);
  
  // If JavaScript disabled or SSR, show static fallback image if provided
  if (!mounted && staticFallback) {
    return (
      <img 
        src={staticFallback} 
        alt={layout?.title || 'Chart'} 
        style={{ maxWidth: '100%' }}
      />
    );
  }
  
  if (!PlotComponent) {
    return (
      <div className="plot-loading" aria-busy="true">
        Loading chart…
      </div>
    );
  }
  
  return (
    <PlotComponent 
      data={data} 
      layout={layout} 
      config={{ responsive: true, ...config }} 
    />
  );
}
