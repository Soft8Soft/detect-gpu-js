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

async function getGPUTier(undecided='BAD') {
    const webgl1 = checkWebGL1();
    if (!webgl1)
        return { tier: 'BAD', reason: 'Not supporting WebGL' };

    const webgl2 = checkWebGL2();

    if (webgl1 && !webgl2)
        return { tier: 'BAD', reason: 'Not supporting WebGL 2.0' };

    const vendor = getGPUVendor();
    const model = getGPUModel();
    const userAgent = window.navigator.userAgent;

    // https://fingerprint-scan.com/webgl_renderers/

    printDebug(vendor);
    printDebug(model);
    printDebug(userAgent);

    if (/(SwiftShader|Basic Render|llvmpipe)/i.test(model))
        return { tier: 'BAD', reason: 'Software renderer' };

    if (/Quest 3/i.test(userAgent))
        return { tier: 'GOOD', reason: 'Meta Quest 3/3s' };
    // Adreno 650 is good, but not for so many pixels
    else if (/Quest 2/i.test(userAgent))
        return { tier: 'BAD', reason: 'Meta Quest 2' };
    else if (/Quest\)/i.test(userAgent))
        return { tier: 'BAD', reason: 'Meta Quest 1' };

    // ancient GPUs did not support WebGL 2, which do are almost always good
    if (/(NVIDIA|AMD)/i.test(model))
        return { tier: 'GOOD', reason: 'NVIDIA/AMD graphics' };

    if (/Intel/i.test(model)) {
        // Tiger Lake, Alder Lake, Raptor Lake, Raptor Lake Refresh (11-13 gen)
        if  (/Xe Graphics/i.test(model))
            return { tier: 'GOOD', reason: 'Decent Intel Iris Xe GPU' };
        // Meteor Lake, Lunar Lake, Arrow Lake, Panther Lake (Core Ultra)
        else if (/Arc/i.test(model))
            return { tier: 'GOOD', reason: 'Good Intel Arc GPU' };

        // ADL/RPL naming is used on ChromeOS / Linux (Mesa), but in some cases lack "Xe Graphics" prefix
        else if (/ADL GT2/i.test(model))
            return { tier: 'GOOD', reason: 'Decent Intel Alder Lake GPU (Xe Graphics)' };
        // e.g Chromebook Plus 516 GE (RPL-S is low-end UHD Graphics)
        else if (/RPL-U/i.test(model) || /RPL-P/i.test(model))
            return { tier: 'GOOD', reason: 'Decent Intel Raptor Lake-P/U GPU (Xe Graphics)' };

        else
            // most likely HD/UHD
            return { tier: 'BAD', reason: 'Old or low-performance Intel GPU' };
    }

    // TODO: exclude older devices
    if (/Apple/i.test(model))
        return { tier: 'GOOD', reason: 'Apple GPU' };

    // TODO: exclude older devices
    if (/Adreno/i.test(model))
        return { tier: 'GOOD', reason: 'Adreno GPU' };

    // e.g. Xclipse 920 (Galaxy S22), Xclipse 940 (Galaxy S24)
    // NOTE: not sure about Xclipse 530 (Galaxy A55), Xclipse 540 (Galaxy A56)
    if (/Xclipse/i.test(model))
        return { tier: 'GOOD', reason: 'Samsung Xclipse GPU' };

    // e.g. Samsung Galaxy A15/A16/A06 5G
    if (/Mali/i.test(model) && (/Mali-G57/i.test(model) || /Mali-G68/i.test(model)))
        return { tier: 'GOOD', reason: 'Decent Mali GPU' };

    // TODO: check Mali-based flagships

    if (await checkWebGPUSupport())
        return { tier: 'GOOD', reason: 'Supporting WebGPU' };

    return { tier: undecided, reason: 'Unknown device, forcing to be ' + undecided};
};

export { getGPUTier };
