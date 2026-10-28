/**
 * Hash 摘要算法集合
 * 支持 MD5, SHA-1, SHA-256, SHA-512, SM3
 * 使用原生 Crypto 和 纯JS实现 SM3
 */

// ------------------- MD5 实现 (公共域) -------------------
const MD5 = (function() {
    function md5cycle(x, k) {
        var a = x[0], b = x[1], c = x[2], d = x[3];
        a = ff(a, b, c, d, k[0], 7, -680876936);
        d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17, 606105819);
        b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897);
        d = ff(d, a, b, c, k[5], 12, 1200080426);
        c = ff(c, d, a, b, k[6], 17, -1473231341);
        b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416);
        d = ff(d, a, b, c, k[9], 12, -1958414417);
        c = ff(c, d, a, b, k[10], 17, -42063);
        b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682);
        d = ff(d, a, b, c, k[13], 12, -40341101);
        c = ff(c, d, a, b, k[14], 17, -1502002290);
        b = ff(b, c, d, a, k[15], 22, 1236535329);
        a = gg(a, b, c, d, k[1], 5, -165796510);
        d = gg(d, a, b, c, k[6], 9, -1069501632);
        c = gg(c, d, a, b, k[11], 14, 643717713);
        b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691);
        d = gg(d, a, b, c, k[10], 9, 38016083);
        c = gg(c, d, a, b, k[15], 14, -660478335);
        b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438);
        d = gg(d, a, b, c, k[14], 9, -1019803690);
        c = gg(c, d, a, b, k[3], 14, -187363961);
        b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467);
        d = gg(d, a, b, c, k[2], 9, -51403784);
        c = gg(c, d, a, b, k[7], 14, 1735328473);
        b = gg(b, c, d, a, k[12], 20, -1926607734);
        a = hh(a, b, c, d, k[5], 4, -378558);
        d = hh(d, a, b, c, k[8], 11, -2022574463);
        c = hh(c, d, a, b, k[11], 16, 1839030562);
        b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060);
        d = hh(d, a, b, c, k[4], 11, 1272893353);
        c = hh(c, d, a, b, k[7], 16, -155497632);
        b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174);
        d = hh(d, a, b, c, k[0], 11, -358537222);
        c = hh(c, d, a, b, k[3], 16, -722521979);
        b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487);
        d = hh(d, a, b, c, k[12], 11, -421815835);
        c = hh(c, d, a, b, k[15], 16, 530742520);
        b = hh(b, c, d, a, k[2], 23, -995338651);
        a = ii(a, b, c, d, k[0], 6, -198630844);
        d = ii(d, a, b, c, k[7], 10, 1126891415);
        c = ii(c, d, a, b, k[14], 15, -1416354905);
        b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571);
        d = ii(d, a, b, c, k[3], 10, -1894986606);
        c = ii(c, d, a, b, k[10], 15, -1051523);
        b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359);
        d = ii(d, a, b, c, k[15], 10, -30611744);
        c = ii(c, d, a, b, k[6], 15, -1560198380);
        b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070);
        d = ii(d, a, b, c, k[11], 10, -1120210379);
        c = ii(c, d, a, b, k[2], 15, 718787259);
        b = ii(b, c, d, a, k[9], 21, -343485551);
        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);
    }
    function cmn(q, a, b, x, s, t) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
    }
    function ff(a, b, c, d, x, s, t) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
    function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
    function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
    function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }
    function add32(a, b) {
        return (a + b) & 0xFFFFFFFF;
    }
    function md5(s) {
        var n = s.length, state = [1732584193, -271733879, -1732584194, 271733878], i;
        for (i = 64; i <= s.length; i += 64) {
            md5cycle(state, md5blk(s.substring(i-64, i)));
        }
        s = s.substring(i-64);
        var tail = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        for (i = 0; i < s.length; i++)
            tail[i>>2] |= s.charCodeAt(i) << ((i%4) << 3);
        tail[i>>2] |= 0x80 << ((i%4) << 3);
        if (i > 55) {
            md5cycle(state, tail);
            for (i = 0; i < 16; i++) tail[i] = 0;
        }
        tail[14] = n * 8;
        md5cycle(state, tail);
        return state;
    }
    function md5blk(s) {
        var md5blks = [], i;
        for (i = 0; i < 64; i += 4) {
            md5blks[i>>2] = s.charCodeAt(i) + (s.charCodeAt(i+1) << 8) + (s.charCodeAt(i+2) << 16) + (s.charCodeAt(i+3) << 24);
        }
        return md5blks;
    }
    function hex(x) {
        var hexchars = '0123456789abcdef', res = '';
        for (var i = 0; i < x.length; i++) {
            var val = x[i];
            for (var j = 0; j < 4; j++) {
                res += hexchars.charAt((val >> (j*8+4)) & 0x0F) + hexchars.charAt((val >> (j*8)) & 0x0F);
            }
        }
        return res;
    }
    return function(str) { return hex(md5(str)); };
})();

