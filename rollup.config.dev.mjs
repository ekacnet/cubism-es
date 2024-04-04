import { babel } from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import fs from 'fs';
import postcss from 'rollup-plugin-postcss';
import localResolve from 'rollup-plugin-local-resolve';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';

export default {
  input: 'src/index.js',
  plugins: [
    json({
      exclude: ['node_modules'],
      preferConst: true,
    }),
    localResolve(),
    postcss({ extract: 'dist/cubism-es.css' }),
    babel(),
    resolve({
      module: true,
      jsnext: true,
      main: true,
      extensions: ['.js'],
    }),
    commonjs(),
    serve({
      open: true,
      verbose: true,
      contentBase: ['demo', 'dist'],
      historyApiFallback: false,
      host: 'localhost',
      port: 3004,
    }),
    livereload({
      watch: 'demo',
      verbose: false,
    }),
  ],
  external: ['d3'],
  output: [
    {
      file: 'dist/cubism-es.standalone.js',
      format: 'umd',
      name: 'cubism',
      globals: {
        d3: 'd3',
      },
      sourcemap: true,
    },
  ],
};
