// Vendor
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
    input: 'example/index.js',
    output: [{
        dir: `example/build`,
        format: 'esm',
        sourcemap: true,
    }, ],
    plugins: [
        livereload({
            exts: ['html', 'js', 'css'],
            verbose: true,
            watch: '.',
        }),
        resolve(),
        commonjs(),
        serve({
            contentBase: ['./example'],
            host: 'localhost',
            open: true,
            openPage: '/',
            port: 3003,
        }),
        copy({
            targets: [{ dest: 'example/build', src: 'benchmarks' }],
        }),
        json(),
        sourcemaps(),
    ],
};
