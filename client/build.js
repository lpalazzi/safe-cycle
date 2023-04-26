const esbuild = require('esbuild');
const inlineImage = require('esbuild-plugin-inline-image');
require('dotenv').config({ path: '../.env.client' });

const watchMode = process.argv[2] === '-w';

esbuild
  .build({
    entryPoints: ['./src/index.tsx'],
    outfile: '../public/bundle/app.js',
    publicPath: '/bundle',
    minify: true,
    bundle: true,
    plugins: [inlineImage()],
    define: {
      'process.env.DEV': JSON.stringify(process.env.DEV === '1') ?? 'false',
      'process.env.SENTRY_DSN':
        JSON.stringify(process.env.SENTRY_DSN) ?? 'undefined',
    },
    watch: watchMode
      ? {
          onRebuild(error, result) {
            if (error) console.error('watch build failed:', error);
          },
        }
      : null,
  })
  .catch(() => process.exit(1));
