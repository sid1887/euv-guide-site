# Contributing to EUV Lithography Guide

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm start`
4. Open http://localhost:3000

## Content Guidelines

### Adding a New Chapter

1. Create a new MDX file in `docs/chapters/`
2. Use the template from `docs/_templates/chapter-template.mdx`
3. Follow the naming convention: `XX-chapter-name.mdx`
4. Update `sidebar_position` in frontmatter

### Writing Accessible Content

#### ✅ Images
- [ ] All images have meaningful `alt` attributes
- [ ] Use `AccessibleImage` component for responsive images
- [ ] Provide captions when helpful
- [ ] Include WebP versions for better performance

#### ✅ Headings
- [ ] Every page has exactly one H1
- [ ] Headings are properly nested (H1 → H2 → H3, no skipping)
- [ ] Headings describe the content structure

#### ✅ Links
- [ ] Link text is descriptive (not "click here")
- [ ] External links open in same tab (accessibility best practice)

#### ✅ Interactive Elements
- [ ] All buttons and controls are keyboard accessible
- [ ] Focus indicators are visible
- [ ] ARIA labels provided where needed

### Adding Interactive Plots

Use the `Plot` component for interactive visualizations:

\`\`\`jsx
import Plot from '@site/src/components/Plot';

<Plot
  data={[your plot data]}
  layout={{title: 'Descriptive Title'}}
  staticFallback="/img/static/chart-name.png"
/>
\`\`\`

#### Plot Best Practices
- Always include a `staticFallback` image for print/performance
- Use descriptive titles and axis labels
- Ensure good color contrast in your data visualization
- Test with keyboard navigation

### Mathematical Expressions

Use KaTeX for math rendering:

- Inline: `$E = mc^2$`
- Block: `$$\\text{Resolution} = k_1 \\frac{\\lambda}{NA}$$`

## Development Workflow

### Before Committing
Run these commands to ensure quality:

\`\`\`bash
npm run lint           # Check for code issues
npm run format         # Format code with Prettier
npm run typecheck      # TypeScript type checking
npm run test           # Run all tests
npm run build          # Ensure site builds successfully
\`\`\`

### Testing

#### Accessibility Testing
\`\`\`bash
npm start                    # Start dev server
npm run test:accessibility   # Run automated a11y tests
\`\`\`

#### Manual Accessibility Checklist
- [ ] Tab through entire page (logical focus order)
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Verify sufficient color contrast
- [ ] Test with keyboard only (no mouse)
- [ ] Confirm reduced motion preference respected

#### Link Testing
\`\`\`bash
npm run serve               # Start production server
npm run test:links          # Check for broken links
\`\`\`

## Performance Guidelines

### Images
- Use WebP format with JPG fallback
- Provide multiple sizes with `srcSet`
- Use `loading="lazy"` for non-critical images
- Optimize images (use tools like ImageOptim)

### Code Splitting
- Use dynamic imports for heavy components
- Plotly.js is already code-split in the Plot component

### Bundle Analysis
\`\`\`bash
npm run build -- --bundle-analyzer
\`\`\`

## Style Guide

### Code Formatting
- Use Prettier for consistent formatting
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required

### Component Structure
- Use TypeScript for new components
- Include proper PropTypes/interfaces
- Export components as default
- Use semantic HTML elements

### CSS
- Use CSS custom properties for theming
- Follow BEM methodology for class names
- Ensure responsive design (mobile-first)
- Respect `prefers-reduced-motion`

## Deployment

The site automatically deploys to GitHub Pages on push to `main` branch.

### Manual Deployment
\`\`\`bash
npm run build
# Upload contents of build/ directory to your hosting provider
\`\`\`

## Error Reporting

When reporting issues:

1. Include browser and OS information
2. Describe expected vs actual behavior
3. Provide steps to reproduce
4. Include accessibility impact if relevant
5. Screenshots/videos help!

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Docusaurus Documentation](https://docusaurus.io/)
- [MDX Documentation](https://mdxjs.com/)
- [Plotly.js Documentation](https://plotly.com/javascript/)
- [Framer Motion Documentation](https://www.framer.com/motion/)

## Questions?

Open an issue or start a discussion in the repository!
