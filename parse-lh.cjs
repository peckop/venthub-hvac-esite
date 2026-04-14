/* eslint-disable no-console, @typescript-eslint/no-require-imports */
const fs = require('fs');

try {
  const file = process.argv[2] || 'lh-after.json';
  const d = JSON.parse(fs.readFileSync(file, 'utf8'));
  const audits = d.audits;
  console.log('--- SCORE ---');
  console.log('Performance.score:', d.categories.performance.score);
  
  console.log('\n--- CORE WEB VITALS ---');
  console.log('LCP:', audits['largest-contentful-paint'].displayValue);
  console.log('FCP:', audits['first-contentful-paint'].displayValue);
  console.log('TTFB:', audits['server-response-time'].displayValue);
  console.log('TBT:', audits['total-blocking-time'].displayValue);
  console.log('SI:', audits['speed-index'].displayValue);
  console.log('CLS:', audits['cumulative-layout-shift'].displayValue);

  console.log('\n--- LCP ELEMENT ---');
  const lcpItem = audits['largest-contentful-paint-element']?.details?.items?.[0];
  if (lcpItem && lcpItem.node) {
    console.log(lcpItem.node.snippet);
  } else {
    console.log('No LCP node snippet found');
  }

  console.log('\n--- RENDER BLOCKING ---');
  if (audits['render-blocking-resources'].details && audits['render-blocking-resources'].details.items) {
    audits['render-blocking-resources'].details.items.forEach(i => console.log(i.url, i.totalBytes + ' bytes'));
  }

  console.log('\n--- LCP IMAGE OPTIMIZATION ---');
  if (audits['prioritize-lcp-image']) {
    console.log('Prioritize LCP Image:', audits['prioritize-lcp-image'].details || 'OK');
  }

  console.log('\n--- DIAGNOSTICS (Score < 0.9) ---');
  Object.values(audits).forEach(x => {
    if (x.score !== null && x.score < 0.9 && x.displayValue) {
      console.log(x.id, ':', x.displayValue);
    }
  });
} catch (e) {
  console.error('Error parsing lh-after.json:', e);
}
