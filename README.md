# Detect GPU

[![npm version](https://badge.fury.io/js/detect-gpu-js.svg)](https://badge.fury.io/js/detect-gpu-js)
[![gzip size](https://img.badgesize.io/https:/unpkg.com/detect-gpu-js/dist/detect-gpu.esm.js?compression=gzip)](https://unpkg.com/detect-gpu-js)
[![install size](https://packagephobia.now.sh/badge?p=detect-gpu-js)](https://packagephobia.now.sh/result?p=detect-gpu-js)

Detect and rate GPUs based on their 3D rendering benchmark score allowing the developer to provide sensible default settings for graphically intensive applications. Think of it like a user-agent detection for the GPU but more powerful.

This project is a maintained fork of [detect-gpu](https://github.com/pmndrs/detect-gpu) project rewritten in JavaScript.

## Demo

[Live demo](https://soft8soft.github.io/detect-gpu-js/)

## Installation

Make sure you have [Node.js](http://nodejs.org/) installed, then:

```sh
 $ npm install detect-gpu-js
```

By default we use the [UNPKG](https://unpkg.com) CDN to host the benchmark data. If you would like to serve the benchmark data yourself, download the required benchmarking data from [benchmarks.tar.gz](https://github.com/soft8soft/detect-gpu-js/raw/master/benchmarks.tar.gz) and serve it from a public directory.

Alternatively, there is the `detect-gpu.bundle.js` build that comes with benchmark data embeeded. This however requires 300KB+ more data downloaded over the network.

## Usage

```js
import { getGPUTier } from 'detect-gpu';

(async () => {
    const gpuTier = await getGPUTier();
  
    // Example output:
    // {
    //     "tier": 1,
    //     "isMobile": false,
    //     "type": "BENCHMARK",
    //     "fps": 21,
    //     "gpu": "intel iris graphics 6100"
    // }
})();
```

`detect-gpu-js` uses rendering benchmark scores (framerate, normalized by resolution) in order to determine what tier should be assigned to the user's GPU. If no `WebGLContext` can be created, the GPU is blocklisted or the GPU has reported to render on less than `15 fps` `tier: 0` is assigned. One should provide a fallback to a non-WebGL experience.

Based on the reported `fps` the GPU is then classified into either `tier: 1 (>= 15 fps)`, `tier: 2 (>= 30 fps)` or `tier: 3 (>= 60 fps)`. The higher the tier the more graphically intensive workload you can offer to the user.

## API

```js
getGPUTier({
    /**
     * URL of directory where benchmark data is hosted.
     *
     * @default https://unpkg.com/detect-gpu-js@{version}/dist/benchmarks
     */
    benchmarksURL,
    /**
     * Optionally pass in a WebGL context to avoid creating a temporary one
     * internally.
     */
    glContext,
    /**
     * Whether to fail if the system performance is low or if no hardware GPU is
     * available.
     *
     * @default false
     */
    failIfMajorPerformanceCaveat,
    /**
     * Framerate per tier for mobile devices.
     *
     * @defaultValue [0, 15, 30, 60]
     */
    mobileTiers,
    /**
     * Framerate per tier for desktop devices.
     *
     * @defaultValue [0, 15, 30, 60]
     */
    desktopTiers,
    /**
     * Optionally override specific parameters. Used mainly for testing.
     */
    override: {
        renderer,
        /**
         * Override whether device is an iPad.
         */
        isIpad,
        /**
         * Override whether device is a mobile device.
         */
        isMobile,
        /**
         * Override device screen size.
         */
        screenSize: { width, height };
        /**
         * Override how benchmark data is loaded
         */
        loadBenchmarks
    };
})
```

## Support

Requires JavaScript modules to be supported, e.g. works on Chrome 61+, Firefox 60+, Safari 11+ (most versions dated back to 2017).

## Changelog

[Changelog](CHANGELOG.md)

## Licence

The project is released under the [MIT license](https://raw.githubusercontent.com/soft8soft/detect-gpu-js/master/LICENSE).

`detect-gpu-js` uses both mobile and desktop benchmarking scores from [https://gfxbench.com](https://gfxbench.com).
