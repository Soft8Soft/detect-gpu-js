# Detect GPU

Rate GPUs based on their 3D rendering performance allowing the developer to provide sensible default settings for graphically intensive applications. Think of it like a user-agent detection for the GPU but more powerful.

This project was initially based on [detect-gpu](https://github.com/pmndrs/detect-gpu) code rewritten in JavaScript, but now it uses completely different approach to GPU detection.

## Demo

[Live demo](https://soft8soft.github.io/detect-gpu-js/)

## Installation

Just place and link detect-gpu.js in your project HTML if you're using ES6 modules, or detect-gpu-compat.js if you're using namespaced modules.

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
getGPUTier(undecided='GOOD')
```

## Licence

The project is released under the [MIT license](https://raw.githubusercontent.com/soft8soft/detect-gpu-js/master/LICENSE).