// ------------------- SM3 实现（国密摘要算法） -------------------
// 基于公开实现，简化版
const SM3 = (function() {
    function sm3_ffj(x, y, z, j) {
        if (j >= 0 && j <= 15) return x ^ y ^ z;
        return (x & y) | (x & z) | (y & z);
    }
    function sm3_ggj(x, y, z, j) {
        if (j >= 0 && j <= 15) return x ^ y ^ z;
        return (x & y) | (~x & z);
    }
    function sm3_p0(x) { return x ^ rotl(x, 9) ^ rotl(x, 17); }
    function sm3_p1(x) { return x ^ rotl(x, 15) ^ rotl(x, 23); }
    function rotl(x, n) { return (x << n) | (x >>> (32 - n)); }
    function sm3_compress(IV, B) {
        var W = new Array(68);
        var W1 = new Array(64);
        for (var i = 0; i < 16; i++) W[i] = B[i];
        for (var i = 16; i < 68; i++) {
            W[i] = sm3_p1(W[i-16] ^ W[i-9] ^ rotl(W[i-3], 15)) ^ rotl(W[i-13], 7) ^ W[i-6];
        }
        for (var i = 0; i < 64; i++) W1[i] = W[i] ^ W[i+4];
        var A = IV[0], B0 = IV[1], C = IV[2], D = IV[3], E = IV[4], F = IV[5], G = IV[6], H = IV[7];
        for (var j = 0; j < 64; j++) {
            var SS1 = rotl(rotl(A, 12) + E + rotl(0x79CC4519, j), 7);
            var SS2 = SS1 ^ rotl(A, 12);
            var TT1 = sm3_ffj(A, B0, C, j) + D + SS2 + W1[j];
            var TT2 = sm3_ggj(E, F, G, j) + H + SS1 + W[j];
            D = C;
            C = rotl(B0, 9);
            B0 = A;
            A = TT1;
            H = G;
            G = rotl(F, 19);
            F = E;
            E = sm3_p0(TT2);
        }
        return [A ^ IV[0], B0 ^ IV[1], C ^ IV[2], D ^ IV[3], E ^ IV[4], F ^ IV[5], G ^ IV[6], H ^ IV[7]];
    }
    function sm3(msg) {
        var len = msg.length * 8;
        var padding = [0x80];
        var padLen = (56 - (msg.length + 1) % 64) % 64;
        for (var i = 0; i < padLen; i++) padding.push(0);
        var msgBytes = [];
        for (var i = 0; i < msg.length; i++) {
            var code = msg.charCodeAt(i);
            if (code < 0x80) msgBytes.push(code);
            else if (code < 0x800) {
                msgBytes.push(0xC0 | (code >> 6), 0x80 | (code & 0x3F));
            } else if (code < 0xD800 || code >= 0xE000) {
                msgBytes.push(0xE0 | (code >> 12), 0x80 | ((code >> 6) & 0x3F), 0x80 | (code & 0x3F));
            } else {
                // surrogate pair
                i++;
                var code2 = msg.charCodeAt(i);
                var cp = ((code & 0x3FF) << 10) + (code2 & 0x3FF) + 0x10000;
                msgBytes.push(0xF0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3F), 0x80 | ((cp >> 6) & 0x3F), 0x80 | (cp & 0x3F));
            }
        }
        var totalLen = msgBytes.length + padding.length + 8;
        var blockCount = Math.ceil(totalLen / 64);
        var blocks = new Array(blockCount);
        for (var i = 0; i < blockCount; i++) blocks[i] = new Array(16);
        var idx = 0;
        for (var i = 0; i < msgBytes.length; i++) {
            var bitOffset = idx % 4;
            var wordIdx = Math.floor(idx / 4);
            var blockIdx = Math.floor(wordIdx / 16);
            var blockWord = wordIdx % 16;
            if (!blocks[blockIdx][blockWord]) blocks[blockIdx][blockWord] = 0;
            blocks[blockIdx][blockWord] |= msgBytes[i] << (24 - bitOffset * 8);
            idx++;
        }
        for (var i = 0; i < padding.length; i++) {
            var bitOffset = idx % 4;
            var wordIdx = Math.floor(idx / 4);
            var blockIdx = Math.floor(wordIdx / 16);
            var blockWord = wordIdx % 16;
            if (!blocks[blockIdx][blockWord]) blocks[blockIdx][blockWord] = 0;
            blocks[blockIdx][blockWord] |= padding[i] << (24 - bitOffset * 8);
            idx++;
        }
        var lastBlockIdx = blockCount - 1;
        var lenHigh = Math.floor(len / 0x100000000);
        var lenLow = len & 0xFFFFFFFF;
        var lastWordIdx = Math.floor(idx / 4);
        var lastBlockWord = lastWordIdx % 16;
        blocks[lastBlockIdx][lastBlockWord] = (blocks[lastBlockIdx][lastBlockWord] || 0) | (lenHigh >>> 0);
        blocks[lastBlockIdx][lastBlockWord+1] = lenLow;
        var IV = [0x7380166F, 0x4914B2B9, 0x172442D7, 0xDA8A0600, 0xA96F30BC, 0x163138AA, 0xE38DEE4D, 0xB0FB0E4E];
        for (var i = 0; i < blockCount; i++) {
            IV = sm3_compress(IV, blocks[i]);
        }
        var result = '';
        for (var i = 0; i < IV.length; i++) {
            result += ('00000000' + IV[i].toString(16)).slice(-8);
        }
        return result;
    }
    return sm3;
})();

// ------------------- 使用原生 Web Crypto 实现 SHA 系列 -------------------
async function sha(message, algorithm) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 导出统一的接口
export async function hash(message, algorithm) {
    const alg = algorithm.toUpperCase();
    if (alg === 'MD5') {
        return MD5(message);
    } else if (alg === 'SM3') {
        return SM3(message);
    } else if (alg === 'SHA-1') {
        return await sha(message, 'SHA-1');
    } else if (alg === 'SHA-256') {
        return await sha(message, 'SHA-256');
    } else if (alg === 'SHA-512') {
        return await sha(message, 'SHA-512');
    } else {
        throw new Error(`不支持的算法: ${algorithm}`);
    }
}

// 同步版本（md5 + sm3 同步，SHA 异步用 promise）
export function hashSync(message, algorithm) {
    const alg = algorithm.toUpperCase();
    if (alg === 'MD5') return MD5(message);
    if (alg === 'SM3') return SM3(message);
    throw new Error(`${algorithm} 不支持同步调用，请使用异步 hash 函数`);
}