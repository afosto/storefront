import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import pkg from './package.json';

const createBanner = () => {
  return `/**
 * @license Afosto Storefront v${pkg.version} | ${pkg.repository.url}
 * afosto-storefront.min.js
 *
 * Copyright (c) Afosto Saas BV.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */`;
};

module.exports = [
  {
    input: 'dist/esm/index.js',
    plugins: [
      nodeResolve({
        browser: true,
      }),
      commonjs({
        exclude: 'src/**',
      }),
    ],
    output: [
      {
        file: `dist/umd/afosto-storefront.js`,
        format: 'umd',
        banner: createBanner(),
        exports: 'named',
        name: 'afostoStorefront',
        plugins: [
          replace({
            'process.env.NODE_ENV': JSON.stringify('production'),
          }),
        ],
      },
      {
        file: `dist/umd/afosto-storefront.min.js`,
        format: 'umd',
        banner: createBanner(),
        exports: 'named',
        name: 'afostoStorefront',
        plugins: [
          replace({
            'process.env.NODE_ENV': JSON.stringify('production'),
          }),
          terser(),
        ],
      },
    ],
    onwarn: (warning, handler) => {
      if (warning.code === 'THIS_IS_UNDEFINED') {
        return;
      }

      handler(warning);
    },
  },
];
