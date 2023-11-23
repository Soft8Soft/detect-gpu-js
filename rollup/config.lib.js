// Vendor
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import filesize from 'rollup-plugin-filesize';
import terser from '@rollup/plugin-terser';
import { babel } from '@rollup/plugin-babel';
import ignore from 'rollup-plugin-ignore'

const formats = [
    ['esm', 'esm', './internal/benchmarks.json'],
    ['umd', 'umd', './internal/benchmarks.json'],
    ['umd', 'bundle', ''],
];

export default formats.map(([format, suffix, ignored] = []) => ({
    input: './src/index.js',
    output: {
        file: `./dist/detect-gpu.${suffix}.js`,
        format,
        name: 'DetectGPU',
        sourcemap: true,
    },
    plugins: [
        ignore(ignored),
        babel({
            presets: [['@babel/preset-env', { targets: "safari >= 11" }]],
            babelHelpers: 'bundled',
        }),
        terser({
            format: {
                comments: false,
            },
        }),
        filesize(),
        resolve(),
        copy({
            targets: [{ dest: 'dist', src: 'benchmarks' }],
        }),
        json(),
    ],
}));
