// 后处理脚本：把 dist/assets/*.js 内联到 dist/index.html，生成单文件部署包
// 并去除 type="module" 以支持 file:// 协议直接打开
const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, 'dist');
const htmlPath = path.join(distDir, 'index.html');

let html = fs.readFileSync(htmlPath, 'utf8');

// 找到所有 <script type="module" crossorigin src="./assets/xxx.js"></script>
// 或者 src="/assets/xxx.js" 也兼容
// 替换为内联 <script>...js content...</script>（去除 type=module 以支持 file://）
const scriptRegex = /<script\s+type="module"\s+crossorigin\s+src="[./]*\/assets\/([^"]+\.js)"\s*><\/script>/g;
let replaced = 0;

html = html.replace(scriptRegex, (match, jsFile) => {
  const jsPath = path.join(distDir, 'assets', jsFile);
  if (!fs.existsSync(jsPath)) {
    console.error('JS file not found:', jsPath);
    return match;
  }
  const jsContent = fs.readFileSync(jsPath, 'utf8');
  replaced++;
  console.log('Inlined:', jsFile, '(' + (jsContent.length / 1024).toFixed(0) + ' KB)');
  return '<script>\n' + jsContent + '\n</script>';
});

// 也内联 CSS（如果有）
const cssRegex = /<link\s+rel="stylesheet"\s+crossorigin\s+href="[./]*\/assets\/([^"]+\.css)"\s*>/g;
html = html.replace(cssRegex, (match, cssFile) => {
  const cssPath = path.join(distDir, 'assets', cssFile);
  if (!fs.existsSync(cssPath)) return match;
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  replaced++;
  console.log('Inlined CSS:', cssFile, '(' + cssContent.length + ' chars)');
  return '<style>\n' + cssContent + '\n</style>';
});

// 内联 favicon
const faviconRegex = /<link\s+rel="icon"[^>]*href="[./]*\/favicon\.svg"[^>]*>/g;
html = html.replace(faviconRegex, (match) => {
  const favPath = path.join(distDir, 'favicon.svg');
  if (!fs.existsSync(favPath)) {
    console.log('favicon.svg not found, removing link');
    return '';
  }
  const favContent = fs.readFileSync(favPath, 'utf8');
  const dataUri = 'data:image/svg+xml,' + encodeURIComponent(favContent);
  replaced++;
  console.log('Inlined favicon.svg (' + favContent.length + ' chars)');
  return '<link rel="icon" type="image/svg+xml" href="' + dataUri + '" />';
});

// 移除所有 type="module"（file:// 兼容）
html = html.replace(/<script\s+type="module"\s*>/g, '<script>');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('\nDone. Inlined', replaced, 'files into index.html');
console.log('Final HTML size:', (html.length / 1024).toFixed(0), 'KB');

// 验证：检查是否还有外部 JS/CSS 引用
const remainingScripts = [...html.matchAll(/src=["'][./]*\/assets\/[^"']+["']/g)].map(m => m[0]);
const remainingLinks = [...html.matchAll(/href=["'][./]*\/assets\/[^"']+["']/g)].map(m => m[0]);
const remainingFavicon = [...html.matchAll(/href=["'][./]*\/favicon\.svg["']/g)].map(m => m[0]);
if (remainingScripts.length > 0 || remainingLinks.length > 0 || remainingFavicon.length > 0) {
  console.log('WARNING: Still has external references:', remainingScripts, remainingLinks, remainingFavicon);
} else {
  console.log('OK: No external JS/CSS/favicon references. Single-file build ready.');
}
