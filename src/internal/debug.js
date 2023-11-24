const DEBUG_METHOD = 0; // 0 - none, 1 - console.log, 2 - HTML body element

let debug;

switch (DEBUG_METHOD) {
    case 0:
        debug = () => {};
        break;
    case 1:
        debug = console.log;
        break;
    case 2:
        debug = (...args) => {
            setTimeout(() => {
                args = args.map(a => typeof(a) == 'string' ? a : JSON.stringify(a));
                document.body.innerHTML += `<div style="font-size: small">${args.join(' ')}</div>`;
            }, 300);
        }
        break;
}

export { debug };
