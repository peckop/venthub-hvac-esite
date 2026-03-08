const fs = require('fs');

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = require('path').join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, stat);
        } else if (stat.isDirectory() && name !== 'node_modules') {
            walkSync(filePath, callback);
        }
    });
}

const dir = 'c:\\Users\\alize\\venthub-hvac\\src';

walkSync(dir, function (filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // React Router DOM imports replace
    if (content.includes("from 'react-router-dom'")) {
        // Handle standalone import { Link }
        if (content.includes("import { Link } from 'react-router-dom'")) {
            content = content.replace("import { Link } from 'react-router-dom'", "import Link from 'next/link'");
            modified = true;
        }

        // Handle mixed like import { useParams, Link }
        if (content.includes("import { useParams, Link } from 'react-router-dom'")) {
            content = content.replace("import { useParams, Link } from 'react-router-dom'", "import { useParams } from 'next/navigation'\nimport Link from 'next/link'");
            modified = true;
        }

        if (content.includes("import { Link, useParams } from 'react-router-dom'")) {
            content = content.replace("import { Link, useParams } from 'react-router-dom'", "import { useParams } from 'next/navigation'\nimport Link from 'next/link'");
            modified = true;
        }
    }

    // Replace <Link to="..." with <Link href="..."
    if (modified || content.includes("<Link") || content.includes("</Link>")) {
        let newContent = content.replace(/<Link([^>]*)to=/g, '<Link$1href=');
        if (newContent !== content) {
            content = newContent;
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
});
