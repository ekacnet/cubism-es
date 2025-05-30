import { babel } from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';

export default {
  onwarn: function (message) {
    if (message.code === 'CIRCULAR_DEPENDENCY') {
      return;
    }
    console.warn(message);
  },
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
      open: true,
      verbose: true,
      contentBase: ['demo'],
      historyApiFallback: false,
      host: 'localhost',
      port: 3004,
    }),
    livereload({
      watch: ['demo', 'src'],
      verbose: false,
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
