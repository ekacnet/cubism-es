import { babel } from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import serve from 'rollup-plugin-serve';

export default {
  input: 'src/index.js',
  plugins: [
    json({
      exclude: ['node_modules'],
      preferConst: true,
    }),
    resolve({
      module: true,
      jsnext: true,
      main: true,
      extensions: ['.js', '.ts'],
    }),
    commonjs(),
    typescript(),
    babel({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      babelHelpers: 'bundled',
      plugins: ['istanbul'],
    }),
    serve({
      open: false,
      verbose: true,
      contentBase: ['demo'],
      historyApiFallback: false,
      host: 'localhost',
      port: 3004,
    }),
  ],
  external: ['d3'],
  output: [
    {
      file: 'demo/cubism-ng.standalone.js',
      format: 'umd',
      name: 'cubism',
      globals: {
        d3: 'd3',
      },
      sourcemap: true,
    },
  ],
};
