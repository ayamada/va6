(function (global, factory) {
  var namespace = 'va6/validate';
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global[namespace] = {}));
}(this, (function (exports) { 'use strict';

  var root = {};
  if (typeof window !== 'undefined') { root = window; }
  else if (typeof global !== 'undefined') { root = global; }
  function importLoadedModule (namespace) {
    var m = root[namespace];
    if (!m) { throw new Error(namespace + " not found"); }
    return m;
  }


  var log = importLoadedModule('va6/log');


  // validate系機能は「値に問題がなければ」「補正後の値」が返される。
  // 「値に問題があれば」「consoleにエラーを出力し」「fallback値」が返される。
  // fallback値を指定できないものはnullを返すしかない(続行不可能)。
  // fallback値を指定できるものは適当に指定する事で、適当に続行できる。
  // ※nullが返されるものを || で補正しない事！0まで補正されてしまう。


  exports.number = function (label, min, v, max, fallback) {
    if (typeof v !== 'number' || !isFinite(v)) {
      log.error(["" + label + " must be a number, but found", v]);
      return fallback;
    }
    // clampした結果を返す
    if (min != null) { v = Math.max(min, v); }
    if (max != null) { v = Math.min(v, max); }
    return v;
  };



// from va5

//  Assert.validateString = function (label, v, fallback) {
//    if (typeof v !== 'string') {
//      va5._logError("" + label + " must be a string, but found " + v + " (" + typeof v + ")");
//      return fallback;
//    }
//    if (v === "") {
//      va5._logError("" + label + " should not be empty string");
//      return fallback;
//    }
//    return v;
//  };

//  // enums内にnullを含める事はできないのに注意
//  Assert.validateEnum = function (label, v, enums, fallback) {
//    var isFound = false;
//    enums.forEach(function (e) { if (e === v) { isFound = true; } });
//    if (!isFound) {
//      va5._logError("" + label + " must be " +
//        enums.map(JSON.stringify).join(" or ") + ", but found " + v +
//        " (" + typeof v + ")");
//      return fallback;
//    }
//    return v;
//  };




  Object.defineProperty(exports, '__esModule', { value: true });
})));
