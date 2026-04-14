/* eslint-disable */
const fs = require('fs');

try {
  const file = process.argv[2] || 'lh-after.json';
  const d = JSON.parse(fs.readFileSync(file, 'utf8'));
  const audits = d.audits;
  console.warn('--- SCORE ---');
  console.warn('Performance.score:', d.categories.performance.score);
  
  console.warn('\n--- CORE WEB VITALS ---');
  console.warn('LCP:', audits['largest-contentful-paint'].displayValue);
  console.warn('FCP:', audits['first-contentful-paint'].displayValue);
  console.warn('TTFB:', audits['server-response-time'].displayValue);
  console.warn('TBT:', audits['total-blocking-time'].displayValue);
  console.warn('SI:', audits['speed-index'].displayValue);
  console.warn('CLS:', audits['cumulative-layout-shift'].displayValue);

  console.warn('\n--- LCP ELEMENT ---');
  const lcpItem = audits['largest-contentful-paint-element']?.details?.items?.[0];
  if (lcpItem && lcpItem.node) {
    console.warn(lcpItem.node.snippet);
  } else {
    console.warn('No LCP node snippet found');
  }

  console.warn('\n--- RENDER BLOCKING ---');
  if (audits['render-blocking-resources'].details && audits['render-blocking-resources'].details.items) {
    audits['render-blocking-resources'].details.items.forEach(i => console.warn(i.url, i.totalBytes + ' bytes'));
  }

  console.warn('\n--- LCP IMAGE OPTIMIZATION ---');
  if (audits['prioritize-lcp-image']) {
    console.warn('Prioritize LCP Image:', audits['prioritize-lcp-image'].details || 'OK');
  }

  console.warn('\n--- DIAGNOSTICS (Score < 0.9) ---');
  Object.values(audits).forEach(x => {
    if (x.score !== null && x.score < 0.9 && x.displayValue) {
      console.warn(x.id, ':', x.displayValue);
    }
  });
} catch (e) {
  console.error('Error parsing lh-after.json:', e);
}
