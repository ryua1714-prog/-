import {continueRender, delayRender, staticFile} from 'remotion';

// Local, glyph-subsetted fonts (regenerate with `npm run fonts` after changing text).
export const JP = 'Noto Serif JP Local';
export const LATIN = 'Cormorant Garamond Local';

const faces: [string, string, string][] = [
  [JP, 'NotoSerifJP-300.woff2', '300'],
  [JP, 'NotoSerifJP-500.woff2', '500'],
  [JP, 'NotoSerifJP-700.woff2', '700'],
  [LATIN, 'Cormorant-300.woff2', '300'],
  [LATIN, 'Cormorant-500.woff2', '500'],
];

const handle = delayRender('Loading fonts');
Promise.all(
  faces.map(async ([family, file, weight]) => {
    const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {weight});
    await face.load();
    document.fonts.add(face);
  }),
).then(() => continueRender(handle));
