!(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
      (global = global || self, factory(global.Base64 = {}));
}(this, (function (exports) {
  'use strict';
  const BASE64CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const BASE64DECODER = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];

  const UTF8toUnicode = function (str) {
    // |[\xF8-\xFB][\x80-\xBF]{4}|[\xFC-\xFD][\x80-\xBF]{5}
    return str.replace(/[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g, function (str) {
      return decodeURIComponent(escape(str));
    });
  }
  exports.UTF8toUnicode = UTF8toUnicode

  const UnicodetoUTF8 = function (str) {
    return str.replace(/[^\x00-\xff]/g, function (str) {
      return unescape(encodeURIComponent(str));
    })
  }
  exports.UnicodetoUTF8 = UnicodetoUTF8

  const encodeStr = function (str) {
    //if (exports.btoa) { return exports.btoa(stringToByte(str)); }
    return encode(stringToByte(str))
  }
  exports.encodeStr = encodeStr

  const encode = function (byteArray) {
    var r = [],
      i = 0,
      t = 0,
      len = byteArray.length,
      c;
    for (; i < len; i++) {
      if (++t === 3) { t = 0; }
      c = byteArray[i];

      switch (t) {
        case 1:
          r.push(c >> 2 & 0x3F);
          break;
        case 2:
          r.push((byteArray[i - 1] << 4 | c >> 4) & 0x3F);
          break;
        case 0:
          r.push((byteArray[i - 1] << 2 | c >> 6) & 0x3F);
          r.push(c & 0x3F);
          break;

      }

      if (i === len - 1 && t > 0) {
        r.push(c << ((3 - t) << 1) & 0x3F);
      }
    }

    for (var i = 0, len = r.length; i < len; i++) { r[i] = BASE64CHARS.charAt(r[i]); }

    if (t) {
      while (3 - t++ > 0) { r.push('='); }
    }

    return r.join('');
  };
  exports.encode = encode

  const decode = function (str) {
    //if (exports.atob) { return UnicodetoUTF8(exports.atob(str)); }
    var r = [],
      i = 0,
      t = 0,
      c,
      n,
      len,
      off;

    i = 0;
    n = BASE64DECODER[str.charCodeAt(0)];
    len = str.length;

    while (i < len) {
      t++;
      c = n;
      n = BASE64DECODER[str.charCodeAt(++i)];

      if (n === -1) {
        i = len;
        n = 0;
      }

      r.push(c << (t << 1) & 0xFF | n >> ((3 - t) << 1));

      if (t === 3) {
        i++;
        n = BASE64DECODER[str.charCodeAt(i)];
        t = 0;
      }
    }
    return r;
  }
  exports.decode = decode;

  //字符串转字节序列
  const stringToByte = function (str) {
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
  exports.stringToByte = stringToByte

  //字节序列转ASCII码
  const byteToString = function (arr) {
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
  exports.byteToString = byteToString

})));