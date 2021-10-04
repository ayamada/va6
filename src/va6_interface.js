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


  var log = importLoadedModule('va6/log');
  exports.displayErrorLog = log.error;
  exports.displayDebugLog = log.debug;


  var config = importLoadedModule('va6/config');
  exports.getConfig = config.get;
  exports.setConfig = config.set;
  exports.config = config.proxy;




  var webaudio = importLoadedModule('va6/webaudio');
  exports.isActivatedAudioContext = webaudio.isActivatedAudioContext;
  exports.getAudioContext = webaudio.getAudioContext;
  exports.getAudioContextAsync = webaudio.getAudioContextAsync;
  exports.createOfflineAudioContext = webaudio.createOfflineAudioContext;
  exports.init = webaudio.init;
















  // TODO: この中でinitを実行してしまうかはとても悩む。少なくとも引数でオプションを指定したい場合はここで実行してはいけないのだが…
  exports.init();


  Object.defineProperty(exports, '__esModule', { value: true });
})));
