(function (global, factory) {
  var namespace = 'VA6/Debug';
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


  var VA6 = importLoadedModule('VA6');
  var NodeSet = importLoadedModule('VA6/NodeSet');
  var Se = importLoadedModule('VA6/Se');



  var debugBuf = null;
  function prepareDebugBuf () {
    var sec = 0.5;
    var oac = VA6.createOfflineAudioContext(sec);
    var osc = oac.createOscillator();
    //var hz = 440;
    var hz = 220 + Math.floor(Math.random()*440);
    osc.type = "square"; // sine, square, sawtooth, triangle
    osc.frequency.setValueAtTime(hz, 0);
    osc.detune.setValueAtTime(0, 0);

    var vol = 0.1;
    var pan = 0;
    var ns = NodeSet.make(oac, osc, vol, pan);
    NodeSet.connect(ns, oac.destination);
    // TODO: attack/decay/sustain/releaseっぽく制御したい。できるか？
    // TODO: 音楽的に複数の音を出すには？
    // TODO: この処理を汎用的にできるか？
    osc.start();
    oac.startRendering().then(function(buf) {
      debugBuf = buf;
      osc.stop();
      osc.disconnect();
      NodeSet.disconnect(ns);
      //oac.close(); // OfflineAudioContextはcloseできないらしい。startRenderingだけでもうclose状態になるようだ
    });
  }
  prepareDebugBuf();

  VA6.debug = function () {
    if (!debugBuf) { return; }
    Se.playProto({buf: debugBuf});
  };




  Object.defineProperty(exports, '__esModule', { value: true });
})));
