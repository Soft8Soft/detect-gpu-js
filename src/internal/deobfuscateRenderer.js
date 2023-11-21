// Internal
import { deobfuscateAppleGPU } from './deobfuscateAppleGPU';

export function deobfuscateRenderer(gl, renderer, isMobileTier) {
    return renderer === 'apple gpu' ?
        deobfuscateAppleGPU(gl, renderer, isMobileTier) :
        [renderer];
}