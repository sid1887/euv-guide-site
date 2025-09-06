// src/components/AccessibleImage.tsx
import React from 'react';

type Props = {
  src: string;
  alt: string;
  webp?: string;
  srcSet?: string;
  sizes?: string;
  caption?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
};

export default function AccessibleImage({ src, alt, webp, srcSet, sizes, caption, className, loading='lazy' }: Props) {
  return (
    <figure className={`figure ${className || ''}`}>
      <picture>
        {webp && <source srcSet={webp} type="image/webp" />}
        {srcSet && <source srcSet={srcSet} sizes={sizes} />}
        <img src={src} alt={alt} loading={loading} decoding="async" style={{width:'100%',height:'auto'}}/>
      </picture>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
