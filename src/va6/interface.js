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
  exports.connectMasterGainNode = webaudio.connectMasterGainNode;
  exports.createOfflineAudioContext = webaudio.createOfflineAudioContext;
  exports.init = webaudio.init;
  //exports.disconnectNodeSafely = webaudio.disconnectNodeSafely;
  //exports.stopNodeSet = webaudio.stopNodeSet;
  //exports.setVolume = webaudio.setVolume;
  //exports.setPan = webaudio.setPan;
  //exports.setupNodeSet = webaudio.setupNodeSet;














  // TODO: デバッグ用。最終的には消す。まずこれで音が出るようにし、そこから分化させていく
  var debugBuf = null;
  function prepareDebugBuf () {
    var sec = 0.5;
    var oac = exports.createOfflineAudioContext(sec);
    var osc = oac.createOscillator();
    //var hz = 440;
    var hz = 220 + Math.floor(Math.random()*440);
    osc.type = "square"; // sine, square, sawtooth, triangle
    osc.frequency.setValueAtTime(hz, 0);
    osc.detune.setValueAtTime(0, 0);

    var vol = 0.1;
    var pan = 0;
    var nodeSet = webaudio.setupNodeSet(oac, osc, vol, pan);
    nodeSet.gainNode.connect(oac.destination);
    // TODO: attack/decay/sustain/releaseっぽく制御したい。できるか？
    // TODO: 音楽的に複数の音を出すには？
    // TODO: この処理を汎用的にできるか？
    osc.start();
    oac.startRendering().then(function(buf) {
      debugBuf = buf;
      osc.stop();
      osc.disconnect();
      webaudio.disconnectNodeSet(nodeSet);
      //oac.close(); // OfflineAudioContextはcloseできないらしい
    });
  }
  prepareDebugBuf();

  exports.debug = function () {
    var ac = exports.getAudioContext();
    if (!ac) { return; }

    if (!debugBuf) { return; }

    // TODO: この辺りの、「bufをnodeにする処理」もwebaudio内に格納する事
    var node = ac.createBufferSource();
    node.buffer = debugBuf;
    var nodeSet = webaudio.setupNodeSet(ac, node);
    webaudio.connectMasterGainNode(node);
    // TODO: onendedの部分もwebaudio名前空間に移動させる必要があるが…
    node.onended = function () {
      var isSlept = false; // TODO: どうやって取るか考える事
      if (!isSlept) {
        log.debug(["onended", nodeSet, "and shutdown"]);
        webaudio.stopNodeSet(nodeSet);
        webaudio.disconnectNodeSet(nodeSet);
      }
      else {
        log.debug(["onended", nodeSet, "but slept (don't shutdown)"]);
      }
    };
    node.start();
  };


  // nodeやworkers等でoacのみ使うケースがある
  if (typeof window !== 'undefined') {
    exports.init();
  }


  Object.defineProperty(exports, '__esModule', { value: true });
})));
