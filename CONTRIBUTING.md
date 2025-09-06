# Contributing to EUV Lithography Guide

Welcome to the EUV Lithography Guide project! This document provides guidelines for contributors to maintain the high quality, accessibility, and consistency of our educational resource.

## 🎯 Project Goals

- **Accessibility-first**: WCAG AA compliant content
- **Interactive learning**: Rich visualizations and animations
- **Performance**: Fast loading, mobile-friendly
- **Modern web app**: PWA capabilities, crisp typography

## 🚀 Quick Start

### Development Setup

```bash
npm install
npm start  # Development server at http://localhost:3000
```

### Testing

```bash
npm run lint          # Code quality checks
npm run test          # Run all tests
npm run test:accessibility  # Accessibility audits
```

## 📝 Content Guidelines

### Chapter Structure

Use the template in `docs/_templates/chapter-template.mdx`:

```mdx
---
title: Chapter Title
sidebar_position: N
---

import SideBySide from '@site/src/components/SideBySide';
import AccessibleImage from '@site/src/components/AccessibleImage';
import AnimatedBlock from '@site/src/components/AnimatedBlock';

# Chapter Title

<AnimatedBlock>
Introduction paragraph...
</AnimatedBlock>

<SideBySide plotProps={{...}}>
Content with side-by-side plot...
</SideBySide>
```

### Interactive Components

#### SideBySide Layout
```mdx
<SideBySide plotProps={{
  data: [...],
  layout: { title: 'Chart Title' }
}}>
  Content goes here with text on left, plot on right.
</SideBySide>
```

#### Accessible Images
```mdx
<AccessibleImage 
  src="/img/example-800.jpg"
  webp="/img/example-800.webp"
  alt="Descriptive alt text"
  caption="Figure N: Caption explaining significance"
  srcSet="/img/example-320.jpg 320w, /img/example-640.jpg 640w"
  sizes="(max-width: 320px) 320px, 640px"
/>
```

#### Animations
```mdx
<AnimatedBlock>
Content that animates smoothly into view
</AnimatedBlock>
```

## ♿ Accessibility Checklist

Before submitting content, verify:

- [ ] **Images**: Meaningful alt attributes (not decorative text)
- [ ] **Headings**: Logical structure (H1 → H2 → H3)
- [ ] **Color contrast**: Meets WCAG AA standards (4.5:1 for normal text)
- [ ] **Keyboard navigation**: All interactive elements are focusable
- [ ] **Links**: Descriptive text (avoid "click here")
- [ ] **Tables**: Headers with `<th>` and appropriate `scope`
- [ ] **Math**: Use KaTeX for formulas: `$inline$` or `$$block$$`

### Testing Accessibility

```bash
# Run automated accessibility tests
npm run test:accessibility

# Manual testing checklist:
# 1. Navigate entire page using only Tab key
# 2. Test with screen reader (NVDA/JAWS/VoiceOver)
# 3. Verify 200% zoom doesn't break layout
# 4. Test in high contrast mode
```

## 📊 Plot Guidelines

### Data Visualization Best Practices

1. **Always provide static fallbacks**:
   ```mdx
   <Plot
     data={...}
     layout={...}
     staticFallback="/img/static/chart-name.png"
   />
   ```

2. **Use appropriate chart types**:
   - **Line plots**: Trends over continuous variables
   - **Bar charts**: Comparing discrete categories
   - **Scatter plots**: Relationships between variables
   - **3D surfaces**: Complex parameter spaces

3. **Color accessibility**:
   - Use colorblind-friendly palettes
   - Don't rely solely on color to convey information
   - Provide patterns/shapes for differentiation

4. **Responsive design**:
   - Charts automatically resize
   - Readable on mobile devices
   - Fullscreen modal for detailed inspection

### Plot Examples

```mdx
// Basic scatter plot
<Plot
  data={[{
    x: [1, 2, 3, 4],
    y: [2, 4, 6, 8],
    type: 'scatter',
    mode: 'lines+markers'
  }]}
  layout={{
    title: 'Feature Size vs Process Node',
    xaxis: { title: 'Process Node (nm)' },
    yaxis: { title: 'Feature Size (nm)' }
  }}
/>
```

## 🖼️ Image Optimization

### Required Formats
For every image, provide:
- **WebP format** for modern browsers
- **JPEG/PNG fallback** for compatibility
- **Multiple sizes** for responsive loading

### File Naming Convention
```
static/img/
├── original-name-320.jpg
├── original-name-640.jpg  
├── original-name-800.jpg
├── original-name-320.webp
├── original-name-640.webp
└── original-name-800.webp
```

### Optimization Commands
```bash
# Generate WebP versions
npx @squoosh/cli --webp '{"quality":80}' static/img/*.jpg

# Generate multiple sizes
npx @squoosh/cli --resize '{"width":320}' static/img/*-original.jpg
```

## 🎨 Design Tokens

Use CSS custom properties defined in `src/css/custom.css`:

```css
:root {
  --accent: #2ea3ff;
  --bg: #071021;
  --text: #e6eef6;
  --muted: #96a3b2;
  --content-max: 980px;
  --base-size: 18px;
}
```

## 🚀 Performance Guidelines

### Bundle Size
- Keep components lazy-loaded
- Use dynamic imports for heavy libraries
- Optimize images (WebP, appropriate sizing)

### Lighthouse Targets
- **Performance**: > 90
- **Accessibility**: 100
- **Best Practices**: > 90
- **SEO**: > 90

## 🔧 Development Workflow

### Branch Strategy
```bash
git checkout -b feature/chapter-euv-source
# Make changes
git commit -m "feat(content): add EUV source chapter with interactive plots"
git push origin feature/chapter-euv-source
# Create pull request
```

### Commit Messages
Follow conventional commits:
- `feat(content): add new chapter`
- `fix(a11y): improve keyboard navigation`
- `style: update typography scale`
- `docs: update contributing guide`

### Code Review Checklist
- [ ] Accessibility tests pass
- [ ] Responsive design works on mobile
- [ ] Images have proper alt text
- [ ] Interactive elements are keyboard accessible
- [ ] Performance impact is minimal
- [ ] Content is technically accurate

## 📱 Mobile-First Design

Ensure content works well on:
- **Mobile phones** (320px+)
- **Tablets** (768px+)  
- **Desktop** (1024px+)
- **Large screens** (1440px+)

Test responsive behavior:
```bash
# Start dev server
npm start

# Test different viewport sizes in browser dev tools
# Verify SideBySide component stacks properly on mobile
```

## 🌐 Internationalization (Future)

While currently English-only, the site is structured for future i18n:
- Use semantic HTML
- Avoid text in images
- Structure for RTL language support
- Keep text content in MDX files (not hardcoded in components)

## 📋 Review Process

All contributions go through:

1. **Automated checks**: Linting, accessibility, build
2. **Technical review**: Code quality, performance
3. **Content review**: Accuracy, clarity, educational value
4. **Accessibility review**: Manual testing with assistive technologies

## 🆘 Getting Help

- **Technical issues**: Create GitHub issue with reproduction steps
- **Content questions**: Tag subject matter experts in PR
- **Accessibility concerns**: Run accessibility tests and describe issue

## 📚 Resources

- [Docusaurus Documentation](https://docusaurus.io/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Plotly.js Documentation](https://plotly.com/javascript/)
- [WebP Optimization Guide](https://web.dev/serve-images-webp/)

---

Thank you for contributing to making semiconductor education more accessible and engaging! 🎓✨
