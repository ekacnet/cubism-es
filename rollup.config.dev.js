import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss'
import localResolve from 'rollup-plugin-local-resolve';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';
import json from '@rollup/plugin-json';

const isWatch = !!process.env.ROLLUP_WATCH;

export default {
    input: 'src/index.js',
    plugins: [
        json({
            exclude: [ 'node_modules' ],
            preferConst: true,
        }),
        localResolve(),
        postcss({ extract: 'dist/cubism-es.css' }),
        babel({
            babelHelpers: 'bundled',
            exclude: 'node_modules/**',
        }),
        resolve({
            browser: true,
            extensions: ['.js']
        }),
        commonjs(),
        isWatch &&
            serve({
                open: true,
                verbose: true,
                contentBase: ['demo', 'dist'],
                historyApiFallback: false,
                host: 'localhost',
                port: 3004
            }),
        isWatch &&
            livereload({
                watch: 'demo',
                verbose: false
            })
    ].filter(Boolean),
    external: [],
    output: [
        {
            file: 'dist/cubism-es.standalone.js',
            format: 'umd',
            name: 'cubism',
            sourcemap: true
        }
    ]
};
