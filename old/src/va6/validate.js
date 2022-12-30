(function (global, factory) {
  var namespace = 'VA6/Validate';
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


  var Log = importLoadedModule('VA6/Log');


  // validate系機能は「値に問題がなければ」「補正後の値」が返される。
  // 「値に問題があれば」「consoleにエラーを出力し」「fallback値」が返される。
  // fallback値を指定できないものはnullを返すしかない(続行不可能)。
  // fallback値を指定できるものは適当に指定する事で、適当に続行できる。
  // ※nullが返されるものを || で補正しない事！0まで補正されてしまう。


  exports.number = function (label, min, v, max, fallback) {
    if (typeof v !== 'number' || !isFinite(v)) {
      Log.error([label + " must be a number, but found", v]);
      return fallback;
    }
    // clampした結果を返す
    if (min != null) { v = Math.max(min, v); }
    if (max != null) { v = Math.min(v, max); }
    return v;
  };


  exports.string = function (label, v, isAllowEmpty, fallback) {
    if (typeof v !== 'string') {
      Log.error([label + " must be a string, but found", v]);
      return fallback;
    }
    if (!isAllowEmpty && (v === "")) {
      Log.error(label + " should not be empty string");
      return fallback;
    }
    return v;
  };


  exports.enumerated = function (label, v, enums, fallback) {
    // enums内にnullを含める事はできないのに注意
    var isFound = false;
    enums.forEach(function (e) { if (e === v) { isFound = true; } });
    if (!isFound) {
      Log.error([label + " must be " + enums.map(JSON.stringify).join(" or ") + ", but found", v]);
      return fallback;
    }
    return v;
  };


  exports.instanceOf = function (label, v, targetClass, fallback) {
    if (!(v instanceof targetClass)) {
      Log.error([v, "is not instance of", targetClass]);
      return fallback;
    }
    return v;
  };





  Object.defineProperty(exports, '__esModule', { value: true });
})));
