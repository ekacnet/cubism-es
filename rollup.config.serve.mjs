import { babel } from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import localResolve from 'rollup-plugin-local-resolve';
import typescript from '@rollup/plugin-typescript';
import serve from 'rollup-plugin-serve';

export default {
  input: 'src/index.js',
  plugins: [
    json({
      exclude: ['node_modules'],
      preferConst: true,
    }),
    localResolve(),
    babel(),
    resolve({
      module: true,
      jsnext: true,
      main: true,
      extensions: ['.js', '.ts'],
    }),
    commonjs(),
    typescript(),
    serve({
      open: false,
      verbose: true,
      contentBase: ['demo', 'dist'],
      historyApiFallback: false,
      host: 'localhost',
      port: 3004,
    }),
  ],
  external: ['d3'],
  output: [
    {
      file: 'demo/cubism-es.standalone.js',
      format: 'umd',
      name: 'cubism',
      globals: {
        d3: 'd3',
      },
      sourcemap: true,
    },
  ],
};
