// @ts-nocheck
import ts from 'rollup-plugin-ts';
import { Addon } from '@embroider/addon-dev/rollup';
import { defineConfig } from 'rollup';

const addon = new Addon({
  srcDir: 'src',
  destDir: 'dist',
});

export default defineConfig({
  watch: {
    chokidar: {
      usePolling: true,
    },
  },
  output: {
    ...addon.output(),
    sourcemap: true,
    hoistTransitiveImports: false,
  },
  plugins: [
    addon.publicEntrypoints(['**/*.ts']),
    ts({
      transpiler: 'babel',
      babelConfig: './babel.config.cjs',
      browserslist: ['last 2 firefox versions', 'last 2 chrome versions'],
      tsconfig: {
        fileName: 'tsconfig.json',
        hook: (config) => ({
          ...config,
          declaration: true,
          declarationMap: true,
          declarationDir: './dist',
        }),
      },
    }),

    addon.dependencies(),
    addon.clean(),
  ],
});
