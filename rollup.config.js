import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

module.exports = [
  {
    input: 'src/index.js',
    plugins: [
      nodeResolve({
        browser: true,
      }),
      replace({
        preventAssignment: true,
        // Remove after this issue is fixed: https://github.com/prisma-labs/graphql-request/issues/362
        'window.FormData': "(typeof window !='undefined' ? window : {}).FormData",
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: /node_modules/,
        presets: [['@babel/preset-env', { modules: false }]],
      }),
      commonjs(),
      terser(),
    ],
    output: [
      { file: pkg.main, exports: 'named', format: 'cjs', sourcemap: true },
      { file: pkg.module, exports: 'named', format: 'es', sourcemap: true },
    ],
  },
];
