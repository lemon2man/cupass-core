/**
 * Luhn 算法 (模10算法)
 * 用于 ICCID, IMEI, 信用卡号等校验
 * 纯函数，无副作用
 */

/**
 * 计算给定数字串的 Luhn 校验位
 * @param {string} digits - 不含校验位的数字串
 * @returns {number} 0-9 校验位
 */
export function calculateLuhnCheckDigit(digits) {
    const arr = digits.split('').reverse();
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        let digit = parseInt(arr[i], 10);
        if (isNaN(digit)) throw new Error('输入必须为数字');
        if ((i % 2) === 0) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit;
}

/**
 * 验证完整号码（包含校验位）
 * @param {string} fullNumber 
 * @returns {boolean}
 */
export function validateLuhn(fullNumber) {
    if (!/^\d+$/.test(fullNumber)) return false;
    const digits = fullNumber.split('').map(d => parseInt(d,10));
    let sum = 0;
    let isEven = false;
    for (let i = digits.length-1; i >= 0; i--) {
        let digit = digits[i];
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
    }
    return (sum % 10) === 0;
}

/**
 * 为给定的数字串添加校验位，返回完整号码
 * @param {string} withoutCheck 
 * @returns {string}
 */
export function addLuhnCheckDigit(withoutCheck) {
    const cd = calculateLuhnCheckDigit(withoutCheck);
    return withoutCheck + cd;
}