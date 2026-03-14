const CryptoJS = require('crypto-js');
const config = require('../config');

function encrypt(text) {
    if (!text) return text;
    return CryptoJS.AES.encrypt(text, config.encryptionKey).toString();
}

function decrypt(ciphertext) {
    if (!ciphertext) return ciphertext;
    const bytes = CryptoJS.AES.decrypt(ciphertext, config.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}

module.exports = { encrypt, decrypt };
