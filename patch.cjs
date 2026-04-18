const fs = require('fs');

function addAuthCheck(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes("req.headers.get('Authorization') !== `Bearer ${")) {
        console.log("Already patched:", filePath);
        return;
    }

    let corsHeaderNameMatch = content.match(/const\s+(\w+cors\w*)\s*=\s*\{/i);
    let corsName = corsHeaderNameMatch ? corsHeaderNameMatch[1] : (content.includes("corsHeaders") ? "corsHeaders" : "cors");

    const keyMatch = content.match(/const\s+(\w+)\s*=\s*Deno\.env\.get\(['"]SUPABASE_SERVICE_ROLE_KEY['"]\)/);
    let keyVarName = keyMatch ? keyMatch[1] : null;

    if (!keyVarName) {
         const keyMatch2 = content.match(/const\s+(\w+)\s*=\s*Deno\.env\.get\(['"]SERVICE_KEY['"]\)/);
         if (keyMatch2) keyVarName = keyMatch2[1];
    }

    if (!keyVarName) {
        console.error("Could not find SUPABASE_SERVICE_ROLE_KEY assignment in", filePath);
        return;
    }

    const createClientRegex = new RegExp(`const\\s+(\\w+)\\s*=\\s*createClient\\(.*?,\\s*${keyVarName}\\)`);
    let targetMatch = content.match(createClientRegex);

    // For endpoints without createClient, let's insert after SUPABASE_SERVICE_ROLE_KEY lookup
    if (!targetMatch) {
       const keyLineRegex = new RegExp(`const\\s+${keyVarName}\\s*=\\s*Deno\\.env\\.get\\(['"](?:SUPABASE_SERVICE_ROLE_KEY|SERVICE_KEY)['"]\\)(\\s*\\|\\|\\s*['"]{2})?`);
       targetMatch = content.match(keyLineRegex);
       if(targetMatch) {
            const headerStr = corsName ? `{ ...${corsName}, 'Content-Type': 'application/json' }` : `{ 'Content-Type': 'application/json' }`;
            const authCheckStr = `\n    if (req.headers.get('Authorization') !== \`Bearer \${${keyVarName}}\`) {\n        return new Response(JSON.stringify({ error: 'Unauthorized' }), {\n            status: 401,\n            headers: ${headerStr}\n        })\n    }\n`;
            content = content.replace(targetMatch[0], targetMatch[0] + '\n' + authCheckStr);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log("Patched successfully:", filePath);
            return;
       }
    }

    if (targetMatch) {
        const headerStr = corsName ? `{ ...${corsName}, 'Content-Type': 'application/json' }` : `{ 'Content-Type': 'application/json' }`;
        const authCheckStr = `\n    if (req.headers.get('Authorization') !== \`Bearer \${${keyVarName}}\`) {\n        return new Response(JSON.stringify({ error: 'Unauthorized' }), {\n            status: 401,\n            headers: ${headerStr}\n        })\n    }\n`;
        content = content.replace(targetMatch[0], authCheckStr + '\n    ' + targetMatch[0]);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Patched successfully:", filePath);
    } else {
        console.log("Could not find insertion point for", filePath);
    }
}

module.exports = { addAuthCheck };
