import { babel } from '@rollup/plugin-babel';
import resolve  from '@rollup/plugin-node-resolve';
import commonjs  from '@rollup/plugin-commonjs';
import localResolve from 'rollup-plugin-local-resolve';
import json from '@rollup/plugin-json';
import fs from 'fs';

// disable circular dependency warning

let data = fs.readFileSync('./package.json', {encoding: 'utf8'})
let pkg = JSON.parse(data);

export default {
    onwarn: function ( message ) {
        if (message.code === 'CIRCULAR_DEPENDENCY') {
                return;
        }
        console.warn(message);
    },
    input: 'src/index.js',
    plugins: [
        json({
            exclude: [ 'node_modules' ],
            preferConst: true,
        }),
        localResolve(),
        babel(),
        resolve({
            module: true,
            jsnext: true,
            main: true,
            browser: true,
            extensions: ['.js']
        }),
        commonjs(),
    ],
    external: ["d3"],
    output: [
        {
            file: pkg.main,
            format: 'iife',
            name: 'cubism',
            sourcemap: true,
            globals: {
                d3: 'd3'
            },
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap: true,
            globals: {
                d3: 'd3'
            },
        },
        {
            file: 'dist/cubism-es.standalone.js',
            format: 'umd',
            name: 'cubism',
            globals: {
                d3: 'd3'
            },
            sourcemap: true
        }
    ]
};
