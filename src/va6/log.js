(function (global, factory) {
  var namespace = 'va6/log';
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


  exports.error = function (logObj) {
    if (!importLoadedModule("va6/config").proxy.isDisplayErrorLog) { return; }
    if (typeof console !== 'undefined') { console.error("va6:", logObj); }
  };
  exports.debug = function (logObj) {
    if (!importLoadedModule("va6/config").proxy.isDisplayDebugLog) { return; }
    if (typeof console !== 'undefined') { console.info("va6:", logObj); }
  };


  Object.defineProperty(exports, '__esModule', { value: true });
})));
