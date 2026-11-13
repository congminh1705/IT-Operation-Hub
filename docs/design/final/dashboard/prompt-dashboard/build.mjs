import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const root = path.dirname(fileURLToPath(import.meta.url));
const frontend = path.resolve(root, '../../../../../src/frontend');
const require = createRequire(path.join(frontend, 'package.json'));
const tailwind = require('@tailwindcss/postcss');
const postcss = createRequire(require.resolve('@tailwindcss/postcss'))('postcss');
const source = `@import "${frontend.replaceAll('\\', '/')}/node_modules/tailwindcss/index.css";\n@source "${root.replaceAll('\\', '/')}/src";\n` + fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');
const compiled = await postcss([tailwind({ base: root })]).process(source, { from: path.join(root, 'src/styles.css') });
fs.mkdirSync(path.join(root, 'public/assets'), { recursive: true });
fs.writeFileSync(path.join(root, 'public/assets/hero.css'), compiled.css);
const viteFolder = fs.readdirSync(path.join(frontend, 'node_modules/.pnpm')).find(name => name.startsWith('vite@'));
if (!viteFolder) throw new Error('Install the existing frontend lockfile before building the preview.');
const { build } = await import(pathToFileURL(path.join(frontend, 'node_modules/.pnpm', viteFolder, 'node_modules/vite/dist/node/index.js')).href);
await build({
  root, configFile: false, base: './',
  resolve: { alias: {
    'react-dom': path.join(frontend, 'node_modules/react-dom'),
    react: path.join(frontend, 'node_modules/react'),
  } },
  build: { outDir: path.join(root, 'site'), emptyOutDir: true },
});
console.log('Preview only: existing React/Tailwind/Vite dependencies reused; app source unchanged.');
