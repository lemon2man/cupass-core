/**
 * CRC 校验算法集合 (纯前端，无依赖)
 * 支持 CRC-16 多种变体 和 CRC-32
 * 使用查表法预生成表，提高计算效率
 */

// ------------- CRC-16 查表生成 -------------
function generateCRC16Table(polynomial, isReflectIn = false, isReflectOut = false) {
    const table = new Array(256);
    for (let i = 0; i < 256; i++) {
        let crc = i << 8;
        for (let j = 0; j < 8; j++) {
            if (crc & 0x8000) crc = (crc << 1) ^ polynomial;
            else crc <<= 1;
        }
        table[i] = crc & 0xFFFF;
    }
    return table;
}

function crc16(data, polynomial, initial, finalXor, reflectIn, reflectOut, table) {
    let crc = initial;
    for (let i = 0; i < data.length; i++) {
        let byte = data[i];
        if (reflectIn) {
            byte = reflectByte(byte);
        }
        const index = (crc >> 8) ^ byte;
        crc = ((crc << 8) ^ table[index]) & 0xFFFF;
    }
    if (reflectOut) {
        crc = reflect16(crc);
    }
    crc ^= finalXor;
    return crc & 0xFFFF;
}

// ------------- CRC-32 查表生成 -------------
function generateCRC32Table(polynomial) {
    const table = new Array(256);
    for (let i = 0; i < 256; i++) {
        let crc = i;
        for (let j = 0; j < 8; j++) {
            crc = (crc & 1) ? (crc >>> 1) ^ polynomial : crc >>> 1;
        }
        table[i] = crc >>> 0;
    }
    return table;
}

function crc32(data, polynomial, initial, finalXor, reflectIn, reflectOut, table) {
    let crc = initial;
    for (let i = 0; i < data.length; i++) {
        let byte = data[i];
        if (reflectIn) {
            byte = reflectByte(byte);
        }
        const index = (crc ^ byte) & 0xFF;
        crc = (crc >>> 8) ^ table[index];
    }
    if (reflectOut) {
        crc = reflect32(crc);
    }
    crc ^= finalXor;
    return crc >>> 0;
}

function reflectByte(b) {
    let r = 0;
    for (let i = 0; i < 8; i++) {
        r = (r << 1) | (b & 1);
        b >>= 1;
    }
    return r & 0xFF;
}

function reflect16(x) {
    let r = 0;
    for (let i = 0; i < 16; i++) {
        r = (r << 1) | (x & 1);
        x >>= 1;
    }
    return r & 0xFFFF;
}

function reflect32(x) {
    let r = 0;
    for (let i = 0; i < 32; i++) {
        r = (r << 1) | (x & 1);
        x >>= 1;
    }
    return r >>> 0;
}

// ------------- 预定义算法配置 -------------
const crcAlgorithms = {
    'CRC-16/IBM': {
        width: 16,
        polynomial: 0x8005,
        initial: 0x0000,
        finalXor: 0x0000,
        reflectIn: true,
        reflectOut: true,
        table: generateCRC16Table(0x8005, true, true)
    },
    'CRC-16/CCITT-FALSE': {
        width: 16,
        polynomial: 0x1021,
        initial: 0xFFFF,
        finalXor: 0x0000,
        reflectIn: false,
        reflectOut: false,
        table: generateCRC16Table(0x1021, false, false)
    },
    'CRC-16/XMODEM': {
        width: 16,
        polynomial: 0x1021,
        initial: 0x0000,
        finalXor: 0x0000,
        reflectIn: false,
        reflectOut: false,
        table: generateCRC16Table(0x1021, false, false)
    },
    'CRC-16/USB': {
        width: 16,
        polynomial: 0x8005,
        initial: 0xFFFF,
        finalXor: 0xFFFF,
        reflectIn: true,
        reflectOut: true,
        table: generateCRC16Table(0x8005, true, true)
    },
    'CRC-32': {
        width: 32,
        polynomial: 0xEDB88320,
        initial: 0xFFFFFFFF,
        finalXor: 0xFFFFFFFF,
        reflectIn: true,
        reflectOut: true,
        table: generateCRC32Table(0xEDB88320)
    },
    'CRC-32/MPEG-2': {
        width: 32,
        polynomial: 0x04C11DB7,
        initial: 0xFFFFFFFF,
        finalXor: 0x00000000,
        reflectIn: false,
        reflectOut: false,
        table: generateCRC32Table(0x04C11DB7)
    }
};

/**
 * 计算指定算法的 CRC
 * @param {Uint8Array} data 字节数组
 * @param {string} algorithmName 算法名
 * @returns {number} CRC 值（无符号整数）
 */
export function calculateCRC(data, algorithmName) {
    const cfg = crcAlgorithms[algorithmName];
    if (!cfg) throw new Error(`不支持的算法: ${algorithmName}`);
    if (cfg.width === 16) {
        return crc16(data, cfg.polynomial, cfg.initial, cfg.finalXor, cfg.reflectIn, cfg.reflectOut, cfg.table);
    } else if (cfg.width === 32) {
        return crc32(data, cfg.polynomial, cfg.initial, cfg.finalXor, cfg.reflectIn, cfg.reflectOut, cfg.table);
    }
    throw new Error('未知位宽');
}

/**
 * 将字符串或十六进制字符串转换为 Uint8Array
 * @param {string} input 输入内容
 * @param {string} mode 'text' 或 'hex'
 * @returns {Uint8Array}
 */
export function inputToBytes(input, mode) {
    if (mode === 'hex') {
        const clean = input.replace(/\s/g, '');
        if (clean.length % 2 !== 0) throw new Error('十六进制长度必须为偶数');
        const bytes = new Uint8Array(clean.length / 2);
        for (let i = 0; i < clean.length; i += 2) {
            const byte = parseInt(clean.substr(i, 2), 16);
            if (isNaN(byte)) throw new Error(`无效十六进制: ${clean.substr(i,2)}`);
            bytes[i/2] = byte;
        }
        return bytes;
    } else {
        const encoder = new TextEncoder();
        return encoder.encode(input);
    }
}

// 导出算法名称列表，用于界面下拉菜单
export const getSupportedAlgorithms = () => Object.keys(crcAlgorithms);