// Downloads subsetted font files (only glyphs used in the video) into public/fonts.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const src = fs.readFileSync('src/data.ts', 'utf8') + fs.readFileSync('src/ToyotaHistory.tsx', 'utf8') + ' 0123456789';
const chars = [...new Set([...src])].filter((c) => c.charCodeAt(0) > 31).join('');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36';

const fonts = [
  ['Noto+Serif+JP', [300, 500, 700], 'NotoSerifJP'],
  ['Cormorant+Garamond', [300, 500], 'Cormorant'],
];
for (const [family, weights, name] of fonts) {
  for (const w of weights) {
    const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${w}&text=${encodeURIComponent(chars)}`;
    const css = execFileSync('curl', ['-sS', '-A', UA, url]).toString();
    const fontUrl = css.match(/url\((https:[^)]+)\)/)[1];
    execFileSync('curl', ['-sS', '-o', `public/fonts/${name}-${w}.woff2`, fontUrl]);
    console.log(name, w, 'ok');
  }
}
