// src/components/AnimatedBlock.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnimatedBlock({ children, className }: { children: React.ReactNode; className?: string; }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.45, ease: [0.22,0.9,0.33,1] }}
        className={className}
        aria-live="polite"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
