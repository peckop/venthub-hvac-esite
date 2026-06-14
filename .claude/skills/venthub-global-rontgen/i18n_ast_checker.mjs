import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');

const dirsToScan = [
  path.join(projectRoot, 'src', 'views'),
  path.join(projectRoot, 'src', 'components'),
  path.join(projectRoot, 'src', 'app')
];

let leakages = [];

// Sızıntı kontrolünde istisna tutulacak tag ve klasör isimleri
const ignoredTags = ['code', 'pre', 'script', 'style', 'svg', 'path', 'div'];
const r=/[A-Za-z]/; // En az bir harf icermeli ki sembol veya bosluktan ibaret metinler yakalanmasin.

function isTurkishOrEnglishHardcoded(text) {
  // Sadece bosluk veya noktalama degilse, regex gecer.
  // Gercek bir sızınti olup olmadigini kabaca tespit icin regex:
  if (!text.trim()) return false;
  if (!/[a-zA-ZçğıöşüÇĞIÖŞÜ]/.test(text)) return false;
  
  // ignore common symbols/numbers
  if (/^[0-9\s.,!?:;%$\-\/\+=\(\)\[\]\{\}]+$/.test(text.trim())) return false;
  return true;
}

function scanNode(node, sourceFile) {
  // JSX Text or String Literal Prop
  if (ts.isJsxText(node)) {
    const text = node.getText(sourceFile);
    if (isTurkishOrEnglishHardcoded(text)) {
      const parent = node.parent;
      let parentTag = 'Unknown';
      if (parent && parent.openingElement) {
         parentTag = parent.openingElement.tagName.getText(sourceFile);
      }
      if (!ignoredTags.includes(parentTag)) {
         addLeakage(sourceFile.fileName, node, text, 'JsxText', parentTag);
      }
    }
  } else if (ts.isJsxAttribute(node)) {
    const propName = node.name.getText(sourceFile);
    // placeholder, title, label, alt vs props kontrolu
    if (['placeholder', 'title', 'label', 'alt', 'aria-label'].includes(propName.toLowerCase())) {
       if (node.initializer && ts.isStringLiteral(node.initializer)) {
          const text = node.initializer.text;
          if (isTurkishOrEnglishHardcoded(text)) {
            addLeakage(sourceFile.fileName, node, text, 'JsxProp', propName);
          }
       }
    }
  }

  ts.forEachChild(node, child => scanNode(child, sourceFile));
}

function addLeakage(filePath, node, text, type, context) {
  const { line, character } = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());
  const relPath = path.relative(projectRoot, filePath);
  leakages.push({
    file: relPath,
    line: line + 1,
    col: character + 1,
    text: text.trim().replace(/\n/g, ' '),
    type,
    context
  });
}

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) { // Sadece UI odakli tsx dosyalarini tara
      const code = fs.readFileSync(fullPath, 'utf8');
      const sourceFile = ts.createSourceFile(
        fullPath,
        code,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
      );
      scanNode(sourceFile, sourceFile);
    }
  }
}

console.log("[i18n AST Scanner] Tarama basliyor...");
dirsToScan.forEach(scanDirectory);

if (leakages.length > 0) {
  console.error("\n[🚨 i18n LEAKAGE DETECTED]");
  console.error("Bulunan hardcoded metin sızıntıları:");
  leakages.forEach(l => {
    console.error(`- ${l.file}:${l.line} | [${l.type} <${l.context}>] | Text: "${l.text}"`);
  });
  console.error(`\nToplam ${leakages.length} potansiyel i18n sızıntısı bulundu.`);
  console.error("Lutfen useI18n() dictionary mantigina gecirin! (veya ignore icin yorum atin)");
  process.exit(1);
} else {
  console.log("Tertemiz! i18n sızıntısı bulunamadı.");
  process.exit(0);
}
