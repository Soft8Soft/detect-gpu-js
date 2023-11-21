// Vendor
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import filesize from 'rollup-plugin-filesize';
import terser from '@rollup/plugin-terser';

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
        terser({
            format: {
                comments: false,
            },
        }),
        filesize(),
        resolve(),
        commonjs(),
        copy({
            targets: [{ dest: 'dist', src: 'benchmarks' }],
        }),
        json(),
    ],
}));
