const DEBUG = false;

function printDebug(msg) {
    if (DEBUG)
        console.log(msg);
}

function checkWebGL1() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
    } catch (e) {
        return false;
    }
}

function checkWebGL2() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
    } catch (e) {
        return false;
    }
}

function getGPUVendor() {
    const gl = document.createElement('canvas').getContext('webgl');

    if (/Firefox/.test(navigator.userAgent)) {
        return gl.getParameter(gl.VENDOR);
    } else {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo != null)
            return gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        else
            return '';
    }
}

function getGPUModel() {
    const gl = document.createElement('canvas').getContext('webgl');

    if (/Firefox/.test(navigator.userAgent)) {
        return gl.getParameter(gl.RENDERER);
    } else {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo != null)
            return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        else
            return '';
    }
}

async function checkWebGPUSupport() {
    if (!navigator.gpu)
        return false;

    try {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter)
            return false;

        return true;
    } catch (err) {
        return false;
    }
};

async function getGPUTier(undecided='GOOD') {
    const webgl1 = checkWebGL1();
    const webgl2 = checkWebGL2();

    if (webgl1 && !webgl2) {
        return { tier: 'BAD', reason: 'Not supporting WebGL 2.0'};
    }

    const vendor = getGPUVendor();
    const model = getGPUModel();

    printDebug(vendor);
    printDebug(model);

    if (/(NVIDIA|AMD|Apple|Adreno)/i.test(model)) {
        return { tier: 'GOOD', reason: 'Decent GPU vendor'};
    }

    if (await checkWebGPUSupport()) {
        return { tier: 'GOOD', reason: 'Supporting WebGPU'};
    }

    if (/Intel/i.test(model) && (/Iris/i.test(model) || /Xe Graphics/i.test(model))) {
        return { tier: 'GOOD', reason: 'Decent Intel GPU'};
    }

    if (/Intel/i.test(model)) {
        return { tier: 'BAD', reason: 'Old Intel GPU'};
    }

    return { tier: undecided, reason: 'Undecided, but specified to be ' + undecided + ' in such cases'};
};

export { getGPUTier };
