// 使用 Web Crypto API 实现 AES-256-CBC
// 辅助函数：将字符串转为 Uint8Array
function strToBytes(str) {
    return new TextEncoder().encode(str);
}
function bytesToStr(bytes) {
    return new TextDecoder().decode(bytes);
}
// 将十六进制字符串转为 Uint8Array
function hexToBytes(hex) {
    const clean = hex.replace(/\s/g, '');
    if (clean.length % 2 !== 0) throw new Error('十六进制长度必须为偶数');
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < clean.length; i += 2) {
        bytes[i/2] = parseInt(clean.substr(i, 2), 16);
    }
    return bytes;
}
// 将 Uint8Array 转为 Base64
function bytesToBase64(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
function base64ToBytes(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

// AES-256-CBC 加密（返回密文 Base64）
export async function aesEncrypt(plainText, keyBytes, ivBytes) {
    if (keyBytes.length !== 32) throw new Error('AES-256 密钥必须为 32 字节');
    if (ivBytes.length !== 16) throw new Error('IV 必须为 16 字节');
    const key = await crypto.subtle.importKey(
        'raw', keyBytes, { name: 'AES-CBC' }, false, ['encrypt']
    );
    const data = strToBytes(plainText);
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv: ivBytes }, key, data
    );
    return new Uint8Array(encrypted);
}

// AES-256-CBC 解密（输入密文 Uint8Array，输出明文字符串）
export async function aesDecrypt(cipherBytes, keyBytes, ivBytes) {
    if (keyBytes.length !== 32) throw new Error('AES-256 密钥必须为 32 字节');
    if (ivBytes.length !== 16) throw new Error('IV 必须为 16 字节');
    const key = await crypto.subtle.importKey(
        'raw', keyBytes, { name: 'AES-CBC' }, false, ['decrypt']
    );
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv: ivBytes }, key, cipherBytes
    );
    return bytesToStr(new Uint8Array(decrypted));
}

// 辅助导出
export { hexToBytes, bytesToBase64, base64ToBytes, strToBytes, bytesToStr };