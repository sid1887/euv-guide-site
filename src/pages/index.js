import React from 'react';
import Layout from '@theme/Layout';
import { motion } from 'framer-motion';
import SkipLink from '@site/src/components/SkipLink';
import AnimatedBlock from '@site/src/components/AnimatedBlock';

export default function Home() {
  return (
    <Layout title="EUV Lithography Guide" description="Visual, interactive learning for next-generation semiconductor manufacturing">
      <SkipLink />
      <main id="main-content">
        <AnimatedBlock className="container">
          <h1 style={{ textAlign: 'center', marginTop: '2rem' }}>
            🚀 EUV Lithography — Student-Friendly Guide
          </h1>
          <p style={{ textAlign: 'center', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Interactive diagrams, animations, and insights for next-gen chipmaking technology that powers modern semiconductors.
          </p>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <a href="/docs/intro" className="button button--primary button--lg">
              Start Learning
            </a>
          </div>
        </AnimatedBlock>
      </main>
    </Layout>
  );
}
