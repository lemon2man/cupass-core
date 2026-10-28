/**
 * ASN.1 DER 解析器 (修正版)
 * 支持常见类型标签，输出树形结构
 */

const TAG_NAMES = {
    0x01: 'BOOLEAN',
    0x02: 'INTEGER',
    0x03: 'BIT STRING',
    0x04: 'OCTET STRING',
    0x05: 'NULL',
    0x06: 'OBJECT IDENTIFIER',
    0x0C: 'UTF8String',
    0x0D: 'RELATIVE OID',
    0x10: 'SEQUENCE',
    0x11: 'SET',
    0x12: 'NumericString',
    0x13: 'PrintableString',
    0x14: 'T61String',
    0x15: 'VideotexString',
    0x16: 'IA5String',
    0x17: 'UTCTime',
    0x18: 'GeneralizedTime',
    0x1E: 'BMPString'
};

function hexToBytes(hex) {
    const clean = hex.replace(/\s/g, '');
    if (clean.length % 2 !== 0) throw new Error('十六进制长度必须为偶数');
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < clean.length; i += 2) {
        const b = parseInt(clean.substr(i, 2), 16);
        if (isNaN(b)) throw new Error('无效十六进制');
        bytes[i/2] = b;
    }
    return bytes;
}

function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ').toUpperCase();
}

function oidToString(oidBytes) {
    if (oidBytes.length < 2) return '';
    let first = Math.floor(oidBytes[0] / 40);
    let second = oidBytes[0] % 40;
    let oid = `${first}.${second}`;
    let value = 0;
    for (let i = 1; i < oidBytes.length; i++) {
        value = (value << 7) | (oidBytes[i] & 0x7F);
        if ((oidBytes[i] & 0x80) === 0) {
            oid += '.' + value;
            value = 0;
        }
    }
    return oid;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : (m === '<' ? '&lt;' : '&gt;'));
}

function parseNode(bytes, offset) {
    if (offset >= bytes.length) throw new Error('数据不完整');
    const tagByte = bytes[offset];
    let tag = tagByte & 0x1F;
    const tagClass = (tagByte & 0xC0) >> 6;
    const isConstructed = (tagByte & 0x20) !== 0;
    let consumedTag = 1;
    
    // 处理长标签 (超过30)
    if (tag === 0x1F) {
        tag = 0;
        let i = offset + 1;
        while (i < bytes.length && (bytes[i] & 0x80)) {
            tag = (tag << 7) | (bytes[i] & 0x7F);
            i++;
            consumedTag++;
        }
        if (i < bytes.length) {
            tag = (tag << 7) | bytes[i];
            consumedTag++;
        } else {
            throw new Error('不完整的长标签');
        }
    }
    const tagName = TAG_NAMES[tag] || `Tag(0x${tag.toString(16)})`;
    
    // 解析长度
    const lenByte = bytes[offset + consumedTag];
    let length;
    let consumedLen = 1;
    if (lenByte < 0x80) {
        length = lenByte;
    } else {
        const lenBytes = lenByte & 0x7F;
        if (lenBytes === 0) {
            throw new Error('DER 不支持不定长编码');
        }
        consumedLen = 1 + lenBytes;
        length = 0;
        for (let i = 0; i < lenBytes; i++) {
            length = (length << 8) | bytes[offset + consumedTag + 1 + i];
        }
    }
    
    const valueStart = offset + consumedTag + consumedLen;
    const valueEnd = valueStart + length;
    if (valueEnd > bytes.length) throw new Error('值长度超出数据范围');
    const valueBytes = bytes.slice(valueStart, valueEnd);
    
    let children = null;
    let valueStr = '';
    
    // 如果是构造类型或 SEQUENCE/SET，尝试递归解析
    if (isConstructed || tag === 0x10 || tag === 0x11) {
        try {
            const nested = [];
            let pos = 0;
            while (pos < valueBytes.length) {
                const sub = parseNode(valueBytes, pos);
                nested.push(sub.node);
                pos = sub.nextOffset;
            }
            if (pos === valueBytes.length) {
                children = nested;
                valueStr = `[${nested.length} 个子项]`;
            } else {
                valueStr = bytesToHex(valueBytes);
            }
        } catch(e) {
            valueStr = bytesToHex(valueBytes);
        }
    } else {
        // 原始类型尝试显示可读内容
        if (tag === 0x02) { // INTEGER
            let intVal = 0;
            for (let i = 0; i < valueBytes.length; i++) {
                intVal = (intVal << 8) | valueBytes[i];
            }
            valueStr = intVal.toString();
        } else if (tag === 0x06) { // OID
            valueStr = oidToString(valueBytes);
        } else if (tag === 0x13 || tag === 0x16) { // PrintableString / IA5String
            valueStr = new TextDecoder().decode(valueBytes);
        } else {
            valueStr = bytesToHex(valueBytes);
        }
    }
    
    return {
        node: {
            tag: tag,
            tagName: tagName,
            class: tagClass === 0 ? 'Universal' : (tagClass === 1 ? 'Application' : (tagClass === 2 ? 'Context-specific' : 'Private')),
            constructed: isConstructed,
            length: length,
            value: valueStr,
            children: children,
            hex: bytesToHex(valueBytes)
        },
        nextOffset: valueEnd
    };
}

// 修正：返回数组包含根节点
export function parseDER(hexString) {
    const bytes = hexToBytes(hexString);
    const result = parseNode(bytes, 0);
    // 确保总是返回数组
    return [result.node];
}

// 递归生成 HTML 树（保持原有逻辑）
export function renderASN1Tree(nodes, indent = 0) {
    if (!nodes || nodes.length === 0) return '';
    let html = '';
    for (const node of nodes) {
        html += `<div style="margin-left: ${indent * 1.5}em;">`;
        html += `<strong>${escapeHtml(node.tagName)}</strong> `;
        html += `<span style="color:#2c6e9e;">(len=${node.length})</span>`;
        if (node.children) {
            html += `<div style="border-left: 2px solid #cbd5e1; margin: 0.3rem 0 0.3rem 1rem;">`;
            html += renderASN1Tree(node.children, indent + 1);
            html += `</div>`;
        } else {
            html += `<span style="color:#0f3b5c;"> ${escapeHtml(node.value)}</span>`;
        }
        html += `</div>`;
    }
    return html;
}