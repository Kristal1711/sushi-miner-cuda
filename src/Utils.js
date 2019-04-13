const fs = require('fs');
const JSON5 = require('json5');
const Nimiq = require('@nimiq/core');

exports.humanHashrate = function (hashes) {
    let thresh = 1000;
    if (Math.abs(hashes) < thresh) {
        return hashes + ' H/s';
    }
    let units = ['kH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s', 'ZH/s', 'YH/s'];
    let u = -1;
    do {
        hashes /= thresh;
        ++u;
    } while (Math.abs(hashes) >= thresh && u < units.length - 1);
    return hashes.toFixed(1) + ' ' + units[u];
}

exports.readConfigFile = function (fileName) {
    try {
        const config = JSON5.parse(fs.readFileSync(fileName));
        // TODO: Validate
        return config;
    } catch (e) {
        Nimiq.Log.e(`Failed to read config file ${fileName}: ${e.message}`);
        return false;
    }
}

exports.getDeviceOptions = function (config) {
    const devices = Array.isArray(config.devices) ? config.devices : [];
    const memory = Array.isArray(config.memory) ? config.memory : [];
    const threads = Array.isArray(config.threads) ? config.threads : [];
    const cache = Array.isArray(config.cache) ? config.cache : [];
    const memoryTradeoff = Array.isArray(config.memoryTradeoff) ? config.memoryTradeoff : [];

    const getOption = (values, deviceIndex) => {
        if (values.length > 0) {
            const value = (values.length === 1) ? values[0] : values[(devices.length === 0) ? deviceIndex : devices.indexOf(deviceIndex)];
            if (Number.isInteger(value)) {
                return value;
            }
        }
        return undefined;
    };

    return {
        forDevice: (deviceIndex) => {
            const enabled = (devices.length === 0) || devices.includes(deviceIndex);
            if (!enabled) {
                return {
                    enabled: false
                };
            }
            return {
                enabled: true,
                memory: getOption(memory, deviceIndex),
                threads: getOption(threads, deviceIndex),
                cache: getOption(cache, deviceIndex),
                memoryTradeoff: getOption(memoryTradeoff, deviceIndex),
            };
        }
    }
}
