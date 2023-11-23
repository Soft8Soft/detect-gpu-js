// Vendor
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import filesize from 'rollup-plugin-filesize';
import terser from '@rollup/plugin-terser';
import { babel } from '@rollup/plugin-babel';

const formats = ['esm', 'umd'];

export default formats.map((format) => ({
    input: './src/index.js',
    output: {
        file: `./dist/detect-gpu.${format}.js`,
        format,
        name: 'DetectGPU',
        sourcemap: true,
    },
    plugins: [
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
