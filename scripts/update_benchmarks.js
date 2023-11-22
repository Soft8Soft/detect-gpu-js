import fs from 'fs';
import puppeteer from 'puppeteer';

import { BLOCKLISTED_GPUS } from '../src/internal/blocklistedGPUS.js';
import { cleanRenderer } from '../src/internal/cleanRenderer.js';
import { getGPUVersion } from '../src/internal/getGPUVersion.js';
import { tokenizeForLevenshteinDistance } from '../src/internal/getLevenshteinDistance.js';
import { internalBenchmarkResults } from './internalBenchmarkResults.js';

const version = JSON.parse(fs.readFileSync('./package.json')).version;

const libraryMajorVersion = version.split('.')[0];

const BENCHMARK_URL = `https://gfxbench.com/result.jsp?benchmark=gfx50&test=544&text-filter=&order=median&ff-lmobile=true&ff-smobile=true&os-Android_gl=true&os-Android_vulkan=true&os-iOS_gl=true&os-iOS_metal=true&os-Linux_gl=true&os-OS_X_gl=true&os-OS_X_metal=true&os-Windows_dx=true&os-Windows_dx12=true&os-Windows_gl=true&os-Windows_vulkan=true&pu-dGPU=true&pu-iGPU=true&pu-GPU=true&arch-ARM=true&arch-unknown=true&arch-x86=true&base=device`;

const TYPES = [
    'adreno',
    'apple',
    'mali-t',
    'mali',
    'nvidia',
    'powervr',
    'intel',
    'amd',
    'radeon',
    'nvidia',
    'geforce',
    'samsung',
];

(async () => {
    let benchmarks = await fetchBenchmarks();
    benchmarks.push(...internalBenchmarkResults);
    benchmarks = benchmarks
        .map((benchmark) => {
            benchmark.gpu = cleanRenderer(benchmark.gpu)
                .replace(/\s*\([^)]+(\))/g, '')
                .replace(/(\d+)\/[^ ]+/, '$1')
                .replace(
                    /x\.org |inc\. |open source technology center |imagination technologies |™ |nvidia corporation |apple inc\. |advanced micro devices, inc\. | series$| edition$| graphics$/g,
                    ''
                )
                .replace(/(qualcomm|adreno)[^ ] /g, 'qualcomm ')
                .replace(/qualcomm (qualcomm )+/g, 'qualcomm ')
                .trim();
            benchmark.device = benchmark.device.toLowerCase();
            return benchmark;
        })
        .sort((a, b) => a.gpu.localeCompare(b.gpu));

    await Promise.all([true, false].map(exportBenchmarks));

    async function exportBenchmarks(isMobile) {
        const rows = benchmarks.filter(
            ({ mobile, gpu }) =>
            mobile === isMobile &&
            TYPES.filter((type) => gpu.includes(type)).length > 0
        );

        const rowsByGpu = Object.values(
            rows.reduce((groupedByKey, row) => {
                const groupKey = row.gpu;
                (groupedByKey[groupKey] = groupedByKey[groupKey] || []).push(row);
                return groupedByKey;
            }, {})
        );

        return Promise.all([
            ...TYPES.map(async (type) => {
                const devicesByGpu = rowsByGpu
                    .filter(([{ gpu }]) => gpu.includes(type))
                    .map((rows) => {
                        const { gpu } = rows[0];
                        const blocklisted = BLOCKLISTED_GPUS.find((blocklistedModel) =>
                            gpu.includes(blocklistedModel)
                        );
                        const devices = Object.entries(
                                rows.reduce((fpsByResolution, { resolution, fps, device }) => {
                                    fpsByResolution[resolution] = [device, blocklisted ? -1 : fps];
                                    return fpsByResolution;
                                }, {})
                            )
                            .map(([resolution, [device, fps]]) => {
                                const [width, height] = resolution.split(' x ').map(Number);
                                return { width, height, fps, device };
                            })
                            .sort(
                                ({ width: aW, height: aH }, { width: bW, height: bH }) =>
                                aW * aH - bW * bH
                            );
                        return {
                            blocklisted,
                            devices,
                            gpu,
                            gpuVersion: getGPUVersion(gpu),
                        };
                    });

                if (devicesByGpu.length === 0) {
                    return Promise.resolve();
                }
                const outputFile = async (type, models) => {
                    const serializedModels = models.map(
                        ({ gpu, gpuVersion, blocklisted, devices }) => [
                            gpu,
                            gpuVersion,
                            tokenizeForLevenshteinDistance(gpu),
                            blocklisted ? 1 : 0,
                            devices.map(({ width, height, fps, device }) =>
                                isMobile ? [width, height, fps, device] : [width, height, fps]
                            ),
                        ]
                    );
                    const data = [libraryMajorVersion, ...serializedModels];
                    await Promise.all(
                        [true, false].map(async (minified) => {
                            const file = `./benchmarks${minified ? '-min' : ''}/${ isMobile ? 'm' : 'd' }-${type}.json`;
                            const json = JSON.stringify(data, null, minified ? undefined : 2);
                            await fs.promises.writeFile(file, json);
                            if (!minified) {
                                console.log(`Exported ${file}`);
                            }
                        })
                    );
                };

                // output ipads seperately from other ios devices:
                if (type === 'apple' && isMobile) {
                    await Promise.all([
                        outputFile(
                            'apple-ipad',
                            devicesByGpu
                            .map((gpu) => ({
                                ...gpu,
                                devices: gpu.devices.filter(({ device }) =>
                                    device.includes('ipad')
                                ),
                            }))
                            .filter(({ devices }) => devices.length > 0)
                        ),
                        outputFile(
                            'apple',
                            devicesByGpu
                            .map((gpu) => ({
                                ...gpu,
                                devices: gpu.devices.filter(
                                    ({ device }) => !device.includes('ipad')
                                ),
                            }))
                            .filter(({ devices }) => devices.length > 0)
                        ),
                    ]);
                } else {
                    await outputFile(type, devicesByGpu);
                }
            }),
            // outputFile(getOutputFilename(`all-${isMobile ? 'm' : 'd'}`), rowsByGpu),
        ]);
    }
})().catch((err) => {
    throw err;
});

async function fetchBenchmarks() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.goto(BENCHMARK_URL, { waitUntil: 'networkidle2' });

    const benchmarks = await page.evaluate(() => {
        const {
            firstResult,
            deviceName,
            fpses,
            gpuNameLookup,
            screenSizeLookup,
            screenSizes,
            gpuName,
            formFactorLookup,
            formFactor,
        } = window;

        return gpuName
            .map((gpuIndex, index) => ({
                date: firstResult[index],
                device: deviceName[index].toLowerCase(),
                fps: fpses[index] === '' ?
                    undefined :
                    Math.round(Number(fpses[index].replace(/[^\d.]+/g, ''))),
                gpu: gpuNameLookup[gpuIndex],
                mobile: formFactorLookup[formFactor[index]].includes('mobile'),
                resolution: screenSizeLookup[screenSizes[index]],
            }))
            .filter((row) => row.fps !== undefined);
    });
    await browser.close();
    return benchmarks;
}
