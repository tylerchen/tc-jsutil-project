!(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
      (global = global || self, factory(global.Base92 = {}));
}(this, (function (exports) {
  'use strict';
  const ALPHABET = "~!@#$%^&*()_+`1234567890-=QWERTYUIOP{}|qwertyuiop[]ASDFGHJKL:asdfghjkl;'ZXCVBNM<>?zxcvbnm,./";
  const ALPHABET_MAP = {};
  const BASE = 92;
  for (var i = 0; i < ALPHABET.length; i++) {
    ALPHABET_MAP[ALPHABET.charAt(i)] = i;
  }

  exports.encode = function (buffer) {
    if (buffer.length === 0) { return ''; }
    var i, j, digits = [0];
    for (i = 0; i < buffer.length; i++) {
      for (j = 0; j < digits.length; j++) {
        // 将数据转为二进制，再位运算右边添8个0，得到的数转二进制
        // 位运算-->相当于 digits[j].toString(2);parseInt(10011100000000,2)
        digits[j] <<= 8;
      }
      digits[0] += buffer[i];
      var carry = 0;
      for (j = 0; j < digits.length; ++j) {
        digits[j] += carry;
        carry = (digits[j] / BASE) | 0;
        digits[j] %= BASE;
      }
      while (carry) {
        digits.push(carry % BASE);
        carry = (carry / BASE) | 0;
      }
    }
    // deal with leading zeros
    for (i = 0; buffer[i] === 0 && i < buffer.length - 1; i++) digits.push(0);
    return digits
      .reverse()
      .map(function (digit) {
        return ALPHABET[digit];
      })
      .join('');
  }
  exports.decode = function (string) {
    if (string.length === 0) return [];
    var i,j,bytes = [0];
    for (i = 0; i < string.length; i++) {
      var c = string[i];
      // c是不是ALPHABET_MAP的key
      if (!(c in ALPHABET_MAP)) {throw new Error('Non-base58 character');}
      for (j = 0; j < bytes.length; j++) {bytes[j] *= BASE;}
      bytes[0] += ALPHABET_MAP[c];
      var carry = 0;
      for (j = 0; j < bytes.length; ++j) {
        bytes[j] += carry;
        carry = bytes[j] >> 8;
        // 0xff --> 11111111
        bytes[j] &= 0xff;
      }
      while (carry) {
        bytes.push(carry & 0xff);
        carry >>= 8;
      }
    }
    // deal with leading zeros
    for (i = 0; string[i] === '1' && i < string.length - 1; i++) {bytes.push(0);}
    return bytes.reverse();
  }

  //字符串转字节序列
  exports.stringToByte = function (str) {
    var bytes = new Array();
    var len, c;
    len = str.length;
    for (var i = 0; i < len; i++) {
      c = str.charCodeAt(i);
      if (c >= 0x010000 && c <= 0x10FFFF) {
        bytes.push(((c >> 18) & 0x07) | 0xF0);
        bytes.push(((c >> 12) & 0x3F) | 0x80);
        bytes.push(((c >> 6) & 0x3F) | 0x80);
        bytes.push((c & 0x3F) | 0x80);
      } else if (c >= 0x000800 && c <= 0x00FFFF) {
        bytes.push(((c >> 12) & 0x0F) | 0xE0);
        bytes.push(((c >> 6) & 0x3F) | 0x80);
        bytes.push((c & 0x3F) | 0x80);
      } else if (c >= 0x000080 && c <= 0x0007FF) {
        bytes.push(((c >> 6) & 0x1F) | 0xC0);
        bytes.push((c & 0x3F) | 0x80);
      } else {
        bytes.push(c & 0xFF);
      }
    }
    return bytes;


  }

  //字节序列转ASCII码
  exports.byteToString = function (arr) {
    if (typeof arr === 'string') {
      return arr;
    }
    var str = '',
      _arr = arr;
    for (var i = 0; i < _arr.length; i++) {
      var one = _arr[i].toString(2),
        v = one.match(/^1+?(?=0)/);
      if (v && one.length == 8) {
        var bytesLength = v[0].length;
        var store = _arr[i].toString(2).slice(7 - bytesLength);
        for (var st = 1; st < bytesLength; st++) {
          store += _arr[st + i].toString(2).slice(2);
        }
        str += String.fromCharCode(parseInt(store, 2));
        i += bytesLength - 1;
      } else {
        str += String.fromCharCode(_arr[i]);
      }
    }
    return str;
  }

})));