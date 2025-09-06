// src/components/SideBySide.tsx
import React from 'react';
import Plot from './Plot';

interface SideBySideProps {
  children: React.ReactNode;
  plotProps: any;
  className?: string;
}

export default function SideBySide({ children, plotProps, className }: SideBySideProps) {
  return (
    <div 
      className={`side-by-side ${className || ''}`} 
      style={{
        display: 'grid', 
        gridTemplateColumns: 'minmax(0, 1fr) 480px', 
        gap: '2rem',
        marginBottom: '2rem'
      }}
    >
      <div>{children}</div>
      <aside style={{ minWidth: 300 }}>
        <Plot {...plotProps} />
      </aside>
    </div>
  );
}
