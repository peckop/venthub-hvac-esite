const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDir = path.join(__dirname, '../../docs/reference/supabase');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const docsToFetch = [
  {
    name: 'row-level-security.md',
    url: 'https://raw.githubusercontent.com/supabase/supabase/master/apps/docs/content/guides/database/postgres/row-level-security.mdx'
  },
  {
    name: 'custom-claims-and-role-based-access-control-rbac.md',
    url: 'https://raw.githubusercontent.com/supabase/supabase/master/apps/docs/content/guides/api/custom-claims-and-role-based-access-control-rbac.mdx'
  },
  {
    name: 'auth-hooks.md',
    url: 'https://raw.githubusercontent.com/supabase/supabase/master/apps/docs/content/guides/auth/auth-hooks.mdx'
  },
  {
    name: 'realtime-authorization.md',
    url: 'https://raw.githubusercontent.com/supabase/supabase/master/apps/docs/content/guides/realtime/authorization.mdx'
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${url}: Status Code ${res.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function sync() {
  console.log('Starting Supabase docs sync from GitHub...');
  for (const doc of docsToFetch) {
    const dest = path.join(targetDir, doc.name);
    try {
      console.log(`Fetching ${doc.name}...`);
      await download(doc.url, dest);
      console.log(`Successfully synced ${doc.name}`);
    } catch (err) {
      console.error(`Error syncing ${doc.name}:`, err.message);
    }
  }
  console.log('Docs sync completed.');
}

sync();
