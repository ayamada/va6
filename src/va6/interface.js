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
  //exports.displayErrorLog = log.error;
  //exports.displayDebugLog = log.debug;


  var validate = importLoadedModule('va6/validate');


  var config = importLoadedModule('va6/config');
  exports.getConfig = config.get;
  exports.setConfig = config.set;
  exports.config = config.proxy;


  var webaudio = importLoadedModule('va6/webaudio');
  //exports.setVolumeMaster = webaudio.setVolumeMaster;
  exports.isActivatedAudioContext = webaudio.isActivatedAudioContext;
  exports.getAudioContext = webaudio.getAudioContext;
  exports.getAudioContextAsync = webaudio.getAudioContextAsync;
  exports.createOfflineAudioContext = webaudio.createOfflineAudioContext;
  exports.init = webaudio.init;
  //exports.disconnectNodeSafely = webaudio.disconnectNodeSafely;














  // TODO: デバッグ用。最終的には消す。まずこれで音が出るようにし、そこから分化させていく
  exports.debug = function () {
    var ac = exports.getAudioContext();
    if (!ac) { return; }
    var osc = ac.createOscillator();
    osc.type = "square"; // sine, square, sawtooth, triangle
    osc.frequency.setValueAtTime(440, ac.currentTime);
    osc.detune.setValueAtTime(0, ac.currentTime);
    var nodes = webaudio.connectNode(osc);
    osc.start();
    // TODO: SE的に、自動的に終わるようにするには？
    //       調べた。va5のappendNodesの中で sourceNode.onended を設定し、
    //       その中で終了処理を設定していた。
    //       osc自体には「おわり」はないので、この手法は取れない…。
    //       きちんとやる場合はoacからbufferを作るようにするしかないし、
    //       最終的にはそうなるので、
    //       ここでもそのように実装しておいた方がよい。
    setTimeout(function () {
      webaudio.disconnectNodeSafely(osc);
    }, 200);
  };


  // TODO: この中でinitを実行してしまうかはとても悩む。少なくとも引数でオプションを指定したい場合はここで実行してはいけないのだが…
  exports.init();


  Object.defineProperty(exports, '__esModule', { value: true });
})));
