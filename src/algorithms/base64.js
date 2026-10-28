/**
 * Base64 编解码 (纯前端，浏览器原生支持 atob/btoa 但需处理 Unicode)
 * 提供支持 UTF-8 的编解码函数
 */

// 编码：字符串 -> Base64
export function encodeBase64(str) {
    // 先将字符串转为 UTF-8 字节
    const utf8Bytes = new TextEncoder().encode(str);
    // 将字节转为二进制字符串
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
    }
    return btoa(binary);
}

// 解码：Base64 -> 字符串
export function decodeBase64(base64) {
    // 解码 Base64 得到二进制字符串
    const binary = atob(base64);
    // 将二进制字符串转为 Uint8Array
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    // 解码 UTF-8
    return new TextDecoder().decode(bytes);
}

// 验证是否为合法 Base64 字符串
export function isValidBase64(str) {
    try {
        return btoa(atob(str)) === str;
    } catch(e) {
        return false;
    }
}