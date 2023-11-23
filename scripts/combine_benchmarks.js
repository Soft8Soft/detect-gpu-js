#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import url from 'url';

const CURR_DIR = path.dirname(url.fileURLToPath(import.meta.url));
const BENCH_DIR = path.join(CURR_DIR, '..', 'benchmarks');

const pack = {};

fs.readdirSync(BENCH_DIR).forEach(file => {
    pack[file] = JSON.parse(fs.readFileSync(path.join(BENCH_DIR, file)));
});

fs.writeFileSync(path.join(CURR_DIR, '..', 'src', 'internal', 'benchmarks.json'), JSON.stringify(pack));
