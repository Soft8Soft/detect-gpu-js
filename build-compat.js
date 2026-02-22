#!/usr/bin/env node
import { readFile, writeFile } from 'fs/promises';

const SRC = 'detect-gpu.js';
const DST = 'detect-gpu-compat.js';
const SEARCH = 'export { getGPUTier };';
const REPLACE = `if (typeof window !== 'undefined') { window.getGPUTier = getGPUTier; }`;
const content = await readFile(SRC, 'utf-8');
const lines = content.split(/\r?\n/);

const index = lines.findIndex(line => line.includes(SEARCH));
if (index === -1) {
    console.log(`No line containing "${SEARCH}" found.`);
    process.exit();
}

lines[index] = REPLACE;
await writeFile(DST, lines.join('\n'), 'utf-8');
