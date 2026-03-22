import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { createRequire } from 'node:module';
import localResolve from 'rollup-plugin-local-resolve';
import json from '@rollup/plugin-json';

const require = createRequire(import.meta.url);
let pkg = require('./package.json');
let external = Object.keys(pkg.dependencies);

export default {
    input: 'src/index.js',
    plugins: [
        json({
            exclude: [ 'node_modules' ],
            preferConst: true,
        }),
        localResolve(),
        babel({
            babelHelpers: 'bundled',
            exclude: 'node_modules/**',
        }),
        resolve({
            browser: true,
            extensions: ['.js']
        }),
        commonjs(),
    ],
    external: external,
    output: [
        {
            file: pkg.main,
            format: 'umd',
            name: 'cubism',
            sourcemap: true
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap: true
        }
    ]
};
