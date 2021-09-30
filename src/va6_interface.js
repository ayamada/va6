(function (global, factory) {
  var namespace = 'va6';
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


  var va6_webaudio = importLoadedModule('va6/webaudio');
  exports.isActivatedAudioContext = va6_webaudio.isActivatedAudioContext;
  exports.getAudioContextAsync = va6_webaudio.getAudioContextAsync;
  exports.createOfflineAudioContext = va6_webaudio.createOfflineAudioContext;
  exports.init = va6_webaudio.init;
















  // TODO: この中でinitを実行してしまうかはとても悩む。少なくともオプションを指定したい場合はここで実行してはいけないのだが…
  exports.init({isSkipOptimizeChromium: true});


  Object.defineProperty(exports, '__esModule', { value: true });
})));
