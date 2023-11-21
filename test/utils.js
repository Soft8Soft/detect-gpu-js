import { getGPUTier } from '../dist/detect-gpu.esm.js';

export function getTier(override = {}) {
    return getGPUTier({
        desktopTiers: [0, 15, 30, 60],
        mobileTiers: [0, 15, 30, 60],
        override: {
            loadBenchmarks: async (file) =>
                (await import(`../benchmarks/${file}`)).default,
            ...override,
        },
    });
}

export function expectGPUResults(expected, result) {
    if (expected.type) {
        expect(result.type).toBe(expected.type);
    }

    if (expected.tier !== undefined) {
        expect(result.tier).toBe(expected.tier);
    }

    if (expected.isMobile !== undefined) {
        expect(result.isMobile).toBe(expected.isMobile);
    }

    if (expected.gpu !== undefined) {
        expect(result.gpu).toBe(expected.gpu);
    }
}
