// test/accessibility.test.js
const puppeteer = require('puppeteer');
const { AxePuppeteer } = require('@axe-core/puppeteer');

describe('accessibility', () => {
  let browser;
  
  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true });
  });
  
  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });
  
  it('index page should have no critical a11y violations', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    const results = await new AxePuppeteer(page).analyze();
    const violations = results.violations.filter(v => 
      v.impact === 'critical' || v.impact === 'serious'
    );
    
    expect(violations).toHaveLength(0);
  }, 20000);
  
  it('docs page should have proper heading structure', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/docs/intro', { waitUntil: 'networkidle0' });
    
    const results = await new AxePuppeteer(page).analyze();
    const headingViolations = results.violations.filter(v => 
      v.id === 'heading-order' && (v.impact === 'critical' || v.impact === 'serious')
    );
    
    expect(headingViolations).toHaveLength(0);
  }, 20000);
  
  it('should have skip link functionality', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Focus the skip link
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement.textContent);
    
    expect(focusedElement).toContain('Skip to content');
  }, 10000);
});
