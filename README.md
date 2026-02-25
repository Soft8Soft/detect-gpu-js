# Detect GPU

Rate GPUs based on their 3D rendering performance allowing the developer to provide sensible default settings for graphically intensive applications. Think of it like a user-agent detection for the GPU but more powerful.

This project was initially based on [detect-gpu](https://github.com/pmndrs/detect-gpu) code rewritten in JavaScript, but now it uses completely different approach to GPU detection.

Older library used performance profile data taken from gfxbench.com (now defunct). The new version uses a set of evaluation snippets to classify GPUs as "good" or "bad".

Examples of "good" GPUs:

* NVIDIA/AMD devices
* iPhone 8+
* Apple Silicon desktops/laptops (M1-M4)
* Adreno phones/tablets
* Intel Xe/Arc integrated GPUs

Examples of "bad" GPUs:

* Outdated Apple hardware
* Intel HD/UHD crap
* Devices that can't handle WebGL 2.0 API
* Software renderers: llvmpipe, swiftshader

## Demo

[Live demo](https://soft8soft.github.io/detect-gpu-js/)

[WebGLReport with performance evaluation](https://v3d.net/w)

## Installation

Just copy and link ``detect-gpu.js`` in your project HTML if you're using ES6 modules, or ``detect-gpu-compat.js`` if you're using namespaced (IIFE) modules.

## Usage

```js
import { getGPUTier } from 'detect-gpu';

(async () => {
    const gpuTier = await getGPUTier();
  
    // output is one of:
    // { tier: 'GOOD', reason: '...' }
    // { tier: 'BAD', reason: '...' }
})();
```

## API

```js
getGPUTier(undecided='BAD', printDebugInfo=false)
```

``undecided`` param is used to return GPU tier when the system can't be evaluated reliably 

``printDebugInfo`` enables printing additional debugging info in the browser console

## Licence

The project is released under the [MIT license](https://raw.githubusercontent.com/soft8soft/detect-gpu-js/master/LICENSE).
